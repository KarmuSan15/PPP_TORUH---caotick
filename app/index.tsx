import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import HomeScreen from './HomeScreen'; // Componente que muestra la pantalla de inicio si el usuario está logueado
import LoginScreen from './LoginScreen'; // Componente que muestra la pantalla de login si no hay usuario
import Juego from './juego';  // Importamos el componente Juego
import './h1.css';  // Estilos específicos para h1
import './global.css'; // Estilos globales
import './Login.css'; // Estilos específicos para la pantalla de login

// Definición de la interfaz User, que representa los datos del usuario
interface User {
  email: string;
  id: string;
}

const Index: React.FC = () => {
  // Estado para almacenar la información del usuario logueado
  const [user, setUser] = useState<User | null>(null);

  // useEffect para gestionar la sesión y el estado de autenticación
  useEffect(() => {
    // Función para obtener la sesión del usuario desde Supabase
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession(); // Obtener la sesión del usuario
      if (session?.user) {
        // Si hay sesión activa, guardamos los datos del usuario en el estado
        setUser({
          email: session.user.email ?? '',
          id: session.user.id
        });
      }
    };

    fetchSession(); // Ejecutar la función para obtener la sesión

    // Suscripción a los cambios en el estado de autenticación de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Si hay un usuario en la sesión, lo guardamos en el estado
      setUser(session?.user ? {
        email: session.user.email ?? '',
        id: session.user.id
      } : null);
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // Dependencia vacía, solo se ejecuta una vez al montar el componente

  return (
    <div className="content">
      {/* Si el usuario está logueado, mostramos la pantalla de inicio */}
      {user ? (
        <HomeScreen />  // No se pasa más el user como prop, porque Juego lo obtiene directamente de supabase
      ) : (
        // Si no hay usuario, mostramos la pantalla de login
        <LoginScreen onAuthChange={setUser} />
      )}
    </div>
  );
};

export default Index;
