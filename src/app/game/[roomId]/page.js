"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import GameSettings from "../gameSettings";
import GameBoard from "../gameBoard";
import { GAME_STATUS, GAME_STATUS_DESCRIPTION } from "../../constants";
import * as msgpack from "msgpack-lite";

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
  const [currentRound, setCurrentRound] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [smorePositions, setSmorePositions] = useState([]);

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
      setServerConnected(true);
      setShowLoader(false);
      setGameSettings(data.settings);
      setGameStatus(data.status);
      setMazeMap(data.mazeMap);
      setPlayers(data.players);
      setPlayersPos(data.playersPosition);
      setCurrentRound(data.currentRound);
      setCurrentTurn(data.currentTurn);
      setRole(data.players.find((player) => player.id === socket.id).role);
      if (data.players.length === 2) {
        if (data.currentRound === 1 && data.currentTurn === 1) {
          setScoreboard(data.settings.totalRounds, data.players);
        }
      }

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
      setSmorePositions(data.mazeMap.smorePositions || []);
    });

    socket.on("roleUpdate", ({ players }) => {
      setPlayers(players);
      setRole(players.find((player) => player.id === socket.id).role);
    });

    socket.on("startGame", ({ status }) => {
      if (
        status === GAME_STATUS.STARTED ||
        status === GAME_STATUS.TURN_STARTED
      ) {
        setGameStatus(status);
      }
    });

    socket.on("roomFull", () => {
      alert("Room is full");
      socket.disconnect();
    });

    socket.on("settingsUpdate", ({ settings, mazeMap, players }) => {
      setGameSettings(settings);
      setMazeMap(mazeMap);
      setSmorePositions(mazeMap.smorePositions || []);
      if (players.length === 2 && settings.totalRounds) {
        setScoreboard(settings.totalRounds, players);
      }
    });

    socket.on("playerMove", (encodedData) => {
      if (encodedData === undefined) {
        console.error("Received undefined encodedData in playerMove event");
        return;
      }

      const dataToDecode =
        encodedData instanceof Uint8Array ? encodedData.buffer : encodedData;
      const decodedData = msgpack.decode(new Uint8Array(dataToDecode));

      if (!decodedData) {
        console.error("Decoded data is null or undefined");
        return;
      }
      console.log("Decoded data:", decodedData);
      setScore(decodedData.scores);
      setPlayersPos(decodedData.playersPosition);
      setGameStatus(decodedData.gameStatus);

      if (decodedData.eatenSmore) {
        setSmorePositions((prevPositions) =>
          prevPositions.filter(
            (smore) =>
              smore.row !== decodedData.eatenSmore.row ||
              smore.col !== decodedData.eatenSmore.col
          )
        );
      }
      if (decodedData.winner !== undefined) {
        setWinner(decodedData.winner);
      }
    });

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
    if (
      gameStatus === GAME_STATUS.STARTED ||
      gameStatus === GAME_STATUS.TURN_STARTED
    ) {
      return;
    }

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

  // Update the renderScoreboard function
  const renderScoreboard = () => {
    if (!score || (players && players.length !== 2)) return null;

    return (
      <table className="scoreboard text-xs w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-1 border">Round</th>
            <th className="p-1 border">Turn 1</th>
            <th className="p-1 border">Turn 2</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(score).map(([round, turns]) => (
            <tr key={round}>
              <td className="p-1 border text-center">{round}</td>
              <td className="p-1 border text-center">{renderTurnResult(turns[1])}</td>
              <td className="p-1 border text-center">{renderTurnResult(turns[2])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderTurnResult = (turn) => {
    const player1Score = turn[players[0].id];
    const player2Score = turn[players[1].id];

    if (player1Score === -1 && player2Score === -1) {
      return "T";
    } else if (player1Score > 0) {
      return "P1";
    } else if (player2Score > 0) {
      return "P2";
    } else {
      return "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-4">Room: {roomId}</h2>
      <div className="text-xs mb-4">
        Server Connected: {serverConnected ? "Yes" : "No"} | Players:{" "}
        {players.length} | Status: {GAME_STATUS_DESCRIPTION[gameStatus]} |
        Current Round: {currentRound} | Current Turn: {currentTurn}
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-3/4">
          {/* Game Board */}
          {(gameStatus === GAME_STATUS.GAME_OVER ||
            gameStatus === GAME_STATUS.TURN_COMPLETED ||
            gameStatus === GAME_STATUS.STARTED ||
            gameStatus === GAME_STATUS.TURN_STARTED) &&
            players.length === 2 &&
            settingsData &&
            mazeMap && (
              <GameBoard
                mazeMap={mazeMap}
                playersPos={playersPos}
                role={role}
                handlePlayerMove={handlePlayerMove}
                gameStatus={gameStatus}
                smorePositions={smorePositions}
              />
            )}

          {/* Game controls and status messages */}
          <div className="mt-4">
            {isRoomOwner &&
              (gameStatus === GAME_STATUS.NOT_STARTED ||
                gameStatus === GAME_STATUS.TURN_STARTED) &&
              settingsData &&
              players.length === 2 && (
                <button
                  onClick={startGame}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Start Game
                </button>
              )}
            {gameStatus === GAME_STATUS.NOT_STARTED && players.length === 1 && (
              <p className="text-lg font-semibold text-gray-600">
                Waiting for another user...
              </p>
            )}
            {(gameStatus === GAME_STATUS.NOT_STARTED ||
              gameStatus === GAME_STATUS.TURN_STARTED) &&
              players.length === 2 &&
              !isRoomOwner && (
                <p className="text-lg font-semibold text-gray-600">
                  Waiting for another player to start...
                </p>
              )}
            {gameStatus === GAME_STATUS.TURN_COMPLETED && (
              <button
                onClick={handleNextTurn}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Next Turn
              </button>
            )}
          </div>

          {/* Scoreboard */}
          {players.length === 2 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">Scoreboard</h3>
              {renderScoreboard()}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/4">
          {/* Game Settings */}
          {serverConnected && (
            <GameSettings
              isRoomOwner={isRoomOwner}
              settingsData={settingsData}
              gameStatus={gameStatus}
              role={role}
              handleSettingsChange={handleSettingsChange}
            />
          )}
        </div>
      </div>

      {showLoader && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="loader"></div>
        </div>
      )}
      {playerDisconnected && players.length === 1 && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Player Disconnected</p>
        </div>
      )}
      {gameStatus === GAME_STATUS.GAME_OVER && (
        <div
          className={`mt-4 px-4 py-3 rounded ${
            winner === socket.id
              ? "bg-green-100 border border-green-400 text-green-700"
              : winner === -1
              ? "bg-blue-100 border border-blue-400 text-blue-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          <p className="font-bold">Game Over</p>
          {winner === socket.id ? (
            <p className="mt-2 text-green-600 font-semibold">
              You won the game!
            </p>
          ) : winner === -1 ? (
            <p className="mt-2 text-blue-600 font-semibold">It's a tie!</p>
          ) : (
            <p className="mt-2 text-red-600 font-semibold">
              You lost the game.
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Play Again
          </button>
        </div>
      )}
      {(gameStatus === GAME_STATUS.STARTED ||
        gameStatus === GAME_STATUS.TURN_STARTED) &&
        timeRemaining !== null && (
          <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-bold">Time Remaining: {timeRemaining} seconds</p>
          </div>
        )}
    </div>
  );
}
