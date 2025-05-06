import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './h1.css';
import './global.css';
import './Login.css';
import Menu from './Menu';

interface User {
  email: string;
  id: string;
}

const HomeScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Obtener el usuario de Supabase
    const fetchUser = async () => {
      const { data: { user: loggedUser } } = await supabase.auth.getUser();
      if (loggedUser) {
        setUser({ email: loggedUser.email ?? '', id: loggedUser.id });
      }
      setLoading(false); // Termina el loading independientemente del resultado
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); // Limpiamos el usuario en el estado
  };

  if (loading) {
    return <div>Loading...</div>; // Muestra un indicador de carga mientras obtenemos los datos del usuario
  }

  if (!user) {
    return (
      <div>
        <Menu />
        <div style={{ paddingTop: '80px', textAlign: 'center' }}>
          <h1>No estás logueado. Por favor, inicia sesión.</h1>
        </div>
      </div>
    );
  }

  // Usamos el nombre de usuario o el email como fallback si no hay username
  const userName = user.email.split('@')[0]; // Cambia esto si más adelante tienes un campo de nombre.

  return (
    <div>
      <Menu />
      <div style={{ paddingTop: '80px', textAlign: 'center' }}>
        <h1>Bienvenido, {userName}</h1>
      </div>
    </div>
  );
};

export default HomeScreen;
