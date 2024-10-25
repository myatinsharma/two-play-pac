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

  const handleSettingChange = (event) => {
    const { name, value } = event.target;
    const numericSettings = [
      "timeLimit",
      "smoreCount",
      "totalRounds",
      "maze",
      "role",
    ];
    const newValue = numericSettings.includes(name) ? Number(value) : value;
    handleSettingsChange({ target: { name, value: newValue } });
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-2 mt-2">
      <div className="flex flex-wrap items-center text-xs">
        {settingsFields.map((setting) => {
          const options = settingOptionsData[setting.optionsKey] || [];
          return (
            <div
              key={setting.name}
              className={`mr-4 mb-1 ${
                setting.name === "role" ? "bg-yellow-100 p-1 rounded" : ""
              }`}
            >
              <label className="font-medium mr-1 text-gray-700">
                {setting.label}:
              </label>
              <select
                name={setting.name}
                value={
                  setting.name === "role"
                    ? role
                    : settingsData
                    ? settingsData[setting.name]
                    : ""
                }
                onChange={handleSettingChange}
                disabled={
                  !isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED
                }
                className={`border-gray-300 rounded-md ${
                  setting.name === "role" ? "bg-yellow-100" : ""
                }`}
              >
                {options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className={setting.name === "role" ? "bg-yellow-100" : ""}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
