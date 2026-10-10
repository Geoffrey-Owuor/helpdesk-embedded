import { ReactNode } from "react";
import { Briefcase, FileText, Hash, MessageSquare, UserRound } from "lucide-react";
import { IssueDetail } from "@/queries/fetchIssue";
import { CollaboratorRecord } from "@/queries/fetchCollaborators";
import { AssignedAgentFormatter } from "../../IssuesData/AssignedAgentFormatter";
import IssueAttachmentsViewer from "../../IssueModals/IssueAttachmentsViewer";
import CommentsSection from "../CommentsSection";
import { DetailCard } from "./DetailCard";
import { InfoBlock } from "./InfoBlock";
import { CollaboratorChips } from "./CollaboratorChips";
import { IssueTextCard } from "./IssueTextCard";
import { IssueMetadataCard } from "./IssueMetadataCard";

// Everything below an issue's header - details, description, remarks,
// attachments, comments and dates - shared by the issue page and its
// read-only analytics mirror. Editing controls come in through the slots.
export const IssueDetailBody = ({
  issue,
  collaborators,
  collaboratorsLoading,
  issueTypeAction,
  descriptionAction,
  canComment = true,
}: {
  issue: IssueDetail;
  collaborators: CollaboratorRecord[];
  collaboratorsLoading: boolean;
  issueTypeAction?: ReactNode;
  descriptionAction?: ReactNode;
  canComment?: boolean;
}) => (
  <>
    {/* --- DETAILS GRID (3 Cards) --- */}
    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Card 1: Submitter Info */}
      <DetailCard title="Submitter Details" icon={UserRound}>
        <InfoBlock label="Submitted By" value={issue.issue_submitter_name} />
        <InfoBlock
          label="Department"
          value={issue.issue_submitter_department}
        />
      </DetailCard>

      {/* Card 2: Handling Info */}
      <DetailCard title="Handling Details" icon={Briefcase}>
        <InfoBlock
          label="Target Department"
          value={issue.issue_target_department}
        />
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-500">
            Assigned Agent
          </span>
          <div className="mt-2 w-auto">
            <AssignedAgentFormatter
              agentName={issue.issue_agent_name ?? "Not Assigned"}
            />
          </div>
        </div>
      </DetailCard>

      {/* Card 3: System Info */}
      <DetailCard title="Issue Data" icon={Hash}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <InfoBlock label="Issue Type" value={issue.issue_type} />
          {issueTypeAction}
        </div>

        <CollaboratorChips
          collaborators={collaborators}
          isLoading={
            Number(issue.collaborators_count) > 0 && collaboratorsLoading
          }
        />
      </DetailCard>
    </div>

    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <IssueTextCard
        title="Description"
        icon={FileText}
        text={issue.issue_description}
        action={descriptionAction}
      />
      <IssueTextCard
        title="Remarks"
        icon={MessageSquare}
        text={issue.issue_remarks}
        emptyText="No remarks provided."
      />
    </div>

    {/* --- ATTACHMENTS VIEWER --- */}
    {Number(issue.attachments_count) > 0 && (
      <div className="mb-6">
        <IssueAttachmentsViewer uuid={issue.issue_uuid} />
      </div>
    )}

    {/* --- BOTTOM GRID: Comments + Metadata --- */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <CommentsSection uuid={issue.issue_uuid} canComment={canComment} />
      <IssueMetadataCard issue={issue} />
    </div>
  </>
);
