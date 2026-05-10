import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CalendarClock, MapPin, LogOut, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

// --- MOCK DATA ---
const DAILY_STATS = {
  revenue: '2,450,000',
  totalBookings: 12,
  occupancyRate: '75%',
};

const SCHEDULE_DATA = [
  { id: 1, court: 'Sân 1', time: '18:00 - 19:00', user: 'Hoàng Thanh Tùng', status: 'PAID', price: '120k' },
  { id: 2, court: 'Sân 2', time: '18:00 - 20:00', user: 'Nhật', status: 'PENDING', price: '240k' },
  { id: 3, court: 'Sân 1', time: '19:00 - 21:00', user: 'Minh Tuấn', status: 'PAID', price: '240k' },
];

const COURTS_DATA = [
  { id: 1, name: 'Sân 1 (Thảm xịn)', status: 'ACTIVE', basePrice: '80k' },
  { id: 2, name: 'Sân 2', status: 'ACTIVE', basePrice: '80k' },
  { id: 3, name: 'Sân 3 (VIP)', status: 'MAINTENANCE', basePrice: '100k' },
];

export default function CourtOwnerDashboard() {
  const { logout, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', color: 'white', paddingBottom: '80px' }}>
      {/* HEADER */}
      <header style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a1a', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <h2 style={{ margin: 0, color: '#ccff00', fontSize: '1.2rem' }}>KINETIC MANAGER</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{currentUser?.email}</p>
        </div>
        <button onClick={logout} className="icon-btn-transparent" style={{ color: '#ff4444' }}>
          <LogOut size={20} />
        </button>
      </header>

      {/* CONTENT AREA */}
      <div style={{ padding: '20px' }}>
        
        {/* TAB 1: TỔNG QUAN */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <h3 style={{ marginBottom: '15px' }}>Tổng quan hôm nay</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              
              {/* Doanh thu Card */}
              <div style={{ backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '20px', borderLeft: '4px solid #ccff00' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#888' }}>Doanh thu dự kiến</span>
                  <TrendingUp size={20} color="#ccff00" />
                </div>
                <h2 style={{ margin: '10px 0 0 0', fontSize: '2rem' }}>{DAILY_STATS.revenue}đ</h2>
              </div>

              {/* Grid 2 cột cho Booking & Tỷ lệ lấp đầy */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{DAILY_STATS.totalBookings}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>Lượt đặt sân</div>
                </div>
                <div style={{ backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00d2ff' }}>{DAILY_STATS.occupancyRate}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>Tỷ lệ lấp đầy</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LỊCH ĐẶT */}
        {activeTab === 'schedule' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Lịch đặt sân (Hôm nay)</h3>
              <button style={{ background: '#ccff00', color: 'black', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>+ Tạo lịch thủ công</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SCHEDULE_DATA.map(item => (
                <div key={item.id} style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 'bold', color: '#ccff00' }}>{item.court}</span>
                      <span style={{ fontSize: '0.8rem', backgroundColor: '#333', padding: '2px 8px', borderRadius: '4px' }}>{item.time}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#ccc' }}>Người đặt: {item.user}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.price}</div>
                    {item.status === 'PAID' 
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#ccff00', marginTop: '4px' }}><CheckCircle2 size={12}/> Đã thanh toán</span>
                      : <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#ffaa00', marginTop: '4px' }}><Clock size={12}/> Chờ thu tiền</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QUẢN LÝ SÂN */}
        {activeTab === 'courts' && (
          <div className="fade-in">
            <h3 style={{ marginBottom: '15px' }}>Danh sách sân bãi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {COURTS_DATA.map(court => (
                <div key={court.id} style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px', borderLeft: court.status === 'ACTIVE' ? '4px solid #ccff00' : '4px solid #ff4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>{court.name}</h4>
                    <span style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', backgroundColor: court.status === 'ACTIVE' ? 'rgba(204, 255, 0, 0.1)' : 'rgba(255, 68, 68, 0.1)', color: court.status === 'ACTIVE' ? '#ccff00' : '#ff4444' }}>
                      {court.status === 'ACTIVE' ? 'SẴN SÀNG' : 'BẢO TRÌ'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' }}>
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>Giá gốc: {court.basePrice}/h</span>
                    <button style={{ backgroundColor: 'transparent', border: '1px solid #444', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>Chỉnh sửa</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM NAVIGATION (Giao diện điều hướng dưới đáy) */}
      <nav style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: '100vw', backgroundColor: '#1a1a1a', display: 'flex', justifyContent: 'space-around', padding: '15px 0', borderTop: '1px solid #333', zIndex: 10 }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ background: 'transparent', border: 'none', color: activeTab === 'dashboard' ? '#ccff00' : '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <LayoutDashboard size={24} />
          <span style={{ fontSize: '0.7rem' }}>Tổng quan</span>
        </button>
        <button onClick={() => setActiveTab('schedule')} style={{ background: 'transparent', border: 'none', color: activeTab === 'schedule' ? '#ccff00' : '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <CalendarClock size={24} />
          <span style={{ fontSize: '0.7rem' }}>Lịch đặt</span>
        </button>
        <button onClick={() => setActiveTab('courts')} style={{ background: 'transparent', border: 'none', color: activeTab === 'courts' ? '#ccff00' : '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <MapPin size={24} />
          <span style={{ fontSize: '0.7rem' }}>Sân bãi</span>
        </button>
      </nav>
    </div>
  );
}