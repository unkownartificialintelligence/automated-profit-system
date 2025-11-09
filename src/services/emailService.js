import nodemailer from 'nodemailer';
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

class EmailService {
  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Replace template variables with actual values
  replaceVariables(content, variables) {
    let result = content;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, variables[key] || '');
    });
    return result;
  }

  // Send single email
  async sendEmail(to, subject, html, text) {
    try {
      if (!process.env.SMTP_USER) {
        console.log('📧 Email would be sent (SMTP not configured):');
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        return { success: true, messageId: 'test-' + Date.now() };
      }

      const info = await this.transporter.sendMail({
        from: `"Jerzii AI" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || subject,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email from template
  async sendTemplateEmail(templateId, contactId, variables = {}) {
    return new Promise((resolve, reject) => {
      // Get template
      db.get('SELECT * FROM marketing_templates WHERE id = ?', [templateId], async (err, template) => {
        if (err || !template) {
          return reject(new Error('Template not found'));
        }

        // Get contact
        db.get('SELECT * FROM marketing_contacts WHERE id = ?', [contactId], async (err, contact) => {
          if (err || !contact) {
            return reject(new Error('Contact not found'));
          }

          // Add default variables
          const allVariables = {
            name: contact.name,
            email: contact.email,
            company: contact.company,
            ...variables
          };

          // Replace variables in template
          const subject = this.replaceVariables(template.subject, allVariables);
          const html = this.replaceVariables(template.html_content, allVariables);
          const text = this.replaceVariables(template.text_content || '', allVariables);

          // Send email
          const result = await this.sendEmail(contact.email, subject, html, text);

          // Update contact last_contacted
          db.run('UPDATE marketing_contacts SET last_contacted = datetime(\'now\') WHERE id = ?', [contactId]);

          // Increment template usage
          db.run('UPDATE marketing_templates SET usage_count = usage_count + 1 WHERE id = ?', [templateId]);

          resolve(result);
        });
      });
    });
  }

  // Process email queue
  async processEmailQueue() {
    return new Promise((resolve) => {
      // Get pending emails that are due to be sent
      db.all(
        `SELECT eq.*, mc.email as contact_email
         FROM email_queue eq
         JOIN marketing_contacts mc ON eq.contact_id = mc.id
         WHERE eq.status = 'pending'
         AND eq.scheduled_time <= datetime('now')
         LIMIT 50`,
        [],
        async (err, emails) => {
          if (err || !emails || emails.length === 0) {
            return resolve({ processed: 0 });
          }

          let sent = 0;
          let failed = 0;

          for (const email of emails) {
            try {
              const result = await this.sendEmail(
                email.contact_email,
                email.subject,
                email.html_content,
                email.text_content
              );

              if (result.success) {
                // Mark as sent
                db.run(
                  `UPDATE email_queue
                   SET status = 'sent', sent_time = datetime('now')
                   WHERE id = ?`,
                  [email.id]
                );
                sent++;

                // Update campaign stats if associated
                if (email.campaign_id) {
                  db.run(
                    'UPDATE marketing_campaigns SET total_sent = total_sent + 1 WHERE id = ?',
                    [email.campaign_id]
                  );
                }
              } else {
                // Mark as failed
                db.run(
                  'UPDATE email_queue SET status = \'failed\', error_message = ? WHERE id = ?',
                  [result.error, email.id]
                );
                failed++;
              }
            } catch (error) {
              db.run(
                'UPDATE email_queue SET status = \'failed\', error_message = ? WHERE id = ?',
                [error.message, email.id]
              );
              failed++;
            }

            // Delay between emails to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          console.log(`📧 Email queue processed: ${sent} sent, ${failed} failed`);
          resolve({ processed: sent + failed, sent, failed });
        }
      );
    });
  }

  // Create email queue entries for campaign
  async queueCampaignEmails(campaignId) {
    return new Promise((resolve, reject) => {
      // Get campaign
      db.get('SELECT * FROM marketing_campaigns WHERE id = ?', [campaignId], (err, campaign) => {
        if (err || !campaign) {
          return reject(new Error('Campaign not found'));
        }

        // Get target contacts
        let contactQuery = 'SELECT * FROM marketing_contacts WHERE status = \'active\'';
        if (campaign.target_audience !== 'all') {
          contactQuery += ` AND contact_type = '${campaign.target_audience}'`;
        }

        db.all(contactQuery, [], (err, contacts) => {
          if (err || !contacts || contacts.length === 0) {
            return resolve({ queued: 0 });
          }

          let queued = 0;
          const insertStmt = db.prepare(`
            INSERT INTO email_queue (campaign_id, contact_id, subject, html_content, text_content, scheduled_time)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          contacts.forEach(contact => {
            // Replace variables in content
            const variables = {
              name: contact.name,
              email: contact.email,
              company: contact.company
            };

            const subject = this.replaceVariables(campaign.subject, variables);
            const content = this.replaceVariables(campaign.content, variables);
            const scheduledTime = campaign.scheduled_date || new Date().toISOString();

            insertStmt.run(
              campaignId,
              contact.id,
              subject,
              content,
              '',
              scheduledTime
            );

            queued++;
          });

          insertStmt.finalize();

          console.log(`📧 Queued ${queued} emails for campaign ${campaignId}`);
          resolve({ queued });
        });
      });
    });
  }

  // Track email open
  async trackOpen(emailId) {
    db.run(
      `UPDATE email_queue
       SET opened_at = datetime('now')
       WHERE id = ? AND opened_at IS NULL`,
      [emailId],
      (err) => {
        if (!err) {
          // Update campaign stats
          db.run(
            `UPDATE marketing_campaigns
             SET total_opened = total_opened + 1
             WHERE id = (SELECT campaign_id FROM email_queue WHERE id = ?)`,
            [emailId]
          );
        }
      }
    );
  }

  // Track email click
  async trackClick(emailId) {
    db.run(
      `UPDATE email_queue
       SET clicked_at = datetime('now')
       WHERE id = ? AND clicked_at IS NULL`,
      [emailId],
      (err) => {
        if (!err) {
          // Update campaign stats
          db.run(
            `UPDATE marketing_campaigns
             SET total_clicked = total_clicked + 1
             WHERE id = (SELECT campaign_id FROM email_queue WHERE id = ?)`,
            [emailId]
          );
        }
      }
    );
  }
}

export default new EmailService();
