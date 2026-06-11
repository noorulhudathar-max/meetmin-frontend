import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  session: any;
  children: ReactNode;
}

export function ProtectedRoute({ session, children }: ProtectedRouteProps) {
  const location = useLocation();

  if (!session) {
    // Save the intercepted location so we can send them back post-login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}