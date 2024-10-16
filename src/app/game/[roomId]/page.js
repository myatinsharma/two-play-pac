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
  const [playersPos, setPlayersPos] = useState(null);
  const [role, setRole] = useState(null);
  const [winner, setWinner] = useState(null);
  const [playerDisconnected, setPlayerDisconnected] = useState(false);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.NOT_STARTED);
  const [settingsData, setGameSettings] = useState(null);
  const [mazeMap, setMazeMap] = useState(null);
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [score, setScore] = useState(null);

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
      setPlayersPos(data.playersPosition);
      setRole(data.players.find((player) => player.id === socket.id).role);
      if (data.players.length === 2) {
        setScoreboard(data.settings.totalRounds, data.players);
      }
      setServerConnected(true);

      if (data.roomOwner === socket.id) {
        setIsRoomOwner(true);
        localStorage.setItem("roomOwner", roomId);
      } else {
        setIsRoomOwner(false);
        localStorage.removeItem("roomOwner");
      }

      if (data.settings && data.settings.timeLimit) {
        setTimeRemaining(data.settings.timeLimit);
      }
    });

    socket.on("roleUpdate", ({ players }) => {
      console.log("roleUpdate", players);
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

    socket.on(
      "playerMove",
      ({ playersPosition, mazeMap, turnWinner, scores, gameStatus }) => {
        console.log("turnWinner..", turnWinner);
        console.log("scores..", scores);
        console.log("playersPosition..", playersPosition);
        console.log("mazeMap..", mazeMap);
        console.log("gameStatus..", gameStatus);
        setScore(scores);
        setMazeMap(mazeMap);
        setPlayersPos(playersPosition);
        //setWinner(turnWinner);
        setGameStatus(gameStatus);
      }
    );

    socket.on("timeUpdate", ({ timeRemaining }) => {
      setTimeRemaining(timeRemaining);
    });

    return () => {
      socket.off("roomData");
      socket.off("roleChosen");
      socket.off("startGame");
      socket.off("roomFull");
      socket.off("settingsUpdate");
      socket.off("playerMove");
      socket.off("timeUpdate");
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

  const setScoreboard = (totalRounds, players) => {
    const scoreboard = {};
    for (let i = 1; i <= totalRounds; i++) {
      scoreboard[i] = {
        1: { [players[0].id]: 0, [players[1].id]: 0 },
        2: { [players[0].id]: 0, [players[1].id]: 0 },
      };
    }
    setScore(scoreboard);
  };

  const handleNextTurn = () => {
    socket.emit("nextTurn", { roomId });
  };

  // Add this new function to render the scoreboard
  const renderScoreboard = () => {
    if (!score || (players && players.length !== 2)) return null;

    return (
      <table className="scoreboard">
        <thead>
          <tr>
            <th>Round</th>
            <th>Turn 1 - P1</th>
            <th>Turn 1 - P2</th>
            <th>Turn 2 - P1</th>
            <th>Turn 2 - P2</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(score).map(([round, turns]) => (
            <tr key={round}>
              <td>{round}</td>
              <td>{turns[1][players[0].id] || "-"}</td>
              <td>{turns[1][players[1].id] || "-"}</td>
              <td>{turns[2][players[0].id] || "-"}</td>
              <td>{turns[2][players[1].id] || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
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
        players.length === 2 && <button onClick={startGame}>Start Game</button>}
      {gameStatus === GAME_STATUS.NOT_STARTED && players.length === 1 && (
        <p>Waiting for another user..</p>
      )}
      {gameStatus === GAME_STATUS.NOT_STARTED &&
        players.length === 2 &&
        !isRoomOwner && <p>Waiting for another player to start..</p>}
      {(gameStatus === GAME_STATUS.GAME_OVER ||
        gameStatus === GAME_STATUS.TURNS_TIME_UP ||
        gameStatus === GAME_STATUS.ROUND_COMPLETED ||
        gameStatus === GAME_STATUS.TURN_COMPLETED ||
        (gameStatus === GAME_STATUS.STARTED && players.length === 2)) &&
        settingsData &&
        mazeMap && (
          <GameBoard
            mazeMap={mazeMap}
            playersPos={playersPos}
            role={role}
            handlePlayerMove={handlePlayerMove}
            gameStatus={gameStatus}
          />
        )}
      {showLoader && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}
      {(gameStatus === GAME_STATUS.TURN_COMPLETED ||
        gameStatus === GAME_STATUS.ROUND_COMPLETED) && (
        <div className="turn-completed-container">
          <button onClick={handleNextTurn}>Next Turn</button>
        </div>
      )}
      {playerDisconnected && players.length === 1 && (
        <div className="player-disconnected-container">
          <p>Player Disconnected</p>
        </div>
      )}
      {gameStatus === GAME_STATUS.GAME_OVER && (
        <div className="game-over-container">
          <p>Game Over</p>
        </div>
      )}
      {gameStatus === GAME_STATUS.GAME_OVER && winner === role && (
        <p>You won the game</p>
      )}
      {gameStatus === GAME_STATUS.GAME_OVER && winner !== role && (
        <p>You lost the game</p>
      )}
      {gameStatus === GAME_STATUS.TURNS_TIME_UP && <p>Time's up! No Winner</p>}
      {gameStatus === GAME_STATUS.GAME_OVER && (
        <button onClick={() => window.location.reload()}>Play Again</button>
      )}
      {gameStatus === GAME_STATUS.STARTED && timeRemaining !== null && (
        <div className="time-remaining">
          <p>Time Remaining: {timeRemaining} seconds</p>
        </div>
      )}
      <div className="scoreboard-container">
        <h3>Scoreboard</h3>
        {renderScoreboard()}
      </div>
    </div>
  );
}
