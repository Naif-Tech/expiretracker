import { Package, BarChart3, Tag, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    {
      id: "products",
      label: "المنتجات",
      icon: Package,
    },
    {
      id: "statistics",
      label: "إحصائيات",
      icon: BarChart3,
    },
    {
      id: "categories",
      label: "الفئات",
      icon: Tag,
    },
    {
      id: "settings",
      label: "الإعدادات",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-20">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center py-2 px-3 transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium font-arabic">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
