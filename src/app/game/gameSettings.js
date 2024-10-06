import { useEffect, useState } from "react";
import { getNonOwnerRole } from "../utils";

export default function GameSettings({
  isRoomOwner,
  settingsData,
  handleSettingsChange,
}) {
  const [settingOptionsData, setSettingOptionsData] = useState({});
  const [defaultSettingOptionsLoaded, setDefaultSettingOptionsLoaded] =
    useState(false);

  useEffect(() => {
    fetch("/settings.json")
      .then((response) => response.json())
      .then((data) => {
        setSettingOptionsData(data);
        setDefaultSettingOptionsLoaded(true);
      });
  }, []);
  return (
    defaultSettingOptionsLoaded && (
      <form>
        <label>
          Time Limit:
          <select
            name="timeLimit"
            onChange={handleSettingsChange}
            disabled={!isRoomOwner}
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
            disabled={!isRoomOwner}
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
            disabled={!isRoomOwner}
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
          Your Initial Role:
          <select
            name="initialRole"
            onChange={handleSettingsChange}
            disabled={!isRoomOwner}
            value={
              settingsData
                ? isRoomOwner
                  ? settingsData.initialRole
                  : getNonOwnerRole(settingsData.initialRole)
                : ""
            }
          >
            {settingOptionsData.initialRoles.map((initialRole) => (
              <option key={initialRole.value} value={initialRole.value}>
                {initialRole.label}
              </option>
            ))}
          </select>
        </label>
      </form>
    )
  );
}
