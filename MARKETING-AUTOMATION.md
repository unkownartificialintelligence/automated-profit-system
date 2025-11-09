# Marketing Automation System

Complete marketing and advertising automation for team, customers, clients, partnerships, and sponsorship partners.

## Overview

The Marketing Automation System provides comprehensive tools to manage and automate all marketing activities across different audience segments.

### Key Features

- **Multi-Audience Management**: Team, Customers, Clients, Partners, Sponsors
- **Campaign Management**: Create, schedule, and track email campaigns
- **Email Automation**: Template-based email system with variable replacement
- **Partnership Management**: Track partnerships and sponsorships
- **Analytics & Reporting**: Real-time campaign performance tracking
- **Automation Workflows**: Trigger-based automated sequences

## Quick Start

### 1. Initialize Marketing Database

```bash
node setup-marketing.js
```

This creates:
- `marketing_contacts` table
- `marketing_campaigns` table
- `marketing_templates` table (with 6 starter templates)
- `social_media_posts` table
- `partnerships` table
- `content_library` table
- `automation_workflows` table
- `campaign_analytics` table
- `email_queue` table

### 2. Configure Email Service (Optional)

Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Note:** Email automation works without SMTP (logs to console for testing).

### 3. Access Marketing Dashboard

Navigate to Admin Panel → Marketing tab
- URL: `http://localhost:5173/admin` → Click "Marketing"

## Audience Types

The system supports 5 distinct audience segments:

### 1. Team Members
- Internal team communications
- Onboarding sequences
- Company updates
- Training materials

### 2. Customers
- Product updates
- Usage tips
- Engagement campaigns
- Retention emails

### 3. Clients
- Project updates
- Success stories
- Upsell campaigns
- Case studies

### 4. Partners
- Partnership proposals
- Collaboration opportunities
- Joint marketing campaigns
- Partner updates

### 5. Sponsors
- Sponsorship packages
- ROI reports
- Event invitations
- Recognition campaigns

## Features

### Contacts Management

**Add Contacts:**
- Manually via dashboard
- Bulk import (API)
- Automatic from client/partnership creation

**Contact Fields:**
- Email (required, unique)
- Name
- Company
- Contact Type (team/customer/client/partner/sponsor)
- Status (active/unsubscribed/bounced)
- Tags (for segmentation)
- Engagement score
- Last contacted date

**Contact Segmentation:**
- Filter by type
- Filter by status
- Filter by tags
- Search by name/email

### Campaign Management

**Campaign Types:**
- Email campaigns
- Social media campaigns
- Content campaigns
- Mixed campaigns

**Campaign Workflow:**
1. **Draft**: Create and edit campaign
2. **Scheduled**: Set launch date
3. **Running**: Active campaign
4. **Paused**: Temporarily stopped
5. **Completed**: Finished campaign

**Campaign Features:**
- Target specific audiences
- Use templates or custom content
- Schedule for specific date/time
- Set frequency (one-time, daily, weekly, monthly)
- Track performance in real-time
- A/B testing capabilities

### Email Templates

**Pre-built Templates:**
1. Team Welcome Email
2. Customer Onboarding
3. Partnership Proposal
4. Sponsorship Package
5. Monthly Newsletter
6. Client Success Story

**Template Variables:**
- `{{name}}` - Contact name
- `{{email}}` - Contact email
- `{{company}}` - Company name
- `{{tier}}` - Partnership tier
- `{{month}}` - Current month
- Custom variables per template

**Creating Templates:**
```javascript
{
  name: "Template Name",
  category: "welcome|newsletter|promotion|update|partnership|sponsorship",
  audience_type: "team|customer|client|partner|sponsor|all",
  subject: "Email Subject with {{variables}}",
  html_content: "<h1>HTML content with {{variables}}</h1>",
  text_content: "Plain text fallback",
  variables: ["name", "company", "custom"]
}
```

### Partnership Management

**Partnership Types:**
- Partners (strategic partnerships)
- Sponsors (sponsorship agreements)

**Partnership Tiers:**
- Bronze
- Silver
- Gold
- Platinum

**Partnership Status:**
- Prospect (potential partner)
- Active (current partnership)
- Inactive (paused)
- Expired (ended)

**Track:**
- Contact information
- Contract value
- Contract dates
- Benefits provided
- Deliverables owed
- Communication history

### Automation Workflows

