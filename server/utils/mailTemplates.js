const mailTemplates = {
  otpTemplate: (data) => {
    const { otp, validityMinutes = 10, userName = 'Reader' } = data;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Library Account Verification</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f5f5f5;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #fff;
          border-radius: 8px;
          padding: 30px 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 15px;
        }
        .logo {
          color: #1d4ed8;
          font-size: 22px;
          font-weight: 700;
        }
        .content {
          text-align: center;
          margin-top: 25px;
        }
        h1 {
          color: #111827;
          font-size: 22px;
          font-weight: 600;
        }
        p {
          color: #4b5563;
          font-size: 16px;
        }
        .otp-box {
          margin: 25px auto;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px 24px;
          font-size: 26px;
          letter-spacing: 6px;
          font-weight: bold;
          display: inline-block;
        }
        .footer {
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          margin-top: 30px;
          border-top: 1px solid #e5e7eb;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 class="logo">Library OPAC</h2>
        </div>
        <div class="content">
          <h1>Email Verification</h1>
          <p>Hello ${userName},</p>
          <p>Use the following OTP to verify your email and activate your Library OPAC account:</p>
          <div class="otp-box">${otp}</div>
          <p>This code will expire in ${validityMinutes} minutes.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Library OPAC. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  },

  bookIssuedTemplate: (data) => {
    const { userName, bookTitle, issueDate, dueDate } = data;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Book Issued Notification</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f9fafb;
          color: #333;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #fff;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
          color: #1d4ed8;
        }
        p {
          color: #4b5563;
        }
        .details {
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 13px;
          border-top: 1px solid #e5e7eb;
          margin-top: 30px;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Book Issued Successfully</h1>
        <p>Hello ${userName},</p>
        <p>The following book has been issued to your account:</p>
        <div class="details">
          <p><strong>Title:</strong> ${bookTitle}</p>
          <p><strong>Issued On:</strong> ${issueDate}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Please ensure to return or renew the book before the due date to avoid fines.</p>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Library OPAC</p>
        </div>
      </div>
    </body>
    </html>
    `;
  },

  dueReminderTemplate: (data) => {
    const { userName, bookTitle, dueDate } = data;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Due Date Reminder</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f9fafb;
          color: #333;
        }
        .container {
          max-width: 600px;
          background: #fff;
          margin: 0 auto;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
          color: #b91c1c;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 13px;
          border-top: 1px solid #e5e7eb;
          margin-top: 30px;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Due Date Approaching!</h1>
        <p>Hello ${userName},</p>
        <p>This is a reminder that the book you borrowed is due soon:</p>
        <p><strong>${bookTitle}</strong></p>
        <p>Please return or renew it by <strong>${dueDate}</strong> to avoid fines.</p>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Library OPAC</p>
        </div>
      </div>
    </body>
    </html>
    `;
  },

  passwordResetTemplate: (data) => {
    const { token, validityMinutes = 30, userName = 'User' } = data;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Password Reset Request</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f9fafb;
          color: #333;
        }
        .container {
          max-width: 600px;
          background: #fff;
          margin: 0 auto;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
          color: #1d4ed8;
        }
        .token-box {
          margin: 20px 0;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          font-family: monospace;
          word-break: break-all;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 13px;
          border-top: 1px solid #e5e7eb;
          margin-top: 30px;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Password Reset</h1>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password. Use the token below to proceed:</p>
        <div class="token-box">${token}</div>
        <p>This token will expire in ${validityMinutes} minutes.</p>
        <p>If you did not request this, you can safely ignore the email.</p>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Library OPAC</p>
        </div>
      </div>
    </body>
    </html>
    `;
  },
};

export default mailTemplates;
