import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCategorySchema } from "@shared/schema";
import type { Category } from "@shared/schema";

const formSchema = insertCategorySchema.omit({ userId: true });
type FormData = z.infer<typeof formSchema>;

interface CategoriesProps {
  userId: number;
}

export default function Categories({ userId }: CategoriesProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories", userId],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      icon: "📦",
      color: "#00A898",
      isDefault: false,
    },
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (categoryData: FormData & { userId: number }) => {
      return apiRequest("POST", "/api/categories", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "تم إضافة الفئة بنجاح",
        description: "تمت إضافة الفئة الجديدة",
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة الفئة",
        description: "حدث خطأ أثناء إضافة الفئة",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FormData> }) => {
      return apiRequest("PUT", `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "تم تحديث الفئة بنجاح",
        description: "تم تحديث الفئة",
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "خطأ في تحديث الفئة",
        description: "حدث خطأ أثناء تحديث الفئة",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "تم حذف الفئة",
        description: "تم حذف الفئة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في حذف الفئة",
        description: "حدث خطأ أثناء حذف الفئة",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: FormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data,
      });
    } else {
      addCategoryMutation.mutate({
        ...data,
        userId,
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      nameAr: category.nameAr,
      icon: category.icon,
      color: category.color,
      isDefault: category.isDefault || false,
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (categoryId: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الفئة؟")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
    form.reset();
  };

  const commonIcons = ["🍎", "💊", "🧴", "🧽", "🥛", "🍞", "🧊", "🧺", "🧴", "🩹"];
  const commonColors = ["#00A898", "#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#EC4899", "#6366F1"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-primary ml-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-arabic">الفئات</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">إدارة فئات المنتجات</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90 font-arabic"
              size="sm"
            >
              <Plus className="w-4 h-4 ml-1" />
              إضافة فئة
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex space-x-reverse space-x-2">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 font-arabic">
              لا توجد فئات
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-arabic">
              ابدأ بإضافة فئات لتنظيم منتجاتك
            </p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90 font-arabic"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة فئة جديدة
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="transition-all duration-200 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                    <div className="flex space-x-reverse space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </Button>
                      {!category.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 font-arabic">
                    {category.nameAr}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {category.name}
                  </p>
                  {category.isDefault && (
                    <span className="inline-block mt-2 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-arabic">
                      افتراضي
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md w-full mx-4" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 font-arabic">
              {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">الاسم بالعربية</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="مثل: مواد غذائية"
                        className="text-right font-arabic"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">الاسم بالإنجليزية</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g: Food"
                        className="text-right"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">الرمز</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Input
                          placeholder="🍎"
                          className="text-center text-lg"
                          {...field}
                        />
                        <div className="grid grid-cols-5 gap-2">
                          {commonIcons.map((icon) => (
                            <Button
                              key={icon}
                              type="button"
                              variant="outline"
                              className="h-10 text-lg"
                              onClick={() => field.onChange(icon)}
                            >
                              {icon}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">اللون</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Input
                          type="color"
                          className="h-10"
                          {...field}
                        />
                        <div className="grid grid-cols-4 gap-2">
                          {commonColors.map((color) => (
                            <Button
                              key={color}
                              type="button"
                              variant="outline"
                              className="h-10 p-0"
                              style={{ backgroundColor: color }}
                              onClick={() => field.onChange(color)}
                            >
                              <span className="sr-only">{color}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-reverse space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 font-arabic"
                  onClick={handleCloseModal}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 font-arabic"
                  disabled={addCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {addCategoryMutation.isPending || updateCategoryMutation.isPending
                    ? "جاري الحفظ..."
                    : editingCategory
                    ? "تحديث"
                    : "إضافة"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
