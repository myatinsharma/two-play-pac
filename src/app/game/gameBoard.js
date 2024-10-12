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
  const [showArrows, setShowArrows] = useState(false);

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

  const handleArrowClick = (direction) => {
    if (gameStatus !== GAME_STATUS.GAME_OVER) {
      setCurrentDirection(direction);
    }
  };

  const handleArrowRelease = () => {
    setCurrentDirection(null);
  };

  const toggleArrows = () => {
    setShowArrows((prev) => !prev);
  };

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
            let cellContent = null;

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
              backgroundColor = "white"; // Keep cell white
              cellContent = (
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#4dc513", // Always yellow, no blinking
                    margin: "4px auto",
                  }}
                />
              ); // S'more (static yellow dot)
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor,
                  border: "1px solid gray",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {cellContent}
              </div>
            );
          })
        )}
      </div>
      <button onClick={toggleArrows} style={toggleButtonStyle}>
        {showArrows ? "Hide" : "Show"} Arrows
      </button>
      {showArrows && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            onTouchStart={() => handleArrowClick("up")}
            onTouchEnd={handleArrowRelease}
            onMouseDown={() => handleArrowClick("up")}
            onMouseUp={handleArrowRelease}
            style={arrowButtonStyle}
          >
            ▲
          </button>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onTouchStart={() => handleArrowClick("left")}
              onTouchEnd={handleArrowRelease}
              onMouseDown={() => handleArrowClick("left")}
              onMouseUp={handleArrowRelease}
              style={arrowButtonStyle}
            >
              ◀
            </button>
            <button
              onTouchStart={() => handleArrowClick("down")}
              onTouchEnd={handleArrowRelease}
              onMouseDown={() => handleArrowClick("down")}
              onMouseUp={handleArrowRelease}
              style={arrowButtonStyle}
            >
              ▼
            </button>
            <button
              onTouchStart={() => handleArrowClick("right")}
              onTouchEnd={handleArrowRelease}
              onMouseDown={() => handleArrowClick("right")}
              onMouseUp={handleArrowRelease}
              style={arrowButtonStyle}
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
