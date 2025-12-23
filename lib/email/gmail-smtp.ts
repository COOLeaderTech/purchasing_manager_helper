import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
}

interface SendResult {
  messageId: string;
  success: boolean;
  error?: string;
}

let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize Gmail SMTP transporter (lazy init)
 */
function getTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  const user = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;

  if (!user || !password) {
    throw new Error('Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.');
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass: password,
    },
  });

  return transporter;
}

/**
 * Send email via Gmail SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  try {
    const transport = getTransporter();

    const info = await transport.sendMail({
      from: process.env.GMAIL_USER,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      cc: options.cc?.join(','),
      bcc: options.bcc?.join(','),
      subject: options.subject,
      html: options.html,
    });

    return {
      messageId: info.messageId || '',
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      messageId: '',
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send RFQ email to vendors
 */
export async function sendRFQEmail(params: {
  recipients: string[];
  subject: string;
  body: string;
  vessel_name: string;
  port_name: string;
}): Promise<SendResult> {
  const { recipients, subject, body, vessel_name, port_name } = params;

  // Format email body with HTML styling
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background-color: #1e3a5f; color: white; padding: 20px; border-radius: 4px 4px 0 0; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .footer { background-color: #f5f5f5; padding: 15px; font-size: 12px; color: #666; border-radius: 0 0 4px 4px; }
    .item-list { margin: 20px 0; }
    .item { margin: 10px 0; padding: 10px; background-color: #f9f9f9; border-left: 3px solid #1e3a5f; }
    .footer-divider { border-top: 1px solid #ddd; margin-top: 20px; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>REQUEST FOR QUOTATION</h2>
      <p><strong>Vessel:</strong> ${vessel_name} | <strong>Port:</strong> ${port_name}</p>
    </div>
    <div class="content">
      ${body.split('\n').map(line => `<p>${line.trim()}</p>`).join('')}
    </div>
    <div class="footer">
      <p><strong>This is an automated RFQ email. Please do not reply to this address.</strong></p>
      <p>For any questions or clarifications, please reply to the sender's email address.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: recipients,
    subject,
    html: htmlBody,
  });
}

/**
 * Verify email configuration (test connection)
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
}
