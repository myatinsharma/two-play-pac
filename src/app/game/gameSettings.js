import { useEffect, useState } from "react";

export default function GameSettings(props) {
  const [settingsData, setSettingsData] = useState({});
  const [defaultSettingsDataLoaded, setDefaultSettingsDataLoaded] =
    useState(false);

  useEffect(() => {
    fetch("/settings.json")
      .then((response) => response.json())
      .then((data) => {
        setSettingsData(data);
        setDefaultSettingsDataLoaded(true);
        props.defaultSettingsDataLoaded(true);
      });
  }, []);
  return (
    defaultSettingsDataLoaded && (
      <form onSubmit={props.handleSettingsSubmit}>
        <label>
          Time Limit:
          <select
            name="timeLimit"
            onChange={props.handleSettingsChange}
            disabled={!props.isRoomOwner}
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
            onChange={props.handleSettingsChange}
            disabled={!props.isRoomOwner}
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
            onChange={props.handleSettingsChange}
            disabled={!props.isRoomOwner}
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
          Initial Role:
          <select
            name="initialRole"
            onChange={props.handleSettingsChange}
            disabled={!props.isRoomOwner}
          >
            {settingsData.initialRoles.map((initialRole) => (
              <option key={initialRole.value} value={initialRole.value}>
                {initialRole.label}
              </option>
            ))}
          </select>
        </label>

        <br />
        {props.isRoomOwner && <button type="submit">Close Settings</button>}
      </form>
    )
  );
}
