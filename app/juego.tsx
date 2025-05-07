import React, { useState, useEffect } from 'react'; 
import { supabase } from '../lib/supabase';
import './juego.css';
import Menu from './Menu';

// Definimos la interfaz para cada celda del tablero
interface Cell {
  isMine: boolean; // Indica si la celda contiene una mina
  isRevealed: boolean; // Indica si la celda está revelada
  adjacentMines: number; // Número de minas adyacentes a esta celda
  isFlagged: boolean;  // Nueva propiedad para marcar las minas con una bandera
}

const Juego: React.FC = () => {
  // Estado del juego: tablero, estado del juego, tiempo, número de minas, etc.
  const [grid, setGrid] = useState<Cell[][]>([]); // El tablero del juego (matriz de celdas)
  const [juegoStatus, setjuegoStatus] = useState('playing'); // Estado del juego (jugando, ganado, perdido)
  const [timeElapsed, setTimeElapsed] = useState(0); // Tiempo transcurrido desde el inicio del juego
  const [minesCount, setMinesCount] = useState(0); // Número total de minas en el tablero
  const [flagsCount, setFlagsCount] = useState(0); // Número de banderas colocadas por el jugador
  const [user, setUser] = useState<{ email: string; id: string } | null>(null); // Información del usuario logueado
  const [showInstructions, setShowInstructions] = useState(false); // Estado para mostrar/ocultar instrucciones
  const gridSize = 8; // Tamaño del tablero (8x8 celdas)
  const mineCount = 10; // Número de minas en el tablero

  // Efecto para obtener el usuario desde Supabase cuando el componente se monta
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser(); // Obtener el usuario actual de supabase
      if (user) {
        setUser({
          email: user.email ?? '',
          id: user.id,
        });
      }
    };

    fetchUser();

    // Suscripción para escuchar cambios en el estado de autenticación
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

    // Limpiar la suscripción al desmontar el componente
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Efecto para iniciar un nuevo juego cuando el componente se monta
  useEffect(() => {
    startNewjuego(); // Llama a la función que inicia un nuevo juego
  }, []);

  // Efecto para iniciar un temporizador si el juego está en curso
  useEffect(() => {
    if (juegoStatus === 'playing') {
      const timer = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1); // Incrementa el tiempo cada segundo
      }, 1000);
      return () => clearInterval(timer); // Limpia el temporizador cuando el juego termina
    }
  }, [juegoStatus]);

  // Función para iniciar un nuevo juego
  const startNewjuego = () => {
    // Inicializa el tablero vacío
    const newGrid: Cell[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => ({
        isMine: false,
        isRevealed: false,
        adjacentMines: 0,
        isFlagged: false, // Inicializamos como no marcado
      }))
    );

    
    let minesPlaced = 0;
    // Coloca las minas en posiciones aleatorias
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * gridSize); // Genera una fila aleatoria
      const col = Math.floor(Math.random() * gridSize); // Genera una columna aleatoria
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true; // Coloca una mina en una celda aleatoria
        minesPlaced++;
      }
    }

    // CALCULO DE LAS MINAS ADYACENTES
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (newGrid[row][col].isMine) continue; // Si la celda actual tiene una mina, no hace falta calcular adyacentes

        let adjacentMines = 0; // Inicializamos el contador de minas adyacentes

        // Comprobamos las 8 celdas adyacentes alrededor de la celda actual
        for (let i = -1; i <= 1; i++) { // Compara con las celdas arriba, abajo, izquierda y derecha
          for (let j = -1; j <= 1; j++) { // Y las celdas diagonales
            const newRow = row + i;  // Nueva fila en la vecindad
            const newCol = col + j;  // Nueva columna en la vecindad

            // Verificamos si la celda adyacente está dentro de los límites del tablero
            if (
              newRow >= 0 && // Verifica que no se salga de la parte superior
              newRow < gridSize && // Verifica que no se salga de la parte inferior
              newCol >= 0 && // Verifica que no se salga de la parte izquierda
              newCol < gridSize && // Verifica que no se salga de la parte derecha
              newGrid[newRow][newCol].isMine // Si la celda vecina contiene una mina
            ) {
              adjacentMines++; // Aumentamos el contador de minas adyacentes
            }
          }
        }

        // Asignamos el número de minas adyacentes a la celda
        newGrid[row][col].adjacentMines = adjacentMines;
      }
    }

    setGrid(newGrid); // Actualiza el estado del tablero
    setjuegoStatus('playing'); // Cambia el estado del juego a 'jugando'
    setMinesCount(mineCount); // Establece el número de minas
    setFlagsCount(0); // Reinicia el contador de banderas
    setTimeElapsed(0); // Reinicia el tiempo
  };

  // Maneja el clic en una celda del tablero
  const handleCellClick = (row: number, col: number) => {
    if (juegoStatus !== 'playing') return; // Si el juego no está en curso, no hacer nada

    const newGrid = [...grid];
    const cell = newGrid[row][col];

    if (cell.isRevealed || cell.isFlagged) return; // No se puede hacer clic en celdas ya reveladas o con bandera

    cell.isRevealed = true; // Revela la celda
    setGrid(newGrid); // Actualiza el estado del tablero

    if (cell.isMine) {
      // Si la celda es una mina, termina el juego
      revealMines(newGrid); // Revela todas las minas
      setjuegoStatus('lost'); // Cambia el estado del juego a 'perdido'
      alert('¡Perdiste!');
      saveScore('lost');  // Guarda el puntaje de la partida perdida
    } else if (isjuegoWon(newGrid)) {
      setjuegoStatus('won'); // Cambia el estado del juego a 'ganado'
      alert('¡Ganaste!');
      saveScore('won');  // Guarda el puntaje de la partida ganada
    }
  };

  // Maneja el clic derecho en una celda (poner bandera)
  const handleContextMenu = (event: React.MouseEvent, row: number, col: number) => {
    event.preventDefault(); // Evitar el menú contextual del navegador

    if (juegoStatus !== 'playing') return; // No hacer nada si el juego no está en curso

    const newGrid = [...grid];
    const cell = newGrid[row][col];

    if (cell.isRevealed) return; // No se puede marcar una celda ya revelada

    // Cambiar el estado de la bandera
    cell.isFlagged = !cell.isFlagged; // Alterna el estado de la bandera
    setGrid(newGrid); // Actualiza el tablero

    // Actualiza el contador de banderas
    setFlagsCount((prevCount) => prevCount + (cell.isFlagged ? 1 : -1));
  };

  // Función para verificar si el juego ha sido ganado
  const isjuegoWon = (grid: Cell[][]) => {
    return grid.every((row) =>
      row.every((cell) => cell.isRevealed || cell.isMine)
    ); // Verifica si todas las celdas reveladas o minas están en su lugar
  };

  // Guarda el puntaje del jugador en la base de datos
  const saveScore = async (result: string) => {
    if (!user || !user.id || !user.email) {
      console.warn('Usuario no definido. No se puede guardar la puntuación.');
      return;
    }

    const minesFound = grid.flat().filter(cell => cell.isMine && cell.isFlagged).length; // Contamos las minas correctamente marcadas

    // Obtener el puntaje actual del jugador
    const { data: existingScores, error: fetchError } = await supabase
      .from('scores')
      .select('games_won, games_lost')
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.error('Error obteniendo el puntaje actual', fetchError);
      return;
    }

    // Actualiza el número de juegos ganados y perdidos
    const gamesWon = result === 'won' ? (existingScores?.games_won || 0) + 1 : existingScores?.games_won || 0;
    const gamesLost = result === 'lost' ? (existingScores?.games_lost || 0) + 1 : existingScores?.games_lost || 0;

    // Objeto de puntuación a guardar
    const score = {
      user_id: user.id,
      email: user.email,
      time: timeElapsed,
      minesfound: minesFound, // Minas encontradas por el jugador
      games_won: gamesWon,  // Juegos ganados
      games_lost: gamesLost,  // Juegos perdidos
    };

    // Usamos 'upsert' para insertar o actualizar el registro
    const { data, error } = await supabase
      .from('scores')
      .upsert([score], { onConflict: 'user_id' });

    if (error) {
      console.error('Error guardando o actualizando la puntuación', error);
    } else {
      console.log('Puntuación guardada o actualizada', data);
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
    setGrid(newGrid); // Actualiza el estado del tablero
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
