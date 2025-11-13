import bcrypt from 'bcryptjs';
import db from '../src/database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function changeOwnerPassword() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔐 OWNER ACCOUNT PASSWORD CHANGE');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get current owner info
    const owner = await db.get('SELECT * FROM users WHERE email = ?', ['owner@jerzii.ai']);

    if (!owner) {
      console.error('❌ Owner account not found!');
      process.exit(1);
    }

    console.log(`Account: ${owner.name} (${owner.email})\n`);

    // Ask for current password
    const currentPassword = await question('Enter current password: ');

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, owner.password);

    if (!validPassword) {
      console.error('\n❌ Current password is incorrect!');
      rl.close();
      process.exit(1);
    }

    console.log('✓ Current password verified\n');

    // Ask for new password
    const newPassword = await question('Enter new password (min 8 characters): ');

    if (newPassword.length < 8) {
      console.error('\n❌ Password must be at least 8 characters long!');
      rl.close();
      process.exit(1);
    }

    // Ask for confirmation
    const confirmPassword = await question('Confirm new password: ');

    if (newPassword !== confirmPassword) {
      console.error('\n❌ Passwords do not match!');
      rl.close();
      process.exit(1);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await db.run(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'owner@jerzii.ai']
    );

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ PASSWORD CHANGED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Remember your new password!');
    console.log('   Email: owner@jerzii.ai');
    console.log('   New password: [securely saved]\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error changing password:', error);
    rl.close();
    process.exit(1);
  }
}

changeOwnerPassword();
