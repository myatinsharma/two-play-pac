import React, { useState, useEffect, useCallback } from "react";
import { PLAYER_ROLES, GAME_STATUS } from "../constants";

function GameBoard({
  playersPos,
  mazeMap,
  role,
  handlePlayerMove,
  gameStatus,
}) {
  const [currentDirection, setCurrentDirection] = useState(null);
  const [lastMoveTime, setLastMoveTime] = useState(0);

  const movePlayer = useCallback(
    (direction) => {
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

      // Update the position based on direction
      if (direction === "up") newRow--;
      else if (direction === "down") newRow++;
      else if (direction === "left") newCol--;
      else if (direction === "right") newCol++;

      // Ensure new position is within the maze and not a wall
      if (
        newRow >= 0 &&
        newRow < mazeMap.maze.length &&
        newCol >= 0 &&
        newCol < mazeMap.maze[0].length &&
        mazeMap.maze[newRow][newCol] !== 1
      ) {
        handlePlayerMove({ row: newRow, col: newCol });
      }
    },
    [playersPos, mazeMap, role, handlePlayerMove]
  );

  useEffect(() => {
    let animationFrameId;
    const moveInterval = 100; // Adjust this value to change movement speed

    const gameLoop = (timestamp) => {
      if (
        currentDirection &&
        timestamp - lastMoveTime >= moveInterval &&
        gameStatus !== GAME_STATUS.GAME_OVER
      ) {
        movePlayer(currentDirection);
        setLastMoveTime(timestamp);
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (event) => {
      if (gameStatus === GAME_STATUS.GAME_OVER) {
        return; // Ignore key presses when the game is over
      }

      let direction;
      switch (event.key) {
        case "ArrowUp":
          direction = "up";
          break;
        case "ArrowDown":
          direction = "down";
          break;
        case "ArrowLeft":
          direction = "left";
          break;
        case "ArrowRight":
          direction = "right";
          break;
        default:
          return; // If it's not an arrow key, do nothing
      }

      setCurrentDirection(direction);
    };

    const handleKeyUp = (event) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        setCurrentDirection(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [movePlayer, currentDirection, lastMoveTime, gameStatus]);

  useEffect(() => {
    if (gameStatus === GAME_STATUS.GAME_OVER) {
      setCurrentDirection(null);
    }
  }, [gameStatus]);

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
