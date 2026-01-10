import nodemailer from 'nodemailer';

const logoUrl = process.env.LOGO_URL || "https://mongilodge.com/src/logo.png";

export default async ({ req, res, log, error }) => {
    try {
        log('Function started');

        // Parse request body
        let data;
        try {
            data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

            // If body is wrapped in another layer
            if (data.body && typeof data.body === 'string') {
                data = JSON.parse(data.body);
            }

            log('Data parsed: ' + JSON.stringify(data));
        } catch (e) {
            error('Failed to parse body: ' + e.message);
            return res.json({ success: false, message: 'Invalid request data' }, 400);
        }

        // Honeypot check
        if (data._gotcha || data._honeypot) {
            log('Spam detected');
            return res.json({ success: false, message: 'Spam detected' }, 400);
        }

        // Validate required fields
        if (!data.Email || !data.Message) {
            log('Missing required fields');
            return res.json({
                success: false,
                message: 'Email and Message are required'
            }, 400);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.Email)) {
            log('Invalid email format');
            return res.json({
                success: false,
                message: 'Invalid email address'
            }, 400);
        }

        log('Validation passed, setting up email transport');

        // Configure Gmail SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        log('Transport configured, preparing email');

        // Get the origin URL from the request (where the form was submitted from)
        const websiteUrl = data._origin || req.headers['origin'] || req.headers['referer'] || 'Website';

        // Prepare email content
        const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #166534; color: white; padding: 30px 20px; text-align: center; border-bottom: 3px solid #374151; }
          .logo { max-width: 80px; height: auto; margin-bottom: 15px; }
          .header h2 { margin: 0; }
          .from-section { background-color: #f3f4f6; padding: 12px 20px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
          .from-section strong { color: #1f2937; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #1f2937; }
          .value { margin-top: 5px; }
          .message-box { background-color: white; padding: 15px; border-left: 4px solid #166534; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Logo" class="logo">
            <h2>New Contact Form Submission</h2>
          </div>
          <div class="from-section">
            <strong>From:</strong> ${websiteUrl}
          </div>
          <div class="content">
            ${data['First Name'] || data['Last Name'] ? `
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${data['First Name'] || ''} ${data['Last Name'] || ''}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${data.Email}">${data.Email}</a></div>
            </div>
            
            ${data['Country Code'] || data.Phone ? `
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value">${data['Country Code'] || ''} ${data.Phone || ''}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="message-box">${data.Message.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="field">
              <div class="label">Submitted:</div>
              <div class="value">${new Date().toLocaleString('en-US', 
            { timeZone: 'America/Chicago', dateStyle: 'short', timeStyle: 'short' })}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

        const emailText = `
New Contact Form Submission

From: ${websiteUrl}

${data['First Name'] || data['Last Name'] ? `Name: ${data['First Name'] || ''} ${data['Last Name'] || ''}\n` : ''}
Email: ${data.Email}
${data['Country Code'] || data.Phone ? `Phone: ${data['Country Code'] || ''} ${data.Phone || ''}\n` : ''}

Message:
${data.Message}

Submitted: ${new Date().toLocaleString()}
    `;

        log('Sending email...');

        // Support multiple recipient emails (comma-separated)
        const recipients = process.env.RECIPIENT_EMAIL.split(',').map(email => email.trim()).join(',');

        await transporter.sendMail({
            from: `"Mongi Contact Form" <${process.env.GMAIL_USER}>`,
            to: recipients,
            replyTo: data.Email,
            subject: `New Contact: ${data['First Name'] || data.Email}`,
            text: emailText,
            html: emailHtml
        });

        log('Email sent successfully');

        return res.json({
            success: true,
            message: 'Form submitted successfully'
        }, 200);

    } catch (err) {
        error('Error: ' + err.message);
        error('Stack: ' + err.stack);
        return res.json({
            success: false,
            message: 'Server error: ' + err.message
        }, 500);
    }
};
