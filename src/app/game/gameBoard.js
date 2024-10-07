import React from "react";
import { useState } from "react";
function GameBoard({ players, role }) {
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
  //const [playerPos, setPlayerPos] = useState({ row: 1, col: 1 });
  const initialPositions = {
    chaserPos: { row: 1, col: 1 },
    chaseePos: { row: 1, col: 7 },
  };

  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     let newPos;

  //     if (role === "Chaser" && gameStatus === "GameStarted") {
  //       newPos = movePlayer(chaserPos, event.key);
  //       setChaserPos(newPos);
  //       socket.emit("playerMove", { roomId, role: "Chaser", newPos });
  //     } else if (role === "Chasee" && gameStatus === "GameStarted") {
  //       newPos = movePlayer(chaseePos, event.key);
  //       setChaseePos(newPos);
  //       socket.emit("playerMove", { roomId, role: "Chasee", newPos });
  //     }
  //   };

  //   const movePlayer = (pos, key) => {
  //     let newRow = pos.row;
  //     let newCol = pos.col;

  //     // Update the position based on arrow keys
  //     if (key === "ArrowUp") newRow--;
  //     else if (key === "ArrowDown") newRow++;
  //     else if (key === "ArrowLeft") newCol--;
  //     else if (key === "ArrowRight") newCol++;

  //     // Ensure new position is within the maze and not a wall
  //     if (maze[newRow] && maze[newRow][newCol] !== 1) {
  //       return { row: newRow, col: newCol };
  //     }

  //     // Return previous position if movement is invalid
  //     return pos;
  //   };

  //   window.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [chaserPos, chaseePos]);

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

            // if (rowIndex === chaserPos.row && colIndex === chaserPos.col) {
            //   backgroundColor = "blue"; // Chaser
            // } else if (
            //   rowIndex === chaseePos.row &&
            //   colIndex === chaseePos.col
            // ) {
            //   backgroundColor = "red"; // Chasee
            // } else
            if (cell === 1) {
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
