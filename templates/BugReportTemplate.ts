import { dateFormatter } from "@/public/assets";
import { BugReportProps } from "@/services/SendBugReport";

export const BugReportTemplate = (bugReportData: BugReportProps): string => {
  const { title, category, dateReported, severity } = bugReportData;

  const formattedDate = dateFormatter(dateReported);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Bug Report: ${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: transparent;
            margin: 0;
            padding: 0;
        }
        .container {
            margin: 0 auto;
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
        }
        .header {
            background-color: #c0392b;
            color: #ffffff;
            padding: 24px 32px;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
        }
        .header p {
            margin: 4px 0 0;
            font-size: 13px;
            opacity: 0.85;
        }
        .body {
            padding: 32px;
        }
        .field {
            margin-bottom: 20px;
        }
        .field label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #888888;
            margin-bottom: 4px;
        }
        .field .value {
            font-size: 15px;
            color: #222222;
        }
        .divider {
            border: none;
            border-top: 1px solid #eeeeee;
            margin: 24px 0;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 16px 32px;
            font-size: 12px;
            color: #aaaaaa;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐛 Bug Report Submitted</h1>
            <p>A new bug has been reported and is awaiting review.</p>
        </div>
        <div class="body">
            <div class="field">
                <label>Title</label>
                <div class="value">${title}</div>
            </div>
            <hr class="divider" />
            <div class="field">
                <label>Category</label>
                <div class="value">${category}</div>
            </div>
            <div class="field">
                <label>Severity</label>
                <div class="value">${severity}</div>
            </div>
            <div class="field">
                <label>Date Reported</label>
                <div class="value">${formattedDate}</div>
            </div>
        </div>
        <div class="footer">
            This is an automated notification. Please do not reply to this email.
        </div>
    </div>
</body>
</html>
    `;
};
