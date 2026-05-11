import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const auth = useAuth();
  // Khắc phục tên biến
  const activeUser = auth.currentUser || auth.user; 

  const [courts, setCourts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // Chỉ tải dữ liệu khi đã đăng nhập
    if (!activeUser) return; 

    setLoadingData(true);

    const unsubCourts = onSnapshot(collection(db, 'courts'), (snapshot) => {
      const courtsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(court => court.status === 'approved')
        .filter(court => court.lat !== undefined && court.lng !== undefined)
        .map(court => ({
          ...court,
          image: court.image || "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=500&auto=format&fit=crop",
          tags: court.tags || [],
          distance: court.distance || "0 km"
        }));
      setCourts(courtsData);
    });

    const unsubMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const matchesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(matchesData);
      setLoadingData(false);
    });

    return () => { 
      unsubCourts(); 
      unsubMatches(); 
    };
  }, [activeUser]);

  return (
    <DataContext.Provider value={{ courts, matches, loadingData }}>
      {children}
    </DataContext.Provider>
  );
};