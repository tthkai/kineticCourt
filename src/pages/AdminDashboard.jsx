import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { logout, currentUser } = useAuth();
  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h1 style={{ color: '#00d2ff' }}>Admin Control Panel</h1>
        <button onClick={logout} style={{ backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '5px 15px', borderRadius: '4px' }}>Đăng xuất</button>
      </header>
      <div style={{ marginTop: '20px' }}>
        <p>Xin chào Admin: {currentUser.email}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '20px' }}>
          <div style={{ padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>Quản lý Users</div>
          <div style={{ padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>Duyệt sân mới</div>
          <div style={{ padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>Thống kê doanh thu</div>
        </div>
      </div>
    </div>
  );
}