
import React, { useRef, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './src/pages/Home';
import { useScrollReveal } from './src/hooks/useScrollReveal';

// Lazy load heavy components
const Products = React.lazy(() => import('./components/Products'));

const About = React.lazy(() => import('./components/About'));
const Contact = React.lazy(() => import('./components/Contact'));
const AdminDashboard = React.lazy(() => import('./src/pages/Admin/Dashboard'));
const AdminLogin = React.lazy(() => import('./src/pages/Admin/Login'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useScrollReveal(contentRef, location.pathname);

  // Check if current route is admin to conditionally render Navbar/Footer
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen selection:bg-primary/20 selection:text-primary overflow-x-hidden" ref={contentRef}>
      {!isAdminRoute && <Navbar />}

      <main className="transition-all duration-700 min-h-screen">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<div className="page-enter pt-20"><Products /></div>} />

            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />


            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
