import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
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

    // Check if the room is full
    if (rooms[roomId].players.length >= 2) {
      // Emit an error message back to the client and disconnect them
      socket.emit("roomFull", "Room is full. Cannot join.");
      socket.disconnect();
      return;
    }

    // Add player to the room only if they aren't already added
    if (!rooms[roomId].players.includes(socket.id)) {
      rooms[roomId].players.push(socket.id);
    }

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
        // Remove player from room
        rooms[roomId].players = rooms[roomId].players.filter(
          (id) => id !== socket.id
        );
        // Notify remaining players
        io.to(roomId).emit("roomData", { players: rooms[roomId].players });

        // Clean up the room if no players left
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });
});

httpServer.listen(3001, () => {
  console.log("Socket.io server running on port 3001");
});
