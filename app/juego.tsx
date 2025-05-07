import React, { useState, useEffect } from 'react'; 
import { supabase } from '../lib/supabase';
import './juego.css';
import Menu from './Menu';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  adjacentMines: number;
  isFlagged: boolean;  // Nueva propiedad para marcar las minas
}

const Juego: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [juegoStatus, setjuegoStatus] = useState('playing');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [minesCount, setMinesCount] = useState(0);
  const [flagsCount, setFlagsCount] = useState(0);
  const [user, setUser] = useState<{ email: string; id: string } | null>(null); // Agregamos el estado de usuario
  const [showInstructions, setShowInstructions] = useState(false); // Estado para mostrar las instrucciones
  const gridSize = 8;
  const mineCount = 10;

  // Obtener el usuario desde supabase cuando el componente se monta
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          email: user.email ?? '',
          id: user.id,
        });
      }
    };

    fetchUser();

    // Suscripción para escuchar cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? '',
          id: session.user.id,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    startNewjuego();
  }, []);

  useEffect(() => {
    if (juegoStatus === 'playing') {
      const timer = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [juegoStatus]);

  const startNewjuego = () => {
    const newGrid: Cell[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => ({
        isMine: false,
        isRevealed: false,
        adjacentMines: 0,
        isFlagged: false, // Inicializamos como no marcado
      }))
    );

    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (newGrid[row][col].isMine) continue;
        let adjacentMines = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (
              newRow >= 0 &&
              newRow < gridSize &&
              newCol >= 0 &&
              newCol < gridSize &&
              newGrid[newRow][newCol].isMine
            ) {
              adjacentMines++;
            }
          }
        }
        newGrid[row][col].adjacentMines = adjacentMines;
      }
    }

    setGrid(newGrid);
    setjuegoStatus('playing');
    setMinesCount(mineCount);
    setFlagsCount(0);
    setTimeElapsed(0);
  };

  const handleCellClick = (row: number, col: number) => {
    if (juegoStatus !== 'playing') return;

    const newGrid = [...grid];
    const cell = newGrid[row][col];

    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    setGrid(newGrid);

    if (cell.isMine) {
      // Revelamos todas las minas cuando se pierde
      revealMines(newGrid);
      setjuegoStatus('lost');
      alert('¡Perdiste!');
      saveScore('lost');  // Guardamos el resultado como 'lost'
    } else if (isjuegoWon(newGrid)) {
      setjuegoStatus('won');
      alert('¡Ganaste!');
      saveScore('won');  // Guardamos el resultado como 'won'
    }
  };

  const handleContextMenu = (event: React.MouseEvent, row: number, col: number) => {
    event.preventDefault(); // Evitar el menú contextual del navegador

    if (juegoStatus !== 'playing') return;

    const newGrid = [...grid];
    const cell = newGrid[row][col];

    if (cell.isRevealed) return; // No permitir marcar una celda ya revelada

    // Cambiar el estado de la bandera
    cell.isFlagged = !cell.isFlagged;
    setGrid(newGrid);

    // Actualizar el contador de banderas
    setFlagsCount((prevCount) => prevCount + (cell.isFlagged ? 1 : -1));
  };

  const isjuegoWon = (grid: Cell[][]) => {
    return grid.every((row) =>
      row.every((cell) => cell.isRevealed || cell.isMine)
    );
  };

  const saveScore = async (result: string) => {
    if (!user || !user.id || !user.email) {
      console.warn('Usuario no definido. No se puede guardar la puntuación.');
      return;
    }

    const minesFound = grid.flat().filter(cell => cell.isMine && cell.isFlagged).length; // Contamos las minas marcadas por el jugador

    const score = {
      user_id: user.id,
      email: user.email,
      time: timeElapsed,
      minesfound: minesFound, // Ahora se usa el número de minas encontradas
      games_won: result === 'won' ? 1 : 0,  // Guardamos el estado de ganado
      games_lost: result === 'lost' ? 1 : 0,  // Guardamos el estado de perdido
    };

    const { data, error } = await supabase.from('scores').insert([score]);

    if (error) {
      console.error('Error guardando la puntuación', error);
    } else {
      console.log('Puntuación guardada', data);
    }
  };

  // Función para revelar todas las minas cuando el jugador pierde
  const revealMines = (newGrid: Cell[][]) => {
    newGrid.forEach(row => {
      row.forEach(cell => {
        if (cell.isMine) {
          cell.isRevealed = true; // Revela todas las minas
        }
      });
    });
    setGrid(newGrid);
  };

  return (
    <div className="juego-container">
      <Menu />
      <div className="juego-center">
        <h2>Busca Minas</h2>
        <button onClick={startNewjuego}>Nuevo Juego</button>
        {/* Botón para mostrar las instrucciones */}
        <button onClick={() => setShowInstructions(!showInstructions)}>
          {showInstructions ? 'Ocultar Instrucciones' : 'Cómo se Juega'}
        </button>

        {/* Desplegable de instrucciones */}
        {showInstructions && (
          <div className="instructions">
            <h3>Instrucciones</h3>
            <p>Bienvenido a Busca Minas. El objetivo del juego es encontrar todas las celdas vacías sin hacer clic en las minas.</p>
            <p>Haz clic en una celda para revelar su contenido. Si encuentras una mina, pierdes el juego. Si descubres todas las celdas sin minas, ¡ganas!</p>
            <p>Cada celda revelada mostrará el número de minas adyacentes. Usa estos números para deducir dónde están las minas. ¡Buena suerte!</p>
          </div>
        )}

        <div className="timer">Tiempo: {timeElapsed}s</div>
        <div className="grid">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`cell ${cell.isRevealed ? 'revealed' : ''} ${cell.isFlagged ? 'flagged' : ''}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => handleContextMenu(e, rowIndex, colIndex)}
                >
                  {cell.isRevealed && !cell.isMine ? cell.adjacentMines : ''}
                  {cell.isRevealed && cell.isMine ? '💣' : ''}
                  {cell.isFlagged ? '🚩' : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Juego;