**Trigger Types:**
- `new_contact`: When new contact added
- `tag_added`: When specific tag assigned
- `date`: Scheduled date/time
- `behavior`: Based on user actions

**Actions:**
- Send email from template
- Add/remove tags
- Create task for follow-up
- Update contact score
- Add to different campaign

**Example Workflows:**

**New Customer Welcome Series:**
```javascript
{
  trigger: "new_contact",
  condition: { contact_type: "customer" },
  actions: [
    { send_email: template_id_2, delay: 0 },
    { send_email: template_id_5, delay: 24h },
    { add_tag: "onboarded", delay: 48h }
  ]
}
```

**Partner Outreach:**
```javascript
{
  trigger: "tag_added",
  condition: { tag: "potential_partner" },
  actions: [
    { send_email: template_id_3, delay: 0 },
    { create_task: "Follow-up call", delay: 72h }
  ]
}
```

### Email Queue System

**Automatic Processing:**
- Runs every 5 minutes via cron job
- Processes up to 50 emails per batch
- Handles rate limiting
- Retries failed sends
- Tracks opens and clicks

**Email Tracking:**
- Sent time
- Opened (date/time)
- Clicked (date/time)
- Bounced
- Error messages

### Analytics & Reporting

**Dashboard Metrics:**
- Total contacts by type
- Active campaigns
- Total emails sent
- Average open rate
- Average click rate
- Partnership value

**Campaign Analytics:**
- Emails sent
- Emails opened (%)
- Emails clicked (%)
- Conversions
- Revenue generated
- ROI calculation

**Performance Tracking:**
- Daily/weekly/monthly trends
- Audience engagement scores
- Template performance
- Best sending times

## API Reference

All endpoints require admin authentication.

### Contacts

```
GET    /api/marketing/contacts?type=customer&status=active
POST   /api/marketing/contacts
PUT    /api/marketing/contacts/:id
DELETE /api/marketing/contacts/:id
```

### Campaigns

```
GET    /api/marketing/campaigns?status=running
GET    /api/marketing/campaigns/:id
POST   /api/marketing/campaigns
PUT    /api/marketing/campaigns/:id
POST   /api/marketing/campaigns/:id/launch
POST   /api/marketing/campaigns/:id/pause
```

### Templates

```
GET    /api/marketing/templates?category=welcome&audience=customer
GET    /api/marketing/templates/:id
POST   /api/marketing/templates
PUT    /api/marketing/templates/:id
```

### Partnerships

```
GET    /api/marketing/partnerships?type=sponsor&status=active
POST   /api/marketing/partnerships
PUT    /api/marketing/partnerships/:id
```

### Analytics

```
GET /api/marketing/dashboard
GET /api/marketing/analytics/performance?days=30
```

### Workflows

```
GET  /api/marketing/workflows
POST /api/marketing/workflows
PUT  /api/marketing/workflows/:id/toggle
```

## Usage Examples

### Creating a Contact

```javascript
const response = await fetch('http://localhost:3000/api/marketing/contacts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'partner@company.com',
    name: 'John Doe',
    company: 'Example Corp',
    contact_type: 'partner',
    tags: ['potential', 'tech'],
    metadata: { source: 'conference', interest: 'high' }
  })
});
```

### Creating a Campaign

