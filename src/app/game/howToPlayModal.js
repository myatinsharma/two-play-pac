export default function HowToPlayModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-800">
          How to Play
        </h2>
        <div className="space-y-6">
          <section>
            <h3 className="text-2xl font-semibold mb-2 text-green-700">
              Objective
            </h3>
            <p className="text-gray-700">
              The game is played between two players: a Camper and a Bear. The
              Camper's goal is to collect all the s'mores on the board, while
              the Bear tries to catch the Camper before all s'mores are
              collected.
            </p>
          </section>
          <section>
            <h3 className="text-2xl font-semibold mb-2 text-green-700">
              Game Setup
            </h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>
                The room owner selects their initial role (Camper 🏕️ or Bear
                🐻).
              </li>
              <li>
                The room owner sets the time limit, number of s'mores, total
                rounds, and chooses the maze.
              </li>
              <li>
                The game board is generated based on the selected maze, with
                s'mores placed on the board.
              </li>
            </ul>
          </section>
          <section>
            <h3 className="text-2xl font-semibold mb-2 text-green-700">
              Gameplay
            </h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>
                Players take turns moving one square at a time (up, down, left,
                or right).
              </li>
              <li>The Camper collects s'mores by moving onto their squares.</li>
              <li>
                The Bear tries to move onto the same square as the Camper to
                catch them.
              </li>
              <li>
                The game ends when all s'mores are collected, the Camper is
                caught, or the time limit is reached.
              </li>
            </ul>
          </section>
          <section>
            <h3 className="text-2xl font-semibold mb-2 text-green-700">
              Scoring
            </h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>
                Camper wins if all s'mores are collected before being caught or
                time runs out.
              </li>
              <li>
                Bear wins if they catch the Camper before all s'mores are
                collected.
              </li>
              <li>If time runs out, the player with the most points wins.</li>
            </ul>
          </section>
        </div>
        <button
          onClick={onClose}
          className="mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
