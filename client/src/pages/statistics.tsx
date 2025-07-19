import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCards from "@/components/stats-cards";
import type { ProductWithCategory, DashboardStats } from "@shared/schema";

interface StatisticsProps {
  userId: number;
}

export default function Statistics({ userId }: StatisticsProps) {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard", userId],
  });

  // Fetch products for detailed analytics
  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", userId],
  });

  // Fetch expiring products (next 7 days)
  const { data: expiringProducts = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/expiring", userId, 7],
    queryFn: async () => {
      const response = await fetch(`/api/expiring/${userId}?days=7`);
      if (!response.ok) throw new Error('Failed to fetch expiring products');
      return response.json();
    },
  });

  // Calculate category statistics
  const categoryStats = products.reduce((acc, product) => {
    const categoryName = product.category?.nameAr || "بدون فئة";
    if (!acc[categoryName]) {
      acc[categoryName] = { total: 0, expired: 0, expiring: 0, fresh: 0 };
    }
    acc[categoryName].total++;
    acc[categoryName][product.status]++;
    return acc;
  }, {} as Record<string, { total: number; expired: number; expiring: number; fresh: number }>);

  const isLoading = statsLoading || productsLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-primary ml-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-arabic">الإحصائيات</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">تحليل مفصل لمنتجاتك</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Overall Stats */}
        <StatsCards 
          stats={stats || { total: 0, expired: 0, expiring: 0, fresh: 0, used: 0 }} 
          isLoading={isLoading} 
        />

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 font-arabic">
              التوزيع حسب الفئات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : Object.keys(categoryStats).length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-arabic">لا توجد بيانات لعرضها</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(categoryStats).map(([category, stats]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-gray-100 font-arabic">
                        {category}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stats.total} منتج
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="flex h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${(stats.fresh / stats.total) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-orange-500" 
                          style={{ width: `${(stats.expiring / stats.total) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${(stats.expired / stats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-reverse space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full ml-1"></div>
                          <span>صالح: {stats.fresh}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-orange-500 rounded-full ml-1"></div>
                          <span>قريب الانتهاء: {stats.expiring}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full ml-1"></div>
                          <span>منتهي: {stats.expired}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-bold text-gray-900 dark:text-gray-100 font-arabic">
              <AlertTriangle className="w-5 h-5 text-orange-500 ml-2" />
              ينتهي خلال الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : expiringProducts.length === 0 ? (
              <div className="text-center py-6">
                <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-arabic">
                  ممتاز! لا توجد منتجات تنتهي قريباً
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiringProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 font-arabic">
                        {product.nameAr || product.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                        {product.category?.nameAr || "بدون فئة"}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        {product.daysUntilExpiry === 0 ? "اليوم" : 
                         product.daysUntilExpiry === 1 ? "غداً" : 
                         `${product.daysUntilExpiry} أيام`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {stats ? Math.round((stats.fresh / (stats.total || 1)) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                نسبة المنتجات الصالحة
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">
                {expiringProducts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                يحتاج انتباه
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
