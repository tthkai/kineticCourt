import React from 'react';
import { useAuth } from './context/AuthContext';
import AuthScreen from './pages/AuthScreen';
import AdminDashboard from './pages/AdminDashboard';
import CourtOwnerDashboard from './pages/CourtOwnerDashboard';
import App from './App'; // Đây là file App.jsx gốc (UI của Player) mà bạn đang có

export default function AppRoot() {
  const { currentUser, role } = useAuth();

  // Chưa login -> Bắt đăng nhập
  if (!currentUser) {
    return <AuthScreen />;
  }

  // Đã login -> Điều hướng theo Role
  if (role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (role === 'court_owner') {
    return <CourtOwnerDashboard />;
  }

  // Mặc định (player) -> Vào App chính của bạn
  return (
    <>
      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}>
        {/* Nút đăng xuất nhỏ cho Player, bạn có thể di chuyển nó vào trang Profile Subscreen sau */}
        <button onClick={() => window.location.reload()} style={{ fontSize: '10px', background: '#333', color: 'white', border: 'none', padding: '5px' }}>App Active</button>
      </div>
      <App />
    </>
  );
}