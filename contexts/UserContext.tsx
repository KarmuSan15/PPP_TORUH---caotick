import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase'; // Importación de Supabase

// Definición de la interfaz para un usuario
interface User {
  email: string; // Correo electrónico del usuario
  id: string;    // ID único del usuario
}

// Definición del tipo de datos que manejará el contexto
interface UserContextType {
  user: User | null;          // Información del usuario autenticado
  loading: boolean;           // Estado de carga
  refreshUser: () => void;    // Función para refrescar los datos del usuario
}

// Creación del contexto con valores por defecto
const UserContext = createContext<UserContextType>({
  user: null,          // Valor inicial del usuario: null (no autenticado)
  loading: true,       // Valor inicial de carga: true (está cargando datos)
  refreshUser: () => {}, // Función vacía por defecto
});

// Custom Hook para usar el contexto en otros componentes
export const useUser = () => useContext(UserContext);

// Componente Provider que envuelve la aplicación
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para guardar al usuario autenticado
  const [user, setUser] = useState<User | null>(null);

  // Estado para controlar si está cargando
  const [loading, setLoading] = useState(true);

  // Función para obtener los datos del usuario
  const fetchUser = async () => {
    // Consulta a Supabase para obtener el usuario autenticado
    const { data: { user: supaUser } } = await supabase.auth.getUser();
    
    // Si hay un usuario autenticado, actualizamos el estado
    if (supaUser) {
      setUser({ email: supaUser.email!, id: supaUser.id });
    } else {
      setUser(null); // Si no hay usuario, se establece como null
    }
    
    // Finaliza el estado de carga
    setLoading(false);
  };

  // useEffect para ejecutar la función al cargar el componente
  useEffect(() => {
    fetchUser(); // Obtener el usuario al cargar el componente

    // Escuchar cambios en la autenticación (login, logout, refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Si hay sesión, actualizar el usuario en el estado
        setUser({ email: session.user.email!, id: session.user.id });
      } else {
        // Si no hay sesión, limpiar el estado
        setUser(null);
      }
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => listener?.subscription.unsubscribe();
  }, []);

  // Proporcionar el contexto a los componentes hijos
  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};
