'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh, // Get the refresh function from hook
  } = useNotifications({ userId });

  const [open, setOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isAppealDialogOpen, setIsAppealDialogOpen] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'IMAGE_VERIFIED':
        return '✅';
      case 'IMAGE_FLAGGED':
        return '❌';
      case 'IMAGE_APPEAL':
        return '⚖️';
      case 'BATCH_VERIFIED':
        return '🎉';
      case 'BATCH_REJECTED':
        return '⚠️';
      case 'STAGE_COMPLETE':
        return '📋';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'IMAGE_VERIFIED':
      case 'BATCH_VERIFIED':
      case 'STAGE_COMPLETE':
        return 'bg-green-50 border-green-200';
      case 'IMAGE_FLAGGED':
      case 'BATCH_REJECTED':
        return 'bg-red-50 border-red-200';
      case 'IMAGE_APPEAL':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead([notification.id]);
    }
    
    // Handle different notification types
    if (notification.type === 'IMAGE_APPEAL') {
      // Show appeal details dialog
      setSelectedNotification(notification);
      setIsAppealDialogOpen(true);
      setOpen(false);
    } else if (notification.actionUrl) {
      // Navigate to the actionUrl if provided
      window.location.href = notification.actionUrl;
      setOpen(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500); // Show spinner for at least 500ms
  };

  const handleBellClick = async () => {
    // Auto-refresh notifications when opening the bell
    if (!open) {
      setIsRefreshing(true);
      await refresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <>
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100 rounded-full"
          onClick={handleBellClick}
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-xs h-7 px-2"
              title="Refresh notifications"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7 px-2"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        <span className="text-sm">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Show appeal details if it's an appeal notification */}
                          {notification.type === 'IMAGE_APPEAL' &&
                            notification.metadata?.appealReason && (
                              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                                <p className="font-medium text-orange-900">
                                  Appeal Reason:
                                </p>
                                <p className="text-orange-700 mt-1">
                                  {notification.metadata.appealReason}
                                </p>
                                {notification.metadata.farmerName && (
                                  <p className="text-orange-600 mt-1 text-[10px]">
                                    From: {notification.metadata.farmerName}
                                  </p>
                                )}
                              </div>
                            )}

                          {/* Show rejection reason if it's a flagged image */}
                          {notification.type === 'IMAGE_FLAGGED' &&
                            notification.metadata?.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                <p className="font-medium text-red-900">
                                  Reason:
                                </p>
                                <p className="text-red-700 mt-1">
                                  {notification.metadata.rejectionReason}
                                </p>
                              </div>
                            )}

                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-600"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Appeal Details Dialog */}
    <Dialog open={isAppealDialogOpen} onOpenChange={setIsAppealDialogOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-orange-700">
            Image Appeal Details
          </DialogTitle>
          <DialogDescription>
            Review the farmer's appeal for the flagged image
          </DialogDescription>
        </DialogHeader>
        {selectedNotification && selectedNotification.metadata && (
          <div className="space-y-6 py-4">
            {/* Farmer Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Farmer Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Name:</span>
                  <span className="font-semibold text-blue-900">
                    {selectedNotification.metadata.farmerName || 'Unknown Farmer'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Farmer ID:</span>
                  <span className="font-mono text-xs text-blue-600">
                    {selectedNotification.metadata.farmerId?.substring(0, 20)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Appeal Info */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Appeal Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-orange-700">Reason:</span>
                  <p className="mt-1 text-orange-900 bg-white p-3 rounded border border-orange-100">
                    {selectedNotification.metadata.appealReason || 'No reason provided'}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">Status:</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    {selectedNotification.metadata.appealStatus || 'PENDING'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">Submitted:</span>
                  <span className="text-orange-900 text-xs">
                    {formatDistanceToNow(new Date(selectedNotification.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Flagged Image */}
            {selectedNotification.metadata.imageUrl && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Flagged Image</h3>
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={selectedNotification.metadata.imageUrl}
                    alt="Flagged image"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This image was flagged as potentially fake/AI-generated
                </p>
              </div>
            )}

            {/* Batch Info */}
            {selectedNotification.metadata.batchId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Batch Information</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Batch ID:</span>
                    <span className="font-mono text-xs text-green-600">
                      {selectedNotification.metadata.batchId?.substring(0, 20)}...
                    </span>
                  </div>
                  {selectedNotification.metadata.stageId && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Stage ID:</span>
                      <span className="font-mono text-xs text-green-600">
                        {selectedNotification.metadata.stageId?.substring(0, 20)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => {
                  // TODO: Navigate to batch details or admin verification page
                  window.location.href = '/admin';
                  setIsAppealDialogOpen(false);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Go to Admin Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAppealDialogOpen(false)}
                className="px-8"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </>
  );
}
