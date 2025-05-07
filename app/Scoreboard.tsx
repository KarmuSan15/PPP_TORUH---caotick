import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Menu from './Menu';
import './Scoreboard.css';

const Scoreboard: React.FC = () => {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('scores')
        .select('email, games_won')  // Solo seleccionamos 'email' y 'games_won'
        .gt('games_won', 0)  // Filtramos para solo mostrar jugadores que han ganado al menos una partida
        .order('games_won', { ascending: false });  // Ordenamos por 'games_won' de mayor a menor

      if (error) {
        console.error('Error obteniendo las puntuaciones:', error);
      } else {
        setScores(data || []);  // Si 'data' es null, usamos un array vacío
      }
      setLoading(false);
    };

    fetchScores();
  }, []);

  return (
    <div className="scoreboard-container">
      <Menu />
      <div className="scoreboard-content">
        <h2>🏆 Puntuaciones 🏆</h2>
        {loading ? (
          <p>Cargando puntuaciones...</p>
        ) : scores.length > 0 ? (
          <ul className="scoreboard-list">
            {scores.map((score, index) => {
              const username = score.email.split('@')[0]; // Obtener el nombre del usuario (parte antes del @)
              return (
                <li key={index} className="scoreboard-item">
                  <div className="scoreboard-rank">#{index + 1}</div>
                  <div className="scoreboard-details">
                    <strong>👤 {username}</strong> {/* Mostrar solo el nombre */}
                    <p>🎉 {score.games_won} Partidas Ganadas</p> {/* Mostrar la cantidad de partidas ganadas */}
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
