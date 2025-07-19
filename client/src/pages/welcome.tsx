import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Package, BarChart3 } from "lucide-react";

interface WelcomeProps {
  onComplete: () => void;
}

export default function Welcome({ onComplete }: WelcomeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: CheckCircle,
      text: "تنبيهات ذكية قبل انتهاء الصلاحية"
    },
    {
      icon: Package,
      text: "مسح الباركود والتعرف الذكي"
    },
    {
      icon: BarChart3,
      text: "تقارير وإحصائيات مفصلة"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-teal-600 flex flex-col items-center justify-center text-white p-6">
      <div className={`text-center max-w-md mx-auto transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* App Icon */}
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-8 mx-auto backdrop-blur-sm">
          <Clock className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 font-arabic">إكسباير</h1>
        <p className="text-xl mb-8 text-white/90 leading-relaxed font-arabic">
          تطبيقك الذكي لتتبع تواريخ انتهاء صلاحية المنتجات المنزلية
        </p>
        
        <div className="space-y-4 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className={`flex items-center text-right transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
                style={{ transitionDelay: `${index * 200 + 600}ms` }}
              >
                <Icon className="w-6 h-6 ml-3 text-white/80" />
                <span className="text-white/90 font-arabic">{feature.text}</span>
              </div>
            );
          })}
        </div>
        
        <Button 
          onClick={onComplete}
          className="w-full bg-white text-primary font-bold py-4 px-8 rounded-2xl text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg font-arabic"
        >
          ابدأ الآن
        </Button>
      </div>
    </div>
  );
}
