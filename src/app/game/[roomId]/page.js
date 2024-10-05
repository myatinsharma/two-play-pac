"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import GameSettings from "../gameSettings";

let socket;

export default function GameRoom({ params }) {
  const { roomId } = params;
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState({ Chaser: null, Chasee: null });
  const [gameStatus, setGameStatus] = useState("GameNotStarted");
  const [gameSettings, setGameSettings] = useState({});
  const [defaultSettingLoaded, setDefaultSettingLoaded] = useState(false);
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
    console.log("GameRoom useEffect roomId", roomId);
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
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    fetch("/settings.json")
      .then((response) => response.json())
      .then((data) => {
        setGameSettings(data);
        setDefaultSettingLoaded(true);
      });
  }, []);

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
  }, [role, gameStatus, chaserPos, chaseePos, roomId]);

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
      {defaultSettingLoaded && !settingsSelected && (
        <GameSettings
          isRoomOwner={isRoomOwner}
          gameSettings={gameSettings}
          handleSettingsSubmit={handleSettingsSubmit}
        ></GameSettings>
      )}
      {isRoomOwner && settingsSelected && gameStatus === "GameNotStarted" && (
        <button onClick={startGame}>Start Game</button>
      )}
      {gameStatus === "GameStarted" && (
        <div>
          <h3>Game Board</h3>
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
                  backgroundColor = "blue"; // Chaser
                } else if (
                  rowIndex === chaseePos.row &&
                  colIndex === chaseePos.col
                ) {
                  backgroundColor = "red"; // Chasee
                } else if (cell === 1) {
                  backgroundColor = "black"; // Wall
                } else if (cell === 2) {
                  backgroundColor = "yellow"; // S'more
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
        </div>
      )}
    </div>
  );
}
