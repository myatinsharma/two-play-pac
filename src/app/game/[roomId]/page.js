"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import GameSettings from "../gameSettings";
import GameBoard from "../gameBoard";

let socket;

export default function GameRoom({ params }) {
  const PLAYER_ROLES = Object.freeze({ CHASER: 1, CHASEE: 2 });
  const { roomId } = params;
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState({ Chaser: null, Chasee: null });
  const [gameStatus, setGameStatus] = useState("GameNotStarted");
  const [settingsData, setGameSettings] = useState({
    timeLimit: "30",
    smoreCount: "2",
    totalRounds: "3",
    role: 1,
  });
  const [isRoomOwner, setIsRoomOwner] = useState(false);

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
      console.log(data.players);
      if (data.players[0].id === socket.id) {
        setIsRoomOwner(true);
        localStorage.setItem("roomOwner", roomId);
      } else {
        localStorage.removeItem("roomOwner");
      }
    });

    socket.on("roleChosen", ({ role, player }) => {
      setRoles((prevRoles) => ({ ...prevRoles, [role]: player }));
      console.log("roles", roles);
      if (player !== socket.id) {
        setRole(role === "Chaser" ? "Chasee" : "Chaser");
      }
    });

    socket.on("startGame", ({ settings }) => {
      console.log("game started", settings);
      setGameStatus("GameStarted");
      setGameSettings(settings);
    });

    socket.on("roomFull", () => {
      alert("Room is full");
      socket.disconnect();
    });

    socket.on("settingsUpdate", (settings) => {
      setGameSettings(settings);
      setShowLoader(false);
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
      console.log("disconnected from room");
    };
  }, [roomId]);

  useEffect(() => {
    setRole(settingsData.role);
  }, [settingsData]);

  const handleSettingsChange = (event) => {
    setShowLoader(true);
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

      {isRoomOwner && gameStatus === "GameNotStarted" && settingsData && (
        <button onClick={startGame}>Start Game</button>
      )}
      {gameStatus === "GameStarted" && settingsData && (
        <GameBoard players={players} role={settingsData.role} />
      )}
      {showLoader && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
}
