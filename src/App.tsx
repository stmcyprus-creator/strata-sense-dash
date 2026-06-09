import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BudgetReport from "./pages/BudgetReport";
import ScheduleReport from "./pages/ScheduleReport";
import WorkersReport from "./pages/WorkersReport";
import ProgressReport from "./pages/ProgressReport";
import MaterialsReport from "./pages/MaterialsReport";
import SafetyReport from "./pages/SafetyReport";
import ForemanReport from "./pages/ForemanReport";

const queryClient = new QueryClient();

const ProtectedRoute = ({ path, children }: { path: string; children: React.ReactNode }) => {
  const { canAccess, role } = useRole();
  if (!canAccess(path)) {
    // Redirect to first accessible page for current role
    const ROLE_PAGES = {
      director: "/",
      project_manager: "/",
      foreman: "/foreman",
      supply: "/materials",
    };
    return <Navigate to={ROLE_PAGES[role]} replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute path="/"><Index /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute path="/budget"><BudgetReport /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute path="/schedule"><ScheduleReport /></ProtectedRoute>} />
            <Route path="/workers" element={<ProtectedRoute path="/workers"><WorkersReport /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute path="/progress"><ProgressReport /></ProtectedRoute>} />
            <Route path="/materials" element={<ProtectedRoute path="/materials"><MaterialsReport /></ProtectedRoute>} />
            <Route path="/safety" element={<ProtectedRoute path="/safety"><SafetyReport /></ProtectedRoute>} />
            <Route path="/foreman" element={<ProtectedRoute path="/foreman"><ForemanReport /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
