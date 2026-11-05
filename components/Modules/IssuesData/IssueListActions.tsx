"use client";

import { useUser } from "@/contexts/UserContext";
import { IssueValueTypes, statusOptions } from "@/lib/assets";
import { getIssuePermissions } from "@/lib/issues/issuePermissions";
import {
  CircleCheck,
  CircleX,
  GitBranchPlus,
  LoaderCircle,
  LucideIcon,
  UndoDot,
  UserRoundPen,
} from "lucide-react";
import { ActionMenuItem } from "../IssuePage/HelperComponents/ActionMenu";
import { MoreActionsMenu } from "../IssuePage/HelperComponents/IssueHeaderParts";
import EscalateIssueModal from "../IssuePage/EscalateIssueModal";
import ReassignIssue from "../IssuePage/ReassignIssue";
import ReopenIssueModal from "../IssuePage/ReopenIssueModal";
import UpdateStatusModal from "../IssuePage/UpdateStatusModal";

export type IssueListRow = Record<string, IssueValueTypes>;

export type IssueListAction =
  | { kind: "status"; status: string }
  | { kind: "reassign" | "escalate" | "reopen" };

export type ActiveIssueAction = {
  issue: IssueListRow;
  action: IssueListAction;
};

export type IssueActionHandler = (active: ActiveIssueAction) => void;

const statusItemDetails: Record<string, { label: string; icon: LucideIcon }> = {
  "in progress": { label: "Mark in progress", icon: LoaderCircle },
  resolved: { label: "Mark resolved", icon: CircleCheck },
  closed: { label: "Close issue", icon: CircleX },
};

// Builds a row's action menu: the critical actions the viewer may take on it,
// by the issue page's rules. Empty when there are none.
export const useIssueMenuItems = (onAction: IssueActionHandler) => {
  const user = useUser();

  return (issue: IssueListRow): ActionMenuItem[] => {
    const can = getIssuePermissions(
      user,
      {
        issue_status: String(issue.issue_status),
        issue_target_department: String(issue.issue_target_department),
        // Unassigned issues come back with null, whatever the row type says
        issue_agent_email: issue.issue_agent_email
          ? String(issue.issue_agent_email)
          : null,
        issue_submitter_id: String(issue.issue_submitter_id),
      },
      Number(issue.viewer_is_collaborator) === 1,
    );

    const statusItems: ActionMenuItem[] = can.canUpdateStatus
      ? statusOptions.flatMap(({ value }) => {
          const details = statusItemDetails[value];
          if (!details || value === issue.issue_status) return [];
          return {
            key: value,
            ...details,
            onSelect: () =>
              onAction({ issue, action: { kind: "status", status: value } }),
          };
        })
      : [];

    const otherItems: ActionMenuItem[] = [
      can.canTriage && {
        key: "reassign",
        label: "Reassign",
        icon: UserRoundPen,
        onSelect: () => onAction({ issue, action: { kind: "reassign" } }),
      },
      can.canEscalate && {
        key: "escalate",
        label: "Escalate",
        icon: GitBranchPlus,
        tone: "danger" as const,
        onSelect: () => onAction({ issue, action: { kind: "escalate" } }),
      },
      can.canReopen && {
        key: "reopen",
        label: "Reopen",
        icon: UndoDot,
        onSelect: () => onAction({ issue, action: { kind: "reopen" } }),
      },
    ].filter((item) => item !== false);

    return [
      ...statusItems,
      ...otherItems.map((item, index) => ({
        ...item,
        dividerBefore: index === 0 && statusItems.length > 0,
      })),
    ];
  };
};

// The ⋯ menu on an issue list row or card
export const IssueActionsMenu = ({
  issue,
  items,
}: {
  issue: IssueListRow;
  items: ActionMenuItem[];
}) => (
  <MoreActionsMenu
    items={items}
    ariaLabel={`Actions for ${issue.issue_reference_id}`}
  />
);

// Sits outside the rows: a click inside a portaled modal still bubbles through
// the React tree, so a modal inside a row would also open the issue.
export const IssueListActionModals = ({
  active,
  onClose,
}: {
  active: ActiveIssueAction | null;
  onClose: () => void;
}) => {
  if (!active) return null;

  const { issue, action } = active;
  const uuid = String(issue.issue_uuid);
  const issueType = String(issue.issue_type);
  const targetDepartment = String(issue.issue_target_department);
  const issueAgentEmail = issue.issue_agent_email
    ? String(issue.issue_agent_email)
    : null;

  switch (action.kind) {
    case "status":
      return (
        <UpdateStatusModal
          isOpen
          closeModal={onClose}
          uuid={uuid}
          selectedStatus={action.status}
          currentStatus={String(issue.issue_status)}
        />
      );
    case "reassign":
      return (
        <ReassignIssue
          isModalOpen
          closeModal={onClose}
          uuid={uuid}
          issueType={issueType}
          targetDepartment={targetDepartment}
          issueAgentEmail={issueAgentEmail}
        />
      );
    case "escalate":
      return (
        <EscalateIssueModal
          isModalOpen
          closeModal={onClose}
          uuid={uuid}
          issueType={issueType}
          targetDepartment={targetDepartment}
          issueAgentEmail={issueAgentEmail}
        />
      );
    case "reopen":
      return <ReopenIssueModal isModalOpen closeModal={onClose} uuid={uuid} />;
  }
};
