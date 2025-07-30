import { useState, useEffect } from "react";
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
import CameraScanner from "./camera-scanner";
import BarcodeScanner from "./barcode-scanner";

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
  const [showEntryHint, setShowEntryHint] = useState(false);
  useEffect(() => {
    if (isOpen) {
      const hasSeenEntryHint = localStorage.getItem("hasSeenEntryHint");
      if (!hasSeenEntryHint) {
        setTimeout(() => setShowEntryHint(true), 800);
      }
    }
  }, [isOpen]);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

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
    // Convert string date to ISO string for API
    const expiryDate = new Date(data.expiryDate).toISOString();
    const submitData = {
      name: data.name,
      nameAr: data.nameAr || null,
      categoryId: data.categoryId || null,
      expiryDate: expiryDate,
      quantity: data.quantity || null,
      notes: data.notes || null,
      barcode: data.barcode || null,
      imageUrl: data.imageUrl || null,
      isUsed: data.isUsed || false,
      isExpired: data.isExpired || false,
      alertDays: data.alertDays || 7,
      userId,
    };
    
    onSubmit(submitData);
    form.reset();
    onClose();
  };

  const handleCameraCapture = (imageData: string) => {
    // Set the captured image in the form
    form.setValue('imageUrl', imageData);
    
    // AI suggestion simulation - in real app, send image to AI service
    const suggestions = [
      { name: "حليب نادك", nameAr: "حليب نادك", categoryId: 1 },
      { name: "خبز أبيض", nameAr: "خبز أبيض", categoryId: 1 },
      { name: "شامبو", nameAr: "شامبو", categoryId: 2 },
      { name: "دواء باراسيتامول", nameAr: "دواء باراسيتامول", categoryId: 3 },
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    form.setValue('name', randomSuggestion.name);
    form.setValue('nameAr', randomSuggestion.nameAr);
    form.setValue('categoryId', randomSuggestion.categoryId);
  };

  const handleBarcodeScanned = (barcode: string) => {
    // Set the barcode in the form
    form.setValue('barcode', barcode);
    
    // Mock product lookup - in real app, query product database by barcode
    const productData = {
      name: "منتج ممسوح ضوئياً",
      nameAr: "منتج ممسوح ضوئياً", 
      categoryId: 1,
    };
    
    form.setValue('name', productData.name);
    form.setValue('nameAr', productData.nameAr);
    form.setValue('categoryId', productData.categoryId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto relative" dir="rtl">
        {/* Entry Hint */}
        {showEntryHint && (
          <div className="absolute -top-20 left-0 right-0 mx-auto bg-white dark:bg-gray-800 border border-primary shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3 z-40 animate-fade-in-up w-fit" style={{direction: 'rtl'}}>
            <span className="font-arabic text-primary text-base">يمكنك إضافة منتج يدويًا أو عبر الكاميرا أو الباركود!</span>
            <button
              onClick={() => {
                setShowEntryHint(false);
                localStorage.setItem("hasSeenEntryHint", "true");
              }}
              className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="إغلاق التعليمات"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}
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
              onClick={() => setShowCameraScanner(true)}
              disabled={false}
            >
              <Camera className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                التقط صورة
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto border-2 border-dashed hover:border-primary hover:bg-primary/5"
              onClick={() => setShowBarcodeScanner(true)}
              disabled={false}
            >
              <QrCode className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                مسح الباركود
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
                        value={field.value ?? ''}
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
                        value={field.value ?? ''}
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

        {/* Camera Scanner Modal */}
        <CameraScanner
          isOpen={showCameraScanner}
          onClose={() => setShowCameraScanner(false)}
          onCapture={handleCameraCapture}
        />

        {/* Barcode Scanner Modal */}
        <BarcodeScanner
          isOpen={showBarcodeScanner}
          onClose={() => setShowBarcodeScanner(false)}
          onScan={handleBarcodeScanned}
        />
      </DialogContent>
    </Dialog>
  );
}
