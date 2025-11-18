import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@/layouts/Root";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

function Layout() {
  const { user, isAuthenticated } = useSelector(state => state.user);
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with user info and logout */}
      {isAuthenticated && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
                  <ApperIcon name="Upload" className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Drop Zone</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Welcome, {user?.firstName || user?.emailAddress || 'User'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      {/* Main content */}
      <main>
        <Outlet />
      </main>
    </div>
);
}

export default Layout;