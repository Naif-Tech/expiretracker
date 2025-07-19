import { Settings as SettingsIcon, Moon, Sun, User, Bell, Share, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  userId: number;
}

export default function Settings({ userId }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'إكسباير - تطبيق إدارة تواريخ الانتهاء',
        text: 'تطبيق ذكي لتتبع تواريخ انتهاء صلاحية المنتجات المنزلية',
        url: window.location.origin,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط التطبيق إلى الحافظة",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "قريباً",
      description: "ستتم إضافة وظيفة تصدير البيانات قريباً",
    });
  };

  const settingsGroups = [
    {
      title: "الحساب",
      items: [
        {
          icon: User,
          label: "تعديل الملف الشخصي",
          description: "تغيير الاسم والصورة الشخصية",
          action: () => toast({ title: "قريباً", description: "ستتم إضافة هذه الميزة قريباً" }),
        },
      ],
    },
    {
      title: "التطبيق",
      items: [
        {
          icon: theme === "dark" ? Sun : Moon,
          label: "الوضع الليلي",
          description: "تفعيل أو إلغاء الوضع الليلي",
          toggle: true,
          checked: theme === "dark",
          action: () => setTheme(theme === "dark" ? "light" : "dark"),
        },
        {
          icon: Bell,
          label: "التنبيهات",
          description: "إدارة إعدادات التنبيهات",
          action: () => toast({ title: "قريباً", description: "ستتم إضافة إعدادات التنبيهات قريباً" }),
        },
      ],
    },
    {
      title: "البيانات",
      items: [
        {
          icon: Share,
          label: "تصدير البيانات",
          description: "تصدير قائمة المنتجات",
          action: handleExportData,
        },
        {
          icon: Share,
          label: "مشاركة التطبيق",
          description: "مشاركة التطبيق مع الأصدقاء",
          action: handleShareApp,
        },
      ],
    },
    {
      title: "معلومات",
      items: [
        {
          icon: Info,
          label: "حول التطبيق",
          description: "الإصدار 1.0.0",
          action: () => toast({ 
            title: "إكسباير", 
            description: "تطبيق ذكي لإدارة تواريخ انتهاء صلاحية المنتجات المنزلية - الإصدار 1.0.0" 
          }),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <SettingsIcon className="w-8 h-8 text-primary ml-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-arabic">الإعدادات</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">تخصيص التطبيق حسب احتياجاتك</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* User Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 font-arabic">
                  أحمد محمد
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ahmed@example.com
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-arabic">
                  عضو منذ يناير 2024
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 font-arabic px-2">
              {group.title}
            </h2>
            <Card>
              <CardContent className="p-0">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={itemIndex}
                      className={`flex items-center justify-between p-4 ${
                        itemIndex !== group.items.length - 1 
                          ? "border-b border-gray-200 dark:border-gray-700" 
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 font-arabic">
                            {item.label}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      
                      {item.toggle ? (
                        <Switch
                          checked={item.checked}
                          onCheckedChange={item.action}
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={item.action}
                          className="text-primary hover:text-primary/80"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                          </svg>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* App Info */}
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 font-arabic mb-1">
            إكسباير
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic mb-2">
            تطبيق ذكي لإدارة تواريخ انتهاء الصلاحية
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            الإصدار 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
