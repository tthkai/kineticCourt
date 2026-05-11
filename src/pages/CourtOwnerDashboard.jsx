// src/pages/CourtOwnerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
  Plus, LogOut, Clock, MapPin, DollarSign, Calendar,
  Star, Edit3, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Bell, Loader2
} from 'lucide-react';

const TABS = ['Sân của tôi', 'Booking', 'Doanh thu'];

const CourtOwnerDashboard = () => {
  const { logout, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Sân của tôi');
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourt, setShowAddCourt] = useState(false);

  const displayName = currentUser?.email?.split('@')[0] || 'Chủ sân';

  // LOGIC REAL-TIME TỐI ƯU
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    const qCourts = query(collection(db, 'courts'), where('ownerId', '==', currentUser.uid));
    const unsubCourts = onSnapshot(qCourts, (snap) => {
      const ownedCourts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCourts(ownedCourts);

      if (ownedCourts.length > 0) {
        const courtIds = ownedCourts.map(c => c.id);
        const qBookings = query(collection(db, 'bookings'), where('courtId', 'in', courtIds));
        const unsubBookings = onSnapshot(qBookings, (bSnap) => {
          setBookings(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
        return () => unsubBookings();
      } else {
        setLoading(false);
      }
    });

    return () => unsubCourts();
  }, [currentUser]);

  const handleAddCourt = async (courtData) => {
    const randomLat = 10.7761 + (Math.random() * 0.05 - 0.025);
    const randomLng = 106.6713 + (Math.random() * 0.05 - 0.025);
    const newCourt = {
      ...courtData,
      ownerId: currentUser.uid,
      ownerName: displayName,
      status: 'pending',
      rating: 5.0,
      createdAt: serverTimestamp(),
      lat: randomLat,
      lng: randomLng,
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=500&auto=format&fit=crop", 
      distance: "Mới tạo",
    };
    try {
      await addDoc(collection(db, 'courts'), newCourt);
      setShowAddCourt(false);
    } catch (e) { console.error(e); }
  };

  const toggleCourtStatus = async (courtId, currentActive) => {
    try {
      await updateDoc(doc(db, 'courts', courtId), { active: !currentActive });
    } catch (e) { console.error(e); }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div style={S.root}>
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.ownerBadge}>🏟️ CHỦ SÂN</div>
          <h2 style={S.ownerName}>{displayName}</h2>
        </div>
        <div style={S.headerRight}>
          <div style={S.statusPill}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} />
            Đã xác minh
          </div>
          <button style={S.logoutBtn} onClick={logout}><LogOut size={16} /></button>
        </div>
      </div>

      <div style={S.statsRow}>
        <QuickStat icon="🏟️" label="Sân quản lý" value={courts.length} />
        <QuickStat icon="📅" label="Đã xác nhận" value={confirmedBookings} color="#c3ff00" />
        <QuickStat icon="💰" label="Doanh thu" value={`${(totalRevenue / 1000).toFixed(0)}k`} color="#00d4ff" />
      </div>

      <div style={S.tabRow}>
        {TABS.map(t => (
          <button key={t} style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      <div style={S.content}>
        {loading ? (
          <div style={S.center}>
            <Loader2 size={32} color="#00d4ff" className="animate-spin" />
            <p style={{color: '#888', marginTop: 10}}>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {activeTab === 'Sân của tôi' && <CourtsTab courts={courts} onToggle={toggleCourtStatus} onAddCourt={() => setShowAddCourt(true)} />}
            {activeTab === 'Booking' && <BookingTab bookings={bookings} courts={courts} />}
            {activeTab === 'Doanh thu' && <RevenueTab bookings={bookings} />}
          </>
        )}
      </div>

      {showAddCourt && <AddCourtModal onClose={() => setShowAddCourt(false)} onSubmit={handleAddCourt} />}
    </div>
  );
};

// CÁC COMPONENT CON (GIỮ NGUYÊN 100% GIAO DIỆN)
const CourtsTab = ({ courts, onToggle, onAddCourt }) => (
  <div>
    <button style={S.addBtn} onClick={onAddCourt}><Plus size={16} /> Đăng ký sân mới</button>
    {courts.length === 0 ? (
      <div style={S.emptyState}><p style={{ fontSize: '2rem' }}>🏟️</p><p>Bạn chưa có sân nào</p></div>
    ) : (
      courts.map(court => (
        <div key={court.id} style={S.courtCard}>
          <div style={S.courtTop}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{court.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#888', fontSize: '0.75rem' }}>
                <MapPin size={12} /><span>{court.location}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <span style={S.statusChip(court.status)}>{STATUS_LABEL[court.status] || 'Chờ duyệt'}</span>
              <button style={S.toggleBtn} onClick={() => onToggle(court.id, court.active)}>
                {court.active ? <><ToggleRight size={20} color="#c3ff00" /><span style={{ color: '#c3ff00', fontSize: '0.75rem' }}>Đang mở</span></> : <><ToggleLeft size={20} color="#888" /><span style={{ color: '#888', fontSize: '0.75rem' }}>Đóng cửa</span></>}
              </button>
            </div>
          </div>
          <div style={S.courtMeta}>
            <MetaItem icon={<DollarSign size={12} />} text={court.price || 'Chưa cập nhật'} />
            <MetaItem icon={<Star size={12} />} text={`${court.rating || 0} ★`} />
            <MetaItem icon={<Clock size={12} />} text={court.hours || '6:00 - 22:00'} />
          </div>
        </div>
      ))
    )}
  </div>
);

const BookingTab = ({ bookings, courts }) => (
  <div>
    {bookings.length === 0 ? <div style={S.emptyState}><p style={{fontSize: '2rem'}}>📅</p><p>Chưa có booking nào</p></div> : (
      bookings.map(b => {
        const court = courts.find(c => c.id === b.courtId);
        return (
          <div key={b.id} style={S.bookingCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div><p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{b.playerName || 'Khách hàng'}</p><p style={{ margin: 0, color: '#888', fontSize: '0.75rem' }}>{court?.name || 'Sân đã bị xóa'}</p></div>
              <span style={S.statusChip(b.status || 'pending')}>{STATUS_LABEL[b.status] || 'Chờ xác nhận'}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: '#aaa' }}><span>📅 {b.date}</span><span>🕐 {b.time}</span><span style={{ color: '#c3ff00', fontWeight: 700 }}>💰 {b.amount?.toLocaleString()}đ</span></div>
          </div>
        );
      })
    )}
  </div>
);

const RevenueTab = ({ bookings }) => {
  const total = bookings.reduce((s, b) => s + (b.amount || 0), 0);
  const thisMonth = bookings.filter(b => {
    if (!b.createdAt?.seconds) return false;
    const d = new Date(b.createdAt.seconds * 1000);
    return d.getMonth() === new Date().getMonth();
  }).reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ ...S.courtCard, textAlign: 'center' }}><p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 8px' }}>Tổng doanh thu</p><p style={{ color: '#c3ff00', fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>{(total / 1000).toFixed(0)}k</p></div>
        <div style={{ ...S.courtCard, textAlign: 'center' }}><p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 8px' }}>Tháng này</p><p style={{ color: '#00d4ff', fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>{(thisMonth / 1000).toFixed(0)}k</p></div>
      </div>
      <div style={S.courtCard}>
        <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: 16 }}>Lịch sử giao dịch</p>
        {bookings.length === 0 ? <p style={{ color: '#555', textAlign: 'center' }}>Chưa có giao dịch</p> : 
          bookings.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 10).map(b => (
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}><span>{b.playerName || 'Khách'} — {b.date}</span><span style={{ color: '#c3ff00', fontWeight: 700 }}>+{b.amount?.toLocaleString()}đ</span></div>
          ))
        }
      </div>
    </div>
  );
};

const AddCourtModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: '', location: '', price: '', hours: '06:00 - 22:00', tags: '', description: '', district: '' });
  const handleSubmit = (e) => { e.preventDefault(); if (!form.name || !form.location) return; onSubmit({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), active: true }); };
  return (
    <div style={S.modalOverlay}><div style={S.modal}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h2 style={{ margin: 0, fontSize: '1.1rem' }}>Đăng ký sân mới</h2><button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.4rem' }}>✕</button></div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Tên sân *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="VD: Sân Cầu Lông Kinetic" />
        <Field label="Địa chỉ *" value={form.location} onChange={v => setForm({ ...form, location: v })} placeholder="Địa chỉ chi tiết..." />
        <Field label="Quận/Huyện" value={form.district} onChange={v => setForm({ ...form, district: v })} placeholder="VD: Quận 10" />
        <Field label="Giá (VNĐ/giờ)" value={form.price} onChange={v => setForm({ ...form, price: v })} placeholder="VD: 80k - 120k" />
        <Field label="Giờ hoạt động" value={form.hours} onChange={v => setForm({ ...form, hours: v })} placeholder="06:00 - 22:00" />
        <Field label="Tiện ích (cách nhau bằng dấu phẩy)" value={form.tags} onChange={v => setForm({ ...form, tags: v })} placeholder="Thảm PVC, Căng tin..." />
        <button type="submit" style={S.submitBtn}>Tạo Sân Ngay</button>
      </form>
    </div></div>
  );
};

