import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useStore";
import { AppLayout } from "@/components/AppLayout";
import { RoleSelectionModal } from "@/components/RoleSelectionModal";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesPage from "./pages/VehiclesPage";
import TripsPage from "./pages/TripsPage";
import MaintenancePage from "./pages/MaintenancePage";
import ExpensesPage from "./pages/ExpensesPage";
import DriversPage from "./pages/DriversPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthStore();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer>
          <RoleSelectionModal />
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
            <Route path="/trips" element={<ProtectedRoute><TripsPage /></ProtectedRoute>} />
            <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/drivers" element={<ProtectedRoute><DriversPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
