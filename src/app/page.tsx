"use client";

import { useEffect, useState } from "react";
import LoginPage from "@/components/login-page";
import Dashboard from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for auth status in localStorage
    const authStatus = localStorage.getItem("reelwriter-auth") === "true";
    setIsAuthenticated(authStatus);
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-8 w-[200px]" />
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Dashboard />
  ) : (
    <LoginPage onLoginSuccess={handleLoginSuccess} />
  );
}