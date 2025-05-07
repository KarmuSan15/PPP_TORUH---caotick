import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Menu.css';

const Menu: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email ?? null);

        // Intentamos obtener el nombre directamente de user_metadata
        const userName = user.user_metadata?.username ?? null;
        setUserName(userName); // Si no hay nombre, se queda null
      } else {
        setIsLoggedIn(false);
        setUserEmail(null);
        setUserName(null);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email ?? null);
        setUserName(session.user.user_metadata?.username ?? null); // Usamos user_metadata
      } else {
        setIsLoggedIn(false);
        setUserEmail(null);
        setUserName(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const redirectToHome = () => {
    window.location.href = isLoggedIn ? '/HomeScreen' : '/login';
  };

  const redirectToJuego = () => {
    window.location.href = isLoggedIn ? '/juego' : '/login';
  };

  const redirectToPuntuaciones = () => {
    window.location.href = isLoggedIn ? '/Scoreboard' : '/login';
  };

  const redirectToChat = () => {
    window.location.href = isLoggedIn ? '/chat' : '/login';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserEmail(null);
    setUserName(null);
    alert('Has cerrado sesión');
    window.location.href = '/'; // Redirige al login
  };

  return (
    <div>
      <div className="menu-header">
        <div className="menu-container">
          <div className="logo">Caotick</div>

          <div className="nav">
            <button onClick={redirectToHome} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem' }}>
              Inicio
            </button>
            <button onClick={redirectToJuego} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem' }}>
              Juego
            </button>
            <button onClick={redirectToPuntuaciones} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem' }}>
              Puntuaciones
            </button>
            <button onClick={redirectToChat} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem' }}>
              Chat
            </button>

            {isLoggedIn && (
              <div>
                {userName ? (
                  <span></span>
                ) : (
                  <span></span> // Si no hay nombre, mostramos el email
                )}
                <button onClick={handleLogout} className="logout-btn">
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
