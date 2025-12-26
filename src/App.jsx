import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './index.css';
import ScrollToTop from './StateManagement/ScrollToTop';

// --- Auth Imports ---
import { AuthProvider } from './Context/AuthContext';
import { CurrencyProvider } from './Context/CurrencyContext';
import RequireAuth from './Context/RequireAuht';
import RequireAdmin from './Context/RequireAdmin';

// --- Components (Eager Load) ---
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Chatbot from './Chatbot/Chatbot';
import Whatsapp from './Chatbot/Whatsapp';
import Sidefloat from './Components/Sidefloat';
import LoadingSpinner from './Components/LoadingSpinner';

// --- Pages (Lazy Load) ---
const Home = lazy(() => import('./Pages/Home'));
const About = lazy(() => import('./Pages/About'));
const FilePorocessing = lazy(() => import('./Pages/FilePorocessing'));
const Contact = lazy(() => import('./Pages/Contact'));
const Visas = lazy(() => import('./Pages/Visas'));
const HajandUmmrah = lazy(() => import('./Pages/HajandUmmrah'));
const CountryPage = lazy(() => import('./Pages/Countrypage'));
const Packages = lazy(() => import('./Pages/Packages'));
const NotFound = lazy(() => import('./Pages/NotFound'));

// --- Auth Pages ---
const Login = lazy(() => import('./Authentication/Login'));
const Signup = lazy(() => import('./Authentication/Signup'));

// --- User Dashboard ---
const UserDashboard = lazy(() => import('./Pages/UserDashboard'));

// --- Booking & Payments ---
const HandlePurchase = lazy(() => import('./Pages/HandlePurchase'));
const BookingConfirmation = lazy(() => import('./Pages/BookingConfirmation'));
const AlfaPayment = lazy(() => import('./Components/AlfaPayment'));
const PaymentReturn = lazy(() => import('./Pages/PaymentReturn'));

// --- Admin Pages ---
const AdminLogin = lazy(() => import('./Pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./Pages/AdminDashboard'));

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <CurrencyProvider>
        <AuthProvider>
          <ScrollToTop />
          {!isAdminRoute && <Navbar />}

          <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/fileprocessing" element={<FilePorocessing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/visas" element={<Visas />} />
              <Route path="/haj" element={<HajandUmmrah />} />
              <Route path="/countries/:country" element={<CountryPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* User Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <UserDashboard />
                  </RequireAuth>
                }
              />

              {/* Package & Purchase Routes */}
              <Route path="/packages" element={<Packages />} />
              <Route
                path="/purchase"
                element={
                  <RequireAuth>
                    <HandlePurchase />
                  </RequireAuth>
                }
              />

              {/* Payment Flow Routes */}
              <Route path="/paypage" element={<AlfaPayment />} />

              {/* IMPORTANT: Bank Alfalah redirects here after payment */}
              <Route path="/payment-return" element={<PaymentReturn />} />

              {/* Final confirmation page (after PaymentReturn processes everything) */}
              {/* Final confirmation page (after PaymentReturn processes everything) */}
              <Route path="/bookingconfirmation" element={<BookingConfirmation />} />

              {/* --- ADMIN AUTH ROUTES --- */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route
                path="/admin/dashboard"
                element={
                  <RequireAdmin>
                    <AdminDashboard />
                  </RequireAdmin>
                }
              />

              {/* 404 Catch All */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </Suspense>

          {/* Conditionally Render Footer/Chatbots if NOT on Admin Pages */}
          {!isAdminRoute && (
            <>
              <Footer />
              <Chatbot />
              <Sidefloat />
              <Whatsapp />
            </>
          )}

        </AuthProvider>
      </CurrencyProvider>
    </>
  );
}

export default App;