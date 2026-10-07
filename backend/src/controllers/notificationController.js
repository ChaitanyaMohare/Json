const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get all notifications (most recent first)
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const { unreadOnly, limit } = req.query;
    
    const filter = {};
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 50)
      .lean();

    const unreadCount = await Notification.countDocuments({ isRead: false });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// @desc    Create a notification (helper for internal use)
// @route   POST /api/notifications
exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    return res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};
