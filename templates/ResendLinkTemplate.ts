import { currentYear } from "@/public/assets";

const ResendLinkTemplate = (resetLink: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        /* Resets to ensure consistent rendering across clients */
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #51545E; }
        table { border-spacing: 0; width: 100%; }
        td { padding: 0; }
        img { border: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f7; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; color: #4a4a4a; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { padding: 40px 0; text-align: center; }
        .content { padding: 0 40px 40px; }
        .footer { text-align: center; font-size: 12px; color: #999999; padding-top: 20px; }
        
        /* Typography */
        h1 { font-size: 24px; font-weight: bold; margin: 0 0 20px; color: #333333; }
        p { font-size: 16px; line-height: 1.6; margin: 0 0 20px; }
        
        /* Button Style */
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background-color: #2c3e50; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 6px; }
        
        /* Link Fallback */
        .link-fallback { font-size: 12px; color: #999999; word-break: break-all; margin-top: 20px; }
        .link-fallback a { color: #2c3e50; }
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
                    <h1>Reset your password</h1>
                    <p>Hello,</p>
                    <p>We received a request to reset the password for your Issue Desk account. Click the button below to set a new password.</p>
                    
                    <div class="btn-container">
                        <a href="${resetLink}" class="btn">Reset Password</a>
                    </div>

                    <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
                    <p class="link-fallback"><a href="${resetLink}">${resetLink}</a></p>

                    <p>This link will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
                    
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

export default ResendLinkTemplate;
