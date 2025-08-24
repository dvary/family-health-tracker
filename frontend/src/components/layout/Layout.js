import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();


  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background-primary mobile-responsive-layout">
      {/* Navigation */}
      <nav className="bg-surface-primary shadow-soft border-b border-neutral-200/50 sticky top-0 z-40 backdrop-blur-sm bg-white/80 mobile-responsive-nav">
        <div className="container-fluid">
          <div className="flex justify-between items-center h-12">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-3">
              {/* Life Vault Title - Clickable */}
              <Link
                to="/dashboard"
                className="hover:opacity-80 transition-opacity duration-200 flex items-center space-x-2"
                title="Go to Dashboard"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent cursor-pointer tracking-tight">
                  Life Vault
                </h1>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* Mobile User Info */}
              <div className="flex sm:hidden items-center space-x-2">
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


        </div>
      </nav>

      {/* Main content */}
      <main className="container-fluid px-2 py-2 sm:px-3 lg:px-4 mobile-responsive-content">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>


    </div>
  );
};

export default Layout;
