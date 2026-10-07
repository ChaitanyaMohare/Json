'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  Notification
} from '../lib/api';
import { Bell, XCircle, CheckCircle2, AlertTriangle, Users, Clock, MapPin } from './Icons';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

export default function NotificationPanel({ isOpen, onClose, onUnreadCountChange }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { notifications: data, unreadCount } = await getNotifications(filter === 'unread', 20);
      setNotifications(data);
      onUnreadCountChange(unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-50 border-red-200 text-red-700';
      case 'HIGH': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'MEDIUM': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'NEW_REPORT': return <AlertTriangle className="w-4 h-4" />;
      case 'INCIDENT_PROMOTED': return <Users className="w-4 h-4" />;
      case 'STATUS_CHANGE': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-700" />
              Notifications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {notifications.filter(n => !n.isRead).length} unread
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 px-5 py-3 bg-white border-b border-slate-100">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-[#0d7a68] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'unread'
                ? 'bg-[#0d7a68] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unread
          </button>

          <div className="flex-1" />

          {notifications.filter(n => !n.isRead).length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-400">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No notifications</p>
              <p className="text-xs text-slate-400 mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    !notif.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      getPriorityColor(notif.priority)
                    }`}>
                      {getTypeIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {notif.title}
                        </h3>
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="text-blue-600 hover:text-blue-700 shrink-0"
                            title="Mark as read"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Reporter Info */}
                      {notif.reporterInfo && (
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <div className="w-3.5 h-3.5 rounded-full bg-slate-300 flex items-center justify-center text-[8px] font-bold text-white">
                              {notif.reporterInfo.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{notif.reporterInfo.name}</span>
                          </div>
                          {notif.reporterInfo.email && (
                            <span className="truncate">{notif.reporterInfo.email}</span>
                          )}
                        </div>
                      )}

                      {/* Report Details */}
                      {notif.reportDetails && (
                        <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700">
                              {notif.reportDetails.type.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              notif.reportDetails.severity === 'HIGH'
                                ? 'bg-red-100 text-red-700'
                                : notif.reportDetails.severity === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {notif.reportDetails.severity}
                            </span>
                          </div>
                          <div className="flex items-start gap-1 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{notif.reportDetails.location}</span>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(notif.createdAt)}
                        </div>

                        <div className="flex items-center gap-2">
                          {notif.reportId && (
                            <Link
                              href={`/admin/reports/${notif.reportId}`}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                              onClick={onClose}
                            >
                              View Report
                            </Link>
                          )}
                          {notif.incidentId && (
                            <Link
                              href={`/admin/incidents/${notif.incidentId}`}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                              onClick={onClose}
                            >
                              View Incident
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(notif._id)}
                            className="text-xs font-semibold text-slate-400 hover:text-red-600"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
