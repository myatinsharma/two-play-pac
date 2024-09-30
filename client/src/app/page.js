"use client"; // Mark as client component to use state and effects

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const createRoom = () => {
    // Generate a unique room ID
    const roomId = Math.random().toString(36).substring(2, 10);
    // Redirect to the room's unique URL
    router.push(`/game/${roomId}`);
  };

  return (
    <div>
      <h1>Welcome to the Chaser Game!</h1>
      <button onClick={createRoom}>Create New Game Room</button>
    </div>
  );
}
