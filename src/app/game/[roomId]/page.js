"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import GameSettings from "../gameSettings";
import GameBoard from "../gameBoard";
import {
  GAME_STATUS,
  GAME_STATUS_DESCRIPTION,
  PLAYER_ROLES,
} from "../../constants";

let socket;

export default function GameRoom({ params }) {
  const { roomId } = params;
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState(null);
  const [playerPos, setPlayerPos] = useState(null);
  const [playersPos, setPlayersPos] = useState(null);
  const [role, setRole] = useState(null);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.NOT_STARTED);
  const [settingsData, setGameSettings] = useState({
    timeLimit: "30",
    smoreCount: "2",
    totalRounds: "3",
  });
  const [isRoomOwner, setIsRoomOwner] = useState(false);

  useEffect(() => {
    const savedRoomId = localStorage.getItem("roomOwner");
    if (savedRoomId && !roomId) {
      router.push(`/game/${savedRoomId}`);
      return;
    }

    if (!roomId) return;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    socket.emit("joinRoom", { roomId, settings: settingsData });

    socket.on("roomData", (data) => {
      setShowLoader(false);
      setPlayers(data.players);
      const player = data.players.find((player) => player.id === socket.id);
      setPlayer(player);
      setServerConnected(true);

      if (
        data.players.find(
          (player) => player.id === socket.id && player.roomOwner
        )
      ) {
        setIsRoomOwner(true);
        localStorage.setItem("roomOwner", roomId);
      } else {
        setIsRoomOwner(false);
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

    socket.on("playerMove", (data) => {
      setPlayersPos(data);
    });

    return () => {
      socket.off("roomData");
      socket.off("roleChosen");
      socket.off("startGame");
      socket.off("roomFull");
      socket.off("settingsUpdate");
      socket.off("playerMove");
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (settingsData) setRole(settingsData.role);
  }, [settingsData]);

  const handleSettingsChange = (event) => {
    if (gameStatus === GAME_STATUS.STARTED) return;
    setShowLoader(true);
    const { name, value } = event.target;
    if (name === "role") {
      socket.emit("roleChosen", { roomId, role: parseInt(value) });
    } else {
      const updatedSettings = {
        ...settingsData,
        [name]: value,
      };
      socket.emit("gameSettings", { roomId, settings: updatedSettings });
    }
  };

  const startGame = () => {
    if (isRoomOwner) {
      socket.emit("startGame", { roomId });
    }
  };

  const handlePlayerMove = ({ row, col }) => {
    socket.emit("playerMove", { roomId, row, col });
  };

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <p>Server Connected: {serverConnected ? "Yes" : "No"}</p>
      <p>Players: {players.length}</p>
      <p>Status: {GAME_STATUS_DESCRIPTION[gameStatus]}</p>
      {serverConnected && (
        <GameSettings
          isRoomOwner={isRoomOwner}
          settingsData={settingsData}
          gameStatus={gameStatus}
          role={player.role}
          handleSettingsChange={handleSettingsChange}
        ></GameSettings>
      )}
      {isRoomOwner &&
      gameStatus === GAME_STATUS.NOT_STARTED &&
      settingsData &&
      players.length === 2 ? (
        <button onClick={startGame}>Start Game</button>
      ) : (
        <p>
          {isRoomOwner
            ? "Waiting for another user.."
            : "Waiting for game to start..."}
        </p>
      )}
      {gameStatus === GAME_STATUS.STARTED &&
        settingsData &&
        players.length === 2 && (
          <>
            <GameBoard
              playerPos={playerPos}
              playersPos={playersPos}
              role={player.role}
              handlePlayerMove={handlePlayerMove}
            />
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
