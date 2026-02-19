import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';
import { auth } from './firebase';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MenuManager from './pages/MenuManager';

// ── Sidebar layout (used as a layout route) ──────────────────────────────────
function AdminLayout() {
  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 14,
    backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
    color: '#fff',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: 220, backgroundColor: '#1B5E20', padding: 20, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 32 }}>🍽 Al Samaha</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavLink to="/dashboard" style={linkStyle}>📊 Dashboard</NavLink>
          <NavLink to="/menu" style={linkStyle}>🍛 Menu</NavLink>
        </nav>
        <button
          style={{ marginTop: 'auto', padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          onClick={() => signOut(auth)}
        >
          Sign Out
        </button>
      </div>
      {/* Page content rendered by nested routes */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}

// ── Guard: redirect to /login if not authenticated ────────────────────────────
function RequireAuth({ user }: { user: User | null }) {
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ── Root app ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (user === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#1B5E20', fontSize: 18 }}>
        Loading…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

        {/* Protected — wrapped in sidebar layout */}
        <Route element={<RequireAuth user={user} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu" element={<MenuManager />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
