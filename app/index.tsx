import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import Juego from './juego';  // Importamos Juego
import './h1.css';
import './global.css';
import './Login.css';

interface User {
  email: string;
  id: string;
}

const Index: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          email: session.user.email ?? '',
          id: session.user.id
        });
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ? {
        email: session.user.email ?? '',
        id: session.user.id
      } : null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="content">
      {user ? (
        <HomeScreen />  // No se pasa más el user como prop, porque Juego lo obtiene directamente de supabase
      ) : (
        <LoginScreen onAuthChange={setUser} />
      )}
    </div>
  );
};

export default Index;
