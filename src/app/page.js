"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [savedRoom, setSavedRoom] = useState(null);

  useEffect(() => {
    const savedRoomId = localStorage.getItem("roomOwner");
    if (savedRoomId) {
      setSavedRoom(savedRoomId);
    }
  }, []);

  const handleCreateRoom = () => {
    const newRoomId = `room-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("roomOwner", newRoomId);
    router.push(`/game/${newRoomId}`);
  };

  const handleRemoveRoom = () => {
    localStorage.removeItem("roomOwner");
    setSavedRoom(null);
  };

  return (
    <div>
      <h1>Welcome to the Maze Chase Game!</h1>
      {savedRoom ? (
        <div>
          <p>Saved Room ID: {savedRoom}</p>
          <button onClick={() => router.push(`/game/${savedRoom}`)}>
            Rejoin Room
          </button>
          <button onClick={handleRemoveRoom}>Remove Room</button>
        </div>
      ) : (
        <button onClick={handleCreateRoom}>Create New Room</button>
      )}
    </div>
  );
}
