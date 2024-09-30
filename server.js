const next = require("next");
const { createServer } = require("http");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  const rooms = {}; // Track rooms and players

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join room
    socket.on("joinRoom", (roomId) => {
      // Initialize room data if not exists
      if (!rooms[roomId]) {
        rooms[roomId] = { players: [] };
      }

      // Check if the room is already full
      if (rooms[roomId].players.length >= 2) {
        // Emit an error message back to the client
        socket.emit("roomFull", "Room is full. Cannot join.");
        // Disconnect the socket to prevent joining
        socket.disconnect(true); // Use `true` to forcefully close the socket
        return;
      }

      // Add player to the room
      rooms[roomId].players.push(socket.id);
      socket.join(roomId);

      // Notify players in the room
      io.to(roomId).emit("roomData", { players: rooms[roomId].players });

      // Handle role selection
      // Handle role selection
      socket.on("chooseRole", ({ roomId, role }) => {
        // Ensure role is not already chosen
        if (!rooms[roomId][role]) {
          rooms[roomId][role] = socket.id;

          // Notify both clients about the role selection
          io.to(roomId).emit("roleChosen", { role, player: socket.id });

          // Check if both roles are filled
          if (rooms[roomId]["Chaser"] && rooms[roomId]["Chasee"]) {
            // Start the game when both roles are chosen
            io.to(roomId).emit(
              "startGame",
              "Both roles chosen. Game starting!"
            );
          }
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        if (rooms[roomId]) {
          rooms[roomId].players = rooms[roomId].players.filter(
            (id) => id !== socket.id
          );
          io.to(roomId).emit("roomData", { players: rooms[roomId].players });

          // Clean up room data if empty
          if (rooms[roomId].players.length === 0) {
            delete rooms[roomId];
          }
        }
      });
    });
  });

  const port = process.env.PORT || 3000; // Ensure your server listens on the Next.js app port

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
