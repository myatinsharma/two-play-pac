"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import GameSettings from "../gameSettings";
import GameBoard from "../gameBoard";

let socket;

export default function GameRoom({ params }) {
  const { roomId } = params;
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState({ Chaser: null, Chasee: null });
  const [gameStatus, setGameStatus] = useState("GameNotStarted");
  const [settingsData, setGameSettings] = useState({
    timeLimit: "30",
    smoreCount: "2",
    totalRounds: "3",
    initialRole: "1",
  });
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const PLAYER_ROLES = Object.freeze({ CHASER: 1, CHASEE: 2 });

  useEffect(() => {
    const savedRoomId = localStorage.getItem("roomOwner");
    if (savedRoomId && !roomId) {
      router.push(`/game/${savedRoomId}`);
      return;
    }

    if (!roomId) return;

    socket = io("http://localhost:80");
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
      if (player !== socket.id) {
        setRole(role === "Chaser" ? "Chasee" : "Chaser");
      }
    });

    socket.on("startGame", ({ settings }) => {
      setGameStatus("GameStarted");
      setGameSettings(settings);
    });

    socket.on("roomFull", () => {
      alert("Room is full");
      socket.disconnect();
    });

    socket.on("settingsUpdate", (settings) => {
      setGameSettings(settings);
    });

    socket.on("playerMove", ({ role, newPos }) => {
      if (role === "Chaser") {
        setChaserPos(newPos);
      } else if (role === "Chasee") {
        setChaseePos(newPos);
      }
    });

    return () => {
      socket.off("roomData");
      socket.off("roleChosen");
      socket.off("startGame");
      socket.off("roomFull");
      socket.off("settingsUpdate");
      socket.off("playerMove");
      socket.off("gameSettings");
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    setRole(settingsData.initialRole);
  }, [settingsData]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      let newPos;

      if (role === "Chaser" && gameStatus === "GameStarted") {
        newPos = movePlayer(chaserPos, event.key);
        setChaserPos(newPos);
        socket.emit("playerMove", { roomId, role: "Chaser", newPos });
      } else if (role === "Chasee" && gameStatus === "GameStarted") {
        newPos = movePlayer(chaseePos, event.key);
        setChaseePos(newPos);
        socket.emit("playerMove", { roomId, role: "Chasee", newPos });
      }
    };

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

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [chaserPos, chaseePos]);

  const handleSettingsChange = (event) => {
    const { name, value } = event.target;
    const updatedSettings = { ...settingsData, [name]: value };
    socket.emit("gameSettings", { roomId, settings: updatedSettings });
  };

  const startGame = () => {
    if (isRoomOwner) {
      socket.emit("startGame", { roomId });
    }
  };

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <p>Players: {players.length}</p>
      <p>Status: {gameStatus}</p>
      <GameSettings
        isRoomOwner={isRoomOwner}
        settingsData={settingsData}
        handleSettingsChange={handleSettingsChange}
      ></GameSettings>

      {isRoomOwner && gameStatus === "GameNotStarted" && (
        <button onClick={startGame}>Start Game</button>
      )}
      {gameStatus === "GameStarted" && (
        <GameBoard playerPos={playerPos} role={role} />
      )}
    </div>
  );
}
