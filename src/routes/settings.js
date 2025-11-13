import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET /api/settings - Get user settings
router.get('/', async (req, res) => {
  try {
    const settings = await db.get('SELECT * FROM settings WHERE id = 1');

    if (!settings) {
      // Return default settings
      return res.json({
        profile: {
          name: '',
          email: '',
          company: '',
          phone: '',
        },
        apiKeys: {
          printful: process.env.PRINTFUL_API_KEY || '',
          canva: process.env.CANVA_API_KEY || '',
          stripe: process.env.STRIPE_API_KEY || '',
          openai: process.env.OPENAI_API_KEY || '',
        },
        preferences: {
          emailNotifications: true,
          automationAlerts: true,
          weeklyReports: true,
          theme: 'light',
          language: 'en',
        },
      });
    }

    res.json({
      profile: {
        name: settings.user_name || '',
        email: settings.user_email || '',
        company: settings.user_company || '',
        phone: settings.user_phone || '',
      },
      apiKeys: {
        printful: settings.printful_api_key || process.env.PRINTFUL_API_KEY || '',
        canva: settings.canva_api_key || process.env.CANVA_API_KEY || '',
        stripe: settings.stripe_api_key || process.env.STRIPE_API_KEY || '',
        openai: settings.openai_api_key || process.env.OPENAI_API_KEY || '',
      },
      preferences: {
        emailNotifications: Boolean(settings.email_notifications),
        automationAlerts: Boolean(settings.automation_alerts),
        weeklyReports: Boolean(settings.weekly_reports),
        theme: settings.theme || 'light',
        language: settings.language || 'en',
      },
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings - Update user settings
router.put('/', async (req, res) => {
  try {
    const { profile, apiKeys, preferences } = req.body;

    // Update or insert settings
    await db.run(`
      INSERT INTO settings (
        id,
        user_name,
        user_email,
        user_company,
        user_phone,
        printful_api_key,
        canva_api_key,
        stripe_api_key,
        openai_api_key,
        email_notifications,
        automation_alerts,
        weekly_reports,
        theme,
        language
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_name = excluded.user_name,
        user_email = excluded.user_email,
        user_company = excluded.user_company,
        user_phone = excluded.user_phone,
        printful_api_key = excluded.printful_api_key,
        canva_api_key = excluded.canva_api_key,
        stripe_api_key = excluded.stripe_api_key,
        openai_api_key = excluded.openai_api_key,
        email_notifications = excluded.email_notifications,
        automation_alerts = excluded.automation_alerts,
        weekly_reports = excluded.weekly_reports,
        theme = excluded.theme,
        language = excluded.language
    `, [
      profile?.name || '',
      profile?.email || '',
      profile?.company || '',
      profile?.phone || '',
      apiKeys?.printful || '',
      apiKeys?.canva || '',
      apiKeys?.stripe || '',
      apiKeys?.openai || '',
      preferences?.emailNotifications ? 1 : 0,
      preferences?.automationAlerts ? 1 : 0,
      preferences?.weeklyReports ? 1 : 0,
      preferences?.theme || 'light',
      preferences?.language || 'en',
    ]);

    const updatedSettings = await db.get('SELECT * FROM settings WHERE id = 1');

    res.json({
      message: 'Settings updated successfully',
      settings: {
        profile: {
          name: updatedSettings.user_name,
          email: updatedSettings.user_email,
          company: updatedSettings.user_company,
          phone: updatedSettings.user_phone,
        },
        apiKeys: {
          printful: updatedSettings.printful_api_key,
          canva: updatedSettings.canva_api_key,
          stripe: updatedSettings.stripe_api_key,
          openai: updatedSettings.openai_api_key,
        },
        preferences: {
          emailNotifications: Boolean(updatedSettings.email_notifications),
          automationAlerts: Boolean(updatedSettings.automation_alerts),
          weeklyReports: Boolean(updatedSettings.weekly_reports),
          theme: updatedSettings.theme,
          language: updatedSettings.language,
        },
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
