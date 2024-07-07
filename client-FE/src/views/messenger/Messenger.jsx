import "./messenger.css";
import Message from "../../components/message/Message";
import Send from "../../assets/icons/send.svg";
import { useCallback, useEffect, useRef, useState } from "react";
import SideBar from "../../layout/side-bar/SideBar";
import { io } from "socket.io-client";
import NoAvatar from "../../components/no-avatar/NoAvatar";
import Rightbar from "../../layout/right-bar/Rightbar";
import { register } from "../../utils/storage";

export default function Messenger() {
  const [openRightBar, setOpenRightBar] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const socket = useRef();
  const scrollRef = useRef();

  const initReactiveProperties = (user) => {
    user.connected = true;
    user.messages = [];
    user.blockedUsers = [];
    user.hasNewMessages = false;
  };

  useEffect(() => {
    let currUser = JSON.parse(localStorage.getItem("user")) || null;
    setUser(currUser);
  }, []);

  const blockUser = (chat) => {
    let update = user;
    update.blockedUsers ? update.blockedUsers.push(chat) : [chat];
    setUser(update);
    register(update);
  };
  const unblock = (chat) => {
    let update = user;
    // console.log(chat, update);
    update.blockedUsers = update.blockedUsers?.filter(
      (u) => u.email !== chat.email
    );
    setUser(update);
    register(update);
  };

  //Initial socket connection
  useEffect(() => {
    const sessionID = localStorage.getItem("sessionID");
    socket.current = io("http://localhost:8900");
    if (sessionID) {
      //auth user with sessionID
      socket.current.auth = { sessionID };
      socket.current.connect();
    } else {
      let currUser = JSON.parse(localStorage.getItem("user"));
      socket.current.auth = { user: currUser };
      console.log(currUser);
      socket.current.connect();
    }

    socket.current.on("session", ({ sessionID, userID }) => {
      // attach the session ID to the next reconnection attempts
      socket.current.auth = { sessionID };
      // store it in the localStorage
      localStorage.setItem("sessionID", sessionID);
      // save the ID of the user
      socket.current.userID = userID;
    });
    return () => {
      socket.current.disconnect();
    };
  }, []);

  //listeners
  useEffect(() => {
    socket.current.on("connect", () => {
      users.forEach((user) => {
        if (user.self) {
          user.connected = true;
          updateUser(user);
        }
      });
    });

    socket.current.on("disconnect", () => {
      users.forEach((user) => {
        if (user.self) {
          user.connected = false;
          updateUser(user);
          setUser({ user: user });
        }
      });
    });

    socket.current.on("users", (users) => {
      let newUsers = users;
      users.forEach((user) => {
        user.messages.forEach((message) => {
          message.fromSelf = message.from === socket.current.userID;
        });
        for (let i = 0; i < newUsers.length; i++) {
          const existingUser = newUsers[i];
          if (existingUser.userID === user.userID) {
            existingUser.connected = user.connected;
            existingUser.messages = user.messages;
            return;
          }
        }
        user.self = user.userID === socket.current.id;
        initReactiveProperties(user);
      });

      // put the current user first, and then sort by email
      const sortedUsers = newUsers.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.email < b.email) return -1;
        return a.email > b.email ? 1 : 0;
      });
      setUsers(sortedUsers);
    });

    socket.current.on("user connected", (newConnection) => {
      console.log("user connected");
      let newUser = newConnection;
      console.log(newUser);
      //check if user already registered and update socket ID
      setUsers((prevState) => {
        for (let i = 0; i < prevState.length; i++) {
          const existingUser = prevState[i];
          if (existingUser.email === newUser.email) {
            existingUser.connected = true;
            let newUsers = prevState.map((u) =>
              u.email !== newUser.email ? u : existingUser
            );
            return newUsers;
          }
        }

        initReactiveProperties(newUser);
        return [...prevState, newUser];
      });
      if (currentChat)
        if (currentChat.email === newUser.email) {
          setCurrentChat((prevState) => ({
            ...prevState,
            userID: newUser.userID,
            connected: true,
          }));
        }
    });

    socket.current.on("user disconnected", (email) => {
      // console.log("user disconnected", email, users);

      setUsers((prevState) => {
        for (let i = 0; i < prevState.length; i++) {
          const user = prevState[i];
          if (user.email === email) {
            // console.log("found disconnect");
            user.connected = false;
            if (prevState.some((u) => u.email === user.email)) {
              let users = prevState.map((u) =>
                u.email !== user.email ? u : user
              );
              return users;
            } else return [...prevState, user];
          }
        }
      });
    });
    socket.current.on("private message", ({ message, from, to }) => {
      // console.log("new message from", from);
      setIncomingMessage({ message, from: from, to: to });
    });

    return () => {
      socket.current.off("connect");
      socket.current.off("disconnect");
      socket.current.off("user connected");
      socket.current.off("user disconnected");
      socket.current.off("users");
      socket.current.off("private message");
    };
  }, []);

  // record incoming message
  useEffect(() => {
    if (incomingMessage) {
      for (let i = 0; i < users.length; i++) {
        const sender = users[i];
        const fromSelf = socket.userID === incomingMessage.from;
        if (
          sender.userID ===
          (fromSelf ? incomingMessage.to : incomingMessage.from)
        ) {
          const isBlocked = user.blockedUsers?.some(
            (u) => u.email === sender.email
          );
          if (!isBlocked) {
            sender.messages.push({
              message: incomingMessage.message,
              fromSelf,
            });
            if (sender !== currentChat) {
              sender.hasNewMessages = true;
            }
          }
          updateUser(sender);
          break;
        }
      }
    }
  }, [incomingMessage]);

  //track and record ongoing conversations without listing all users
  useEffect(() => {
    let activeChats = [];
    users.forEach((u) => {
      if (u.messages.length > 0) activeChats.push(u);
    });

    if (currentChat) {
      if (!activeChats.some((c) => c.email === currentChat.email))
        activeChats.push(currentChat);
    }
    setConversations(
      activeChats.sort((a, b) => {
        if (a.createdAt > b.createdAt) return -1;
        if (a.createdAt < b.createdAt) return 1;
        return 0;
      })
    );
  }, [users, currentChat]);

  // track current chat changes
  useEffect(() => {
    // console.log(currentChat?.userID);
    if (currentChat) updateUser(currentChat);
  }, [currentChat]);

  useEffect(() => {
    console.log(users);
  }, [users]);

  //update user in users state
  const updateUser = useCallback(
    (updatedUser) => {
      //check if user already registered and update socket ID

      setUsers((prevState) => {
        if (prevState.some((u) => u.email === updatedUser.email)) {
          let updatedUsers = prevState.map((u) =>
            u.email !== updatedUser.email ? u : updatedUser
          );
          return updatedUsers;
        } else return [...prevState, updatedUser];
      });
    },
    [users]
  );

  const addConversation = (receiver) => {
    //ensure conversation is not repeated
    // console.log(receiver);
    setConversations((prevState) => {
      if (prevState.some((chat) => chat.email === receiver.email))
        return prevState;
      return [...prevState, receiver];
    });
  };

  const setChat = (chat) => {
    chat.hasNewMessages = false;
    setCurrentChat(chat);
    updateUser(chat);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = {
      sender: user.email,
      text: newMessage,
      receiver: currentChat.email,
      createdAt: Date.now(),
    };

    if (currentChat) {
      socket.current.emit("private message", {
        message,
        to: currentChat.userID,
      });
      // update current chat messages
      setCurrentChat((prevState) => ({
        ...prevState,
        messages: [
          ...prevState.messages,
          {
            message,
            fromSelf: true,
          },
        ],
      }));
    }
    setNewMessage("");
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [user?.messages]);

  return (
    <div className="messenger">
      <SideBar
        conversations={conversations}
        user={user}
        setCurrentChat={setChat}
        users={users}
        addConversation={addConversation}
        currentChat={currentChat}
      />
      <div className="chatBox">
        <div className="chatBar">
          {currentChat && (
            <div
              className="chatBarInfo"
              onClick={() =>
                setOpenRightBar((prevState) => !prevState)
              }
            >
              <NoAvatar name={currentChat.name} />
              <span>{currentChat.name}</span>
            </div>
          )}
        </div>
        <div className="chatBoxWrapper">
          {currentChat ? (
            <>
              {/* {!checkBlocked(currentChat) && (
                <div className="pop-up close-pop-up">
                  <span>Block User?</span>
                  <div className="btns"> 
                    <button>Close</button>
                    <button>Close</button>
                  </div>
                </div>
              )} */}
              <div className="chatBoxTop">
                <div className="today">Today</div>
                {currentChat.messages?.map((m, i) => {
                  return (
                    <div key={i} ref={scrollRef}>
                      <Message message={m.message} own={m.fromSelf} />
                    </div>
                  );
                })}
              </div>
              <div className="chatBoxBottom">
                <input
                  className="chatMessageInput"
                  placeholder="Message"
                  onChange={(e) => setNewMessage(e.target.value)}
                  value={newMessage}
                />
                <button
                  className="chatSubmitButton"
                  onClick={handleSubmit}
                >
                  <img src={Send} alt="send" />
                </button>
              </div>
            </>
          ) : (
            <span className="noConversationText">
              Open a conversation to start a chat.
            </span>
          )}
        </div>
      </div>
      <Rightbar
        currChat={currentChat}
        open={openRightBar}
        blockUser={() => blockUser(currentChat)}
        close={() => setOpenRightBar(false)}
        unblock={() => unblock(currentChat)}
        user={user}
      />
    </div>
  );
}
