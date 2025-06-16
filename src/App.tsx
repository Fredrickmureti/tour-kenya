import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/home/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import RoutesPage from "./pages/RoutesPage";
import FleetPage from "./pages/FleetPage";
import FAQPage from "./pages/FAQPage";
import TermsPage from "./pages/TermsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import BookingPage from "./pages/BookingPage";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import ReceiptPage from "./pages/ReceiptPage";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { DriverAuthProvider } from "./contexts/DriverAuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardWrapper from "./components/admin/AdminDashboardWrapper";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import DriverLoginPage from "./pages/driver/DriverLoginPage";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverProtectedRoute from "./components/auth/DriverProtectedRoute";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import InboxPage from "./components/messaging/InboxPage";
import AuthCallbackHandler from "./components/auth/AuthCallbackHandler";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import GalleryPage from "./pages/GalleryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <DriverAuthProvider>
        <AdminAuthProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen bg-background text-foreground transition-colors w-full">
                  <Routes>
                    {/* Admin Routes - No Navbar/Footer */}
                    <Route path="/route-aura-booking-admin-page" element={<AdminLoginPage />} />
                    <Route path="/route-aura-booking-admin-page/dashboard/*" element={
                      <AdminProtectedRoute>
                        <AdminDashboardWrapper />
                      </AdminProtectedRoute>
                    } />
                    
                    {/* Driver Routes - No Navbar/Footer */}
                    <Route path="/driver-login-page" element={<DriverLoginPage />} />
                    <Route path="/driver-dashboard" element={
                      <DriverProtectedRoute>
                        <DriverDashboard />
                      </DriverProtectedRoute>
                    } />
                    
                    {/* Auth Callback Route - No Navbar/Footer */}
                    <Route path="/auth/callback" element={<AuthCallbackHandler />} />
                    
                    {/* Regular Routes - With Navbar and Footer */}
                    <Route path="/*" element={
                      <>
                        <Navbar />
                        <main className="min-h-screen">
                          <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/routes" element={<RoutesPage />} />
                            <Route path="/fleet" element={<FleetPage />} />
                            <Route path="/faq" element={<FAQPage />} />
                            <Route path="/terms" element={<TermsPage />} />
                            <Route path="/blog" element={<BlogPage />} />
                            <Route path="/blog/:slug" element={<BlogPostPage />} />
                            <Route path="/gallery" element={<GalleryPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                            <Route path="/booking" element={<BookingPage />} />
                            <Route path="/booking/:routeId" element={<BookingPage />} />
                            <Route path="/bookings" element={
                              <ProtectedRoute>
                                <UserDashboard />
                              </ProtectedRoute>
                            } />
                            <Route path="/dashboard" element={
                              <ProtectedRoute>
                                <UserDashboard />
                              </ProtectedRoute>
                            } />
                            <Route path="/dashboard/receipt/:receiptId" element={
                              <ProtectedRoute>
                                <ReceiptPage />
                              </ProtectedRoute>
                            } />
                            <Route path="/receipt/:receiptId" element={
                              <ProtectedRoute>
                                <ReceiptPage />
                              </ProtectedRoute>
                            } />
                            <Route path="/messages" element={
                              <ProtectedRoute>
                                <InboxPage />
                              </ProtectedRoute>
                            } />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                        <Footer />
                      </>
                    } />
                  </Routes>
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </DriverAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
