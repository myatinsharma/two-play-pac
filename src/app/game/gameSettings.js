import { useEffect, useState } from "react";
import { GAME_STATUS, PLAYER_ROLES } from "../constants";

export default function GameSettings({
  isRoomOwner,
  settingsData,
  role,
  gameStatus,
  handleSettingsChange,
}) {
  const [settingOptionsData, setSettingOptionsData] = useState(null);

  useEffect(() => {
    fetch("/settings.json")
      .then((response) => response.json())
      .then((data) => {
        setSettingOptionsData(data);
      })
      .catch((error) => console.error("Error loading settings:", error));
  }, []);

  if (!settingOptionsData) {
    return <div>Loading settings...</div>;
  }

  const settingsFields = [
    { name: "timeLimit", label: "Time Limit", optionsKey: "timeLimits" },
    { name: "smoreCount", label: "S'more Count", optionsKey: "smoreCounts" },
    { name: "totalRounds", label: "Total Rounds", optionsKey: "totalRounds" },
    { name: "maze", label: "Maze", optionsKey: "maze" },
    { name: "role", label: "Your Role", optionsKey: "roles" },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Game Settings</h3>
      <form className="space-y-2">
        {settingsFields.map((setting) => {
          const options = settingOptionsData[setting.optionsKey] || [];

          return (
            <div key={setting.name} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 w-1/2">
                {setting.label}:
              </label>
              <select
                name={setting.name}
                onChange={handleSettingsChange}
                disabled={!isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED}
                value={setting.name === "role" ? role : (settingsData ? settingsData[setting.name] : "")}
                className="w-1/2 text-sm border-gray-300 rounded-md"
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {setting.name === "role" && (option.value === PLAYER_ROLES.CHASER ? "🔵" : "🔴")}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </form>
    </div>
  );
}
