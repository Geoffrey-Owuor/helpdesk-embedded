import IssuesCards from "../IssuesCards/IssuesCards";
import IssuesData from "../IssuesData/IssuesData";

const AutomationsPage = () => {
  return (
    <div>
      <IssuesCards type="automations" />
      <IssuesData recordType="automations" />
    </div>
  );
};

export default AutomationsPage;
