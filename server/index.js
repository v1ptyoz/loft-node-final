const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const db = require('./models');

const server = http.createServer(app);
const io = require('socket.io').listen(server)

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '../build')));
app.use(express.static(path.join(__dirname, 'upload')))

require('./models/connection');

require('./auth/passport')

app.use('/api', require('./routes'));

app.use('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'))
})

const PORT = process.env.PORT || 3000;

server.listen(PORT, async function () {
    console.log(`Server running on port ${PORT}`);
    await db.dropAllMessages();
})

const connectedUsers = {};
const historyMessage = {};

io.on("connection", (socket) => {
  const socketId = socket.id;

  socket.on("users:connect", (data) => {
    const user = { ...data, activeRoom: null, socketId };
    connectedUsers[socketId] = user;
    console.log(connectedUsers);

    socket.emit("users:list", Object.values(connectedUsers));
    socket.broadcast.emit("users:add", user);
  });

  socket.on("message:add", (data) => {
    const { senderId, recipientId, roomId } = data;
    socket.emit("message:add", data);
    socket.broadcast.to(roomId).emit("message:add", data);
    addMessageHistory(senderId, recipientId, data);
    if (senderId !== recipientId) {
        addMessageHistory(recipientId, senderId, data)
    }
  });

  socket.on("disconnect", () => {
    delete connectedUsers[socketId];
    socket.broadcast.emit("users:leave", socketId);
  });

  socket.on("message:history", (data) => {
    const { userId, recipientId } = data;
    if (historyMessage[userId] && historyMessage[userId][recipientId]) {
      socket.emit("message:history", historyMessage[userId][recipientId]);
    }
  });
});

function addMessageHistory(senderId, recipientId, data) {
  if (historyMessage[senderId]) {
    if (historyMessage[senderId][recipientId]) {
      historyMessage[senderId][recipientId].push(data);
    } else {
      historyMessage[senderId][recipientId] = [];
      historyMessage[senderId][recipientId].push(data);
    }
  } else {
    historyMessage[senderId] = {};
    historyMessage[senderId][recipientId] = [];
    historyMessage[senderId][recipientId].push(data);
  }
}
