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

    socket = io("http://localhost:80");
    socket.emit("joinRoom", { roomId, settings: settingsData });

    socket.on("roomData", (data) => {
      console.log("roomData", data);
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

  //position of chaser and chasee
  useEffect(() => {
    const handleKeyDown = (event) => {
      let newPos;

      if (role === PLAYER_ROLES.CHASER) {
        newPos = movePlayer(chaserPos, event.key);
        setChaserPos(newPos);
        socket.emit("playerMove", { roomId, role: "Chaser", newPos });
      } else if (role === PLAYER_ROLES.CHASEE) {
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

  const handlePlayerMove = (event) => {
    let newPos;

    if (role === PLAYER_ROLES.CHASER) {
      newPos = movePlayer(chaserPos, event.key);
      setChaserPos(newPos);
      socket.emit("playerMove", { roomId, role: "Chaser", newPos });
    } else if (role === PLAYER_ROLES.CHASEE) {
      newPos = movePlayer(chaseePos, event.key);
      setChaseePos(newPos);
      socket.emit("playerMove", { roomId, role: "Chasee", newPos });
    }
  };

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
        settingsData && <button onClick={startGame}>Start Game</button>}
      {gameStatus === GAME_STATUS.STARTED &&
        settingsData &&
        players.length === 2 && (
          <>
            <GameBoard
              players={players}
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
