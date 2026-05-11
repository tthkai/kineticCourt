import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

// Hook để sử dụng AuthContext ở các file khác
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Thông tin từ Firebase Auth
  const [userProfile, setUserProfile] = useState(null); // Hồ sơ chi tiết từ Firestore
  const [userRole, setUserRole] = useState(null); // Quyền hạn (admin, owner, player)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lắng nghe trạng thái đăng nhập của Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Nếu đã đăng nhập, thiết lập "đường ống" lắng nghe Real-time hồ sơ từ Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile(data);
            setUserRole(data.role);
          } else {
            // Trường hợp user đã auth nhưng chưa có hồ sơ (tài khoản cũ hoặc lỗi)
            setUserProfile(null);
            setUserRole('player');
          }
          setUser(currentUser);
          setLoading(false);
        }, (error) => {
          console.error("Lỗi lắng nghe hồ sơ:", error);
          setLoading(false);
        });

        // Dọn dẹp listener hồ sơ khi logout
        return () => unsubProfile();
      } else {
        // Nếu chưa đăng nhập hoặc đã logout
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Hàm Đăng nhập
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Hàm Đăng ký: Tạo user ở Auth và khởi tạo hồ sơ ở Firestore
  const register = async (email, password, selectedRole, fullName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Khởi tạo hồ sơ người dùng mới
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      name: fullName || email.split('@')[0],
      role: selectedRole,
      level: 1,
      xp: 0,
      maxXp: 1000,
      rank: "Tân binh",
      matches: 0,
      winRate: "0%",
      bio: "Chào mừng bạn đến với Kinetic Court!",
      avatar: `https://ui-avatars.com/api/?name=${fullName || email}&background=ccff00&color=000`,
      createdAt: serverTimestamp() // Dùng serverTimestamp để đồng bộ thời gian
    });

    return userCredential;
  };

  // Hàm Đăng xuất
  const logout = () => {
    return signOut(auth);
  };

  // Giá trị cung cấp cho toàn bộ App
  // Lưu ý: Mình export cả currentUser (tên cũ) và user (tên mới) để tránh lỗi file cũ
  const value = { 
    user, 
    currentUser: user, 
    userProfile, 
    userRole, 
    role: userRole, 
    loading, 
    login, 
    register, 
    logout 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}