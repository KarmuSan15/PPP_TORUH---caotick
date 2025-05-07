import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './h1.css'; // Estilos específicos para h1
import './global.css'; // Estilos globales
import './Login.css'; // Estilos específicos para la pantalla de login
import Menu from './Menu'; // Componente de menú

// Definición de la interfaz User, que representa los datos del usuario
interface User {
  email: string;
  id: string;
}

const HomeScreen: React.FC = () => {
  // Estado para controlar si estamos cargando los datos del usuario
  const [loading, setLoading] = useState<boolean>(true);
  // Estado para almacenar la información del usuario logueado
  const [user, setUser] = useState<User | null>(null);

  // useEffect para obtener el usuario de Supabase al cargar el componente
  useEffect(() => {
    // Función para obtener el usuario logueado de Supabase
    const fetchUser = async () => {
      const { data: { user: loggedUser } } = await supabase.auth.getUser(); // Obtener el usuario
      if (loggedUser) {
        // Si el usuario está logueado, guardamos sus datos en el estado
        setUser({ email: loggedUser.email ?? '', id: loggedUser.id });
      }
      setLoading(false); // Termina la carga una vez que tenemos los datos o no hay usuario
    };

    fetchUser(); // Ejecutar la función al cargar el componente
  }, []); // Dependencia vacía para que solo se ejecute al montar el componente

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Cerrar sesión en Supabase
    setUser(null); // Limpiar el estado de usuario
  };

  // Si el componente está cargando, mostramos un indicador de carga
  if (loading) {
    return <div>Loading...</div>;
  }

  // Si no hay usuario logueado, mostramos un mensaje de inicio de sesión
  if (!user) {
    return (
      <div>
        <Menu /> {/* Mostrar el componente de menú */}
        <div style={{ paddingTop: '80px', textAlign: 'center' }}>
          <h1>No estás logueado. Por favor, inicia sesión.</h1>
        </div>
      </div>
    );
  }

  // Usamos la parte del email antes del '@' como nombre de usuario
  const userName = user.email.split('@')[0]; // Aquí se extrae el nombre del email

  return (
    <div>
      <Menu /> {/* Mostrar el componente de menú */}
      <div style={{ paddingTop: '80px', textAlign: 'center' }}>
        <h1>Bienvenido, {userName}</h1> {/* Mostrar mensaje de bienvenida con el nombre del usuario */}
      </div>
    </div>
  );
};

export default HomeScreen; // Exportar el componente para usarlo en otras partes de la app
