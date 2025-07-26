const express = require('express');
const { join } = require('path'); // Correct use of join from 'path'
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected with socket id:', socket.id);

  io.emit('insert_chat', { socketId: socket.id });

  socket.on('message', (msg) => {
    console.log('message: ' + msg);
    io.emit('send_messages_to_all_users', {
      senderId: socket.id,
      text: msg
    });
  });

  socket.on('typing', () => {
    socket.broadcast.emit('show_typing_status');
  });

  socket.on('stop_typing', () => {
    socket.broadcast.emit('clear_typing_status');
  });

  socket.on('disconnect', () => {
    console.log('Left the chat with socket id ' + socket.id);
    socket.broadcast.emit('left_chat', { socketId: socket.id });
  });
});

server.listen(3000, () => {
  console.log('listening on port: http://localhost:3000');
});