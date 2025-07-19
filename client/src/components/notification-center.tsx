import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, X, AlertTriangle, Check, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { Notification } from "@shared/schema";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export default function NotificationCenter({ isOpen, onClose, userId }: NotificationCenterProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", userId],
    enabled: isOpen,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الإشعار",
        variant: "destructive",
      });
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expiry_warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'expired':
        return <X className="w-5 h-5 text-red-500" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'expiry_warning':
        return `منتج "${notification.title}" سينتهي خلال ${notification.message}`;
      case 'expired':
        return `منتج "${notification.title}" انتهى منذ ${notification.message}`;
      case 'reminder':
        return notification.message;
      default:
        return notification.message;
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full mx-4 max-h-[80vh] overflow-hidden" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 font-arabic flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-6 h-6 text-primary ml-3" />
              <span>الإشعارات</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="mr-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-start space-x-reverse space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 font-arabic">
                لا توجد إشعارات
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-arabic">
                ستظهر الإشعارات هنا عند توفرها
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors ${
                    !notification.isRead 
                      ? 'bg-blue-50 dark:bg-blue-950/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-reverse space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 font-arabic">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic mt-1">
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {format(new Date(notification.createdAt), "PPp", { locale: ar })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <Button
              variant="outline"
              className="w-full font-arabic"
              onClick={() => {
                // Mark all as read
                notifications
                  .filter(n => !n.isRead)
                  .forEach(n => markAsReadMutation.mutate(n.id));
              }}
              disabled={markAsReadMutation.isPending}
            >
              {markAsReadMutation.isPending ? "جاري التحديث..." : "وضع علامة قراءة على الكل"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Notification Service - for creating smart notifications
export const NotificationService = {
  async createExpiryNotification(userId: number, productId: number, productName: string, daysUntilExpiry: number) {
    const notificationData = {
      userId,
      productId,
      type: daysUntilExpiry <= 0 ? 'expired' : 'expiry_warning',
      title: productName,
      message: daysUntilExpiry <= 0 
        ? `${Math.abs(daysUntilExpiry)} أيام` 
        : daysUntilExpiry === 1 
        ? "غداً" 
        : `${daysUntilExpiry} أيام`,
      isRead: false,
      scheduledAt: null,
      sentAt: new Date(),
    };

    try {
      await apiRequest("POST", "/api/notifications", notificationData);
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  },

  async createReminderNotification(userId: number, title: string, message: string) {
    const notificationData = {
      userId,
      productId: null,
      type: 'reminder',
      title,
      message,
      isRead: false,
      scheduledAt: null,
      sentAt: new Date(),
    };

    try {
      await apiRequest("POST", "/api/notifications", notificationData);
    } catch (error) {
      console.error("Failed to create reminder notification:", error);
    }
  }
};