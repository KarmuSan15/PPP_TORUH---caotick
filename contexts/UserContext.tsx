import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  email: string;
  id: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const { data: { user: supaUser } } = await supabase.auth.getUser();
    if (supaUser) {
      setUser({ email: supaUser.email!, id: supaUser.id });
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email!, id: session.user.id });
      } else {
        setUser(null);
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};
