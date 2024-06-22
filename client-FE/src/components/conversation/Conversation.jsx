import { format } from "date-fns";
import NoAvatar from "../no-avatar/NoAvatar";
import "./conversation.css";

export default function Conversation({ conversation, isCurrent }) {
  console.log(conversation.messages);
  return (
    <div className={`conversation ${isCurrent && "currentChat"}`}>
      <div className="userInfo">
        <NoAvatar
          name={conversation.name}
          online={conversation.connected}
        />
        <div className="userDetails">
          <span className="userName">{conversation?.name}</span>

          {conversation.messages.length > 0 && (
            <span className="lastMessage">
              {
                conversation.messages[
                  conversation.messages.length - 1
                ].message.text
              }
            </span>
          )}
        </div>
      </div>
      <div className="chatData">
        {conversation.messages.length > 0 && (
          <span className="chatTime">
            {format(
              conversation.messages[conversation.messages.length - 1]
                .message.createdAt,
              "H':'mm"
            )}
          </span>
        )}
        {conversation.hasNewMessages && (
          <span className="notification"></span>
        )}
      </div>
    </div>
  );
}
