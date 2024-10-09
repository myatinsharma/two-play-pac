import React, { useState, useEffect } from "react";
import {
  GAME_STATUS,
  GAME_STATUS_DESCRIPTION,
  PLAYER_ROLES,
} from "../constants";

function GameBoard({ players, playerPos, role, handlePlayerMove }) {
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

  const initialPositions = {
    chaserPos: { row: 1, col: 1 },
    chaseePos: { row: 6, col: 7 },
  };

  useEffect(() => {
    const movePlayer = ({ key }) => {
      const getInitialPosition = (role, axis) => {
        console.log("playerPos_not", playerPos);
        if (playerPos) {
          console.log("playerPos001", playerPos);
          return playerPos[axis];
        }
        return role === PLAYER_ROLES.CHASER
          ? initialPositions.chaserPos[axis]
          : initialPositions.chaseePos[axis];
      };

      let newRow = getInitialPosition(role, "row");
      let newCol = getInitialPosition(role, "col");

      // Update the position based on arrow keys
      if (key === "ArrowUp") newRow--;
      else if (key === "ArrowDown") newRow++;
      else if (key === "ArrowLeft") newCol--;
      else if (key === "ArrowRight") newCol++;
      console.log("key002", key);

      // Ensure new position is within the maze and not a wall
      if (maze[newRow][newCol] !== 1) {
        console.log("Valid move", { row: newRow, col: newCol });
        handlePlayerMove({ row: newRow, col: newCol });
      } else {
        console.log("Invalid move");
      }
    };

    window.addEventListener("keydown", movePlayer);

    return () => {
      window.removeEventListener("keydown", movePlayer);
    };
  }, [maze, role, playerPos]);

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

            if (
              rowIndex ===
                (role === PLAYER_ROLES.CHASER && playerPos
                  ? playerPos.row
                  : initialPositions.chaserPos.row) &&
              colIndex ===
                (role === PLAYER_ROLES.CHASER && playerPos
                  ? playerPos.col
                  : initialPositions.chaserPos.col)
            ) {
              backgroundColor = "blue"; // Chaser
            } else if (
              rowIndex ===
                (role === PLAYER_ROLES.CHASEE && playerPos
                  ? playerPos.row
                  : initialPositions.chaseePos.row) &&
              colIndex ===
                (role === PLAYER_ROLES.CHASEE && playerPos
                  ? playerPos.col
                  : initialPositions.chaseePos.col)
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
