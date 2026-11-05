const { Resend } = require('resend');

// Helper to escape HTML characters and prevent injection
function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = async function handler(req, res) {
  // 1. Enforce POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Only POST requests are accepted.'
    });
  }

  try {
    // 2. Parse request body if needed
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON payload received.'
        });
      }
    }
    body = body || {};

    const { name, email, phone, message, _hp } = body;

    // 3. Spam Honeypot Protection: if hidden field is filled, silently drop
    if (_hp) {
      console.warn('Bot detected via honeypot field');
      return res.status(200).json({
        success: true,
        message: 'Message received.'
      });
    }

    // 4. Validate input fields
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid name (2 to 100 characters).'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail) || trimmedEmail.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    if (trimmedPhone && trimmedPhone.length > 35) {
      return res.status(400).json({
        success: false,
        error: 'Phone number cannot exceed 35 characters.'
      });
    }

    if (!trimmedMessage || trimmedMessage.length < 5 || trimmedMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message between 5 and 5000 characters.'
      });
    }

    // 5. Verify Resend API Key configuration
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY environment variable is not configured.');
      return res.status(500).json({
        success: false,
        error: 'Email service configuration is missing on the server. Please add RESEND_API_KEY in Vercel project settings (Settings -> Environment Variables).'
      });
    }

    const resend = new Resend(apiKey);

    const recipient = process.env.RECIPIENT_EMAIL || 'dudemithun07@gmail.com';
    const sender = process.env.FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';
    
    let submissionTime = '';
    try {
      submissionTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'long'
      });
    } catch (e) {
      submissionTime = new Date().toUTCString();
    }

    // 6. Build the email payload
    const subject = `New Portfolio Inquiry — ${trimmedName}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #4f46e5, #9333ea); padding: 24px 32px; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
          .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 32px; }
          .field { margin-bottom: 20px; }
          .label { font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
          .value { font-size: 15px; color: #0f172a; font-weight: 500; }
          .message-box { background: #f1f5f9; border-left: 4px solid #4f46e5; border-radius: 4px; padding: 16px; margin-top: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #1e293b; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>✦ New Inquiry from Portfolio</h1>
            <p>Submitted via https://my-portfolio-pi-seven-60.vercel.app/</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Visitor Name</div>
              <div class="value">${escapeHtml(trimmedName)}</div>
            </div>
            <div class="field">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:${escapeHtml(trimmedEmail)}" style="color: #4f46e5; text-decoration: none;">${escapeHtml(trimmedEmail)}</a></div>
            </div>
            <div class="field">
              <div class="label">Phone / WhatsApp Number</div>
              <div class="value">${escapeHtml(trimmedPhone || 'Not provided')}</div>
            </div>
            <div class="field">
              <div class="label">Submission Date & Time (IST)</div>
              <div class="value">${escapeHtml(submissionTime)}</div>
            </div>
            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${escapeHtml(trimmedMessage)}</div>
            </div>
          </div>
          <div class="footer">
            💡 You can directly reply to this email in your Gmail to contact <strong>${escapeHtml(trimmedName)}</strong> directly.
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
New Portfolio Inquiry from: ${trimmedName}
---------------------------------------------
Visitor Name: ${trimmedName}
Email: ${trimmedEmail}
Phone/WhatsApp: ${trimmedPhone || 'Not provided'}
Date & Time: ${submissionTime}

Message:
${trimmedMessage}
---------------------------------------------
Direct reply will be sent to: ${trimmedEmail}
    `.trim();

    // 7. Send email via Resend
    const { data, error } = await resend.emails.send({
      from: sender,
      to: [recipient],
      reply_to: trimmedEmail,
      subject: subject,
      html: htmlContent,
      text: textContent
    });

    if (error) {
      console.error('Resend delivery error:', error);
      return res.status(error.statusCode || 502).json({
        success: false,
        error: error.message || 'Failed to dispatch email through Resend.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry delivered successfully to Mithun.',
      id: data.id
    });

  } catch (err) {
    console.error('Unhandled server error in contact API:', err);
    return res.status(500).json({
      success: false,
      error: err && err.message ? err.message : 'An internal server error occurred while processing your message.'
    });
  }
};
