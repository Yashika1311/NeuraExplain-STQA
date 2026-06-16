const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

// Create a test account (for development only)
const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// Create a production transporter (configure with your actual email service)
const createProductionTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Get the email template
const getEmailTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '..', 'views', 'emails', `${templateName}.ejs`);
    const template = await readFile(templatePath, 'utf-8');
    return ejs.render(template, data);
  } catch (error) {
    console.error('Error loading email template:', error);
    throw new Error('Failed to load email template');
  }
};

// Send email function
const sendEmail = async (options) => {
  try {
    let transporter;
    
    if (process.env.NODE_ENV === 'production') {
      transporter = createProductionTransporter();
    } else {
      // In development, use ethereal.email
      console.log('Creating test email account...');
      transporter = await createTestAccount();
    }

    const { email, subject, template, context } = options;
    
    // Render email template
    const html = await getEmailTemplate(template, context);
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'NeuraExplain'}" <${process.env.EMAIL_FROM || 'noreply@neuraexplain.com'}>`,
      to: email,
      subject,
      html,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;
