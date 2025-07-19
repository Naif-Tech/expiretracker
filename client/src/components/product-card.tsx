import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, CheckCircle, Trash2, MoreVertical, Check, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { ProductWithCategory } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithCategory;
  onMarkAsUsed: (id: number) => void;
  onMarkAsExpired: (id: number) => void;
  onEdit: (product: ProductWithCategory) => void;
  onDelete?: (id: number) => void;
}

export default function ProductCard({ 
  product, 
  onMarkAsUsed, 
  onMarkAsExpired, 
  onEdit,
  onDelete
}: ProductCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'border-red-500';
      case 'expiring':
        return 'border-orange-500';
      case 'fresh':
        return 'border-green-500';
      default:
        return 'border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400';
      case 'expiring':
        return 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400';
      case 'fresh':
        return 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'expired':
        return 'منتهي الصلاحية';
      case 'expiring':
        return 'ينتهي قريباً';
      case 'fresh':
        return 'صالح';
      default:
        return 'غير محدد';
    }
  };

  const getActionButtonStyle = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900';
      default:
        return 'bg-primary/10 text-primary hover:bg-primary/20';
    }
  };

  const handleAction = () => {
    if (product.status === 'expired') {
      onMarkAsExpired(product.id);
    } else {
      onMarkAsUsed(product.id);
    }
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(product.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <Card className={`border-r-4 ${getStatusColor(product.status)} transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4">
        {product.imageUrl && (
          <img 
            src={product.imageUrl} 
            alt={product.nameAr || product.name}
            className="w-full h-24 object-cover rounded-lg mb-3"
          />
        )}
        
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 font-arabic">
          {product.nameAr || product.name}
        </h3>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-arabic">
          {product.category?.nameAr || product.category?.name || 'بدون فئة'}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium font-arabic ${getStatusBadge(product.status)}`}>
            {getStatusText(product.status)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {format(new Date(product.expiryDate), 'dd/MM/yyyy', { locale: ar })}
          </span>
        </div>
        
        <div className="flex space-x-reverse space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className={`flex-1 text-xs py-2 rounded-lg font-medium font-arabic ${getActionButtonStyle(product.status)}`}
            onClick={handleAction}
          >
            <CheckCircle className="w-3 h-3 ml-1" />
            تم الاستهلاك
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            onClick={() => onEdit(product)}
          >
            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
