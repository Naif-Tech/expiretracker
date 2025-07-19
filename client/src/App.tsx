import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import Home from "@/pages/home";
import Statistics from "@/pages/statistics";
import Categories from "@/pages/categories";
import Settings from "@/pages/settings";
import BottomNavigation from "@/components/bottom-navigation";

function Router() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [isHydrated, setIsHydrated] = useState(false);

  // Mock user ID - in a real app, this would come from authentication
  const userId = 1;

  useEffect(() => {
    setIsHydrated(true);
    // Check if user has seen welcome screen before
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const handleWelcomeComplete = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setShowWelcome(false);
  };

  // Don't render anything until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show welcome screen for new users
  if (showWelcome) {
    return <Welcome onComplete={handleWelcomeComplete} />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "products":
        return <Home userId={userId} />;
      case "statistics":
        return <Statistics userId={userId} />;
      case "categories":
        return <Categories userId={userId} />;
      case "settings":
        return <Settings userId={userId} />;
      default:
        return <Home userId={userId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      {renderActiveTab()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
