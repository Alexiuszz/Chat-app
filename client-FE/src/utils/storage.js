//Register User
export const register = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

//get all chats
export const getChats = (userId) =>
  JSON.parse(localStorage.getItem(userId + "-chats")) || [];

// Add new chat using their id's in ls
export const addChat = (userId, newChat) => {
  const chats = getChats(userId);
  console.log(chats, newChat);
  //check if chat already exists
  if (
    chats.findIndex(
      (chat) => chat.receiver.email === newChat.receiver.email
    ) < 0
  )
    localStorage.setItem(
      userId + "-chats",
      JSON.stringify([...chats, newChat])
    );
};

//get chat using chat id
export const getChat = (chatId) =>
  JSON.parse(localStorage.getItem(chatId));

//update chat with new message
export const updateChat = (chatId, message) => {
  const messages = getChat(chatId);
  if (messages)
    localStorage.setItem(
      chatId,
      JSON.stringify([...messages, message])
    );
  else localStorage.setItem(chatId, JSON.stringify([message]));
};
