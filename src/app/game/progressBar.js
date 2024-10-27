import React from "react";

const ProgressBar = ({ players, scores, totalRounds, currentUserId }) => {
  const getWidth = (score) => {
    return (score / totalRounds) * 100;
  };

  const renderDivisions = (totalRounds) => {
    return Array.from({ length: totalRounds - 1 }, (_, index) => (
      <div
        key={index}
        className="absolute h-full border-r border-gray-300"
        style={{ left: `${((index + 1) / totalRounds) * 100}%` }}
      ></div>
    ));
  };

  return (
    <div className="flex space-x-2">
      {players.map((player, index) => (
        <div key={player.id} className="w-1/2">
          <div className="relative h-2 bg-gray-200 overflow-hidden">
            <div className="absolute inset-0 flex">
              {renderDivisions(totalRounds)}
            </div>
            <div
              className="h-full bg-orange-500 transition-all duration-300 ease-in-out"
              style={{
                width: `${getWidth(scores[player.id] || 0)}%`,
                ...(index === 1 ? { marginLeft: "auto", float: "right" } : {}),
              }}
            ></div>
            <span
              className={`absolute inset-0 flex items-center px-1 text-[8px] font-semibold text-black ${
                index === 1 ? "justify-end" : ""
              }`}
            >
              {player.id === currentUserId
                ? "You"
                : player.name || `Player ${index + 1}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
