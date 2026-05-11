import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  // 1. GIỮ NGUYÊN 100% STATE CỦA BẠN
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  // 2. GIỮ NGUYÊN 100% LOGIC XỬ LÝ (Không thay đổi tham số)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, role);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 3. GIAO DIỆN MỚI SIÊU MƯỢT (Không cần cài thêm thư viện ngoài)
  return (
    <div style={styles.root}>
      {/* Background Decor */}
      <div style={styles.glowOrb} />
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoIcon}>🏸</div>
          <h1 style={styles.logoText}>KINETIC COURT</h1>
          <p style={styles.subtitle}>The Ultimate Badminton Hub</p>
        </div>

        {/* Custom Tabs */}
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
          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}
          
          <input 
            type="email" 
            placeholder="Email của bạn" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            style={styles.input} 
          />
          
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            style={styles.input} 
          />

          {!isLogin && (
            <div style={styles.selectWrapper}>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                style={styles.select}
              >
                <option value="player">🏸 Người chơi (Player)</option>
                <option value="court_owner">🏟️ Chủ sân (Court Owner)</option>
                <option value="admin">⚙️ Quản trị viên (Admin)</option>
              </select>
            </div>
          )}

          <button type="submit" style={styles.submitBtn}>
            {isLogin ? 'VÀO SÂN NGAY' : 'TẠO TÀI KHOẢN'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// STYLES (Pure CSS-in-JS, an toàn tuyệt đối)
// ==========================================
const styles = {
  root: {
    backgroundColor: '#0a0a0a',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  glowOrb: {
    position: 'absolute',
    top: '-20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(204,255,0,0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(204, 255, 0, 0.2)',
    borderRadius: '20px',
    padding: '40px 30px',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logoIcon: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  logoText: {
    color: '#ccff00',
    fontSize: '1.8rem',
    fontWeight: '900',
    letterSpacing: '2px',
    margin: '0 0 5px 0',
    textShadow: '0 0 15px rgba(204, 255, 0, 0.3)',
  },
  subtitle: {
    color: '#888',
    fontSize: '0.85rem',
    margin: 0,
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '5px',
    marginBottom: '25px',
  },
  tab: {
    flex: 1,
    padding: '10px 0',
    textAlign: 'center',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  activeTab: {
    backgroundColor: '#ccff00',
    color: '#000',
    boxShadow: '0 4px 15px rgba(204, 255, 0, 0.2)',
  },
  inactiveTab: {
    backgroundColor: 'transparent',
    color: '#888',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    width: '100%',
    padding: '14px 15px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
  },
  selectWrapper: {
    position: 'relative',
  },
  select: {
    width: '100%',
    padding: '14px 15px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    appearance: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#ccff00',
    color: '#000',
    fontWeight: '900',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'transform 0.1s, boxShadow 0.3s',
    boxShadow: '0 5px 20px rgba(204, 255, 0, 0.2)',
  },
  errorBox: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    color: '#ff4444',
    padding: '10px 15px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    textAlign: 'center',
  }
};