// UI UTILS & STYLES (GIỮ NGUYÊN)
const QuickStat = ({ icon, label, value, color = 'white' }) => (<div style={S.statBox}><span style={{ fontSize: '1.2rem' }}>{icon}</span><div style={{ color, fontWeight: 800, fontSize: '1.2rem' }}>{value}</div><div style={{ color: '#666', fontSize: '0.65rem' }}>{label}</div></div>);
const MetaItem = ({ icon, text }) => (<div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#888', fontSize: '0.75rem' }}>{icon}<span>{text}</span></div>);
const Field = ({ label, value, onChange, placeholder }) => (<div><label style={S.fieldLabel}>{label}</label><input required style={S.fieldInput} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></div>);
const STATUS_LABEL = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối', confirmed: 'Xác nhận', cancelled: 'Hủy' };
const STATUS_CHIP_COLORS = { pending: { bg: 'rgba(255,149,0,0.15)', color: '#ff9500' }, approved: { bg: 'rgba(76,175,80,0.15)', color: '#4caf50' }, rejected: { bg: 'rgba(255,68,68,0.15)', color: '#ff4444' }, confirmed: { bg: 'rgba(195,255,0,0.15)', color: '#c3ff00' } };
const S = {
  root: { maxWidth: '480px', margin: '0 auto', height: '100dvh', background: '#0a0a0a', color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#111', flexShrink: 0 },
  ownerBadge: { fontSize: '0.65rem', fontWeight: 700, letterSpacing: 2, color: '#00d4ff', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '3px 10px', display: 'inline-block', marginBottom: 4 },
  ownerName: { margin: 0, fontSize: '1rem', fontWeight: 700 },
  statusPill: { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#aaa', background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '4px 10px' },
  logoutBtn: { background: 'rgba(255,68,68,0.1)', border: 'none', color: '#ff4444', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' },
  statsRow: { display: 'flex', padding: '12px 16px', gap: 12, background: '#0f0f0f', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 },
  statBox: { flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' },
  tabRow: { display: 'flex', padding: '12px 16px', gap: 8, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.07)' },
  tab: { flex: 1, padding: '8px', border: 'none', background: 'transparent', color: '#888', fontSize: '0.85rem', fontWeight: 600, borderRadius: 8, cursor: 'pointer' },
  tabActive: { background: 'rgba(0,212,255,0.1)', color: '#00d4ff' },
  content: { flex: 1, overflowY: 'auto', padding: 16 },
  addBtn: { width: '100%', padding: '12px', background: 'rgba(0,212,255,0.1)', border: '1px dashed rgba(0,212,255,0.3)', color: '#00d4ff', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, fontSize: '0.9rem' },
  courtCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 12 },
  courtTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  courtMeta: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  toggleBtn: { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' },
  statusChip: (status) => ({ fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: STATUS_CHIP_COLORS[status]?.bg || 'rgba(255,255,255,0.1)', color: STATUS_CHIP_COLORS[status]?.color || '#aaa' }),
  tag: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2px 8px', fontSize: '0.65rem', color: '#aaa' },
  bookingCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, marginBottom: 10 },
  emptyState: { textAlign: 'center', padding: '40px 0', color: '#555' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  modalOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  modal: { width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90vh', overflowY: 'auto' },
  fieldLabel: { display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: 6 },
  fieldInput: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  submitBtn: { background: '#00d4ff', color: 'black', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', marginTop: 4 },
};

export default CourtOwnerDashboard;