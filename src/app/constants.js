const PLAYER_ROLES = Object.freeze({ CHASER: 1, CHASEE: 2 });
const GAME_STATUS = Object.freeze({
  NOT_STARTED: 1,
  STARTED: 2,
  GAME_OVER: 3,
  PLAYER_DISCONNECTED: 4,
  TURN_STARTED: 6,
  TURN_COMPLETED: 7,
});

const GAME_STATUS_DESCRIPTION = Object.freeze({
  1: "Not Started",
  2: "Started",
  3: "Game Over",
  4: "Player Disconnected",
  5: "Turns Time Up",
  6: "Turn Started",
  7: "Turn Completed",
  8: "Round Completed",
});

export { GAME_STATUS, GAME_STATUS_DESCRIPTION, PLAYER_ROLES };
