const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const redis = require("redis");

// Create a Redis client
const client = redis.createClient({
  url: "redis://127.0.0.1:6379",
});

// Handle connection errors
client.on("error", (err) => {
  console.error("Redis client error:", err);
});

// Connect to Redis
client.connect().catch((err) => {
  console.error("Error connecting to Redis:", err);
});

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { InMemorySessionStore } = require("./storage/sessionStore");
const sessionStore = new InMemorySessionStore();

const { InMemoryMessageStore } = require("./storage/messageStore");
const messageStore = new InMemoryMessageStore();

// Log successful connection
client.on("connect", async () => {
  console.log("Connecting to Redis...");
  //get users
  await client.get("sessions").then((sessions) => {
    const oldSessions = JSON.parse(sessions);
    if (oldSessions?.length > 0) {
      sessionStore.setSessions(oldSessions);
      console.log(oldSessions);
    }
  });
  // get messages
  await client.get("messages").then((messages) => {
    let oldMessages = JSON.parse(messages);
    if (messages?.length > 0) {
      messageStore.setMessages(oldMessages);
      // console.log(oldMessages);
    }
  });
});

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.email = session.email;
      socket.name = session.name;
      socket.blockedUsers = session.blockedUsers;
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
  socket.blockedUsers = user.blockedUsers;
  next();
});

io.on("connection", async (socket) => {
  console.log("user connected");
  // persist session
  const sessions = sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    email: socket.email,
    name: socket.name,
    phoneNumber: socket.phoneNumber,
    connected: true,
  });

  await client.set("sessions", JSON.stringify(sessions));
  
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
      // console.log(message);
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
  socket.on("private message", async ({ message, to }) => {
    const newMessage = {
      message,
      from: socket.userID,
      to,
    };
    socket
      .to(to)
      .to(socket.userID)
      .emit("private message", newMessage);
    let newMessages = messageStore.saveMessage(newMessage);
    await client.set("messages", JSON.stringify(newMessages));
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
