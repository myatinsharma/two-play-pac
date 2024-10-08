import React, { useState, useEffect } from "react";
import {
  GAME_STATUS,
  GAME_STATUS_DESCRIPTION,
  PLAYER_ROLES,
} from "../constants";

function GameBoard({ players, handlePlayerMove }) {
  const initialMaze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const [maze, setMaze] = useState(initialMaze);
  const [chaserPos, setChaserPos] = useState({ row: 1, col: 1 }); // Initial position for "Chaser"
  const [chaseePos, setChaseePos] = useState({ row: 6, col: 7 }); // Initial position for "Chasee"
  const [playerPos, setPlayerPos] = useState(
    PLAYER_ROLES.CHASER ? { row: 1, col: 1 } : { row: 6, col: 7 }
  ); // Initial position for "Chaser"

  const initialPositions = {
    chaserPos: { row: 1, col: 1 },
    chaseePos: { row: 6, col: 7 },
  };

  useEffect(() => {
    window.addEventListener("keydown", movePlayer);

    return () => {
      window.removeEventListener("keydown", movePlayer);
    };
  }, []);

  const movePlayer = ({ key }) => {
    let newRow = playerPos.row;
    let newCol = playerPos.col;

    console.log("key", key, "newRow", newRow, "newCol", newCol);

    // Update the position based on arrow keys
    if (key === "ArrowUp") newRow--;
    else if (key === "ArrowDown") newRow++;
    else if (key === "ArrowLeft") newCol--;
    else if (key === "ArrowRight") newCol++;

    // Ensure new position is within the maze and not a wall
    if (maze[newRow][newCol] !== 1) {
      console.log("newRow", newRow, "newCol", newCol);
      setPlayerPos({ row: newRow, col: newCol });
    }
  };

  return (
    <div>
      <h3>Game Board</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${maze[0].length}, 20px)`,
        }}
      >
        {maze.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let backgroundColor = "white";

            if (rowIndex === playerPos.row && colIndex === playerPos.col) {
              backgroundColor = "blue"; // Chaser
            } else if (
              rowIndex === initialPositions.chaseePos.row &&
              colIndex === initialPositions.chaseePos.col
            ) {
              backgroundColor = "red"; // Chasee
            } else if (cell === 1) {
              backgroundColor = "black"; // Wall
            } else if (cell === 2) {
              backgroundColor = "yellow"; // S'more
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor,
                  border: "1px solid gray",
                }}
              ></div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default GameBoard;
