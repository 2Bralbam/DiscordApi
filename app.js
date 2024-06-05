import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import { Server, Socket } from 'socket.io';
import http from 'http';
import cors from 'cors';

// Create an express app
const app = express();
app.use(cors());
var clients;
const server = http.createServer(app);
const io = new Server(server);
io.on('connection', (socket) => {
  clients = socket;
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(4332, () => {
  console.log('listening on *:4321');
});
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    const userId = req.body.member.user.username;
    let Json = {
      "username": userId,
      "command": "/test",
      "fecha": new Date().toISOString()
    }
    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      if (clients){
        clients.emit('msg', JSON.stringify(Json));
        console.log('clients is not null');
      }
      else{
        console.log('clients is null');
      }
      

      console.log("SE HA EJECUTADO /test");
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world ' + getRandomEmoji(),
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
