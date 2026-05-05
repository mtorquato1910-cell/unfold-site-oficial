import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Posts from "./pages/admin/Posts";
import Cases from "./pages/admin/Cases";
import Leads from "./pages/admin/Leads";
import Diagnostico from "./pages/admin/Diagnostico";
import Testimonials from "./pages/admin/Testimonials";
import SettingsPage from "./pages/admin/Settings";
import Users from "./pages/admin/Users";
import Categories from "./pages/admin/Categories";
import Media from "./pages/admin/Media";
import Quiz from "./pages/admin/Quiz";
import Insights from "./pages/admin/Insights";
import Prompts from "./pages/admin/Prompts";
import Audit from "./pages/admin/Audit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="dark" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout><Dashboard /></AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/posts" element={<ProtectedRoute><AdminLayout><Posts /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/cases" element={<ProtectedRoute><AdminLayout><Cases /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/leads" element={<ProtectedRoute><AdminLayout><Leads /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/diagnostico" element={<ProtectedRoute><AdminLayout><Diagnostico /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/testimonials" element={<ProtectedRoute><AdminLayout><Testimonials /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><AdminLayout><Categories /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute><AdminLayout><Media /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/quiz" element={<ProtectedRoute><AdminLayout><Quiz /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/insights" element={<ProtectedRoute><AdminLayout><Insights /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/prompts" element={<ProtectedRoute><AdminLayout><Prompts /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute><AdminLayout><Audit /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><SettingsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
