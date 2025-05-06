import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Importa la configuración de Supabase
import HomeScreen from './HomeScreen'; // Importa el componente de la pantalla de inicio
import LoginScreen from './LoginScreen'; // Importa el componente de login
import Menu from './Menu'; 
import './h1.css';
import './global.css'; 
import './Login.css' // Importa los estilos globales

interface User {
  email: string;
}

const Index: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Verifica la sesión cuando el componente se carga
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ email: session.user.email ?? '' });
      }
    };

    fetchSession();

    // Escucha los cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ? { email: session.user.email ?? '' } : null);
    });

    // Limpia el listener cuando el componente se desmonta
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="App">
      {user ? (
        // Si el usuario está logueado, muestra el HomeScreen
        <HomeScreen user={user} />
      ) : (
        // Si el usuario no está logueado, muestra el LoginScreen
        <LoginScreen onAuthChange={setUser} />
      )}
    </div>
  );
};

export default Index;
