import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SupabaseProvider } from '@/contexts/SupabaseContext';
import ErrorBoundary from '@/components/utils/ErrorBoundary';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageTitleUpdater from '@/components/utils/PageTitleUpdater';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AccountDashboard from './pages/AccountDashboard';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Bookings = lazy(() => import('@/pages/Bookings'));
const Emails = lazy(() => import('@/pages/Emails'));
const LeaveRequests = lazy(() => import('@/pages/LeaveRequests'));
const Attendance = lazy(() => import('@/pages/Attendance'));
const TodoList = lazy(() => import('@/pages/TodoList'));
const Customers = lazy(() => import('@/pages/Customers'));
const FinancialAccounts = lazy(() => import('@/pages/FinancialAccounts'));
const AdminReports = lazy(() => import('@/pages/AdminReports'));
const Settings = lazy(() => import('@/pages/Settings'));
const RespondIntegration = lazy(() => import('@/pages/RespondIntegration'));
const Profile = lazy(() => import('@/pages/Profile'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));
const SuperAdminDashboard = lazy(() => import('@/pages/SuperAdminDashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Forbidden = lazy(() => import('@/pages/Forbidden'));
const FlightBookings = lazy(() => import('@/pages/FlightBookings'));
const HotelBookings = lazy(() => import('@/pages/HotelBookings'));
const OtherBookings = lazy(() => import('@/pages/OtherBookings'));
const CallsPage = lazy(() => import('@/pages/CallsPage'));
const MailsPage = lazy(() => import('@/pages/MailsPage'));
const Reports = lazy(() => import('@/pages/Reports'));
const AppRoutes = lazy(() => import('@/pages/AppRoutes'));
const Soon = lazy(() => import('@/pages/Soon'));
const FlightTickets = lazy(() => import('@/pages/FlightTickets'));
const HotelCheckin = lazy(() => import('@/pages/HotelCheckin'));
const VisaPage = lazy(() => import('@/pages/VisaPage'));
const InsurancePage = lazy(() => import('@/pages/InsurancePage'));
const TransportPage = lazy(() => import('@/pages/TransportPage'));
const Notifications = lazy(() => import('@/pages/Notifications'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-background">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <SupabaseProvider>
            <AuthProvider>
              <CompanyProvider>
                <NotificationProvider>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingFallback />}>
                      <div className="min-h-screen bg-background text-foreground">
                        <PageTitleUpdater />
                        <Routes>
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/super-admin" element={
                            <ProtectedRoute requiredRole="super_admin">
                              <SuperAdminDashboard />
                            </ProtectedRoute>
                          } />

                          <Route path="/" element={
                            <ProtectedRoute>
                              <DashboardLayout />
                            </ProtectedRoute>
                          }>
                            <Route index element={<Navigate to="/attendance" replace />} />
                            <Route path="dashboard" element={<ProtectedRoute requiredPermission="view_dashboard"><Dashboard /></ProtectedRoute>} />
                            <Route path="my-reservations" element={<Bookings />} />
                            <Route path="/flight/bookings" element={<FlightBookings />} />
                            <Route path="/flight/tickets" element={<FlightTickets />} />
                            <Route path="/hotels/bookings" element={<HotelBookings />} />
                            <Route path="/hotels/checkin" element={<HotelCheckin />} />
                            <Route path="/visa" element={<VisaPage />} />
                            <Route path="/insurance" element={<InsurancePage />} />
                            <Route path="/transport" element={<TransportPage />} />
                            <Route path="emails" element={<Emails />} />
                            <Route path="leave-requests" element={<LeaveRequests />} />
                            <Route path="attendance" element={<Attendance />} />
                            <Route path="todo" element={<TodoList />} />
                            {/* New Items ============================================================================ */}
                            <Route path="employeeDashboard" element={<EmployeeDashboard />} />
                            <Route path="accountDashboard" element={<AccountDashboard />} />
                            <Route path="customers" element={<ProtectedRoute requiredPermission="view_customers"><Customers /></ProtectedRoute>} />
                            <Route path="financial-accounts" element={<Soon />} />
                            <Route path="admin-reports" element={<ProtectedRoute requiredPermission="view_reports"><AdminReports /></ProtectedRoute>} />
                            <Route path="reports" element={<ProtectedRoute requiredPermission="view_reports"><Reports /></ProtectedRoute>} />
                            <Route path="app-routes" element={<ProtectedRoute requiredRole="admin"><AppRoutes /></ProtectedRoute>} />
                            <Route path="notifications" element={<ProtectedRoute requiredPermission="send_notifications">
                              <Notifications /></ProtectedRoute>} />
                            <Route path="settings" element={
                              <ProtectedRoute requiredPermission="manage_settings">
                                <Settings />
                              </ProtectedRoute>
                            } />
                            <Route path="respond-integration" element={<RespondIntegration />} />
                            <Route path="calls" element={<CallsPage />} />
                            <Route path="mails" element={<MailsPage />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="user-management" element={
                              <ProtectedRoute requiredPermission="manage_users">
                                <UserManagement />
                              </ProtectedRoute>
                            } />
                          </Route>

                          <Route path="/403" element={<Forbidden />} />
                          <Route path="/404" element={<NotFound />} />
                          <Route path="*" element={<Navigate to="/404" replace />} />
                        </Routes>

                        <Toaster />
                      </div>
                    </Suspense>
                  </ErrorBoundary>
                </NotificationProvider>
              </CompanyProvider>
            </AuthProvider>
          </SupabaseProvider>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;