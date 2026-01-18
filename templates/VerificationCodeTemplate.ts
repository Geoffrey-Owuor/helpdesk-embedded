import { currentYear } from "@/public/assets";

const VerificationCodeTemplate = (verificationCode: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        /* Resets to ensure consistent rendering across clients */
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; color: #51545E; }
        table { border-spacing: 0; width: 100%; }
        td { padding: 0; }
        img { border: 0; }
        .wrapper { width: 100%; table-layout: fixed; padding-bottom: 40px; }
        .main { margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; color: #4a4a4a; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { padding: 40px 0; text-align: center; }
        .content { padding: 0 40px 40px; }
        .footer { text-align: center; font-size: 12px; color: #999999; padding-top: 20px; }
        
        /* Typography */
        h1 { font-size: 24px; font-weight: bold; margin: 0 0 20px; color: #333333; }
        p { font-size: 16px; line-height: 1.6; margin: 0 0 20px; }
        
        /* Code Box Style */
        .code-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; text-align: center; padding: 24px; margin: 30px 0; }
        .verification-code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2c3e50; margin: 0; }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%">
            <tr>
                <td class="header">
                   <h2 style="color: #2c3e50; margin:0;">Issue Desk</h2>
                </td>
            </tr>

            <tr>
                <td class="content">
                    <h1>Verify your identity</h1>
                    <p>Hello,</p>
                    <p>We received a request to register for an Issue Desk account. Please use the verification code below to complete the process.</p>
                    
                    <div class="code-box">
                        <p class="verification-code">${verificationCode}</p>
                    </div>

                    <p>This code will expire in 10 minutes. If you did not request this code, please ignore this email or contact support if you have concerns.</p>
                    <p>Best regards,<br>The Issue Desk Team</p>
                </td>
            </tr>
        </table>

        <div class="footer">
            <p>&copy; ${currentYear} Issue Desk. All rights reserved.</p>
        </div>
    </center>
</body>
</html>
  `;
};

export default VerificationCodeTemplate;
