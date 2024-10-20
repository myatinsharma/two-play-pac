import { useEffect, useState } from "react";
import { GAME_STATUS, PLAYER_ROLES } from "../constants";

export default function GameSettings({
  isRoomOwner,
  settingsData,
  role,
  gameStatus,
  handleSettingsChange,
}) {
  const [settingOptionsData, setSettingOptionsData] = useState({});
  const [settingOptionsLoaded, setSettingOptionsLoaded] = useState(false);

  useEffect(() => {
    fetch("/settings.json")
      .then((response) => response.json())
      .then((data) => {
        setSettingOptionsData(data);
        setSettingOptionsLoaded(true);
      });
  }, []);
  return (
    settingOptionsLoaded && (
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Time Limit:
            <select
              name="timeLimit"
              onChange={handleSettingsChange}
              disabled={!isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED}
              value={settingsData ? settingsData.timeLimit : ""}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {settingOptionsData.timeLimits.map((timeLimit) => (
                <option key={timeLimit.value} value={timeLimit.value}>
                  {timeLimit.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            S'more Count:
            <select
              name="smoreCount"
              onChange={handleSettingsChange}
              disabled={!isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED}
              value={settingsData ? settingsData.smoreCount : ""}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {settingOptionsData.smoreCounts.map((smoreCount) => (
                <option key={smoreCount.value} value={smoreCount.value}>
                  {smoreCount.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Rounds:
            <select
              name="totalRounds"
              onChange={handleSettingsChange}
              disabled={!isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED}
              value={settingsData ? settingsData.totalRounds : ""}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {settingOptionsData.totalRounds.map((totalRound) => (
                <option key={totalRound.value} value={totalRound.value}>
                  {totalRound.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Maze:
            <select
              name="maze"
              onChange={handleSettingsChange}
              disabled={!isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED}
              value={settingsData ? settingsData.maze : ""}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {settingOptionsData.maze.map((maze) => (
                <option key={maze.value} value={maze.value}>
                  {maze.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Your Role:
            <select
              name="role"
              onChange={handleSettingsChange}
              disabled={!isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED}
              value={role}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {settingOptionsData.roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label} {role.value === PLAYER_ROLES.CHASER ? "🔵" : "🔴"}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>
    )
  );
}
