/**
 * Generate notifications for existing reports
 * Usage: node backend/scripts/generateNotifications.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Report = require('../src/models/Report');
const Notification = require('../src/models/Notification');
const notificationService = require('../src/services/notificationService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/routeguard';

async function generateNotifications() {
  try {
    console.log('🔌 Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    // Get all existing reports
    const reports = await Report.find().sort({ createdAt: -1 });
    console.log(`📊 Found ${reports.length} reports\n`);

    // Clear existing notifications
    console.log('🗑️  Clearing old notifications...');
    await Notification.deleteMany({});
    console.log('✅ Cleared!\n');

    // Generate notifications for each report
    console.log('🔔 Generating notifications...');
    let count = 0;
    for (const report of reports) {
      try {
        await notificationService.createReportNotification(report);
        count++;
        process.stdout.write(`\r  Created ${count}/${reports.length} notifications...`);
      } catch (err) {
        console.error(`\n  ❌ Failed for report ${report._id}:`, err.message);
      }
    }
    console.log(`\n✅ Created ${count} notifications!\n`);

    // Show summary
    const unreadCount = await Notification.countDocuments({ isRead: false });
    const urgentCount = await Notification.countDocuments({ priority: 'URGENT' });
    const highCount = await Notification.countDocuments({ priority: 'HIGH' });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ NOTIFICATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📬 Total: ${count}`);
    console.log(`🔴 Unread: ${unreadCount}`);
    console.log(`🚨 Urgent: ${urgentCount}`);
    console.log(`⚠️  High: ${highCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🌐 Check notifications at: http://localhost:3000/admin');
    console.log('   Click the bell icon in the top right corner\n');

    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateNotifications();
}

module.exports = { generateNotifications };
