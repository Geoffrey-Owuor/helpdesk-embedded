import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { CollaboratorRecord } from "@/queries/fetchCollaborators";

// The agents invited to collaborate on an issue, as name chips
export const CollaboratorChips = ({
  collaborators,
  isLoading,
}: {
  collaborators: CollaboratorRecord[];
  isLoading: boolean;
}) => (
  <div className="flex flex-col">
    <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-500">
      Collaborators
    </span>
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {isLoading ? (
        <SkeletonBox className="h-7.5 w-40 rounded-full!" />
      ) : collaborators.length === 0 ? (
        <span className="text-sm text-neutral-400 italic dark:text-neutral-500">
          No collaborators on this issue.
        </span>
      ) : (
        collaborators.map((collaborator) => (
          <div
            key={collaborator.collaborator_email}
            title={`${collaborator.collaborator_email} - invited by ${collaborator.inviter_name}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 py-1 pr-3 pl-1 dark:border-blue-900/40 dark:bg-blue-900/20"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white dark:bg-blue-500">
              {collaborator.collaborator_name.charAt(0).toUpperCase()}
            </span>
            <span className="max-w-32 truncate text-xs font-semibold text-blue-800 dark:text-blue-300">
              {collaborator.collaborator_name}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
);
