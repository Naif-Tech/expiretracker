import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Plus, Bell, Settings as SettingsIcon, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import StatsCards from "@/components/stats-cards";
import ProductCard from "@/components/product-card";
import AddProductModal from "@/components/add-product-modal";
import { apiRequest } from "@/lib/queryClient";
import type { ProductWithCategory, Category, DashboardStats } from "@shared/schema";

interface HomeProps {
  userId: number;
}

export default function Home({ userId }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard", userId],
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", userId, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      const response = await fetch(`/api/products/${userId}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories", userId],
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "تم إضافة المنتج بنجاح",
        description: "تمت إضافة المنتج إلى قائمتك",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة المنتج",
        description: "حدث خطأ أثناء إضافة المنتج، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // Mark as used mutation
  const markAsUsedMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("PATCH", `/api/products/${productId}/used`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "تم تحديث المنتج",
        description: "تم وضع علامة على المنتج كمستهلك",
      });
    },
  });

  // Mark as expired mutation
  const markAsExpiredMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("PATCH", `/api/products/${productId}/expired`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "تم تحديث المنتج",
        description: "تم وضع علامة على المنتج كمنتهي الصلاحية",
      });
    },
  });

  const handleAddProduct = (productData: any) => {
    addProductMutation.mutate(productData);
  };

  const handleMarkAsUsed = (productId: number) => {
    markAsUsedMutation.mutate(productId);
  };

  const handleMarkAsExpired = (productId: number) => {
    markAsExpiredMutation.mutate(productId);
  };

  const handleEditProduct = (product: ProductWithCategory) => {
    // For now, just show a toast. In a full implementation, this would open an edit modal
    toast({
      title: "قريباً",
      description: "ستتم إضافة وظيفة تعديل المنتجات قريباً",
    });
  };

  // Filter products based on search
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.nameAr && product.nameAr.includes(searchQuery)) ||
      (product.category?.nameAr && product.category.nameAr.includes(searchQuery))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center ml-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-arabic">إكسباير</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">أهلاً بك، أحمد</p>
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-2">
              <Button variant="ghost" size="sm" className="p-2 rounded-full">
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 rounded-full">
                <SettingsIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Stats Cards */}
        <StatsCards 
          stats={stats || { total: 0, expired: 0, expiring: 0, fresh: 0, used: 0 }} 
          isLoading={statsLoading} 
        />

        {/* Search and Filter */}
        <div className="flex items-center space-x-reverse space-x-3 mb-6">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-12 py-3 text-right focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-arabic"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <Button variant="outline" size="sm" className="p-3 rounded-xl">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4 mb-20">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="flex space-x-reverse space-x-2">
                  <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 font-arabic">
              {searchQuery ? "لم يتم العثور على منتجات" : "لا توجد منتجات"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-arabic">
              {searchQuery 
                ? "جرب تغيير كلمات البحث" 
                : "ابدأ بإضافة منتجاتك لتتبع تواريخ انتهاء صلاحيتها"
              }
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary/90 font-arabic"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج جديد
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-20">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onMarkAsUsed={handleMarkAsUsed}
                onMarkAsExpired={handleMarkAsExpired}
                onEdit={handleEditProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-20 left-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 z-30"
        size="sm"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProduct}
        categories={categories}
        userId={userId}
        isLoading={addProductMutation.isPending}
      />
    </div>
  );
}
