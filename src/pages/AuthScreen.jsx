import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
// Thêm icon để giao diện chuyên nghiệp hơn
import { User, Mail, Lock, Shield, ArrowRight } from 'lucide-react';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // State mới cho Họ tên
  const [role, setRole] = useState('player');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // 1. Đăng ký tài khoản trên Authentication
        const userCredential = await register(email, password, role);
        const user = userCredential.user;

        // 2. KHỞI TẠO HỒ SƠ NGƯỜI DÙNG MỚI TRÊN FIRESTORE
        // Dữ liệu này sẽ thay thế "Nguyễn Văn A" cho các tài khoản mới
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: email,
          name: fullName || email.split('@')[0], 
          role: role,
          level: 1,
          xp: 0,
          maxXp: 1000,
          rank: "Tân binh",
          matches: 0,
          winRate: "0%",
          bio: "Chào mừng bạn đến với Kinetic Court!",
          style: "Chưa cập nhật",
          gear: "Chưa cập nhật",
          avatar: `https://ui-avatars.com/api/?name=${fullName || email}&background=ccff00&color=000`,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.glowOrb} />
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoIcon}>🏸</div>
          <h1 style={styles.logoText}>KINETIC COURT</h1>
          <p style={styles.subtitle}>Cộng đồng cầu lông thế hệ mới</p>
        </div>

        <div style={styles.tabContainer}>
          <div 
            style={{ ...styles.tab, ...(isLogin ? styles.activeTab : styles.inactiveTab) }}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Đăng Nhập
          </div>
          <div 
            style={{ ...styles.tab, ...(!isLogin ? styles.activeTab : styles.inactiveTab) }}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Đăng Ký
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}
          
          {/* Ô nhập tên chỉ hiện khi Đăng ký */}
          {!isLogin && (
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.icon} />
              <input 
                type="text" 
                placeholder="Họ và tên của bạn" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required
                style={styles.input} 
              />
            </div>
          )}

          <div style={styles.inputWrapper}>
            <Mail size={18} style={styles.icon} />
            <input 
              type="email" 
              placeholder="Email của bạn" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              style={styles.input} 
            />
          </div>
          
          <div style={styles.inputWrapper}>
            <Lock size={18} style={styles.icon} />
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={styles.input} 
            />
          </div>

          {!isLogin && (
            <div style={styles.selectWrapper}>
              <Shield size={18} style={styles.icon} />
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                style={styles.select}
              >
                <option value="player">Người chơi (Player)</option>
                <option value="court_owner">Chủ sân (Court Owner)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
            </div>
          )}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'ĐANG XỬ LÝ...' : (isLogin ? 'VÀO SÂN NGAY' : 'TẠO TÀI KHOẢN')}
            {!loading && <ArrowRight size={20} style={{marginLeft: 10}} />}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  root: {
    backgroundColor: '#0a0a0a',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  glowOrb: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(204,255,0,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '40px 30px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  header: { textAlign: 'center', marginBottom: '35px' },
  logoIcon: { fontSize: '48px', marginBottom: '10px' },
  logoText: {
    color: '#ccff00', fontSize: '2rem', fontWeight: '900',
    letterSpacing: '3px', margin: '0 0 5px 0',
  },
  subtitle: { color: '#666', fontSize: '0.9rem', margin: 0 },
  tabContainer: {
    display: 'flex', backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '14px', padding: '6px', marginBottom: '30px',
  },
  tab: {
    flex: 1, padding: '12px 0', textAlign: 'center', borderRadius: '10px',
    fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer',
    transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  activeTab: { backgroundColor: '#ccff00', color: '#000' },
  inactiveTab: { color: '#888' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: '15px', color: '#555' },
  input: {
    width: '100%', padding: '14px 15px 14px 45px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
  },
  selectWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  select: {
    width: '100%', padding: '14px 15px 14px 45px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', appearance: 'none', boxSizing: 'border-box'
  },
  submitBtn: {
    width: '100%', padding: '16px', backgroundColor: '#ccff00',
    color: '#000', fontWeight: '900', fontSize: '1.1rem', border: 'none',
    borderRadius: '12px', cursor: 'pointer', marginTop: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444',
    padding: '12px', borderRadius: '10px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(255, 68, 68, 0.2)'
  }
};