"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [savedRoom, setSavedRoom] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const savedRoomId = localStorage.getItem("roomOwner");
    if (savedRoomId) {
      setSavedRoom(savedRoomId);
    }
  }, []);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    const roomId = `${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("roomOwner", roomId);
    await router.push(`/game/${roomId}`);
    setIsCreating(false);
  };

  const handleRemoveRoom = () => {
    localStorage.removeItem("roomOwner");
    setSavedRoom(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 w-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-indigo-800">
            Camper & Bear
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 mb-6">
              The game is played between two players: a Camper 🟥 and a Bear 🟦.
              The Camper's goal is to collect all the s'mores{" "}
              <span className="text-[9px]">🟡</span> on the board, while the
              Bear tries to catch the Camper before all s'mores are collected.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <span className="block text-2xl font-bold text-indigo-600">
                  2
                </span>
                <span className="text-sm text-gray-600">Players</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <span className="block text-2xl font-bold text-indigo-600">
                  4-5
                </span>
                <span className="text-sm text-gray-600">Minutes</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <span className="block text-2xl font-bold text-indigo-600">
                  All
                </span>
                <span className="text-sm text-gray-600">Ages</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8 border-2 border-indigo-100">
          {savedRoom ? (
            <div className="space-y-4">
              <p className="text-lg">
                Room ID:{" "}
                <span className="font-semibold text-indigo-600">
                  {savedRoom}
                </span>
              </p>
              <button
                onClick={() => router.push(`/game/${savedRoom}`)}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Rejoin Room
              </button>
              <button
                onClick={handleRemoveRoom}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Remove Room
              </button>
            </div>
          ) : (
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className={`w-full ${
                isCreating ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
              } text-white font-bold py-3 px-4 rounded-lg transition duration-200`}
            >
              {isCreating ? (
                <span className="flex items-center justify-center">
                  Creating room...
                  <svg
                    className="animate-spin ml-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : (
                "Create New Room"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
