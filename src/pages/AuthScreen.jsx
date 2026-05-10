import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');
  const [error, setError] = useState('');
  const { login, register } = useAuth();

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

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <h1 style={{ color: '#ccff00', fontSize: '2rem', marginBottom: '20px', fontWeight: 'bold' }}>KINETIC COURT</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '12px', width: '300px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</h2>
        
        {error && <p style={{ color: '#ff4444', fontSize: '12px', marginBottom: '10px' }}>{error}</p>}
        
        <input 
          type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: 'none', backgroundColor: '#2a2a2a', color: 'white' }} 
        />
        <input 
          type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: 'none', backgroundColor: '#2a2a2a', color: 'white' }} 
        />

        {!isLogin && (
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', backgroundColor: '#2a2a2a', color: 'white', border: 'none' }}>
            <option value="player">Người chơi (Player)</option>
            <option value="court_owner">Chủ sân (Court Owner)</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        )}

        <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#ccff00', color: '#000', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}>
          {isLogin ? 'VÀO SÂN' : 'TẠO TÀI KHOẢN'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', cursor: 'pointer', color: '#888' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
        </p>
      </form>
    </div>
  );
}