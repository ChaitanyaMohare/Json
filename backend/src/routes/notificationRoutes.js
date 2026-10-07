const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} = require('../controllers/notificationController');

router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.get('/unread-count', getUnreadCount);

router.patch('/read-all', markAllAsRead);

router.route('/:id')
  .delete(deleteNotification);

router.patch('/:id/read', markAsRead);

module.exports = router;
