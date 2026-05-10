import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function CourtOwnerDashboard() {
  const { logout, currentUser } = useAuth();
  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#121212', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h1 style={{ color: '#ccff00' }}>Dashboard Chủ Sân</h1>
        <button onClick={logout} style={{ backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '5px 15px', borderRadius: '4px' }}>Đăng xuất</button>
      </header>
      <div style={{ marginTop: '20px' }}>
        <p>Xin chào, {currentUser.email}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
          <div style={{ padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>Quản lý sân của tôi</div>
          <div style={{ padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>Lịch đặt sân hôm nay</div>
        </div>
      </div>
    </div>
  );
}