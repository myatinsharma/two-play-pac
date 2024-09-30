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
      socket.join(roomId);

      // Initialize room data if not exists
      if (!rooms[roomId]) {
        rooms[roomId] = { players: [] };
      }

      // Add player to the room
      rooms[roomId].players.push(socket.id);

      // Notify players in the room
      io.to(roomId).emit("roomData", { players: rooms[roomId].players });

      // Handle role selection
      socket.on("chooseRole", ({ roomId, role }) => {
        rooms[roomId][role] = socket.id;
        io.to(roomId).emit("roleChosen", { role });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        if (rooms[roomId]) {
          rooms[roomId].players = rooms[roomId].players.filter(
            (id) => id !== socket.id
          );
          io.to(roomId).emit("roomData", { players: rooms[roomId].players });
        }
      });
    });
  });

  const port = process.env.PORT || 3000; // Ensure your server listens on the Next.js app port

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
