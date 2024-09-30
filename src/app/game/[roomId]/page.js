"use client"; // Mark as client component

import { useRouter } from "next/navigation"; // Correct import for app directory
import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

export default function GameRoom({ params }) {
  const { roomId } = params; // Get roomId from URL params
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    // Initialize the socket connection
    socket = io();

    // Join the specific room
    socket.emit("joinRoom", roomId);

    // Listen for updates on the room (e.g., when players join)
    socket.on("roomData", (data) => {
      setPlayers(data.players);
    });

    return () => {
      socket.off("roomData");
    };
  }, [roomId]);

  // Role selection logic
  const chooseRole = (selectedRole) => {
    socket.emit("chooseRole", { roomId, role: selectedRole });
    setRole(selectedRole);
  };

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <p>Players: {players.length}</p>
      {role ? (
        <p>You are the {role}</p>
      ) : (
        <div>
          <button onClick={() => chooseRole("Chaser")}>Chaser</button>
          <button onClick={() => chooseRole("Chasee")}>Chasee</button>
        </div>
      )}
    </div>
  );
}
