import React from 'react';
import { supabase } from '../lib/supabase';
import './h1.css';
import './global.css';
import './Login.css';
import Menu from './Menu';

interface User {
  email: string;
}

interface HomeScreenProps {
  user: User;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Puedes manejar el estado en el componente padre si lo deseas
  };

  // Extraer el nombre antes del @
  const username = user.email.split('@')[0];

  return (
    <div>
      <Menu />
      <div style={{ paddingTop: '80px', textAlign: 'center' }}>
        <h1>Bienvenido, {username}</h1>
      </div>
    </div>
  );
};

export default HomeScreen;
