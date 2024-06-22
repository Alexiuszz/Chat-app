import Conversation from "../../components/conversation/Conversation";
import Search from "../../components/search/Search";
import "./side-bar.css";
import Logo from "../../assets/icons/icon.svg";

function SideBar({
  user,
  conversations,
  setCurrentChat,
  users,
  addConversation,
  currentChat,
}) {
  return (
    <div className="chatMenu">
      <div className="chatMenuWrapper">
        <img src={Logo} alt="logo" />
        <Search
          addConversation={addConversation}
          options={users}
          user={user}
        />
        {conversations.map((c, i) => (
          <div key={i} onClick={() => setCurrentChat(c)}>
            <Conversation
              conversation={c}
              isCurrent={currentChat?.email === c.email}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
