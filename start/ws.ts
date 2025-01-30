import app from '@adonisjs/core/services/app'
import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'
import logger from '@adonisjs/core/services/logger';

app.ready(() => {
  const io = new Server(server.getNodeServer(), {
    cors: {
      origin: '*',
    },
  });
  io.on('connection', (socket) => {
    logger.info(`ID ${socket.id} Connected`);
  });
});
