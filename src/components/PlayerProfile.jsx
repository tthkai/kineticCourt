// src/components/PlayerProfile.jsx
import React from 'react';
import { ChevronLeft, Shield, Star, Award, MessageCircle, UserPlus, Zap, Rocket, History, Crosshair } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/mockData';

const PlayerProfile = ({ player, onBack }) => {
  if (!player) return null;

  // 1. XỬ LÝ FALLBACK CHO DỮ LIỆU FIREBASE
  // Đảm bảo không bị crash nếu tài khoản mới chưa có các trường này
  const name = player.displayName || player.name || 'Người chơi hệ thống';
  const avatar = player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c3ff00&color=000`;
  const xp = player.xp || 0;
  const maxXp = player.maxXp || 1000;
  const progressPercent = (xp / maxXp) * 100;
  const levelNum = Math.floor(xp / 100) + 1; // Tính level tạm thời dựa trên XP
  
  const bio = player.bio || 'Thành viên mới gia nhập Kinetic Court.';
  const levelText = player.level || 'Người mới';
  const rank = player.rank || '--';
  const winRate = player.winRate || '0%';
  const matchesCount = player.matches || 0;
  const style = player.style || 'Đang cập nhật';
  const gear = player.gear || 'Đang cập nhật';
  
  // Mảng mặc định rỗng nếu chưa có dữ liệu
  const unlockedAchievements = player.unlockedAchievements || [];
  const recentHistory = player.recentHistory || [];

  return (
    <div className="booking-overlay active">
      {/* Header - Fixed */}
      <div className="booking-header" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={onBack} className="icon-btn-transparent">
          <ChevronLeft size={24} color="white" />
        </button>
        <h2 style={{ margin: 0 }}>Hồ sơ cao thủ</h2>
      </div>

      {/* Scrollable Content */}
      <div className="screen-content" style={{ padding: '0 20px 100px', flex: 1, overflowY: 'auto' }}>
        <div className="profile-header mt-20">
          <div className="avatar-wrapper" style={{ position: 'relative' }}>
            <img 
              src={avatar} 
              style={{ width: 100, height: 100, borderRadius: '50%', border: '4px solid var(--primary)', boxShadow: '0 0 20px rgba(195, 255, 0, 0.3)', objectFit: 'cover' }} 
              alt={name} 
            />
            <div className="level-badge-float" style={{ 
              position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--primary)', color: 'black',
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'
            }}>
              LEVEL {levelNum}
            </div>
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '20px', marginBottom: '5px', textAlign: 'center' }}>{name}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
            <Shield size={16} />
            <span>{levelText}</span>
          </div>
          <p className="muted" style={{ fontStyle: 'italic', marginTop: '10px', textAlign: 'center' }}>"{bio}"</p>
        </div>

        {/* XP Progress Bar */}
        <div className="glass-card mt-20" style={{ padding: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
            <span className="muted">Tiến trình Level</span>
            <span>{xp}/{maxXp} XP</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s ease-out' }}></div>
          </div>
        </div>

        <div className="stats-grid mt-20" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div className="glass-card stat-box" style={{ padding: '15px 10px', textAlign: 'center' }}>
            <p className="muted" style={{ fontSize: '0.75rem', marginBottom: '5px' }}>Hạng</p>
            <div className="stat-value neon-text" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>#{rank}</div>
          </div>
          <div className="glass-card stat-box" style={{ padding: '15px 10px', textAlign: 'center' }}>
            <p className="muted" style={{ fontSize: '0.75rem', marginBottom: '5px' }}>Tỷ lệ thắng</p>
            <div className="stat-value" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{winRate}</div>
          </div>
          <div className="glass-card stat-box" style={{ padding: '15px 10px', textAlign: 'center' }}>
            <p className="muted" style={{ fontSize: '0.75rem', marginBottom: '5px' }}>Trận đấu</p>
            <div className="stat-value" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{matchesCount}</div>
          </div>
        </div>

        <div className="section-title" style={{ marginTop: '25px', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Thông tin vợt & Lối chơi</h3>
        </div>
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '15px' }}>
          <div>
            <p className="muted" style={{ fontSize: '0.7rem', marginBottom: '6px' }}>Lối chơi</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} color="var(--primary)" />
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{style}</span>
            </div>
          </div>
          <div>
            <p className="muted" style={{ fontSize: '0.7rem', marginBottom: '6px' }}>Vợt yêu thích</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Rocket size={16} color="var(--primary)" />
              <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{gear}</span>
            </div>
          </div>
        </div>

        <div className="section-title" style={{ marginTop: '25px', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Huy hiệu đạt được</h3>
        </div>
        
        {/* Kiểm tra an toàn nếu user chưa có huy hiệu nào */}
        {unlockedAchievements.length > 0 ? (
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            {unlockedAchievements.map(id => {
              const ach = ACHIEVEMENTS.find(a => a.id === id);
              if (!ach) return null; // An toàn nếu data bị lệch
              return (
                <div key={id} className="glass-card" style={{ padding: '12px 10px', minWidth: '85px', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{ach.icon}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 'bold', lineHeight: '1.2' }}>{ach.title}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '15px', textAlign: 'center' }}>
            <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>Người chơi này chưa đạt được huy hiệu nào.</p>
          </div>
        )}

        <div className="section-title" style={{ marginTop: '25px', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Trận đấu gần đây</h3>
        </div>
        
        {/* Kiểm tra an toàn nếu user chưa đánh trận nào */}
        {recentHistory.length > 0 ? (
          <div className="history-list">
            {recentHistory.map(match => (
              <div key={match.id} className="glass-card" style={{ marginBottom: '12px', padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ 
                    color: match.result === 'WIN' ? 'var(--primary)' : '#ff4444', 
                    fontWeight: 900, fontSize: '0.75rem', padding: '2px 8px', 
                    background: match.result === 'WIN' ? 'rgba(195,255,0,0.1)' : 'rgba(255,68,68,0.1)',
                    borderRadius: '4px'
                  }}>
                    {match.result === 'WIN' ? 'CHIẾN THẮNG' : 'THẤT BẠI'}
                  </span>
                  <span className="muted" style={{ fontSize: '0.75rem' }}>{match.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>vs {match.opponent}</h4>
                    <p className="muted" style={{ fontSize: '0.8rem', marginTop: '4px', margin: 0 }}>{match.location}</p>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '1px' }}>{match.score}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>Chưa có lịch sử thi đấu.</p>
          </div>
        )}

        <div className="action-row mt-30" style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
          <button className="btn-primary" style={{ flex: 1.5, height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            <UserPlus size={20} />
            Kết bạn
          </button>
          <button className="btn-slim-neon" style={{ flex: 1, height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid #333', borderRadius: '12px', cursor: 'pointer' }}>
            <MessageCircle size={20} />
            Nhắn tin
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;