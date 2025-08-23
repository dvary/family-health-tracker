import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background-primary mobile-responsive-layout">
      {/* Navigation */}
      <nav className="bg-surface-primary shadow-soft border-b border-neutral-200/50 sticky top-0 z-40 backdrop-blur-sm bg-white/80 mobile-responsive-nav">
        <div className="container-fluid">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-4">
              {/* Dashboard Icon (Circular) */}
              <Link
                to="/dashboard"
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-soft transition-all duration-200 hover:scale-105 mobile-touch ${
                  location.pathname === '/dashboard'
                    ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                }`}
                title="Dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
              </Link>

              {/* Life Vault Title */}
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  Life Vault
                </h1>
              </div>

              {/* Mobile Menu Button */}
              {isMobile && (
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg hover:bg-neutral-100 mobile-touch"
                  aria-label="Toggle mobile menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* Mobile User Info */}
              <div className="flex sm:hidden items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Desktop User Info */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900">
                    Welcome Back
                  </p>
                  <p className="text-xs text-neutral-600">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)} ${user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)}`
                      : user?.email
                    }
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn-ghost btn-sm mobile-touch"
                title="Sign out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="ml-2 hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobile && isMobileMenuOpen && (
            <div className="sm:hidden border-t border-neutral-200 bg-white mobile-responsive-nav">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Mobile Life Vault Title */}
                <div className="px-3 py-2 border-b border-neutral-100">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    Life Vault
                  </h1>
                </div>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors mobile-touch ${
                    location.pathname === '/dashboard'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-neutral-900">
                    Welcome, {user?.firstName || user?.email}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {user?.role === 'admin' ? 'Administrator' : 'Family Member'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="container-fluid px-4 py-6 sm:px-6 lg:px-8 mobile-responsive-content">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
