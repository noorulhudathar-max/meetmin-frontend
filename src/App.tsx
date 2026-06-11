import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { ProtectedRoute } from "./components/ProtectedRoute"; // Import your new guard

// Page Imports
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/Dashboardlayout";
import Meetings from "./pages/Meetings";
import MeetingDetail from "./pages/MeetingDetail";
import ActionItems from "./pages/ActionItems";
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";
import LandingPage from "./pages/LandingPage";
import Transcriptions from "./pages/Transcriptions";
import LiveRecording from './pages/LiveRecording';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
      } catch (error) {
        console.error("[Auth Initialization Error]:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Interface */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Guest Only Authentication Gateway */}
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/dashboard" replace />}
        />

        {/* Core Layout Sub-Routes (Protected) */}
        <Route
          element={
            <ProtectedRoute session={session}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/meetings/:id" element={<MeetingDetail />} />
          <Route path="/action-items" element={<ActionItems />} />
          <Route path="/templates" element={<div style={{ padding: "32px" }}>Templates coming soon</div>} />
          <Route path="/calendar" element={<div style={{ padding: "32px" }}>Calendar coming soon</div>} />
          <Route path="/integrations" element={<div style={{ padding: "32px" }}>Integrations coming soon</div>} />
          <Route path="/trash" element={<div style={{ padding: "32px" }}>Trash coming soon</div>} />
        </Route>

        {/* Global Isolated Features (Protected) */}
        <Route path="/ai-assistant" element={<ProtectedRoute session={session}><AIAssistant /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute session={session}><Profile /></ProtectedRoute>} />
        <Route path="/transcriptions" element={<ProtectedRoute session={session}><Transcriptions /></ProtectedRoute>} />
        <Route path="/record" element={<ProtectedRoute session={session}><LiveRecording /></ProtectedRoute>} />

        {/* Global Catch-All Fallback Rule */}
        <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;