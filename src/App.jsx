import React, { useState, useEffect, useMemo } from 'react';
import './index.css';
import { Search, Trophy, Wallet, User as UserIcon, MapPin, Star, Calendar, Clock, CreditCard, ChevronRight, Plus, Menu, Crosshair, SlidersHorizontal, Map as MapIcon, CheckCircle, Zap, Rocket, History, Shield, Users, X, LogOut } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
// CHỈ GIỮ LẠI DATA CÁ NHÂN TỪ MOCK DATA
import { USER_STATS, TRANSACTIONS, PLAYERS, MATCH_HISTORY, GROUP_DEBTS } from './data/mockData';
import BookingDetail from './components/BookingDetail';
import { MatchHistory, Achievements, SettingsPage } from './components/ProfileSubScreens';
import MatchDetail from './components/MatchDetail';
import PlayerProfile from './components/PlayerProfile';
import CreateMatchModal from './components/CreateMatchModal';
import MatchCard from './components/MatchCard';
import PaymentMethodsModal from './components/PaymentMethodsModal';
import SplitBillModal from './components/SplitBillModal';

// IMPORT FIREBASE LOGIC
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { useData } from './context/DataContext';
import { useAuth } from './context/AuthContext'; 

// Notification/Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast">
      <CheckCircle color="#c3ff00" size={24} />
      <span>{message}</span>
    </div>
  );
};

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'courts', icon: MapIcon, label: 'Đặt sân' },
    { id: 'community', icon: UserIcon, label: 'Tìm kèo' },
    { id: 'bookings', icon: Wallet, label: 'Quỹ nhóm' },
    { id: 'profile', icon: UserIcon, label: 'Hồ sơ' },
  ];

  return (
    <div className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <tab.icon size={24} color={activeTab === tab.id ? '#c3ff00' : '#888888'} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// Helper component to handle map movement
const MapHandler = ({ center, zoom = 15, bounds = null }) => {
  const map = useMap();
  const centerKey = center ? center.join(',') : '';
  const boundsKey = bounds ? JSON.stringify(bounds) : '';

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, duration: 1.5 });
    } else if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [centerKey, boundsKey, zoom, map]);
  return null;
};

