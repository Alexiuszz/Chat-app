/* abstract */ class SessionStore {
  findSession(id) {}
  saveSession(id, session) {}
  findAllSessions() {}
}

class InMemorySessionStore extends SessionStore {
  constructor() {
    super();
    this.sessions = new Map();
  }

  findSession(id) {
    return this.sessions.get(id);
  }

  saveSession(id, session) {
    this.sessions.set(id, session);
    return this.sessions;
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }

  setSessions(sessions) {
    if (sessions) {
      this.sessions = new Map(
        sessions.map((obj) => [obj.id, obj.name])
      );
    }
  }
}

module.exports = {
  InMemorySessionStore,
};
