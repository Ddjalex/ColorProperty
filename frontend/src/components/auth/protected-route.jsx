import { isAuthenticated } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation("/login");
    }
  }, [setLocation]);

  if (!isAuthenticated()) {
    return null;
  }

  return children;
}