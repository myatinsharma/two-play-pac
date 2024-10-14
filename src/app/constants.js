const PLAYER_ROLES = Object.freeze({ CHASER: 1, CHASEE: 2 });
const GAME_STATUS = Object.freeze({
  NOT_STARTED: 1,
  STARTED: 2,
  GAME_OVER: 3,
  PLAYER_DISCONNECTED: 4,
  TURNS_TIME_UP: 5,
  TURN_COMPLETED: 6,
});

const GAME_STATUS_DESCRIPTION = Object.freeze({
  1: "Not Started",
  2: "Started",
  3: "Game Over",
  4: "Player Disconnected",
  5: "Turns Time Up",
  6: "Turn Completed",
});

export { GAME_STATUS, GAME_STATUS_DESCRIPTION, PLAYER_ROLES };
