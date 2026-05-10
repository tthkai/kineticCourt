// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
  Users, Building2, Calendar, CheckCircle, XCircle,
  LogOut, Search, Trash2, BarChart2, AlertCircle, Loader2
} from 'lucide-react';

const TABS = ['Tổng quan', 'Người dùng', 'Sân đấu', 'Booking'];

const AdminDashboard = () => {
  const { logout, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Tổng quan');
  const [users, setUsers] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy tên admin từ email
  const adminName = currentUser?.email?.split('@')[0] || 'Admin';

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const courtsSnap = await getDocs(collection(db, 'courts'));
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCourts(courtsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const approveCourt = async (courtId) => {
    await updateDoc(doc(db, 'courts', courtId), { status: 'approved' });
    setCourts(prev => prev.map(c => c.id === courtId ? { ...c, status: 'approved' } : c));
  };

  const rejectCourt = async (courtId) => {
    await updateDoc(doc(db, 'courts', courtId), { status: 'rejected' });
    setCourts(prev => prev.map(c => c.id === courtId ? { ...c, status: 'rejected' } : c));
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa user này khỏi hệ thống?')) return;
    await deleteDoc(doc(db, 'users', userId));
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const stats = {
    totalUsers: users.length,
    players: users.filter(u => u.role === 'player').length,
    owners: users.filter(u => u.role === 'court_owner').length,
    totalCourts: courts.length,
    pendingCourts: courts.filter(c => c.status === 'pending').length,
    approvedCourts: courts.filter(c => c.status === 'approved').length,
  };

  return (
    <div style={S.root}>
      {/* 1. STICKY HEADER CHO MOBILE */}
      <header style={S.header}>
        <div>
          <div style={S.adminBadge}>⚙️ SYSTEM ADMIN</div>
          <h2 style={S.adminName}>{adminName}</h2>
        </div>
        <button style={S.logoutBtn} onClick={logout}>
          <LogOut size={16} />
        </button>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <div style={S.main}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={S.pageTitle}>{activeTab}</h1>
          <button style={S.refreshBtn} onClick={fetchData}>↻ Làm mới</button>
        </div>

        {loading ? (
          <div style={S.loading}>
            <Loader2 size={32} color="#c3ff00" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {activeTab === 'Tổng quan' && <OverviewTab stats={stats} courts={courts} />}
            {activeTab === 'Người dùng' && <UsersTab users={users} onDelete={deleteUser} />}
            {activeTab === 'Sân đấu' && <CourtsTab courts={courts} onApprove={approveCourt} onReject={rejectCourt} />}
            {activeTab === 'Booking' && <BookingTab />}
          </>
        )}
      </div>

      {/* 3. BOTTOM NAVIGATION CHO MOBILE */}
      <nav style={S.bottomNav}>
        {TABS.map(tab => (
          <button
            key={tab}
            style={{ ...S.navBtn, ...(activeTab === tab ? S.navBtnActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_ICONS[tab]}
            <span style={{ fontSize: '0.65rem', marginTop: 4 }}>{tab}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// ── OVERVIEW TAB ──────────────────────────────────────────────
const OverviewTab = ({ stats, courts }) => (
  <div>
    <div style={S.statsGrid}>
      <StatCard icon={<Users size={20} />} label="Người dùng" value={stats.totalUsers} color="#c3ff00" />
      <StatCard icon={<Building2 size={20} />} label="Tổng sân" value={stats.totalCourts} color="#00d4ff" />
      <StatCard icon={<AlertCircle size={20} />} label="Chờ duyệt" value={stats.pendingCourts} color="#ff9500" />
      <StatCard icon={<CheckCircle size={20} />} label="Sân đã duyệt" value={stats.approvedCourts} color="#4caf50" />
    </div>

    <div style={S.card}>
      <h3 style={S.cardTitle}>Phân bổ tài khoản</h3>
      <RoleBar label="Người chơi 🏸" count={stats.players} total={stats.totalUsers} color="#c3ff00" />
      <RoleBar label="Chủ sân 🏟️" count={stats.owners} total={stats.totalUsers} color="#00d4ff" />
    </div>

    <div style={S.card}>
      <h3 style={S.cardTitle}>Sân đang chờ duyệt</h3>
      {courts.filter(c => c.status === 'pending').slice(0, 3).map(c => (
        <div key={c.id} style={S.pendingItem}>
          <span style={{ fontSize: '0.85rem' }}>{c.name}</span>
          <span style={S.statusBadge('pending')}>Chờ duyệt</span>
        </div>
      ))}
      {stats.pendingCourts === 0 && <p style={S.empty}>Hệ thống đã duyệt hết các sân</p>}
    </div>
  </div>
);

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ ...S.card, borderColor: `${color}30`, padding: 15, marginBottom: 0 }}>
    <div style={{ color, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: '1.6rem', fontWeight: 900, color }}>{value}</div>
    <div style={{ color: '#888', fontSize: '0.75rem' }}>{label}</div>
  </div>
);

const RoleBar = ({ label, count, total, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8rem' }}>
      <span>{label}</span><span style={{ color }}>{count}</span>
    </div>
    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
      <div style={{ height: '100%', width: `${total ? (count / total) * 100 : 0}%`, background: color, borderRadius: 3 }} />
    </div>
  </div>
);

// ── USERS TAB (Chuyển thành List Card cho Mobile) ─────────────
const UsersTab = ({ users, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = users.filter(u => {
    const matchSearch = (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = filter === 'all' || u.role === filter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={S.searchWrap}>
          <Search size={14} color="#888" />
          <input style={S.searchInput} placeholder="Tìm email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={S.select} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="player">Player</option>
          <option value="court_owner">Chủ sân</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(u => (
          <div key={u.id} style={S.listCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{u.email}</div>
                <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 4 }}>
                  Role: <span style={{ color: STATUS_COLORS[u.role]?.color }}>{ROLE_LABELS[u.role] || u.role}</span>
                </div>
              </div>
              <button style={S.iconBtn} onClick={() => onDelete(u.id)} title="Xóa tài khoản">
                <Trash2 size={18} color="#ff4444" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p style={S.empty}>Không tìm thấy tài khoản nào</p>}
      </div>
    </div>
  );
};

// ── COURTS TAB (Chuyển thành List Card cho Mobile) ────────────
const CourtsTab = ({ courts, onApprove, onReject }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {courts.map(c => (
      <div key={c.id} style={{ ...S.listCard, borderLeft: c.status === 'pending' ? '4px solid #ff9500' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{c.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>Chủ: {c.ownerName || c.ownerId?.substring(0,6)}</div>
          </div>
          <span style={S.statusBadge(c.status || 'pending')}>{STATUS_LABELS[c.status] || 'Chờ duyệt'}</span>
        </div>
        
        {/* Nút hành động cho sân đang chờ duyệt */}
        {c.status === 'pending' && (
          <div style={{ display: 'flex', gap: 10, marginTop: 15, paddingTop: 15, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button style={S.approveBtn} onClick={() => onApprove(c.id)}>✓ Phê duyệt</button>
            <button style={S.rejectBtn} onClick={() => onReject(c.id)}>✗ Từ chối</button>
          </div>
        )}
      </div>
    ))}
    {courts.length === 0 && <p style={S.empty}>Chưa có sân nào được đăng ký lên hệ thống</p>}
  </div>
);

// ── BOOKING TAB ───────────────────────────────────────────────
const BookingTab = () => (
  <div style={S.card}>
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Calendar size={48} color="#b400ff" style={{ margin: '0 auto 16px', display: 'block' }} />
      <h3>Lịch sử Booking Tổng</h3>
      <p style={{ color: '#888', fontSize: '0.85rem' }}>Tính năng đang được phát triển...</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// CONSTANTS & STYLES (ĐÃ TỐI ƯU MOBILE-FIRST)
// ─────────────────────────────────────────────────────────────
const TAB_ICONS = {
  'Tổng quan': <BarChart2 size={20} />,
  'Người dùng': <Users size={20} />,
  'Sân đấu': <Building2 size={20} />,
  'Booking': <Calendar size={20} />,
};
const ROLE_LABELS = { player: 'Player', court_owner: 'Chủ sân', admin: 'Admin' };
const STATUS_LABELS = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };

const STATUS_COLORS = {
  pending: { bg: 'rgba(255,149,0,0.15)', color: '#ff9500' },
  approved: { bg: 'rgba(76,175,80,0.15)', color: '#4caf50' },
  rejected: { bg: 'rgba(255,68,68,0.15)', color: '#ff4444' },
  player: { bg: 'rgba(195,255,0,0.1)', color: '#c3ff00' },
  court_owner: { bg: 'rgba(0,212,255,0.1)', color: '#00d4ff' },
  admin: { bg: 'rgba(180,0,255,0.1)', color: '#b400ff' },
};

const S = {
  // ÉP KHUNG MOBILE
  root: { 
    maxWidth: '480px', margin: '0 auto', height: '100dvh', background: '#0a0a0a', 
    color: 'white', display: 'flex', flexDirection: 'column', position: 'relative',
    boxShadow: '0 0 20px rgba(0,0,0,0.5)'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', background: '#111', borderBottom: '1px solid rgba(255,255,255,0.07)',
    position: 'sticky', top: 0, zIndex: 10
  },
  adminBadge: {
    fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1, color: '#b400ff',
    background: 'rgba(180,0,255,0.1)', border: '1px solid rgba(180,0,255,0.3)',
    borderRadius: 20, padding: '3px 10px', display: 'inline-block', marginBottom: 4,
  },
  adminName: { margin: 0, fontSize: '1rem', fontWeight: 700 },
  logoutBtn: {
    padding: '8px', borderRadius: 8, border: '1px solid rgba(255,68,68,0.3)', 
    background: 'transparent', color: '#ff4444', cursor: 'pointer',
  },
  main: { flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '90px' }, // Tránh bị Bottom Nav đè
  pageTitle: { fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' },
  refreshBtn: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#888', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 },
  card: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 20, marginBottom: 16,
  },
  cardTitle: { fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: '#aaa' },
  pendingItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  listCard: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, padding: 16,
  },
  statusBadge: (status) => ({
    fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20,
    background: STATUS_COLORS[status]?.bg || 'rgba(255,255,255,0.1)',
    color: STATUS_COLORS[status]?.color || '#aaa',
  }),
  searchWrap: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0 12px', height: 40,
  },
  searchInput: { background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.85rem', flex: 1 },
  select: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', borderRadius: 10, padding: '0 10px', height: 40, fontSize: '0.8rem', outline: 'none'
  },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 },
  approveBtn: {
    flex: 1, background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)', color: '#4caf50',
    borderRadius: 8, padding: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem'
  },
  rejectBtn: {
    flex: 1, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444',
    borderRadius: 8, padding: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem'
  },
  empty: { color: '#555', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0', margin: 0 },
  loading: { display: 'flex', justifyContent: 'center', paddingTop: 80 },
  bottomNav: {
    position: 'absolute', bottom: 0, width: '100%', 
    background: '#111', borderTop: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', justifyContent: 'space-around', padding: '10px 0', zIndex: 10
  },
  navBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', 
    background: 'transparent', border: 'none', color: '#666', cursor: 'pointer',
    transition: 'color 0.2s'
  },
  navBtnActive: { color: '#b400ff' } // Màu tím đặc trưng cho Admin
};

export default AdminDashboard;