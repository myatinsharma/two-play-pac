"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

export default function GameRoom({ params }) {
  const { roomId } = params; // Get roomId from URL params
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState({ Chaser: null, Chasee: null }); // Track role assignments
  const [gameStatus, setGameStatus] = useState("Waiting for roles...");

  const initialMaze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]; // A simple maze layout
  const [maze, setMaze] = useState(initialMaze);
  const [chaserPos, setChaserPos] = useState({ row: 1, col: 1 }); // Initial position for "Chaser"
  const [chaseePos, setChaseePos] = useState({ row: 6, col: 7 }); // Initial position for "Chasee"

  useEffect(() => {
    if (!roomId) return;

    // Initialize the socket connection once
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    // Join the specific room
    socket.emit("joinRoom", roomId);

    // Listen for updates on the room (e.g., when players join)
    socket.on("roomData", (data) => {
      setPlayers(data.players);
    });

    // Listen for role selection
    socket.on("roleChosen", ({ role, player }) => {
      setRoles((prevRoles) => ({ ...prevRoles, [role]: player }));
    });

    // Listen for game start event
    socket.on("startGame", (message) => {
      setGameStatus(message);
      // You can add any further initialization for the game here
    });

    // Listen for "room full" error
    socket.on("roomFull", (message) => {
      alert(message);
      socket.disconnect(); // Disconnect if room is full
    });

    return () => {
      socket.off("roomData");
      socket.off("roleChosen");
      socket.off("startGame");
      socket.off("roomFull");
      socket.disconnect(); // Ensure socket is properly disconnected
    };
  }, [roomId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (role === "Chaser") {
        setChaserPos((prevPos) => movePlayer(prevPos, event.key));
      } else if (role === "Chasee") {
        setChaseePos((prevPos) => movePlayer(prevPos, event.key));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [role]);

  const movePlayer = (pos, key) => {
    let newRow = pos.row;
    let newCol = pos.col;

    // Update the position based on arrow keys
    if (key === "ArrowUp") newRow--;
    else if (key === "ArrowDown") newRow++;
    else if (key === "ArrowLeft") newCol--;
    else if (key === "ArrowRight") newCol++;

    // Ensure new position is within the maze and not a wall
    if (maze[newRow] && maze[newRow][newCol] !== 1) {
      return { row: newRow, col: newCol };
    }

    // Return previous position if movement is invalid
    return pos;
  };

  // Role selection logic
  const chooseRole = (selectedRole) => {
    socket.emit("chooseRole", { roomId, role: selectedRole });
    setRole(selectedRole);
  };

  // Render the maze grid
  const renderMaze = () => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${maze[0].length}, 20px)`,
        }}
      >
        {maze.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let backgroundColor = "white";
            if (rowIndex === chaserPos.row && colIndex === chaserPos.col) {
              backgroundColor = "blue"; // Chaser
            } else if (
              rowIndex === chaseePos.row &&
              colIndex === chaseePos.col
            ) {
              backgroundColor = "red"; // Chasee
            } else if (cell === 1) {
              backgroundColor = "black"; // Wall
            } else if (cell === 2) {
              backgroundColor = "yellow"; // Ball
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
    );
  };

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <p>Players: {players.length}</p>
      <p>Status: {gameStatus}</p>
      {gameStatus === "Both roles chosen. Game starting!" && (
        <div>
          <h3>Game Board</h3>
          {renderMaze()}
        </div>
      )}
      ß
      {!role && (
        <div>
          <button
            onClick={() => chooseRole("Chaser")}
            disabled={roles.Chaser !== null}
          >
            Chaser
          </button>
          <button
            onClick={() => chooseRole("Chasee")}
            disabled={roles.Chasee !== null}
          >
            Chasee
          </button>
        </div>
      )}
    </div>
  );
}
