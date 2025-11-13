import bcrypt from 'bcryptjs';
import db from '../src/database.js';

async function createDefaultUsers() {
  console.log('Creating default users...\n');

  const users = [
    {
      email: 'admin@jerzii.ai',
      password: 'Admin@2025',
      name: 'System Administrator',
      role: 'admin',
      company: 'Jerzii AI'
    },
    {
      email: 'owner@jerzii.ai',
      password: 'Owner@2025',
      name: 'Business Owner',
      role: 'admin',
      company: 'Jerzii AI'
    },
    {
      email: 'team1@jerzii.ai',
      password: 'Team@2025',
      name: 'Team Member 1',
      role: 'team',
      company: 'Jerzii AI'
    },
    {
      email: 'team2@jerzii.ai',
      password: 'Team@2025',
      name: 'Team Member 2',
      role: 'team',
      company: 'Jerzii AI'
    },
    {
      email: 'client1@example.com',
      password: 'Client@2025',
      name: 'Demo Client 1',
      role: 'client',
      company: 'Client Company 1'
    },
    {
      email: 'client2@example.com',
      password: 'Client@2025',
      name: 'Demo Client 2',
      role: 'client',
      company: 'Client Company 2'
    }
  ];

  try {
    for (const userData of users) {
      // Check if user exists
      const existing = await db.get('SELECT * FROM users WHERE email = ?', [userData.email]);

      if (existing) {
        console.log(`✓ User ${userData.email} already exists (skipping)`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      await db.run(
        `INSERT INTO users (email, password, name, role, company, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'active', datetime('now'))`,
        [userData.email, hashedPassword, userData.name, userData.role, userData.company]
      );

      console.log(`✓ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n✅ Default users created successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('🔐 ADMIN ACCOUNTS (Full Access)');
    console.log('   Email: admin@jerzii.ai');
    console.log('   Password: Admin@2025\n');
    console.log('   Email: owner@jerzii.ai');
    console.log('   Password: Owner@2025\n');

    console.log('👥 TEAM ACCOUNTS (Team Features)');
    console.log('   Email: team1@jerzii.ai');
    console.log('   Password: Team@2025\n');
    console.log('   Email: team2@jerzii.ai');
    console.log('   Password: Team@2025\n');

    console.log('👤 CLIENT ACCOUNTS (Limited Access)');
    console.log('   Email: client1@example.com');
    console.log('   Password: Client@2025\n');
    console.log('   Email: client2@example.com');
    console.log('   Password: Client@2025\n');

    console.log('═══════════════════════════════════════════════════');
    console.log('⚠️  IMPORTANT: Change these passwords in production!');
    console.log('═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
}

createDefaultUsers();
