import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Camera, QrCode, X } from "lucide-react";
import { insertProductSchema } from "@shared/schema";
import type { Category } from "@shared/schema";

const formSchema = insertProductSchema.extend({
  expiryDate: z.string().min(1, "تاريخ الانتهاء مطلوب"),
}).omit({
  userId: true,
});

type FormData = z.infer<typeof formSchema>;

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData & { userId: number }) => void;
  categories: Category[];
  userId: number;
  isLoading?: boolean;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  userId,
  isLoading = false
}: AddProductModalProps) {
  const [cameraMode, setCameraMode] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      categoryId: undefined,
      expiryDate: "",
      quantity: 1,
      notes: "",
      barcode: "",
      imageUrl: "",
      isUsed: false,
      isExpired: false,
      alertDays: 7,
    },
  });

  const handleSubmit = (data: FormData) => {
    const expiryDate = new Date(data.expiryDate);
    onSubmit({
      ...data,
      expiryDate,
      userId,
    });
    form.reset();
    onClose();
  };

  const handleCameraCapture = () => {
    // Mock camera functionality
    setCameraMode(true);
    // In a real implementation, this would open the camera
    // and use AI to suggest product names and categories
    alert("مؤقتاً: ستتم إضافة وظيفة الكاميرا والذكاء الاصطناعي قريباً");
    setCameraMode(false);
  };

  const handleBarcodeScanner = () => {
    // Mock barcode scanning functionality
    setBarcodeMode(true);
    // In a real implementation, this would open the barcode scanner
    alert("مؤقتاً: ستتم إضافة وظيفة مسح الباركود قريباً");
    setBarcodeMode(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 font-arabic">
            إضافة منتج جديد
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto border-2 border-dashed hover:border-primary hover:bg-primary/5"
              onClick={handleCameraCapture}
              disabled={cameraMode}
            >
              <Camera className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                {cameraMode ? "جاري التشغيل..." : "التقط صورة"}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto border-2 border-dashed hover:border-primary hover:bg-primary/5"
              onClick={handleBarcodeScanner}
              disabled={barcodeMode}
            >
              <QrCode className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                {barcodeMode ? "جاري المسح..." : "مسح الباركود"}
              </span>
            </Button>
          </div>

          {/* Manual Entry Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">اسم المنتج</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل اسم المنتج"
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">الفئة</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="text-right font-arabic">
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center">
                              <span className="ml-2">{category.icon}</span>
                              <span className="font-arabic">{category.nameAr}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">تاريخ الانتهاء</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">الكمية (اختياري)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        className="text-right"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-arabic">ملاحظات (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ملاحظات إضافية..."
                        rows={3}
                        className="text-right font-arabic resize-none"
                        {...field}
                      />
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
                  onClick={onClose}
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 font-arabic"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري الإضافة..." : "إضافة المنتج"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
