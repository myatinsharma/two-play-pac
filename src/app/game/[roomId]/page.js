// Updated src/app/game/[roomId]/page.js
"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";

let socket;

export default function GameRoom({ params }) {
  const { roomId } = params;
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState({ Chaser: null, Chasee: null });
  const [gameStatus, setGameStatus] = useState("Waiting for roles...");
  const [gameSettings, setGameSettings] = useState({});
  const [settingsSelected, setSettingsSelected] = useState(false);
  const [isRoomOwner, setIsRoomOwner] = useState(false);

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
  const [chaserPos, setChaserPos] = useState({ row: 1, col: 1 });
  const [chaseePos, setChaseePos] = useState({ row: 6, col: 7 });

  useEffect(() => {
    const savedRoomId = localStorage.getItem("roomOwner");
    if (savedRoomId && !roomId) {
      // If a saved room exists, redirect or show the saved room
      router.push(`/game/${savedRoomId}`);
      return;
    }

    if (!roomId) return;

    socket = io("https://xyzatin.xyz");

    socket.emit("joinRoom", roomId);

    socket.on("roomData", (data) => {
      setPlayers(data.players);
      if (data.players[0] === socket.id) {
        setIsRoomOwner(true);
        localStorage.setItem("roomOwner", roomId);
      } else {
        localStorage.removeItem("roomOwner");
      }
    });

    socket.on("roleChosen", ({ role, player }) => {
      setRoles((prevRoles) => ({ ...prevRoles, [role]: player }));
    });

    socket.on("startGame", ({ message, settings }) => {
      setGameStatus(message);
      setGameSettings(settings);
    });

    socket.on("roomFull", (message) => {
      alert(message);
      socket.disconnect();
    });

    socket.on("settingsUpdate", (settings) => {
      setGameSettings(settings);
    });

    return () => {
      socket.off("roomData");
      socket.off("roleChosen");
      socket.off("startGame");
      socket.off("roomFull");
      socket.off("settingsUpdate");
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      let newPos;
      if (
        role === "Chaser" &&
        gameStatus === "Both roles chosen. Game starting!"
      ) {
        newPos = movePlayer(chaserPos, event.key);
        setChaserPos(newPos);
        socket.emit("playerMove", { roomId, role: "Chaser", newPos });
      } else if (
        role === "Chasee" &&
        gameStatus === "Both roles chosen. Game starting!"
      ) {
        newPos = movePlayer(chaseePos, event.key);
        setChaseePos(newPos);
        socket.emit("playerMove", { roomId, role: "Chasee", newPos });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    socket.on("playerMove", ({ role, newPos }) => {
      if (role === "Chaser") {
        setChaserPos(newPos);
      } else if (role === "Chasee") {
        setChaseePos(newPos);
      }
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      socket.off("playerMove");
    };
  }, [role, gameStatus, chaserPos, chaseePos]);

  const movePlayer = (pos, key) => {
    let newRow = pos.row;
    let newCol = pos.col;

    if (key === "ArrowUp") newRow--;
    else if (key === "ArrowDown") newRow++;
    else if (key === "ArrowLeft") newCol--;
    else if (key === "ArrowRight") newCol++;

    if (maze[newRow] && maze[newRow][newCol] !== 1) {
      return { row: newRow, col: newCol };
    }

    return pos;
  };

  const handleSettingsSubmit = (event) => {
    event.preventDefault();
    const settings = {
      timeLimit: event.target.timeLimit.value,
      smoreCount: event.target.smoreCount.value,
      totalRounds: event.target.totalRounds.value,
      initialRole: event.target.initialRole.value || "Chasee",
    };
    setSettingsSelected(true);
    setGameSettings(settings);
    socket.emit("gameSettings", { roomId, settings });
  };

  useEffect(() => {
    if (settingsSelected) {
      socket.emit("settingsUpdate", { roomId, settings: gameSettings });
    }
  }, [settingsSelected, gameSettings]);

  const startGame = () => {
    if (isRoomOwner) {
      socket.emit("startGame", { roomId });
    }
  };

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
              backgroundColor = "blue";
            } else if (
              rowIndex === chaseePos.row &&
              colIndex === chaseePos.col
            ) {
              backgroundColor = "red";
            } else if (cell === 1) {
              backgroundColor = "black";
            } else if (cell === 2) {
              backgroundColor = "yellow";
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
      {gameSettings && gameStatus === "Both roles chosen. Game starting!" && (
        <div style={{ marginBottom: "10px" }}>
          <h4>Game Settings:</h4>
          <p>Time Limit: {gameSettings.timeLimit} seconds</p>
          <p>S'more Count: {gameSettings.smoreCount}</p>
          <p>Total Rounds: {gameSettings.totalRounds}</p>
          <p>Initial Role: {gameSettings.initialRole}</p>
        </div>
      )}
      {!settingsSelected && isRoomOwner && (
        <form onSubmit={handleSettingsSubmit} style={{ marginBottom: "20px" }}>
          <label>
            Time Limit:
            <select
              name="timeLimit"
              style={{ marginLeft: "10px", marginBottom: "10px" }}
            >
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="120">2 minutes</option>
            </select>
          </label>
          <br />
          <label>
            S'more Count:
            <select
              name="smoreCount"
              style={{ marginLeft: "10px", marginBottom: "10px" }}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </label>
          <br />
          <label>
            Total Rounds:
            <select
              name="totalRounds"
              style={{ marginLeft: "10px", marginBottom: "10px" }}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </label>
          <br />
          <label>
            Initial Role:
            <select
              name="initialRole"
              style={{ marginLeft: "10px", marginBottom: "10px" }}
            >
              <option value="Chaser">Chaser</option>
              <option value="Chasee" selected>
                Chasee
              </option>
            </select>
          </label>
          <br />
          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Set Game Settings
          </button>
        </form>
      )}
      {isRoomOwner &&
        settingsSelected &&
        gameStatus === "Waiting for roles..." && (
          <button
            onClick={startGame}
            style={{
              padding: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            Start Game
          </button>
        )}
      {gameStatus === "Both roles chosen. Game starting!" && (
        <div>
          <h3>Game Board</h3>
          {renderMaze()}
        </div>
      )}
    </div>
  );
}
