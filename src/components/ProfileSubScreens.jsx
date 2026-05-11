// src/components/ProfileSubScreens.jsx
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

// XÓA IMPORT MOCKDATA: Không dùng import { MATCH_HISTORY, ACHIEVEMENTS } nữa

const MatchHistory = ({ onBack }) => {
  const { userProfile } = useAuth();
  
  // Lấy lịch sử từ Firebase, nếu chưa có thì dùng mảng rỗng [] để không bị lỗi
  const history = userProfile?.recentHistory || [];

  return (
    <div className="screen-content booking-overlay active" style={{ padding: 0 }}>
      <div className="booking-header" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={onBack} className="icon-btn-transparent">
          <ChevronLeft size={24} color="white" />
        </button>
        <h2 style={{ margin: 0 }}>Lịch sử đấu</h2>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        {history.length > 0 ? (
          history.map(match => (
            <div key={match.id} className="glass-card" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: match.result === 'WIN' ? '#c3ff00' : '#ff4444', fontWeight: 800 }}>
                  {match.result === 'WIN' ? 'W' : 'L'}
                </span>
                <span className="muted">{match.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{match.opponent}</h3>
                  <p className="muted" style={{ fontSize: '0.8rem' }}>{match.location}</p>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{match.score}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <p className="muted">Bạn chưa tham gia trận đấu nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Achievements = ({ onBack }) => {
  const { userProfile } = useAuth();
  
  // Danh sách huy hiệu gốc (Cái này có thể fix cứng vì nó là quy tắc của game)
  const ALL_ACHIEVEMENTS = [
    { id: 1, title: "Sát thủ sân cỏ", desc: "Thắng 10 trận liên tiếp", icon: "⚔️" },
    { id: 2, title: "Kẻ thách thức", desc: "Đấu với 5 đối thủ Chuyên nghiệp", icon: "🔥" },
    { id: 3, title: "Đại gia sân bãi", desc: "Đặt sân hơn 50 lần", icon: "💰" },
    { id: 4, title: "Người kết nối", desc: "Tham gia 20 nhóm giao lưu", icon: "🤝" },
    { id: 5, title: "Legend", desc: "Đạt cấp độ 50", icon: "👑" }
  ];

  // Kiểm tra xem user đã mở khóa huy hiệu nào chưa
  const unlockedIds = userProfile?.unlockedAchievements || [];

  return (
    <div className="screen-content booking-overlay active" style={{ padding: 0 }}>
      <div className="booking-header" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={onBack} className="icon-btn-transparent">
          <ChevronLeft size={24} color="white" />
        </button>
        <h2 style={{ margin: 0 }}>Thành tích</h2>
      </div>

      <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {ALL_ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlockedIds.includes(ach.id);
          return (
            <div key={ach.id} className={`glass-card ${!isUnlocked ? 'muted' : ''}`} style={{ textAlign: 'center', opacity: isUnlocked ? 1 : 0.5 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{ach.icon}</div>
              <h4 style={{ margin: '0 0 4px', color: isUnlocked ? '#c3ff00' : 'white' }}>{ach.title}</h4>
              <p className="muted" style={{ fontSize: '0.65rem' }}>{ach.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SettingsPage = ({ onBack }) => {
  const { userProfile, logout } = useAuth(); 

  return (
    <div className="screen-content booking-overlay active" style={{ padding: 0 }}>
      <div className="booking-header" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={onBack} className="icon-btn-transparent">
          <ChevronLeft size={24} color="white" />
        </button>
        <h2 style={{ margin: 0 }}>Cài đặt</h2>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
         <div className="section-title"><h3>Tài khoản</h3></div>
         <div className="menu-list">
           <div className="menu-item"><span>Đổi mật khẩu</span></div>
           {/* Hiển thị email thật từ Firebase */}
           <div className="menu-item"><span>Email: {userProfile?.email || 'Đang cập nhật'}</span></div>
         </div>

         <div className="section-title mt-20"><h3>Thông báo</h3></div>
         <div className="menu-list">
           <div className="menu-item" style={{ justifyContent: 'space-between' }}>
             <span>Thông báo đẩy</span>
             <div style={{ width: 40, height: 20, background: '#c3ff00', borderRadius: 10, position: 'relative' }}>
                <div style={{ width: 16, height: 16, background: 'black', borderRadius: '50%', position: 'absolute', right: 2, top: 2 }}></div>
             </div>
           </div>
         </div>

         <div className="section-title mt-20"><h3>Bảo mật</h3></div>
         <div className="menu-list">
           <div className="menu-item"><span>Xác thực 2 yếu tố</span></div>
         </div>

         <button 
           onClick={logout} 
           className="btn-primary mt-20" 
           style={{ width: '100%', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444' }}
         >
            Đăng xuất
         </button>
      </div>
    </div>
  );
};

export { MatchHistory, Achievements, SettingsPage };