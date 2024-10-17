import { useEffect, useState } from "react";
import { GAME_STATUS } from "../constants";

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
      <form>
        <label>
          Time Limit:
          <select
            name="timeLimit"
            onChange={handleSettingsChange}
            disabled={!isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED}
            value={settingsData ? settingsData.timeLimit : ""}
          >
            {settingOptionsData.timeLimits.map((timeLimit) => (
              <option key={timeLimit.value} value={timeLimit.value}>
                {timeLimit.label}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          S'more Count:
          <select
            name="smoreCount"
            onChange={handleSettingsChange}
            disabled={!isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED}
            value={settingsData ? settingsData.smoreCount : ""}
          >
            {settingOptionsData.smoreCounts.map((smoreCount) => (
              <option key={smoreCount.value} value={smoreCount.value}>
                {smoreCount.label}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Total Rounds:
          <select
            name="totalRounds"
            onChange={handleSettingsChange}
            disabled={!isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED}
            value={settingsData ? settingsData.totalRounds : ""}
          >
            {settingOptionsData.totalRounds.map((totalRound) => (
              <option key={totalRound.value} value={totalRound.value}>
                {totalRound.label}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Maze:
          <select
            name="maze"
            onChange={handleSettingsChange}
            disabled={!isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED}
            value={settingsData ? settingsData.maze : ""}
          >
            {settingOptionsData.maze.map((maze) => (
              <option key={maze.value} value={maze.value}>
                {maze.label}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Your Role:
          <select
            name="role"
            onChange={handleSettingsChange}
            disabled={!isRoomOwner || gameStatus !== GAME_STATUS.NOT_STARTED}
            value={role}
          >
            {settingOptionsData.roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
      </form>
    )
  );
}
