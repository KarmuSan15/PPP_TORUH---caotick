// Scoreboard.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Scoreboard: React.FC = () => {
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    const fetchScores = async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('time', { ascending: true }); // Ordena por el tiempo

      if (data) {
        setScores(data);
      } else {
        console.error('Error obteniendo las puntuaciones', error);
      }
    };

    fetchScores();
  }, []);

  return (
    <div>
      <h2>Puntuaciones</h2>
      <ul>
        {scores.map((score, index) => (
          <li key={score.id}>
            {score.email}: {score.time}s (Mines Found: {score.minesFound})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Scoreboard;
