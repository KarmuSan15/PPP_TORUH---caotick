import React, { useState, useEffect } from 'react'; // Importación de React y hooks
import { supabase } from '../lib/supabase'; // Importación de la instancia de Supabase
import Menu from './Menu'; // Importación del componente Menu
import './Scoreboard.css'; // Importación de los estilos para el Scoreboard

const Scoreboard: React.FC = () => {
  // Estado para almacenar las puntuaciones obtenidas de Supabase
  const [scores, setScores] = useState<any[]>([]);

  // Estado para controlar el estado de carga (loading)
  const [loading, setLoading] = useState(true);

  // useEffect para verificar la autenticación al cargar el componente
  useEffect(() => {
    const checkUser = async () => {
      // Obtiene el usuario autenticado de Supabase
      const { data: { user } } = await supabase.auth.getUser();

      // Si no hay un usuario autenticado, redirige al login
      if (!user) {
        window.location.href = '/login';
      }
    };

    checkUser(); // Llamada a la función para comprobar el usuario

    // Suscribirse a los cambios de autenticación de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Si no hay sesión, redirige al login
      if (!session?.user) {
        window.location.href = '/login';
      } else {
        // Si hay sesión, recarga las puntuaciones
        fetchScores();
      }
    });

    // Al desmontar el componente, se limpia la suscripción
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Función para cargar las puntuaciones de la base de datos
  const fetchScores = async () => {
    setLoading(true); // Establece el estado de carga a verdadero

    try {
      // Realiza una consulta a la tabla 'scores' para obtener los datos
      const { data, error } = await supabase
        .from('scores')
        .select('email, games_won, games_lost')
        .order('games_won', { ascending: false }); // Ordena por partidas ganadas en orden descendente

      if (error) {
        // Muestra un error en la consola si ocurre algún problema
        console.error('Error obteniendo las puntuaciones:', error);
      } else {
        // Almacena las puntuaciones en el estado
        setScores(data || []);
      }
    } catch (err) {
      // Manejo de errores en caso de fallo en la petición
      console.error('Error al recuperar puntuaciones:', err);
    }

    setLoading(false); // Finaliza el estado de carga
  };

  // Función para obtener el nombre de usuario a partir del correo electrónico
  const getUsernameFromEmail = (email: string) => {
    // Divide el correo por el símbolo '@' y devuelve la primera parte (el nombre de usuario)
    const username = email.split('@')[0];
    return username || 'Usuario desconocido';
  };

  // useEffect para cargar las puntuaciones al montar el componente por primera vez
  useEffect(() => {
    fetchScores(); // Llama a la función para cargar las puntuaciones
  }, []);

  return (
    <div className="scoreboard-container">
      {/* Renderiza el menú de navegación */}
      <Menu />

      <div className="scoreboard-content">
        
        {/* Encabezado fijo y centrado */}
        <div className="scoreboard-header">
          <h2>🏆 Puntuaciones 🏆</h2>
        </div>

        {/* Muestra un mensaje de carga mientras se obtienen las puntuaciones */}
        {loading ? (
          <p>Cargando puntuaciones...</p>
        ) : scores.length > 0 ? (
          // Si hay puntuaciones, las muestra en una lista
          <ul className="scoreboard-list">
            {scores.map((score, index) => {
              // Obtiene el nombre de usuario a partir del correo
              const username = getUsernameFromEmail(score.email);

              return (
                <li key={index} className="scoreboard-item">
                  {/* Muestra el ranking con el índice + 1 */}
                  <div className="scoreboard-rank">#{index + 1}</div>
                  
                  {/* Detalles del usuario */}
                  <div className="scoreboard-details">
                    <strong>👤 {username}</strong> {/* Nombre del usuario */}
                    <p>🎉 {score.games_won} Partidas Ganadas</p> {/* Partidas ganadas */}
                    <p>💔 {score.games_lost} Partidas Perdidas</p> {/* Partidas perdidas */}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          // Si no hay puntuaciones, muestra un mensaje
          <p className="centered-message">No hay puntuaciones aún. ¡Sé el primero en ganar! 🚀</p>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;
