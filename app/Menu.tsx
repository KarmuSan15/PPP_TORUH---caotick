import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; 
import './Menu.css';

const Menu: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false); 
    alert("Has cerrado sesión");
    
    // Recargamos la página para simular la redirección
    window.location.reload(); // Recarga la página actual
  };

  const redirectToHome  = () => {
    window.location.href = '/HomeScreen'; // Redirige a la página HomeScreen
  };

  const redirectToJuego = () => {
    window.location.href = '/juego'; // Redirige a la página de juego
  };

  const redirectToPuntuaciones = () => {
    window.location.href = '/puntuaciones'; // Redirige a la página de puntuaciones
  };

  const redirectToChat = () => {
    window.location.href = '/chat'; // Redirige a la página de chat
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
              <button onClick={handleLogout} className="logout-btn">
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
