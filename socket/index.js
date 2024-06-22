const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { InMemorySessionStore } = require("./storage/sessionStore");
const sessionStore = new InMemorySessionStore();

const { InMemoryMessageStore } = require("./storage/messageStore");
const messageStore = new InMemoryMessageStore();

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.email = session.email;
      socket.name = session.name;
      socket.phoneNumber = session.phoneNumber;
      return next();
    }
  }
  const user = socket.handshake.auth.user;
  if (!user.email) {
    return next(new Error("invalid email"));
  }

  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.email = user.email;
  socket.name = user.name;
  socket.phoneNumber = user.phoneNumber;
  next();
});

io.on("connection", (socket) => {
  // persist session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    email: socket.email,
    name: socket.name,
    phoneNumber: socket.phoneNumber,
    connected: true,
  });

  // emit session details
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  // join the "userID" room
  socket.join(socket.userID);

  // fetch existing users
  const users = [];
  //serverside store
  const messagesPerUser = new Map();
  messageStore
    .findMessagesForUser(socket.userID)
    .forEach((message) => {
      const { from, to } = message;
      const otherUser = socket.userID === from ? to : from;
      console.log(message);
      if (messagesPerUser.has(otherUser)) {
        messagesPerUser.get(otherUser).push(message);
      } else {
        messagesPerUser.set(otherUser, [message]);
      }
    });
  sessionStore.findAllSessions().forEach((session) => {
    users.push({
      userID: session.userID,
      email: session.email,
      name: session.name,
      phoneNumber: session.phoneNumber,
      connected: session.connected,
      messages: messagesPerUser.get(session.userID) || [],
    });
  });
  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    email: socket.email,
    name: socket.name,
    phoneNumber: socket.phoneNumber,
    connected: true,
    messages: [],
  });

  // forward the private message to the right recipient
  socket.on("private message", ({ message, to }) => {
    const newMessage = {
      message,
      from: socket.userID,
      to,
    };
    socket
      .to(to)
      .to(socket.userID)
      .emit("private message", newMessage);
    messageStore.saveMessage(newMessage);
  });

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.email);
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        email: socket.email,
        name: socket.name,
        phoneNumber: socket.phoneNumber,
        connected: false,
      });
    }
  });
});

const PORT = process.env.PORT || 8900;

httpServer.listen(PORT, () =>
  console.log(`server listening at http://localhost:${PORT}`)
);
