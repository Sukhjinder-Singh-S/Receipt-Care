"use strict";

require("dotenv").config();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const emailContent = (check, mailType, req, token) => {
  if (mailType == 0) {
    return `<p>Dear ${check.name},</p>
          
    <p>We hope this email finds you well. Our records indicate that it's been a while since you last changed your password for your account.</p>
    
    <p>To ensure the security of your account and protect your personal information, we kindly request that you reset your password.</p>
    
    <p>Please click on the following link to proceed with the password reset:</p>
    
    <p><a href="${req.protocol}://${req.headers.host}/user/resetLink/${token}">Reset Password</a></p>
    
    <p>If you did not initiate this password reset request, please disregard this email. Your account remains secure, and no further action is required.</p>
    
    <p>If you encounter any difficulties or have any questions regarding the password reset process, please don't hesitate to reach out to our support team for assistance.</p>
    
    <p>Thank you for your attention to this matter. Ensuring the security of your account is our top priority.</p>
    
    <p>Best regards,</p>
    <p>Your Receipt Care Team</p>
    `;
  } else if (mailType == 1) {
    return `<h1>Account Notification</h1>
        <p>Dear ${check.name},</p>
        
        <p>We hope this email finds you well. It seems that you haven't logged into your account for a while, and we wanted to bring it to your attention.</p>
        
        <p>If you have forgotten your login credentials or are experiencing any issues accessing your account, please don't hesitate to reach out to our support team for assistance.</p>
        
        <p>You're account deactivated with in 24 hours.</p>
        <p>To avoid deactivation of you're account,Please Login to you're account.</p>

        <p>if you found you're account is already deactivated,Please send email to our Receipt Care team</p>
        
        <p>Thank you for your attention and cooperation.</p>
        
        <p>Best regards,</p>
        <p>Your Receipt Care Team</p>`;
  } else if (mailType == 2) {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MyApp</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
          }
    
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 40px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
    
          h1 {
            font-size: 24px;
            margin-bottom: 20px;
          }
    
          p {
            margin-bottom: 20px;
          }
    
          .cta-button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #fefeff;
            color: #000000;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Receipt Care</h1>
          <p>Dear ${check.name}</p>
          <p>Thank you for signing up for our app. We are excited to have you on board!</p>
          <p>To get started, please click the button below to verify your email:</p>
          <p>
            <a href=${req.protocol}://${req.headers.host}/user/confirmEmail/${token} class="cta-button">Verify Email</a>
          </p>
          <p>If you have any questions or need assistance, please feel free to contact our support team.</p>
          <p>Best regards,</p>
          <p>Receipt Care Team</p>
        </div>
      </body>
    </html>
    `;
  } else if (mailType == 3) {
    return `
    <p><a href="${req.invoiceUrl}">Pay</a></p>
    `;
  }
};

exports.SENDMAIL = async (check, mailType, req) => {
  console.log(">>>>>>>>>>> In mail condition  >>>>>>>>>>>>>");
  let token;
  if (check != null) {
    token = jwt.sign(
      {
        userId: check._id.toString(),
        premium: check.premium,
        email: check.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
  }
  const mailer = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  let subject;
  if (mailType == 0) {
    subject = "Reset Password";
  } else if (mailType == 1) {
    subject = "Account Notification";
  } else if (mailType == 2) {
    subject = "Welcome To Receipt Care";
  } else if (mailType == 3) {
    subject = `Subscribe`;
  }
  //check.email,
  await mailer.sendMail({
    from: `Reciept <${process.env.MAIL_USERNAME}>`,
    to: token ? check.email : req.email,
    subject: subject,
    html: token
      ? emailContent(check, mailType, req, token)
      : emailContent(check, mailType, req),
  });
  console.log(">>>>>>>>>>>>>> Mail send >>>>>>>>>>>>>>>>>>>");
  req.invoiceUrl = null;
};
