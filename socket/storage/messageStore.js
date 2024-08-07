/* abstract */ class MessageStore {
  saveMessage(message) {}
  findMessagesForUser(userID) {}
}

class InMemoryMessageStore extends MessageStore {
  constructor() {
    super();
    this.messages = [];
  }
  setMessages(messages) {
    this.messages = [...messages];
  }
  saveMessage(message) {
    this.messages.push(message);
    return this.messages;
  }

  findMessagesForUser(userID) {
    return this.messages.filter(
      ({ from, to }) => from === userID || to === userID
    );
  }
}

module.exports = {
  InMemoryMessageStore,
};