```javascript
const campaign = await fetch('http://localhost:3000/api/marketing/campaigns', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Summer Partnership Drive',
    campaign_type: 'email',
    target_audience: 'partner',
    subject: 'Exciting Partnership Opportunities',
    content: '<h1>Partner with us!</h1><p>{{name}}, we have exciting opportunities for {{company}}...</p>',
    scheduled_date: '2025-06-01T09:00:00Z',
    frequency: 'one-time',
    budget: 5000
  })
});

// Launch campaign
await fetch(`http://localhost:3000/api/marketing/campaigns/${campaign.id}/launch`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
```

### Creating a Partnership

```javascript
await fetch('http://localhost:3000/api/marketing/partnerships', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    company_name: 'TechCorp Inc',
    contact_name: 'Jane Smith',
    email: 'jane@techcorp.com',
    phone: '555-0123',
    partnership_type: 'sponsor',
    tier: 'gold',
    contract_value: 50000,
    contract_start: '2025-01-01',
    contract_end: '2025-12-31',
    benefits: ['Logo placement', 'Blog mention', 'Event sponsorship'],
    deliverables: ['Monthly report', 'Quarterly review', 'Annual summary']
  })
});
```

## Best Practices

### Segmentation
1. Tag contacts appropriately
2. Use custom metadata for advanced filtering
3. Keep contact lists clean (remove bounced emails)
4. Update engagement scores regularly

### Email Campaigns
1. Test templates before sending
2. Personalize with variables
3. A/B test subject lines
4. Send at optimal times (9-11 AM, 2-4 PM)
5. Monitor unsubscribe rates

### Partnerships
1. Document all benefits and deliverables
2. Set calendar reminders for contract renewals
3. Track ROI for each partnership
4. Maintain regular communication
5. Update status promptly

### Automation
1. Start with simple workflows
2. Test on small audience first
3. Monitor workflow performance
4. Adjust delays based on engagement
5. Have fallback plans for failures

## Troubleshooting

### Emails Not Sending

**Check:**
1. SMTP configuration in `.env`
2. Email queue status: Check database `email_queue` table
3. Cron job running: Look for "Processing email queue..." in logs
4. Contact status is 'active'

**Debug:**
```bash
# Check email queue
sqlite3 database.db "SELECT * FROM email_queue WHERE status='failed' LIMIT 10;"

# Check campaign status
sqlite3 database.db "SELECT * FROM marketing_campaigns WHERE id=YOUR_CAMPAIGN_ID;"
```

### Low Open Rates

**Improve:**
1. Better subject lines (use A/B testing)
2. Send at different times
3. Segment audience more precisely
4. Personalize content
5. Clean email list (remove inactive)

### Campaign Not Launching

**Verify:**
1. Campaign status is not 'draft'
2. Target audience has active contacts
3. Template is set correctly
4. Admin permissions are correct

### Partnership Tracking Issues

**Solution:**
1. Ensure all required fields filled
2. Set proper contract dates
3. Use consistent tier naming
4. Document deliverables clearly

## Advanced Features

### Custom Email Tracking

Track custom events:
```javascript
// Track email open
emailService.trackOpen(emailId);

// Track email click
emailService.trackClick(emailId);
```

### Bulk Operations

Import multiple contacts:
```javascript
const contacts = [
  { email: 'user1@example.com', name: 'User 1', contact_type: 'customer' },
  { email: 'user2@example.com', name: 'User 2', contact_type: 'customer' }
];

for (const contact of contacts) {
  await marketing.createContact(contact);
}
```

### Custom Workflows

Create complex multi-step workflows:
```javascript
{
  name: "Sponsor Nurture Campaign",
  trigger_type: "tag_added",
  trigger_config: { tag: "sponsor_prospect" },
  audience_type: "sponsor",
  actions: [
    { type: "send_email", template_id: 4, delay_minutes: 0 },
    { type: "add_tag", tag: "contacted", delay_minutes: 1440 },
    { type: "send_email", template_id: 5, delay_minutes: 4320 },
    { type: "create_task", description: "Schedule demo call", delay_minutes: 7200 }
  ]
}
```

## Security

### Best Practices
1. Never commit `.env` with SMTP credentials
2. Use strong JWT secrets
3. Limit API access to admin users only
4. Regularly audit email sending permissions
5. Monitor for unusual sending patterns

### Data Protection
- Contacts can unsubscribe anytime
- Respect unsubscribe requests immediately
- Never share contact data
- Comply with GDPR/CAN-SPAM
- Store minimal personal data

## Performance

### Optimization Tips
1. Use email queue for bulk sends
2. Batch process contacts
3. Index database on frequently queried fields
4. Archive old campaigns
5. Clean up email queue regularly

### Scalability
- Email queue processes 50 emails per batch
- Runs every 5 minutes (300 emails/hour max)
- For higher volume, adjust cron schedule
- Consider external email service (SendGrid, Mailgun) for production

## Support

### Need Help?
1. Check this guide
2. Review API documentation
3. Check database schema in `setup-marketing.js`
4. Review error logs in terminal

### Common Questions

**Q: Can I use this without SMTP?**
A: Yes! Emails will be logged to console for testing.

**Q: How do I stop a campaign?**
A: Use the Pause button or call `/campaigns/:id/pause`

**Q: Can I send to multiple audience types?**
A: Yes! Set `target_audience: 'all'`

**Q: How do I track ROI?**
A: Set campaign budget and track conversions/revenue in analytics

---

**Version:** 1.0
**Last Updated:** 2025-11-09
