// juego.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './juego.css';
import Menu from './Menu';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  adjacentMines: number;
}

interface juegoProps {
  user: { email: string; id: string }; // Asegúrate de que el usuario esté autenticado
}

const juego: React.FC<juegoProps> = ({ user }) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [juegoStatus, setjuegoStatus] = useState('playing');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [minesCount, setMinesCount] = useState(0);
  const [flagsCount, setFlagsCount] = useState(0);
  const gridSize = 8; // Tamaño de la cuadrícula (8x8)
  const mineCount = 10; // Número de minas en el tablero

  useEffect(() => {
    startNewjuego();
  }, []);

  useEffect(() => {
    if (juegoStatus === 'playing') {
      const timer = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
      return () => clearInterval(timer); // Limpiar el intervalo cuando el juego termine
    }
  }, [juegoStatus]);

  const startNewjuego = () => {
    const newGrid: Cell[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => ({
        isMine: false,
        isRevealed: false,
        adjacentMines: 0,
      }))
    );

    // Colocar minas de manera aleatoria
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calcular los números de minas adyacentes
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

    if (cell.isRevealed) return; // No hacer nada si la celda ya está revelada

    cell.isRevealed = true;
    setGrid(newGrid);

    if (cell.isMine) {
      setjuegoStatus('lost');
      alert('¡Perdiste!');
      saveScore();
    } else if (isjuegoWon(newGrid)) {
      setjuegoStatus('won');
      alert('¡Ganaste!');
      saveScore();
    }
  };

  const isjuegoWon = (grid: Cell[][]) => {
    return grid.every((row) =>
      row.every((cell) => cell.isRevealed || cell.isMine)
    );
  };

  const saveScore = async () => {
    const score = {
      user_id: user.id,
      email: user.email,
      time: timeElapsed,
      minesFound: mineCount - minesCount,
    };

    const { data, error } = await supabase
      .from('scores')
      .insert([score]);

    if (error) {
      console.error('Error guardando la puntuación', error);
    } else {
      console.log('Puntuación guardada', data);
    }
  };

  return (
    <div className="juego">
      <h2>Busca Minas</h2>
      <button onClick={startNewjuego}>Nuevo Juego</button>
      <div>Tiempo: {timeElapsed}s</div>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell.isRevealed ? 'revealed' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell.isRevealed && !cell.isMine ? cell.adjacentMines : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default juego;
