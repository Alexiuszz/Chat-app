import NoAvatar from "../../components/no-avatar/NoAvatar";
import Close from "../../assets/icons/close.svg";
import "./rightbar.css";

function Rightbar({
  user,
  open,
  close,
  blockUser,
  isBlocked,
  unblock,
}) {
  return (
    <div className={`rightBarContainer ${open && "barOpen"}`}>
      <img onClick={close} src={Close} alt="close" />
      <div className="rightBarContent">
        <NoAvatar name={user?.name} />
        <p className="userName">{user?.name}</p>
        <p className="userContact">{user?.phoneNumber}</p>
        <p className="userContact">{user?.email}</p>
        {isBlocked ? (
          <button
            onClick={unblock}
            className="unblock block authButton"
          >
            Unblock
          </button>
        ) : (
          <button className="block authButton" onClick={blockUser}>
            Block User
          </button>
        )}
      </div>
    </div>
  );
}

export default Rightbar;
