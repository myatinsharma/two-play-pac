import React, { useState, useEffect } from "react";
import {
  GAME_STATUS,
  GAME_STATUS_DESCRIPTION,
  PLAYER_ROLES,
} from "../constants";

function GameBoard({ playersPos, mazeMap, role, handlePlayerMove }) {
  useEffect(() => {
    const movePlayer = ({ key }) => {
      const getInitialPosition = (role, axis) => {
        if (playersPos && playersPos[role]) {
          return playersPos[role][axis];
        }
        return role === PLAYER_ROLES.CHASER
          ? mazeMap.startingPosition.chaser[axis]
          : mazeMap.startingPosition.chasee[axis];
      };

      let newRow = getInitialPosition(role, "row");
      let newCol = getInitialPosition(role, "col");

      // Update the position based on arrow keys
      if (key === "ArrowUp") newRow--;
      else if (key === "ArrowDown") newRow++;
      else if (key === "ArrowLeft") newCol--;
      else if (key === "ArrowRight") newCol++;

      // Ensure new position is within the maze and not a wall
      const isWithinMaze =
        newRow >= 0 &&
        newRow < mazeMap.maze.length &&
        newCol >= 0 &&
        newCol < mazeMap.maze[0].length;
      const isNotWall = mazeMap.maze[newRow][newCol] !== 1;

      if (isWithinMaze && isNotWall) {
        handlePlayerMove({ row: newRow, col: newCol });
      }
    };

    window.addEventListener("keydown", movePlayer);

    return () => {
      window.removeEventListener("keydown", movePlayer);
    };
  }, [mazeMap, role, playersPos]);

  return (
    <div>
      <h3>Game Board</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${mazeMap.maze[0].length}, 20px)`,
        }}
      >
        {mazeMap.maze.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let backgroundColor = "white";
            if (
              rowIndex ===
                (playersPos && playersPos[PLAYER_ROLES.CHASER]
                  ? playersPos[PLAYER_ROLES.CHASER].row
                  : mazeMap.startingPosition.chaser.row) &&
              colIndex ===
                (playersPos && playersPos[PLAYER_ROLES.CHASER]
                  ? playersPos[PLAYER_ROLES.CHASER].col
                  : mazeMap.startingPosition.chaser.col)
            ) {
              backgroundColor = "blue"; // Chaser
            } else if (
              rowIndex ===
                (playersPos && playersPos[PLAYER_ROLES.CHASEE]
                  ? playersPos[PLAYER_ROLES.CHASEE].row
                  : mazeMap.startingPosition.chasee.row) &&
              colIndex ===
                (playersPos && playersPos[PLAYER_ROLES.CHASEE]
                  ? playersPos[PLAYER_ROLES.CHASEE].col
                  : mazeMap.startingPosition.chasee.col)
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
