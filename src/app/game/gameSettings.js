import { useEffect, useState } from "react";
import { getNonOwnerRole } from "../utils";

export default function GameSettings({
  selectedSettingOptions,
  defaultSettingsDataLoaded,
  isRoomOwner,
  handleSettingsSubmit,
  handleSettingsChange,
}) {
  const [settingsData, setSettingsData] = useState({});
  const [defaultSettingOptionsLoaded, setDefaultSettingOptionsLoaded] =
    useState(false);

  useEffect(() => {
    fetch("/settings.json")
      .then((response) => response.json())
      .then((data) => {
        setSettingsData(data);
        setDefaultSettingOptionsLoaded(true);
        defaultSettingsDataLoaded(true);
      });
  }, []);
  return (
    defaultSettingOptionsLoaded && (
      <form onSubmit={handleSettingsSubmit}>
        <label>
          Time Limit:
          <select
            name="timeLimit"
            onChange={handleSettingsChange}
            disabled={!isRoomOwner}
            value={
              selectedSettingOptions ? selectedSettingOptions.timeLimit : ""
            }
          >
            {settingsData.timeLimits.map((timeLimit) => (
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
            value={
              selectedSettingOptions ? selectedSettingOptions.smoreCount : ""
            }
          >
            {settingsData.smoreCounts.map((smoreCount) => (
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
            value={
              selectedSettingOptions ? selectedSettingOptions.totalRounds : ""
            }
          >
            {settingsData.totalRounds.map((totalRound) => (
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
              selectedSettingOptions
                ? isRoomOwner
                  ? selectedSettingOptions.initialRole
                  : getNonOwnerRole(selectedSettingOptions.initialRole)
                : ""
            }
          >
            {settingsData.initialRoles.map((initialRole) => (
              <option key={initialRole.value} value={initialRole.value}>
                {initialRole.label}
              </option>
            ))}
          </select>
        </label>

        <br />
        
      </form>
    )
  );
}
