import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Importa la instancia de supabase para autenticar
import './Menu.css'; // Importa los estilos específicos para el menú

const Menu: React.FC = () => {
  // Estado para gestionar si el usuario está logueado o no
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Estado para almacenar el email y nombre del usuario
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Función que verifica si el usuario está logueado al cargar el componente
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser(); // Obtiene la información del usuario desde supabase
      if (user) {
        setIsLoggedIn(true); // Marca como logueado si hay un usuario
        setUserEmail(user.email ?? null); // Guarda el email del usuario, si existe

        // Intenta obtener el nombre de usuario desde user_metadata
        const userName = user.user_metadata?.username ?? null;
        setUserName(userName); // Si no tiene nombre, se quedará en null
      } else {
        // Si no hay usuario, se restablecen los estados
        setIsLoggedIn(false);
        setUserEmail(null);
        setUserName(null);
      }
    };

    fetchUser(); // Llama a la función fetchUser al cargar el componente

    // Establece un listener que detecta cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true); // Si hay un usuario en la sesión, lo marca como logueado
        setUserEmail(session.user.email ?? null); // Establece el email del usuario
        setUserName(session.user.user_metadata?.username ?? null); // Establece el nombre del usuario desde user_metadata
      } else {
        setIsLoggedIn(false); // Si no hay usuario, restablece los estados
        setUserEmail(null);
        setUserName(null);
      }
    });

    // Limpia el listener cuando el componente se desmonta
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // Se ejecuta solo una vez cuando el componente se monta

  // Función para redirigir al usuario a la pantalla de inicio
  const redirectToHome = () => {
    window.location.href = isLoggedIn ? '/HomeScreen' : '/login'; // Si está logueado, va a HomeScreen, si no, al login
  };

  // Función para redirigir al usuario al juego
  const redirectToJuego = () => {
    window.location.href = isLoggedIn ? '/juego' : '/login'; // Si está logueado, va a juego, si no, al login
  };

  // Función para redirigir al usuario a las puntuaciones
  const redirectToPuntuaciones = () => {
    window.location.href = isLoggedIn ? '/Scoreboard' : '/login'; // Si está logueado, va a la página de puntuaciones, si no, al login
  };

  // Función para redirigir al usuario al chat
  const redirectToChat = () => {
    window.location.href = isLoggedIn ? '/chat' : '/login'; // Si está logueado, va al chat, si no, al login
  };

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Cierra la sesión en supabase
    setIsLoggedIn(false); // Actualiza el estado de isLoggedIn
    setUserEmail(null); // Borra el email almacenado
    setUserName(null); // Borra el nombre almacenado
    alert('Has cerrado sesión'); // Muestra un mensaje de alerta
    window.location.href = '/'; // Redirige al login
  };

  return (
    <div>
      <div className="menu-header">
        <div className="menu-container">
          <div className="logo">Caotick</div> {/* Muestra el logo */}

          <div className="nav">
            {/* Botones de navegación */}
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

            {/* Si el usuario está logueado, se muestran los botones de usuario y cierre de sesión */}
            {isLoggedIn && (
              <div>
                {/* Si el usuario tiene un nombre, lo mostramos (aunque actualmente no se muestra el nombre) */}
                {userName ? (
                  <span></span> 
                ) : (
                  <span></span> 
                )}
                {/* Botón para cerrar sesión */}
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
