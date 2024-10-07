"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import GameSettings from "../gameSettings";
import GameBoard from "../gameBoard";
import { GAME_STATUS } from "../../constants";

let socket;

export default function GameRoom({ params }) {
  const PLAYER_ROLES = Object.freeze({ CHASER: 1, CHASEE: 2 });

  const { roomId } = params;
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState({ Chaser: null, Chasee: null });
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.NOT_STARTED);
  const [settingsData, setGameSettings] = useState({
    timeLimit: "30",
    smoreCount: "2",
    totalRounds: "3",
    role: PLAYER_ROLES.CHASER,
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
    socket.emit("joinRoom", { roomId, settings: settingsData });

    socket.on("roomData", (data) => {
      setPlayers(data.players);
      if (data.players[0].id === socket.id) {
        setIsRoomOwner(true);
        localStorage.setItem("roomOwner", roomId);
      } else {
        localStorage.removeItem("roomOwner");
      }
    });

    socket.on("startGame", ({ status }) => {
      if (status === GAME_STATUS.STARTED) {
        setGameStatus(GAME_STATUS.STARTED);
      }
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
    };
  }, [roomId]);

  useEffect(() => {
    if (settingsData) setRole(settingsData.role);
  }, [settingsData]);

  const handleSettingsChange = (event) => {
    setShowLoader(true);
    const { name, value } = event.target;
    const updatedSettings = {
      ...settingsData,
      [name]: name === "role" ? parseInt(value) : value,
    };
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
        gameStatus={gameStatus}
        handleSettingsChange={handleSettingsChange}
      ></GameSettings>

      {isRoomOwner &&
        gameStatus === GAME_STATUS.NOT_STARTED &&
        settingsData && <button onClick={startGame}>Start Game</button>}
      {gameStatus === GAME_STATUS.STARTED && settingsData && (
        <>
          <GameBoard players={players} role={settingsData.role} />
        </>
      )}
      {showLoader && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
}
