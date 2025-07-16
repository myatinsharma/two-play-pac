import React, { useState, useEffect, useCallback } from "react";
import { PLAYER_ROLES, GAME_STATUS } from "../constants";

function GameBoard({
  playersPos,
  mazeMap,
  role,
  handlePlayerMove,
  gameStatus,
  smorePositions,
  handleNextTurn,
  startGame,
  isRoomOwner,
  settingsData,
  players,
}) {
  const [currentDirection, setCurrentDirection] = useState(null);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [showArrows, setShowArrows] = useState(true);
  const [localPlayerPos, setLocalPlayerPos] = useState(null); // For client-side prediction

  // Add a new state to keep track of eaten smores
  const [eatenSmores, setEatenSmores] = useState([]);

  // Add new state for tracking if it's a web maze
  const [isWebMaze, setIsWebMaze] = useState(false);

  // Modified effect to handle maze type detection
  useEffect(() => {
    const fetchMazeSettings = async () => {
      try {
        const response = await fetch("/settings.json");
        const settings = await response.json();

        if (settings.maze && Array.isArray(settings.maze)) {
          const selectedMaze = settings.maze.find(
            (m) => m.value === settingsData?.maze
          );
          const isWeb = selectedMaze?.for === "web";
          console.log("Maze Settings:", {
            mazeId: settingsData?.maze,
            selectedMaze,
            isWeb,
          });
          setIsWebMaze(isWeb);
        }
      } catch (err) {
        console.error("Error loading maze settings:", err);
      }
    };

    fetchMazeSettings();
  }, [settingsData]);

  // Initialize local player position when playersPos changes
  useEffect(() => {
    if (playersPos && role) {
      setLocalPlayerPos(playersPos[role]);
    }
  }, [playersPos, role]);

  const movePlayer = useCallback(
    (direction) => {
      if (!localPlayerPos || !mazeMap) return;

      let newRow = localPlayerPos.row;
      let newCol = localPlayerPos.col;

      switch (direction) {
        case "up":
          newRow--;
          break;
        case "down":
          newRow++;
          break;
        case "left":
          newCol--;
          break;
        case "right":
          newCol++;
          break;
      }

      // Check boundaries
      if (
        newRow < 0 ||
        newRow >= mazeMap.maze.length ||
        newCol < 0 ||
        newCol >= mazeMap.maze[0].length
      ) {
        return;
      }

      // Check for walls
      if (mazeMap.maze[newRow][newCol] === 1) {
        return;
      }

      // Client-side prediction: update local position immediately
      const newPosition = { row: newRow, col: newCol };
      setLocalPlayerPos(newPosition);

      // Send to server
      handlePlayerMove(newPosition);
    },
    [localPlayerPos, mazeMap, handlePlayerMove]
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

        // Prevent key repeat delays
        event.preventDefault();
        setCurrentDirection(direction);
      }
    };

    const handleKeyUp = (event) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        event.preventDefault();
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

  // Add missing functions for compatibility
  const handleStartGame = async () => {
    if (isWebMaze) {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
          await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
          await elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
          await elem.mozRequestFullScreen();
        }
      } catch (err) {
        console.error('Fullscreen request failed:', err);
        // Continue with the game even if fullscreen fails
      }
    }
    // Small delay to ensure fullscreen is activated before starting the game
    setTimeout(() => {
      startGame();
    }, 100);
  };

  // Update eatenSmores when a new smore is eaten
  useEffect(() => {
    if (smorePositions) {
      setEatenSmores(smorePositions);
    }
  }, [smorePositions]);

  const preventDefaultAndMove = (event, direction) => {
    event.preventDefault();
    handleArrowClick(direction);
  };

  const toggleArrows = () => {
    setShowArrows((prev) => !prev);
  };

  return (
    <div className="mt-2">
      {/* Maze grid - always show */}
      <div className="flex justify-center">
        <div
          className="grid gap-0 border border-gray-300"
          style={{
            gridTemplateColumns: `repeat(${mazeMap.maze[0].length}, minmax(0, 1fr))`,
            width: `${mazeMap.maze[0].length * 20}px`,
          }}
        >
          {mazeMap.maze.flatMap((row, rowIndex) =>
            row.map((cell, colIndex) => {
              let cellClass = "w-5 h-5 flex items-center justify-center"; // Reduced cell size
              let cellContent = null;

              // Use client-side prediction for current player, server position for others
              const currentPlayerPos = role === PLAYER_ROLES.CHASER || role === PLAYER_ROLES.CHASEE 
                ? (localPlayerPos && role === PLAYER_ROLES.CHASER ? localPlayerPos : localPlayerPos && role === PLAYER_ROLES.CHASEE ? localPlayerPos : playersPos[role])
                : null;

              const otherPlayerRole = role === PLAYER_ROLES.CHASER ? PLAYER_ROLES.CHASEE : PLAYER_ROLES.CHASER;
              const otherPlayerPos = playersPos[otherPlayerRole];

              if (
                role === PLAYER_ROLES.CHASER &&
                currentPlayerPos &&
                rowIndex === currentPlayerPos.row &&
                colIndex === currentPlayerPos.col
              ) {
                cellClass += " bg-blue-500";
              } else if (
                role === PLAYER_ROLES.CHASEE &&
                currentPlayerPos &&
                rowIndex === currentPlayerPos.row &&
                colIndex === currentPlayerPos.col
              ) {
                cellClass += " bg-red-500";
              } else if (
                otherPlayerPos &&
                rowIndex === otherPlayerPos.row &&
                colIndex === otherPlayerPos.col
              ) {
                cellClass += role === PLAYER_ROLES.CHASER ? " bg-red-500" : " bg-blue-500";
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

      {/* Game control buttons - always show */}
      <div className="mt-4 flex justify-center">
        {gameStatus === GAME_STATUS.TURN_COMPLETED && (
          <button
            onClick={handleNextTurn}
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1 px-2 rounded"
          >
            Next Turn
          </button>
        )}
        {isRoomOwner &&
          gameStatus === GAME_STATUS.TURN_STARTED &&
          settingsData &&
          players.length === 2 && (
            <button
              onClick={handleStartGame}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1 px-2 rounded"
            >
              Start Game
            </button>
          )}
      </div>

      {/* Only show mobile controls when NOT a web maze */}
      {!isWebMaze && (
        <div>
          {/* Controls toggle button */}
          <div className="mt-4 grid grid-cols-3 items-center w-full max-w-md mx-auto">
            <div className="justify-self-end pr-7">
              <button
                onClick={toggleArrows}
                className={`hover:opacity-80 text-white text-xs font-semibold py-1 px-2 rounded ${
                  showArrows ? "bg-gray-300" : "bg-blue-500"
                }`}
                title={showArrows ? "Hide Controls" : "Show Controls"}
              >
                ◀ ▶
              </button>
            </div>
          </div>

          {/* Arrow controls */}
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
