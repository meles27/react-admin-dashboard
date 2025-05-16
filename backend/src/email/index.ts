import { Settings } from "@/settings";
import logger from "node-color-log";
import nodemailer from "nodemailer";

// Send email with token (Nodemailer example)
export async function sendTokenEmail(email: string, token: string) {
  logger.color("yellow").log("the current email is ", email);
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: Settings.APP_EMAIL, pass: Settings.APP_PASSWORD },
  });

  const response = await transporter.sendMail({
    from: Settings.APP_EMAIL,
    to: email,
    subject: "Your Password Reset Code",
    text: `Your verification token is: ${token}`,
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Token Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 500px;
            padding: 30px;
            box-sizing: border-box;
        }
        
        h1 {
            font-size: 24px;
            margin-top: 0;
            color: #2c3e50;
            text-align: center;
        }
        
        .email-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .token-container {
            display: flex;
            margin: 25px 0;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
        }
        
        .token {
            flex-grow: 1;
            padding: 12px 15px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 16px;
            background-color: #f8f9fa;
            word-break: break-all;
        }
        
        .copy-btn {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 0 20px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        
        .copy-btn:hover {
            background-color: #2980b9;
        }
        
        .copy-btn.copied {
            background-color: #27ae60;
        }
        
        .instructions {
            font-size: 14px;
            color: #7f8c8d;
            line-height: 1.5;
        }
        
        .email-from {
            font-weight: bold;
            color: #2c3e50;
        }
        
        .email-subject {
            color: #3498db;
            margin: 5px 0;
        }
        
        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your Verification Token</h1>
        
        <div class="email-info">
            <div class="email-from">From: ${Settings.APP_EMAIL}</div>
            <div class="email-subject">Subject: Your Verification Token</div>
            <div>Date: <span id="current-date"></span></div>
        </div>
        
        <p>Here is your verification token. Please use it to complete your authentication:</p>
        
        <div class="token-container">
            <div class="token" id="token-display">${token}</div>
            <button class="copy-btn" id="copy-btn">Copy</button>
        </div>
        
        <div class="divider"></div>
        
        <div class="instructions">
            <p><strong>Instructions:</strong></p>
            <ul>
                <li>This token will expire in 24 hours</li>
                <li>Do not share this token with anyone</li>
                <li>If you didn't request this token, please ignore this email</li>
            </ul>
        </div>
    </div>

    <script>
        // Display current date in the email header
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
        
        // Copy token functionality
        const copyBtn = document.getElementById('copy-btn');
        const tokenDisplay = document.getElementById('token-display');
        
        copyBtn.addEventListener('click', () => {
            const token = tokenDisplay.textContent;
            navigator.clipboard.writeText(token).then(() => {
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy token: ', err);
                alert('Failed to copy token. Please try again or copy manually.');
            });
        });
        
        // In a real scenario, you would receive the token from your backend
        // For example, if it's in the URL as a query parameter:
        // const urlParams = new URLSearchParams(window.location.search);
        // const token = urlParams.get('token');
        // if (token) {
        //     tokenDisplay.textContent = token;
        // }
    </script>
</body>
</html>
    `,
  });

  console.log("the email has been sent", response);
}
