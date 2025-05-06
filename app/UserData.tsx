import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Asegúrate de que la ruta es correcta

interface User {
  email: string;
  id: string;
  username: string; // Suponiendo que tienes un campo "username"
}

interface UserDataProps {
  onUserDataFetched: (user: User | null) => void;
}

const UserData: React.FC<UserDataProps> = ({ onUserDataFetched }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('users') // Suponiendo que tienes una tabla 'users'
          .select('email, id, username') // Los campos que deseas consultar
          .single(); // Obtener un solo registro

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          onUserDataFetched(data); // Pasa la información al componente principal
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [onUserDataFetched]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return null; // Este componente no renderiza nada directamente
};

export default UserData;
