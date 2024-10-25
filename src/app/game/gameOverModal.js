export default function GameOverModal({ winner, socketId, onPlayAgain, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Game Over</h2>
        <div className={`p-4 rounded-lg mb-4 ${
          winner === socketId
            ? "bg-green-100 text-green-700"
            : winner === -1
            ? "bg-blue-100 text-blue-700"
            : "bg-red-100 text-red-700"
        }`}>
          {winner === socketId ? (
            <p className="text-center font-semibold">You won the game!</p>
          ) : winner === -1 ? (
            <p className="text-center font-semibold">It's a tie!</p>
          ) : (
            <p className="text-center font-semibold">You lost the game.</p>
          )}
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onPlayAgain}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Play Again
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
