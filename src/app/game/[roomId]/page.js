"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import GameSettings from "../gameSettings";
import GameBoard from "../gameBoard";
import { GAME_STATUS, GAME_STATUS_DESCRIPTION } from "../../constants";

let socket;

export default function GameRoom({ params }) {
  const { roomId } = params;
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  const [players, setPlayers] = useState([]);
  const [playersPos, setPlayersPos] = useState(null);
  const [role, setRole] = useState(null);
  const [playerDisconnected, setPlayerDisconnected] = useState(false);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.NOT_STARTED);
  const [settingsData, setGameSettings] = useState(null);
  const [mazeMap, setMazeMap] = useState(null);
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
      console.log("roomData", data);
      if (data.status === GAME_STATUS.PLAYER_DISCONNECTED) {
        setPlayerDisconnected(true);
      }
      setShowLoader(false);
      setGameSettings(data.settings);
      setGameStatus(data.status);
      setMazeMap(data.mazeMap);
      setPlayers(data.players);
      setPlayersPos(data.playersPos);
      setRole(data.players.find((player) => player.id === socket.id).role);
      setServerConnected(true);

      if (data.roomOwner === socket.id) {
        setIsRoomOwner(true);
        localStorage.setItem("roomOwner", roomId);
      } else {
        setIsRoomOwner(false);
        localStorage.removeItem("roomOwner");
      }
    });

    socket.on("roleUpdate", ({ players }) => {
      setPlayers(players);
      setRole(players.find((player) => player.id === socket.id).role);
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

    socket.on("settingsUpdate", ({ settings, mazeMap }) => {
      setGameSettings(settings);
      setMazeMap(mazeMap);
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
          role={role}
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
        players.length === 2 &&
        mazeMap && (
          <>
            <GameBoard
              mazeMap={mazeMap}
              playersPos={playersPos}
              role={role}
              handlePlayerMove={handlePlayerMove}
            />
          </>
        )}
      {showLoader && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}
      {playerDisconnected && players.length === 1 && (
        <div className="player-disconnected-container">
          <p>Player Disconnected</p>
        </div>
      )}
    </div>
  );
}
