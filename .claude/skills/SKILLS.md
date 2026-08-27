<!-- SKILLS.md file-->

# New feature: Pinning issues to work on later

Outlines the guidelines for adding a new feature involving pinning an issue which allows agents to work on, or check on them later

## UI and Logic

- We add a pin-like button icon in the desktop header (And also in the mobile header if possible) which will show pinned issues through a modal.
- For one pinned issue, we can show key issue metadata which are: issue reference id, issue status, issue priority, issue title, issue description (both title and description clamped to one line).
- We can use a zustand store with local storage persistence for this feature. You can advise and recommend on the same.
- The pin button can be added in the CardViewData, TableViewData, and also in the issue page which holds the specific issue metadata. Clicking on the pin icon adds the issue to the pinned list and also triggers an alert to the user that the issue pinning was successful.
- In the pinned issues list modal, clicking on a pinned issue routes to that specific issue.

## Planning and execution

- Create a plan for this feature changes and execute against tha plan

## Recommendations and follow-up questions

- Ask follow-up questions if you have any, and also any recommendations that you might have
