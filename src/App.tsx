import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerDashboard from "./pages/CustomerDashboard";
import TrackOrder from "./pages/TrackOrder";
import PropertyLookup from "./pages/PropertyLookup";
import UploadDocuments from "./pages/UploadDocuments";
import OrderHistory from "./pages/OrderHistory";
import CustomerNotifications from "./pages/CustomerNotifications";
import CustomerProfile from "./pages/CustomerProfile";
import AdminDashboard from "./pages/AdminDashboard";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Protected customer routes */}
          <Route path="/dashboard" element={<AuthGuard><CustomerDashboard /></AuthGuard>} />
          <Route path="/track-order" element={<AuthGuard><TrackOrder /></AuthGuard>} />
          <Route path="/property-lookup" element={<AuthGuard><PropertyLookup /></AuthGuard>} />
          <Route path="/documents/upload" element={<AuthGuard><UploadDocuments /></AuthGuard>} />
          <Route path="/orders" element={<AuthGuard><OrderHistory /></AuthGuard>} />
          <Route path="/notifications" element={<AuthGuard><CustomerNotifications /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><CustomerProfile /></AuthGuard>} />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
