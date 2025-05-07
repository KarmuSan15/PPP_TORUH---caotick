import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Importación de la instancia de Supabase

// Definición de la interfaz para un usuario
interface User {
  email: string;   // Correo electrónico del usuario
  id: string;      // ID único del usuario
  username: string; // Nombre de usuario
}

// Definición de las propiedades que espera recibir el componente
interface UserDataProps {
  onUserDataFetched: (user: User | null) => void; // Función de callback para enviar los datos al componente padre
}

const UserData: React.FC<UserDataProps> = ({ onUserDataFetched }) => {
  // Estado para controlar la carga de datos
  const [loading, setLoading] = useState<boolean>(true);

  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);

  // useEffect que se ejecuta al montar el componente
  useEffect(() => {
    // Función asíncrona para obtener los datos del usuario
    const fetchUserData = async () => {
      try {
        // Realiza una consulta a la tabla 'users' para obtener los campos especificados
        const { data, error } = await supabase
          .from('users') // Nombre de la tabla
          .select('email, id, username') // Campos que se quieren obtener
          .single(); // Espera un solo registro

        // Si hay un error, lanza una excepción
        if (error) {
          throw new Error(error.message);
        }

        // Si los datos se obtienen correctamente, se envían al componente principal
        if (data) {
          onUserDataFetched(data);
        }
      } catch (err: any) {
        // Si hay un error, se guarda el mensaje en el estado
        setError(err.message);
      } finally {
        // Al finalizar, se establece el estado de carga a falso
        setLoading(false);
      }
    };

    // Llamada a la función para obtener los datos
    fetchUserData();
  }, [onUserDataFetched]); // La función de callback se incluye como dependencia

  // Si los datos están cargando, muestra un mensaje de carga
  if (loading) return <div>Loading...</div>;

  // Si ocurre un error, muestra el mensaje de error
  if (error) return <div>Error: {error}</div>;

  // El componente no renderiza nada directamente, ya que su propósito es solo obtener datos
  return null;
};

export default UserData;
