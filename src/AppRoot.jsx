import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import AuthScreen from './pages/AuthScreen';
import AdminDashboard from './pages/AdminDashboard';
import CourtOwnerDashboard from './pages/CourtOwnerDashboard';
import App from './App';

const RoleRouter = () => {
  const auth = useAuth();
  
  // KHẮC PHỤC LỖI TÊN BIẾN: Tự động lấy đúng tên biến dù là currentUser hay user
  const activeUser = auth.currentUser || auth.user;
  const activeRole = auth.role || auth.userRole;
  const loading = auth.loading || false;

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#c3ff00' }}>
        <h2>Đang kiểm tra dữ liệu...</h2>
      </div>
    );
  }

  // Nếu chưa có user -> Bắt đăng nhập
  if (!activeUser) {
    return <AuthScreen />;
  }

  // Có user -> Phân luồng theo Role
  if (activeRole === 'admin') return <AdminDashboard />;
  if (activeRole === 'court_owner') return <CourtOwnerDashboard />;

  // Mặc định là Player -> Vào App có bản đồ
  return (
    <>
      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}>
        <button onClick={() => window.location.reload()} style={{ fontSize: '10px', background: '#333', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>
          Làm mới App
        </button>
      </div>
      <App />
    </>
  );
};

export default function AppRoot() {
  return (
    <AuthProvider>
      <DataProvider>
        <RoleRouter />
      </DataProvider>
    </AuthProvider>
  );
}