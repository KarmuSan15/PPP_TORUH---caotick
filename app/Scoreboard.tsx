import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Menu from './Menu';
import './Scoreboard.css';

const Scoreboard: React.FC = () => {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Comprobación de autenticación al cargar el componente
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login'; // Redirigir al login si no está autenticado
      }
    };
    checkUser();

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        window.location.href = '/login'; // Redirigir al login si no está autenticado
      } else {
        // Cuando el usuario cambia, volvemos a cargar las puntuaciones
        fetchScores();
      }
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Cargar las puntuaciones de todos los jugadores
  const fetchScores = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('scores')
        .select('email, games_won, games_lost')
        .order('games_won', { ascending: false });

      if (error) {
        console.error('Error obteniendo las puntuaciones:', error);
      } else {
        setScores(data || []);
      }
    } catch (err) {
      console.error('Error al recuperar puntuaciones:', err);
    }

    setLoading(false);
  };

  // Mostrar el nombre de usuario a partir del correo
  const getUsernameFromEmail = (email: string) => {
    const username = email.split('@')[0];
    return username || 'Usuario desconocido';
  };

  // Cargar las puntuaciones al montar el componente por primera vez
  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <div className="scoreboard-container">
      <Menu />
      <div className="scoreboard-content">
        
        {/* Encabezado fijo y centrado */}
        <div className="scoreboard-header">
          <h2>🏆 Puntuaciones 🏆</h2>
        </div>

        {loading ? (
          <p>Cargando puntuaciones...</p>
        ) : scores.length > 0 ? (
          <ul className="scoreboard-list">
            {scores.map((score, index) => {
              const username = getUsernameFromEmail(score.email);

              return (
                <li key={index} className="scoreboard-item">
                  <div className="scoreboard-rank">#{index + 1}</div>
                  <div className="scoreboard-details">
                    <strong>👤 {username}</strong>
                    <p>🎉 {score.games_won} Partidas Ganadas</p>
                    <p>💔 {score.games_lost} Partidas Perdidas</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="centered-message">No hay puntuaciones aún. ¡Sé el primero en ganar! 🚀</p>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;
