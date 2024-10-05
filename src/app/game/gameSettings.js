export default function GameSettings(props) {
  console.log("GameSettings props", props);
  return (
    <form onSubmit={props.handleSettingsSubmit}>
      <label>
        Time Limit:
        <select
          name="timeLimit"
          onChange={handleSettingsChange}
          disabled={!props.isRoomOwner}
        >
          {props.gameSettings.timeLimits.map((timeLimit) => (
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
          disabled={!props.isRoomOwner}
        >
          {props.gameSettings.smoreCounts.map((smoreCount) => (
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
          disabled={!props.isRoomOwner}
        >
          {props.gameSettings.totalRounds.map((totalRound) => (
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
          onChange={handleSettingsChange}
          disabled={!props.isRoomOwner}
        >
          {props.gameSettings.initialRoles.map((initialRole) => (
            <option key={initialRole.value} value={initialRole.value}>
              {initialRole.label}
            </option>
          ))}
        </select>
      </label>

      <br />
      {props.isRoomOwner && <button type="submit">Close Settings</button>}
    </form>
  );
}
