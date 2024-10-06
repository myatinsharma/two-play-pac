import React from "react";
import { useState } from "react";
function GameBoard({ playerPos, role }) {
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
  const [playerPos, setPlayerPos] = useState({ row: 1, col: 1 });
  const initialPositions = {
    chaserPos: { row: 1, col: 1 },
    chaseePos: { row: 1, col: 7 },
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
