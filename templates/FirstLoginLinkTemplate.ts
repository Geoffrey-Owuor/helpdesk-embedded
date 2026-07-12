import { currentYear } from "@/public/assets";

// TODO: If you want to include the user's name in the greeting, add it as a 3rd parameter.
const FirstLoginLinkTemplate = (
  resetLink: string,
  temporaryPassword: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to HelpDesk - Setup Your Account</title>
    <style>
        /* Resets to ensure consistent rendering across clients */
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: transparent; color: #51545E; }
        table { border-spacing: 0; width: 100%; }
        td { padding: 0; }
        img { border: 0; }
        .wrapper { width: 100%; table-layout: fixed; padding-bottom: 40px; }
        .main { margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; color: #4a4a4a; border-radius: 12px; }
        .header { padding: 40px 0; text-align: center; }
        .content { padding: 0 40px 40px; }
        .footer { text-align: center; font-size: 12px; color: #999999; padding-top: 20px; }
        
        /* Typography */
        h1 { font-size: 24px; font-weight: bold; margin: 0 0 20px; color: #333333; }
        p { font-size: 16px; line-height: 1.6; margin: 0 0 20px; }
        
        /* Password Highlight Box */
        .password-box { background-color: #f8f9fa; border: 1px dashed #2c3e50; border-radius: 6px; padding: 15px; text-align: center; margin: 20px 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #2c3e50; letter-spacing: 2px;}

        /* Button Style */
        .btn-container { text-align: center; margin: 30px 0; }
        .btn-container a { color: #ffffff; text-decoration: none; }
        .btn { display: inline-block; background-color: #2c3e50; font-size: 16px; font-weight: bold; padding: 14px 30px; border-radius: 6px; }
        
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
                   <h2 style="color: #2c3e50; margin:0;">HelpDesk</h2>
                </td>
            </tr>

            <tr>
                <td class="content">
                    <h1>Welcome to HelpDesk!</h1>
                    <p>Hello,</p>
                    <p>An account has been created for you on HelpDesk. To get started, you will need to log in and set up your own new password.</p>
                    
                    <p>Your temporary login password is:</p>
                    
                    <div class="password-box">
                        ${temporaryPassword}
                    </div>

                    <p>Click the button below to complete your account setup and choose your new password.</p>
                    
                    <div class="btn-container">
                        <a href="${resetLink}" class="btn">Setup My Account</a>
                    </div>

                    <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
                    <p class="link-fallback"><a href="${resetLink}">${resetLink}</a></p>

                    <p>Please do not share your temporary password with anyone.</p>
                    
                </td>
            </tr>
        </table>

        <div class="footer">
            <p>&copy; ${currentYear} HelpDesk. All rights reserved.</p>
        </div>
    </center>
</body>
</html>
  `;
};

export default FirstLoginLinkTemplate;
