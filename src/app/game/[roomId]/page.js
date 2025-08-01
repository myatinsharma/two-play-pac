"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import GameSettings from "../gameSettings";
import GameBoard from "../gameBoard";
import { GAME_STATUS, GAME_STATUS_DESCRIPTION } from "../../constants";
import * as msgpack from "msgpack-lite";
import HowToPlayModal from "../howToPlayModal";
import GameOverModal from "../gameOverModal";
import ProgressBar from "../progressBar";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";

let socket;

const ROLE_NOTIFICATION_DURATION = 1500;
const FIRST_VISIT_KEY = "hasVisitedBefore";

// Optimized Socket.IO configuration
const socketOptions = {
  transports: ["websocket", "polling"], // Keep both for compatibility but prioritize websocket
  upgrade: true,
  rememberUpgrade: true,
  timeout: 20000,
  forceNew: false,
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
  compression: true,
  perMessageDeflate: true,
};

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
  const [currentRound, setCurrentRound] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [smorePositions, setSmorePositions] = useState([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [scores, setScores] = useState({});
  const [roleNotification, setRoleNotification] = useState(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Animation frame for smooth updates
  let animationFrame;
  const updateUISmooth = (updateFunction) => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    animationFrame = requestAnimationFrame(updateFunction);
  };

  useEffect(() => {
    const savedRoomId = localStorage.getItem("roomOwner");
    if (savedRoomId && !roomId) {
      router.push(`/game/${savedRoomId}`);
      return;
    }

    if (!roomId) return;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, socketOptions);
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
      setScores(data.scores);
      const newRole = data.players.find(
        (player) => player.id === socket.id
      ).role;
      if (newRole !== role) {
        setRole(newRole);
        setRoleNotification(
          newRole === 2 ? "You are Camper now!" : "You are Bear now!"
        );
        setTimeout(() => setRoleNotification(null), ROLE_NOTIFICATION_DURATION);
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
      const newRole = players.find((player) => player.id === socket.id).role;
      if (newRole !== role) {
        setRole(newRole);
        setRoleNotification(
          newRole === 2 ? "You are Camper now!" : "You are Bear now!"
        );
        setTimeout(() => setRoleNotification(null), ROLE_NOTIFICATION_DURATION);
      }
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
    });

    // Handle optimized position updates (frequent, small messages)
    socket.on("positionUpdate", (encodedData) => {
      try {
        const dataToDecode =
          encodedData instanceof Uint8Array ? encodedData.buffer : encodedData;
        const decodedData = msgpack.decode(new Uint8Array(dataToDecode));

        if (decodedData && decodedData.type === "position") {
          updateUISmooth(() => {
            setPlayersPos((prevPos) => ({
              ...prevPos,
              [decodedData.role]: decodedData.position,
            }));
          });
        }
      } catch (error) {
        console.error("Error decoding position update:", error);
      }
    });

    // Handle s'more eating events (medium size messages)
    socket.on("smoreEaten", (encodedData) => {
      try {
        const dataToDecode =
          encodedData instanceof Uint8Array ? encodedData.buffer : encodedData;
        const decodedData = msgpack.decode(new Uint8Array(dataToDecode));

        if (decodedData) {
          // Update only the changed fields
          if (decodedData.playersPosition) {
            setPlayersPos(decodedData.playersPosition);
          }
          if (decodedData.scores) {
            setScores(decodedData.scores);
          }
          if (decodedData.gameStatus !== undefined) {
            setGameStatus(decodedData.gameStatus);
          }
          if (decodedData.eatenSmore) {
            setSmorePositions((prevPositions) =>
              prevPositions.filter(
                (smore) =>
                  smore.row !== decodedData.eatenSmore.row ||
                  smore.col !== decodedData.eatenSmore.col
              )
            );
          }
        }
      } catch (error) {
        console.error("Error decoding smore eaten update:", error);
      }
    });

    // Handle game end events (full state messages)
    socket.on("gameEnd", (encodedData) => {
      try {
        const dataToDecode =
          encodedData instanceof Uint8Array ? encodedData.buffer : encodedData;
        const decodedData = msgpack.decode(new Uint8Array(dataToDecode));

        if (decodedData) {
          setScores(decodedData.scores);
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

          if (decodedData.gameStatus === GAME_STATUS.GAME_OVER) {
            setWinner(decodedData.winner);
            setShowGameOverModal(true);
          }
        }
      } catch (error) {
        console.error("Error decoding game end update:", error);
      }
    });

    // Keep backward compatibility with original playerMove event
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
      setScores(decodedData.scores);
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

      // Only set the winner and show the modal if the game status is GAME_OVER
      if (decodedData.gameStatus === GAME_STATUS.GAME_OVER) {
        setWinner(decodedData.winner);
        setShowGameOverModal(true);
      }
    });

    // Handle optimized time updates
    socket.on("timeUpdate", (encodedData) => {
      try {
        if (
          typeof encodedData === "object" &&
          encodedData.timeRemaining !== undefined
        ) {
          // Handle plain object (backward compatibility)
          setTimeRemaining(encodedData.timeRemaining);
        } else {
          // Handle MessagePack encoded data
          const dataToDecode =
            encodedData instanceof Uint8Array
              ? encodedData.buffer
              : encodedData;
          const decodedData = msgpack.decode(new Uint8Array(dataToDecode));

          if (decodedData && decodedData.type === "time") {
            setTimeRemaining(decodedData.timeRemaining);
          }
        }
      } catch (error) {
        console.error("Error decoding time update:", error);
        // Fallback to plain object handling
        if (encodedData && encodedData.timeRemaining !== undefined) {
          setTimeRemaining(encodedData.timeRemaining);
        }
      }
    });

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      socket.off("roomData");
      socket.off("roleChosen");
      socket.off("startGame");
      socket.off("roomFull");
      socket.off("settingsUpdate");
      socket.off("playerMove");
      socket.off("positionUpdate");
      socket.off("smoreEaten");
      socket.off("gameEnd");
      socket.off("timeUpdate");
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem(FIRST_VISIT_KEY);
    if (!hasVisitedBefore) {
      setShowHowToPlay(true);
      localStorage.setItem(FIRST_VISIT_KEY, "true");
    }
  }, []);

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

  const handleNextTurn = () => {
    socket.emit("nextTurn", { roomId });
  };

  const handlePlayAgain = () => {
    window.location.reload();
  };

  const handleCloseGameOverModal = () => {
    setShowGameOverModal(false);
  };

  const handleCloseHowToPlay = () => {
    setShowHowToPlay(false);
    localStorage.setItem(FIRST_VISIT_KEY, "true");
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold">{roomId}</h2>
        <h1 className="text-xl font-bold text-center text-blue-600">
          Camper and Bear
          <span className="text-[10px] font-normal text-gray-500 ml-2">
            (US only)
          </span>
        </h1>
        <button
          onClick={() => setShowHowToPlay(true)}
          className="w-6 h-6 rounded-full border border-blue-500 flex items-center justify-center text-blue-500 hover:bg-blue-100 text-xs font-semibold focus:outline-none"
        >
          ?
        </button>
      </div>
      {serverConnected && (
        <>
          <GameSettings
            isRoomOwner={isRoomOwner}
            settingsData={settingsData}
            gameStatus={gameStatus}
            role={role}
            handleSettingsChange={handleSettingsChange}
          />
          {players.length === 2 &&
            settingsData &&
            (gameStatus === GAME_STATUS.STARTED ||
              gameStatus === GAME_STATUS.TURN_STARTED ||
              gameStatus === GAME_STATUS.TURN_COMPLETED ||
              gameStatus === GAME_STATUS.GAME_OVER) && (
              <div className="mt-2">
                <ProgressBar
                  players={players}
                  scores={scores}
                  totalRounds={settingsData.totalRounds}
                  currentUserId={socket.id}
                />
              </div>
            )}
          {/* Timer container - always present to maintain layout */}
          <div className="h-[34px] mt-2 mb-0">
            {" "}
            {/* Fixed height container */}
            {(gameStatus === GAME_STATUS.STARTED ||
              gameStatus === GAME_STATUS.TURN_STARTED) &&
              timeRemaining !== null && (
                <div className="text-xs bg-yellow-100 border border-yellow-400 text-yellow-700 px-2 py-1 rounded text-center">
                  Time Remaining: {timeRemaining}s
                </div>
              )}
          </div>
        </>
      )}
      <div className="mt-0 relative">
        {/* Role notification overlay */}
        {roleNotification && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              className={`animate-fade-in-out px-4 py-2 rounded-lg text-lg font-bold text-center ${
                roleNotification.includes("Camper")
                  ? "bg-slate-200 bg-opacity-100 text-red-400"
                  : "bg-slate-200 bg-opacity-100 text-blue-400"
              }`}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              {roleNotification}
            </div>
          </div>
        )}

        {/* GameBoard */}
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
              handleNextTurn={handleNextTurn}
              startGame={startGame}
              isRoomOwner={isRoomOwner}
              settingsData={settingsData}
              players={players}
            />
          )}
        {/* Game controls and status messages */}
        <div className="mt-4 flex justify-center">
          {gameStatus === GAME_STATUS.NOT_STARTED && players.length === 1 && (
            <p className="text-sm font-semibold text-gray-600">
              Waiting for another user...
            </p>
          )}
          {(gameStatus === GAME_STATUS.NOT_STARTED ||
            gameStatus === GAME_STATUS.TURN_STARTED) &&
            players.length === 2 &&
            !isRoomOwner && (
              <p className="text-sm font-semibold text-gray-600">
                Waiting for room owner to start...
              </p>
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
      {showGameOverModal && (
        <GameOverModal
          winner={winner}
          socketId={socket.id}
          onPlayAgain={handlePlayAgain}
          onClose={handleCloseGameOverModal}
        />
      )}

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 text-[8px]">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            Server Connected: {serverConnected ? "Yes" : "No"} | Players:{" "}
            {players.length} | Status: {GAME_STATUS_DESCRIPTION[gameStatus]} |
            Current Round: {currentRound} | Current Turn: {currentTurn}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="text-blue-500 hover:text-blue-600 focus:outline-none"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setShowHowToPlay(true)}
              className="text-blue-500 hover:text-blue-600 focus:outline-none"
            >
              How to Play
            </button>
          </div>
        </div>
      </div>

      {showHowToPlay && <HowToPlayModal onClose={handleCloseHowToPlay} />}

      {isRoomOwner &&
        gameStatus === GAME_STATUS.NOT_STARTED &&
        settingsData &&
        players.length === 2 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded text-sm"
            >
              Start Game
            </button>
          </div>
        )}
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </div>
  );
}
