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
    const roomId = `${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("roomOwner", roomId);
    router.push(`/game/${roomId}`);
  };

  const handleRemoveRoom = () => {
    localStorage.removeItem("roomOwner");
    setSavedRoom(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome to the Maze Chase Game!</h1>
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        {savedRoom ? (
          <div className="space-y-4">
            <p className="text-lg">Saved Room ID: <span className="font-semibold">{savedRoom}</span></p>
            <button
              onClick={() => router.push(`/game/${savedRoom}`)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Rejoin Room
            </button>
            <button
              onClick={handleRemoveRoom}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Remove Room
            </button>
          </div>
        ) : (
          <button
            onClick={handleCreateRoom}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Create New Room
          </button>
        )}
      </div>
    </div>
  );
}