const Courts = ({ courtsList, onBookCourt }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('Tất cả');
  const [showDistrictSheet, setShowDistrictSheet] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(courtsList[0] || null);

  const translateY = isDragging ? Math.max(0, currentY - startY) : 0;

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY - startY > 150) {
      setShowDistrictSheet(false);
    }
    setStartY(0);
    setCurrentY(0);
  };

  const districts = ['Tất cả', 'Quận 1', 'Quận 2', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 8', 'Quận 10', 'Bình Thạnh', 'Phú Nhuận', 'Gò Vấp', 'Tân Bình', 'Thủ Đức'];

  const normalize = (str) => {
    if (!str) return "";
    return str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d");
  };

  const filteredCourts = courtsList.filter(court => {
    const normSearch = normalize(searchQuery);
    const normLocation = normalize(court.location);
    const normName = normalize(court.name);

    const matchesSearch = normName.includes(normSearch) || normLocation.includes(normSearch);
    const matchesDistrict = filterDistrict === 'Tất cả' || court.district === filterDistrict;
    
    return matchesSearch && matchesDistrict;
  });

  const currentBounds = useMemo(() => {
    if (filteredCourts.length > 0) {
      return filteredCourts.map(c => [c.lat, c.lng]);
    }
    return null;
  }, [filteredCourts]);

  useEffect(() => {
    if (filteredCourts.length > 0) {
      if (!selectedCourt || !filteredCourts.some(fc => fc.id === selectedCourt.id)) {
        setSelectedCourt(filteredCourts[0]);
      }
    } else {
      setSelectedCourt(null);
    }
  }, [filterDistrict, searchQuery]);

  const createCustomIcon = (isActive, isVisible) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-container ${isActive ? 'active' : ''} ${!isVisible ? 'dimmed' : ''}">
          <div class="marker-inner">
            <svg viewBox="0 0 24 24" width="${isActive ? 20 : 14}" height="${isActive ? 20 : 14}" stroke="currentColor" stroke-width="2" fill="${isActive ? 'black' : 'none'}" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          ${isActive ? '<div class="marker-pulse"></div>' : ''}
        </div>
      `,
      iconSize: isActive ? [40, 40] : [30, 30],
      iconAnchor: isActive ? [20, 20] : [15, 15]
    });
  };

  return (
    <div className="courts-screen">
      <div className="map-container" style={{ position: 'absolute', inset: 0 }}>
        <MapContainer 
          center={[10.7841, 106.6912]} 
          zoom={13} 
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapHandler 
            center={(!filterDistrict || filterDistrict === 'Tất cả') && !searchQuery ? null : (selectedCourt ? [selectedCourt.lat, selectedCourt.lng] : null)}
            bounds={currentBounds}
          />
          {courtsList.map(court => {
            const isVisible = filteredCourts.some(fc => fc.id === court.id);
            const isActive = selectedCourt?.id === court.id;
            return (
              <Marker 
                key={court.id} 
                position={[court.lat, court.lng]}
                icon={createCustomIcon(isActive, isVisible)}
                eventHandlers={{ click: () => setSelectedCourt(court) }}
              />
            );
          })}
        </MapContainer>
      </div>

      <div className="map-overlay">
        <div className="main-header">
          <h1 className="neon-text">KINETIC COURT</h1>
        </div>

        <div className="search-section">
          <div className="search-input-wrapper">
            <Search size={20} color="#888" />
            <input 
              type="text" 
              placeholder="Tìm sân quanh đây" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Crosshair size={20} color="#c3ff00" />
          </div>
          <button className="icon-btn-neon"><SlidersHorizontal size={24} /></button>
        </div>

        <div className="district-selector-trigger" onClick={() => setShowDistrictSheet(true)}>
          <MapIcon size={16} color="var(--primary)" />
          <span>Khu vực: <strong>{filterDistrict}</strong></span>
          <ChevronRight size={16} color="white" style={{ transform: 'rotate(90deg)' }} />
        </div>

        <div className={`bottom-sheet-overlay ${showDistrictSheet ? 'active' : ''}`} onClick={() => setShowDistrictSheet(false)}></div>

        <div className={`district-bottom-sheet ${showDistrictSheet ? 'active' : ''} ${isDragging ? 'dragging' : ''}`} style={{ transform: `translateX(-50%) translateY(${translateY}px)` }}>
          <div className="drag-handle" style={{ cursor: 'grab' }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}></div>
          <div className="sheet-header" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <h2 style={{ margin: 0 }}>Chọn khu vực</h2>
            <button className="icon-btn-transparent" onClick={() => setShowDistrictSheet(false)}>
              <X size={24} color="white" />
            </button>
          </div>
          <div className="district-scroll-area">
            <div className="district-grid">
              {districts.map(d => (
                <div 
                  key={d} 
                  className={`district-chip-btn ${filterDistrict === d ? 'active' : ''}`}
                  onClick={() => { setFilterDistrict(d); setShowDistrictSheet(false); }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedCourt && filteredCourts.includes(selectedCourt) && (
          <div className="floating-card-container">
            <div className="floating-court-card">
              <div className="img-container">
                <img src={selectedCourt.image} className="floating-img" alt="court" />
                <div className="img-overlay-bottom">
                  <h3 style={{ margin: 0, color: 'white', fontSize: '1rem' }}>{selectedCourt.name}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', margin: '2px 0 0' }}>{selectedCourt.location}</p>
                </div>
                <div className="badge-pop">PHỔ BIẾN</div>
                <div className="rating-overlay">
                   <Star size={10} fill="#c3ff00" color="#c3ff00" />
                   <span>{selectedCourt.rating}</span>
                </div>
              </div>
              <div className="court-compact-footer">
                <div className="price-tag">
                  <span className="val">{selectedCourt.price}</span>
                  <span className="lbl">/H</span>
                </div>
                <button className="btn-slim-neon" onClick={() => onBookCourt(selectedCourt)}>ĐẶT SÂN</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Matchmaking = ({ matches, onJoin, onSelect, onCreateClick, joinedIds }) => (
  <div className="screen-content">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 className="neon-text">Tìm đối thủ</h1>
      <button className="icon-btn-neon" onClick={onCreateClick}><Plus size={24} /></button>
    </div>
    
    <div className="filter-chips">
      <span className="chip active">Hôm nay</span>
      <span className="chip">Ngày mai</span>
      <span className="chip">Tuần này</span>
    </div>

    {matches.map(match => (
      <MatchCard 
        key={match.id}
        match={match}
        onJoin={onJoin}
        onSelect={onSelect}
        isJoined={joinedIds.includes(match.id)}
      />
    ))}
  </div>
);

const GroupWallet = ({ balance, transactions, debts, onDeposit, onOpenDeposit, onOpenSplit, activeTab, onTabChange }) => {
  const totalDebts = debts.reduce((acc, curr) => acc + curr.amount, 0);

  const aggregatedDebts = React.useMemo(() => {
    const groups = {};
    debts.forEach(d => {
      if (!groups[d.name]) {
        groups[d.name] = { ...d, reasons: [d.reason] };
      } else {
        groups[d.name].amount += d.amount;
        if (!groups[d.name].reasons.includes(d.reason)) {
          groups[d.name].reasons.push(d.reason);
        }
      }
    });
    return Object.values(groups);
  }, [debts]);

  return (
    <div className="screen-content">
      <h1 className="neon-text">Ví Nhóm</h1>
      
      <div className="glass-card balance-card neon-border">
        <p className="muted">Số dư hiện tại</p>
        <div className="balance-amount">{balance.toLocaleString()}đ</div>
        <div className="balance-actions">
          <button className="btn-primary" style={{ padding: '12px 30px' }} onClick={onOpenDeposit}>
            <Plus size={20} /> Nạp tiền
          </button>
        </div>
      </div>

      <div className="tab-toggle-container">
        <button 
          className={`tab-toggle-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onTabChange('history')}
        >
          Lịch sử
        </button>
        <button 
          className={`tab-toggle-btn ${activeTab === 'debts' ? 'active' : ''}`}
          onClick={() => onTabChange('debts')}
        >
          Nợ quỹ
        </button>
      </div>

      {activeTab === 'history' ? (
        <div style={{ maxHeight: '450px', overflowY: 'auto', paddingBottom: '20px' }}>
          {transactions.map(tx => (
            <div key={tx.id} className="tx-item-container" style={{ marginBottom: '10px' }}>
              <div className="tx-item">
                <div className="tx-icon">
                  {tx.type === 'deposit' ? <Plus color="#c3ff00" /> : <CreditCard color="#ff4444" />}
                </div>
                <div className="tx-info">
                  <h4>{tx.title}</h4>
                  <p className="muted">{tx.date}</p>
                </div>
                <div className={`tx-amount ${tx.type === 'deposit' ? 'positive' : 'negative'}`}>
                  {tx.amount}
                </div>
              </div>
              {tx.type === 'payment' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-5px', padding: '0 16px 12px' }}>
                   <button 
                     className="chip" 
                     style={{ fontSize: '0.7rem', padding: '4px 12px', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                     onClick={() => onOpenSplit(tx)}
                   >
                     <Users size={12} style={{ marginRight: '4px' }} /> Chia tiền
                   </button>
                </div>
              )}
            </div>
          ))}
          
          <div className="glass-card qr-card mt-20">
            <p className="textAlign-center">Mã QR nạp tiền nhanh</p>
            <div className="qr-placeholder">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=KineticCourtWallet" alt="QR Code" />
            </div>
            <p className="muted textAlign-center">Quét để nạp tiền vào quỹ nhóm</p>
          </div>
        </div>
      ) : (
        <div style={{ maxHeight: '450px', overflowY: 'auto', paddingBottom: '20px' }}>
          {aggregatedDebts.map(debt => (
            <div key={debt.name} className="debt-card">
              <img src={debt.avatar} alt={debt.name} style={{ width: 45, height: 45, borderRadius: '12px' }} />
              <div className="debt-info">
                <h4 style={{ margin: 0 }}>{debt.name}</h4>
                <div className="debt-amount">-{debt.amount.toLocaleString()}đ</div>
                <div className="debt-reason">{debt.reasons.join(', ')}</div>
              </div>
              <button className="remind-btn" onClick={() => alert(`Đã gửi tin nhắn nhắc nợ tới ${debt.name}!`)}>Nhắc nợ</button>
            </div>
          ))}
          <div className="glass-card mt-20" style={{ padding: '15px', textAlign: 'center' }}>
            <p className="muted" style={{ fontSize: '0.85rem' }}>Tổng số nợ cần thu: <strong style={{ color: '#ff4444' }}>{totalDebts.toLocaleString()}đ</strong></p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENT PROFILE HOÀN CHỈNH
// ─────────────────────────────────────────────────────────────
const Profile = ({ onMenuClick }) => {
  const { user, userProfile, logout } = useAuth();
  
  // 1. Xác định tài khoản đặc biệt (Dùng cho Nguyễn Văn A)
  const specialEmails = ['hoangthanhtung2801@gmail.com', 'giakhang@gmail.com'];
  const isSpecialAccount = specialEmails.includes(user?.email);
  const displayData = isSpecialAccount ? USER_STATS : (userProfile || USER_STATS);

  // 2. Logic hiển thị chữ cái trong vòng tròn Avatar (ME hoặc HT)
  const getAvatarContent = () => {
    if (isSpecialAccount) return "ME"; 
    if (displayData.avatar && displayData.avatar.startsWith('http')) return null; 
    
    const nameParts = displayData.name ? displayData.name.split(' ') : ['?'];
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  // 3. ĐỒNG BỘ LOGIC BIẾN (FIX NGƯỢC DỮ LIỆU)
  const xp = displayData.xp || 0;
  const maxXp = displayData.maxXp || 1000;
  const progressPercent = (xp / maxXp) * 100;
  
  const levelNum = displayData.levelNum || (isSpecialAccount ? 12 : Math.floor(xp / 100) + 1);
  
  // NẾU LÀ TÀI KHOẢN ĐẶC BIỆT THÌ ĐẢO NGƯỢC BIẾN CHO KHỚP MOCK DATA
  const shieldText = isSpecialAccount ? displayData.level : (displayData.rank || 'Tân binh');
  const rankValue = isSpecialAccount ? displayData.rank : (displayData.level || 1);

  // Lấy lịch sử đấu (Dùng MATCH_HISTORY cho Nguyễn Văn A, hoặc data rỗng cho người mới)
  const recentMatches = isSpecialAccount ? MATCH_HISTORY.slice(0, 3) : (displayData.recentHistory || []);

  return (
    <div className="screen-content" style={{ paddingBottom: '100px' }}>
      <div className="profile-header mt-20" style={{ textAlign: 'center' }}>
        <div className="avatar-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{ 
            width: 120, height: 120, borderRadius: '50%', background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 'bold', color: 'black',
            boxShadow: '0 0 30px rgba(195, 255, 0, 0.5)', border: '4px solid #000',
            overflow: 'hidden'
          }}>
            {getAvatarContent() ? (
              <span>{getAvatarContent()}</span>
            ) : (
              <img src={displayData.avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Avatar" />
            )}
          </div>
          
          <div style={{ 
            position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--primary)', color: 'black', padding: '6px 18px',
            borderRadius: '25px', fontSize: '0.8rem', fontWeight: '900',
            boxShadow: '0 4px 15px rgba(0,0,0,0.6)', border: '2px solid #000', whiteSpace: 'nowrap'
          }}>
            LEVEL {levelNum}
          </div>
        </div>
        
        <h2 style={{ fontSize: '2.5rem', marginTop: '25px', marginBottom: '8px' }}>{displayData.name}</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)', fontSize: '1rem', fontWeight: 'bold' }}>
          <Shield size={18} />
          <span>{shieldText}</span>
        </div>
        
        <p className="muted" style={{ fontStyle: 'italic', marginTop: '15px', fontSize: '1.1rem' }}>
          "{displayData.bio}"
        </p>
      </div>

      <div className="glass-card mt-20" style={{ padding: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
          <span className="muted">Tiến trình thăng hạng</span>
          <span>{xp}/{maxXp} XP</span>
        </div>
        <div className="progress-bar-bg" style={{ height: '8px' }}>
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, height: '100%' }}></div>
        </div>
        <p className="muted" style={{ fontSize: '0.7rem', marginTop: '8px' }}>Gần tới Level mới rồi!</p>
      </div>

      <div className="stats-grid mt-20">
        <div className="glass-card stat-box">
          <p className="muted">Hạng</p>
          <div className="stat-value neon-text">{rankValue}</div>
        </div>
        <div className="glass-card stat-box">
          <p className="muted">Tỷ lệ thắng</p>
          <div className="stat-value">{displayData.winRate || '0%'}</div>
        </div>
        <div className="glass-card stat-box">
          <p className="muted">Trận đấu</p>
          <div className="stat-value">{displayData.matches || 0}</div>
        </div>
      </div>
      
      {/* KHÔI PHỤC: VỢT & LỐI CHƠI */}
      <div className="section-title">
        <h3>Vợt & Lối chơi</h3>
      </div>
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <p className="muted" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Lối chơi</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color="var(--primary)" />
            <span style={{ fontWeight: 'bold' }}>{displayData.style || (isSpecialAccount ? "Toàn diện" : "Đang cập nhật")}</span>
          </div>
        </div>
        <div>
          <p className="muted" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Vợt yêu thích</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Rocket size={16} color="var(--primary)" />
            <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{displayData.gear || (isSpecialAccount ? "Yonex Arcsaber 11 Play" : "Đang cập nhật")}</span>
          </div>
        </div>
      </div>

      {/* KHÔI PHỤC: TRẬN ĐẤU GẦN ĐÂY */}
      <div className="section-title">
        <h3>Trận đấu gần đây</h3>
      </div>
      <div className="history-preview">
        {recentMatches.length > 0 ? recentMatches.map(match => (
          <div key={match.id} className="glass-card" style={{ marginBottom: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '35px', height: '35px', borderRadius: '8px', 
                  background: match.result === 'WIN' ? 'rgba(195, 255, 0, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: match.result === 'WIN' ? 'var(--primary)' : '#ff4444',
                  fontWeight: 'bold', fontSize: '0.7rem'
                }}>
                  {match.result === 'WIN' ? 'W' : 'L'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem' }}>vs {match.opponent}</h4>
                  <p className="muted" style={{ fontSize: '0.65rem' }}>{match.date} • {match.location ? match.location.split(' ').pop() : ''}</p>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{match.score}</div>
            </div>
          </div>
        )) : (
          <div className="glass-card" style={{ padding: '15px', textAlign: 'center' }}>
            <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>Chưa có lịch sử thi đấu.</p>
          </div>
        )}
      </div>

      <div className="menu-list mt-20">
        <div className="menu-item" onClick={() => onMenuClick('Lịch sử thi đấu')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={18} color="#888" />
            <span>Tất cả lịch sử đấu</span>
          </div>
          <ChevronRight size={18} color="#888" />
        </div>
        <div className="menu-item" onClick={() => onMenuClick('Thành tích')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trophy size={18} color="#888" />
            <span>Thành tích cá nhân</span>
          </div>
          <ChevronRight size={18} color="#888" />
        </div>
        
        <div className="menu-item" onClick={logout} style={{ marginTop: '20px', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4444' }}>
            <LogOut size={18} />
            <span>Đăng xuất tài khoản</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { user, userProfile } = useAuth();
  const { courts, matches, loadingData } = useData(); 

  const [activeTab, setActiveTab] = useState('courts');
  const [bookingCourt, setBookingCourt] = useState(null);
  const [profileSubScreen, setProfileSubScreen] = useState(null);
  const [activeMatchDetail, setActiveMatchDetail] = useState(null);
  const [viewingPlayer, setViewingPlayer] = useState(null);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [activeTxToSplit, setActiveTxToSplit] = useState(null);
  const [joinedMatches, setJoinedMatches] = useState([]);
  const [balance, setBalance] = useState(450000);
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [walletTab, setWalletTab] = useState('history'); 
  const [debtsList, setDebtsList] = useState(GROUP_DEBTS);
  const [toast, setToast] = useState(null);

  const handleDeposit = (amount, methodName) => {
    setBalance(prev => prev + amount);
    const newTx = {
      id: Date.now(),
      title: `Nạp tiền qua ${methodName}`,
      amount: `+${amount.toLocaleString()}đ`,
      date: 'Vừa xong',
      type: 'deposit'
    };
    setTransactions([newTx, ...transactions]);
    setShowDepositModal(false);
    setToast(`Đã nạp ${amount.toLocaleString()}đ vào ví!`);
  };

  const handleSplitConfirm = (tx, members, amountPerPerson, extraFee = 0) => {
    setShowSplitModal(false);
    if (extraFee > 0) {
      const correctionTx = {
        id: Date.now(),
        title: `Phí phát sinh: ${tx.title.replace('Thanh toán ', '')}`,
        amount: `-${extraFee.toLocaleString()}đ`,
        date: 'Vừa xong',
        type: 'payment'
      };
      setTransactions(prev => [correctionTx, ...prev]);
      setBalance(prev => prev - extraFee);
    }
    const newDebts = members.map((player, index) => ({
      id: Date.now() + index,
      name: player.name,
      amount: amountPerPerson,
      reason: `Chia tiền: ${tx.title}`,
      avatar: player.avatar
    }));
    setDebtsList(prev => [...newDebts, ...prev]);
    setToast(`Đã chia tiền và cập nhật nợ cho ${members.length} người!`);
  };

  const handleConfirmBooking = async (totalPrice, selectedSlots, selectedDate) => {
    const cost = totalPrice * 1000;
    if (balance < cost) {
      alert("Số dư không đủ! Vui lòng nạp thêm tiền.");
      return;
    }

    try {
      await addDoc(collection(db, 'bookings'), {
        courtId: bookingCourt.id,
        courtName: bookingCourt.name,
        ownerId: bookingCourt.ownerId || 'system_admin', 
        playerId: user?.uid || 'unknown',
        playerName: userProfile?.name || USER_STATS.name, 
        amount: cost,
        date: selectedDate,
        time: selectedSlots.map(s => s.time).join(', '),
        status: 'confirmed',
        createdAt: serverTimestamp()
      });

      setBalance(prev => prev - cost);
      const newTx = {
        id: Date.now(),
        title: `Đặt sân tại ${bookingCourt.name}`,
        amount: `-${cost.toLocaleString()}đ`,
        date: 'Vừa xong',
        type: 'payment'
      };
      setTransactions([newTx, ...transactions]);
      setBookingCourt(null);
      setToast("Đặt sân thành công! Chủ sân đã nhận được doanh thu.");
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      alert("Không thể hoàn tất giao dịch: " + error.message);
    }
  };

  const handleJoinMatch = (match) => {
    if (joinedMatches.includes(match.id)) {
      setJoinedMatches(prev => prev.filter(id => id !== match.id));
      setToast(`Đã rút lui khỏi: ${match.title}`);
    } else {
      setJoinedMatches(prev => [...prev, match.id]);
      setToast(`Đã tham gia: ${match.title}`);
    }
  };

  const handleCreateMatch = async (newMatch) => {
    try {
      await setDoc(doc(db, 'matches', newMatch.id.toString()), {
        ...newMatch,
        joinedPlayers: []
      });
      setShowCreateMatch(false);
      setToast("Đã đăng trận đấu lên hệ thống Firebase!");
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  if (loadingData) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#c3ff00' }}>
        <h2>Đang tải dữ liệu Bản Đồ...</h2>
      </div>
    );
  }

  const renderScreen = () => {
    // 1. Phân biệt người dùng
    const specialEmails = ['hoangthanhtung2801@gmail.com', 'giakhang@gmail.com'];
    const isSpecialAccount = specialEmails.includes(user?.email);
    
    // 2. Kéo dữ liệu lịch sử đấu chuẩn xác
    const fullHistory = isSpecialAccount ? MATCH_HISTORY : (userProfile?.recentHistory || []);

    if (bookingCourt) {
      const relatedMatches = matches.filter(m => m.courtId === bookingCourt.id);
      return (
        <BookingDetail 
          court={bookingCourt} 
          relatedMatches={relatedMatches}
          onBack={() => setBookingCourt(null)} 
          onConfirm={handleConfirmBooking}
          onJoinMatch={handleJoinMatch}
          onSelectMatch={setActiveMatchDetail}
          joinedIds={joinedMatches}
        />
      );
    }

    if (viewingPlayer) {
      return (
        <PlayerProfile 
          player={viewingPlayer} 
          onBack={() => setViewingPlayer(null)} 
        />
      );
    }

    if (activeMatchDetail) {
      return (
        <MatchDetail 
          match={activeMatchDetail} 
          onBack={() => setActiveMatchDetail(null)} 
          onJoin={handleJoinMatch}
          onViewPlayer={(id) => {
            const player = PLAYERS.find(p => p.id === id);
            setViewingPlayer(player);
          }}
          isJoined={joinedMatches.some(m => m.id === activeMatchDetail.id)}
          courts={courts}
        />
      );
    }

    if (showCreateMatch) {
      return (
        <CreateMatchModal 
          onBack={() => setShowCreateMatch(false)}
          onCreate={handleCreateMatch}
          courts={courts}
        />
      );
    }

    // 3. TRUYỀN DỮ LIỆU historyData VÀO MÀN HÌNH SUB-SCREEN
    if (profileSubScreen === 'Lịch sử thi đấu') {
      return <MatchHistory historyData={fullHistory} onBack={() => setProfileSubScreen(null)} />;
    }
    
    if (profileSubScreen === 'Thành tích') return <Achievements onBack={() => setProfileSubScreen(null)} />;
    if (profileSubScreen === 'Cài đặt') return <SettingsPage onBack={() => setProfileSubScreen(null)} />;

    if (showDepositModal) {
      return (
        <PaymentMethodsModal 
          onBack={() => setShowDepositModal(false)}
          onConfirm={handleDeposit}
        />
      );
    }

    if (showSplitModal && activeTxToSplit) {
      return (
        <SplitBillModal 
          tx={activeTxToSplit}
          onBack={() => { setShowSplitModal(false); setActiveTxToSplit(null); }}
          onConfirm={handleSplitConfirm}
        />
      );
    }

    switch(activeTab) {
      case 'courts': return <Courts courtsList={courts} onBookCourt={setBookingCourt} />;
      case 'community': return (
        <Matchmaking 
          matches={matches} 
          onJoin={handleJoinMatch} 
          onSelect={setActiveMatchDetail}
          onCreateClick={() => setShowCreateMatch(true)}
          joinedIds={joinedMatches}
        />
      );
      case 'bookings': return (
        <GroupWallet 
          balance={balance} 
          transactions={transactions} 
          onDeposit={handleDeposit}
          onOpenDeposit={() => setShowDepositModal(true)}
          onOpenSplit={(tx) => { setActiveTxToSplit(tx); setShowSplitModal(true); }}
          activeTab={walletTab}
          onTabChange={setWalletTab}
          debts={debtsList}
        />
      );
      case 'profile': return <Profile onMenuClick={setProfileSubScreen} />;
      default: return <Courts courtsList={courts} onBookCourt={setBookingCourt} />;
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setBookingCourt(null);
    setShowCreateMatch(false);
    setActiveMatchDetail(null);
    setProfileSubScreen(null);
    setViewingPlayer(null);
    setShowDepositModal(false);
    setShowSplitModal(false);
  };

  return (
    <div className="app-container">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {renderScreen()}
      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
}

export default App;