const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./src/Actions");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'))   //middleware
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

const userSocketMap = {};

// Utility function to get all connected users in a room
function getAllConnectedUsers(roomID) {
  return Array.from(io.sockets.adapter.rooms.get(roomID) || []).map(socketID => {
    return {
      socketID,
      username: userSocketMap[socketID],
    };
  });
}

io.on('connection', (socket) => {
  console.log("Socket Connected ", socket.id);

  // Handle user joining a room
  socket.on(ACTIONS.JOIN, ({ roomID, username }) => {
    try {
      userSocketMap[socket.id] = username;
      socket.join(roomID);

      // Notify the new user about all connected users
      const users = getAllConnectedUsers(roomID);
      socket.emit(ACTIONS.JOINED, {
        users,
        username,
        socketID: socket.id,
      });

      // Notify all users in the room about the new user
      users.forEach(({ socketID }) => {
        if (socketID !== socket.id) {
          io.to(socketID).emit(ACTIONS.JOINED, {
            users,
            username,
            socketID: socket.id,
          });
        }
      });
    } catch (err) {
      console.error(`Error handling JOIN event: ${err}`);
    }
  });

  // Handle code changes
  socket.on(ACTIONS.CODE_CHANGE, ({ roomID, code }) => {
    try {
      console.log(`Code change in room ${roomID}: ${code}`);
      socket.to(roomID).emit(ACTIONS.CODE_CHANGE, { code });
    } catch (err) {
      console.error(`Error handling CODE_CHANGE event: ${err}`);
    }
  });

  // Handle code sync
  socket.on(ACTIONS.SYNC_CODE, ({ socketID, code }) => {
    try {
      io.to(socketID).emit(ACTIONS.CODE_CHANGE, { code });
    } catch (err) {
      console.error(`Error handling SYNC_CODE event: ${err}`);
    }
  });

  // Handle socket disconnecting
  socket.on('disconnecting', () => {
    try {
      const rooms = [...socket.rooms];
      rooms.forEach(roomID => {
        socket.to(roomID).emit(ACTIONS.DISCONNECTED, {
          socketID: socket.id,
          username: userSocketMap[socket.id],
        });
      });
      delete userSocketMap[socket.id];
    } catch (err) {
      console.error(`Error handling disconnecting event: ${err}`);
    }
  });

  // Handle final cleanup on socket disconnect
  socket.on('disconnect', () => {
    console.log(`Socket Disconnected: ${socket.id}`);
    // Additional cleanup if needed
  });

  // Handle socket errors
  socket.on('error', (err) => {
    console.error(`Socket error: ${err}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
