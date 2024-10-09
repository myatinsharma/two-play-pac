import React, { useState, useEffect } from "react";
import {
  GAME_STATUS,
  GAME_STATUS_DESCRIPTION,
  PLAYER_ROLES,
} from "../constants";

function GameBoard({ playersPos, playerPos, role, handlePlayerMove }) {
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
        if (playersPos && playersPos[role]) {
          return playersPos[role][axis];
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

      // Ensure new position is within the maze and not a wall
      if (maze[newRow][newCol] !== 1) {
        handlePlayerMove({ row: newRow, col: newCol });
      }
    };

    window.addEventListener("keydown", movePlayer);

    return () => {
      window.removeEventListener("keydown", movePlayer);
    };
  }, [maze, role, playersPos]);

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
                (playersPos && playersPos[PLAYER_ROLES.CHASER]
                  ? playersPos[PLAYER_ROLES.CHASER].row
                  : initialPositions.chaserPos.row) &&
              colIndex ===
                (playersPos && playersPos[PLAYER_ROLES.CHASER]
                  ? playersPos[PLAYER_ROLES.CHASER].col
                  : initialPositions.chaserPos.col)
            ) {
              backgroundColor = "blue"; // Chaser
            } else if (
              rowIndex ===
                (playersPos && playersPos[PLAYER_ROLES.CHASEE]
                  ? playersPos[PLAYER_ROLES.CHASEE].row
                  : initialPositions.chaseePos.row) &&
              colIndex ===
                (playersPos && playersPos[PLAYER_ROLES.CHASEE]
                  ? playersPos[PLAYER_ROLES.CHASEE].col
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
