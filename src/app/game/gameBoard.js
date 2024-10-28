import React, { useState, useEffect, useCallback } from "react";
import { PLAYER_ROLES, GAME_STATUS } from "../constants";

function GameBoard({
  playersPos,
  mazeMap,
  role,
  handlePlayerMove,
  gameStatus,
  smorePositions,
}) {
  const [currentDirection, setCurrentDirection] = useState(null);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [showArrows, setShowArrows] = useState(false);

  // Add a new state to keep track of eaten smores
  const [eatenSmores, setEatenSmores] = useState([]);

  // Update eatenSmores when a new smore is eaten
  useEffect(() => {
    if (smorePositions) {
      setEatenSmores(smorePositions);
    }
  }, [smorePositions]);

  const movePlayer = useCallback(
    (direction) => {
      let newRow = playersPos[role].row;
      let newCol = playersPos[role].col;

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
    const moveInterval = 90; // Adjust this value to change movement speed

    const gameLoop = (timestamp) => {
      if (
        currentDirection &&
        timestamp - lastMoveTime >= moveInterval &&
        gameStatus === GAME_STATUS.STARTED
      ) {
        movePlayer(currentDirection);
        setLastMoveTime(timestamp);
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (event) => {
      if (gameStatus === GAME_STATUS.STARTED) {
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
      }
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
    if (
      gameStatus === GAME_STATUS.GAME_OVER ||
      gameStatus === GAME_STATUS.TURN_COMPLETED
    ) {
      setCurrentDirection(null);
    }
  }, [gameStatus]);

  const handleArrowClick = (direction) => {
    if (gameStatus === GAME_STATUS.STARTED) {
      setCurrentDirection(direction);
    }
  };

  const handleArrowRelease = () => {
    setCurrentDirection(null);
  };

  const preventDefaultAndMove = (event, direction) => {
    event.preventDefault();
    handleArrowClick(direction);
  };

  const toggleArrows = () => {
    setShowArrows((prev) => !prev);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-center">
        <div
          className="grid gap-0 border border-gray-300"
          style={{
            gridTemplateColumns: `repeat(${mazeMap.maze[0].length}, minmax(0, 1fr))`,
            width: `${mazeMap.maze[0].length * 20}px`, // Adjust this value to change the overall maze size
          }}
        >
          {mazeMap.maze.flatMap((row, rowIndex) =>
            row.map((cell, colIndex) => {
              let cellClass = "w-5 h-5 flex items-center justify-center"; // Reduced cell size
              let cellContent = null;

              if (
                rowIndex === playersPos[PLAYER_ROLES.CHASER].row &&
                colIndex === playersPos[PLAYER_ROLES.CHASER].col
              ) {
                cellClass += " bg-blue-500";
              } else if (
                rowIndex === playersPos[PLAYER_ROLES.CHASEE].row &&
                colIndex === playersPos[PLAYER_ROLES.CHASEE].col
              ) {
                cellClass += " bg-red-500";
              } else if (cell === 1) {
                cellClass += " bg-gray-800";
              } else if (
                smorePositions.some(
                  (smore) => smore.row === rowIndex && smore.col === colIndex
                )
              ) {
                cellContent = (
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                );
              } else {
                cellClass += " bg-white";
              }

              return (
                <div key={`${rowIndex}-${colIndex}`} className={cellClass}>
                  {cellContent}
                </div>
              );
            })
          )}
        </div>
      </div>
      <button
        onClick={toggleArrows}
        className="mt-4 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold py-1 px-2 rounded"
      >
        {showArrows ? "Hide" : "Show"} Controls
      </button>
      {showArrows && (
        <div className="mt-4 flex flex-col items-center">
          <button
            onTouchStart={(e) => preventDefaultAndMove(e, "up")}
            onTouchEnd={handleArrowRelease}
            onMouseDown={(e) => preventDefaultAndMove(e, "up")}
            onMouseUp={handleArrowRelease}
            className="w-16 h-16 bg-gray-200 hover:bg-gray-300 text-2xl font-bold rounded-full mb-2 select-none"
          >
            ▲
          </button>
          <div className="flex justify-center">
            <button
              onTouchStart={(e) => preventDefaultAndMove(e, "left")}
              onTouchEnd={handleArrowRelease}
              onMouseDown={(e) => preventDefaultAndMove(e, "left")}
              onMouseUp={handleArrowRelease}
              className="w-16 h-16 bg-gray-200 hover:bg-gray-300 text-2xl font-bold rounded-full mr-2 select-none"
            >
              ◀
            </button>
            <button
              onTouchStart={(e) => preventDefaultAndMove(e, "down")}
              onTouchEnd={handleArrowRelease}
              onMouseDown={(e) => preventDefaultAndMove(e, "down")}
              onMouseUp={handleArrowRelease}
              className="w-16 h-16 bg-gray-200 hover:bg-gray-300 text-2xl font-bold rounded-full mx-2 select-none"
            >
              ▼
            </button>
            <button
              onTouchStart={(e) => preventDefaultAndMove(e, "right")}
              onTouchEnd={handleArrowRelease}
              onMouseDown={(e) => preventDefaultAndMove(e, "right")}
              onMouseUp={handleArrowRelease}
              className="w-16 h-16 bg-gray-200 hover:bg-gray-300 text-2xl font-bold rounded-full ml-2 select-none"
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const arrowButtonStyle = {
  width: "60px",
  height: "60px",
  fontSize: "24px",
  margin: "5px",
  backgroundColor: "#f0f0f0",
  border: "1px solid #ccc",
  borderRadius: "5px",
  cursor: "pointer",
  userSelect: "none",
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
};

const toggleButtonStyle = {
  padding: "10px 15px",
  fontSize: "16px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "10px",
};

export default GameBoard;
