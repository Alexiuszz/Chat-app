import NoAvatar from "../../components/no-avatar/NoAvatar";
import Close from "../../assets/icons/close.svg";
import './rightbar.css'

function Rightbar({ user, open, close }) {
  console.log(user)
  return (
    <div className={`rightBarContainer ${open && "barOpen"}`}>
      <img onClick={close} src={Close} alt="close" />
      <div className="rightBarContent">
        <NoAvatar name={user?.name} />
        <p className="userName">{user?.name}</p>
        <p className="userContact">{user?.phoneNumber}</p>
        <p className="userContact">{user?.email}</p>
      </div>
    </div>
  );
}

export default Rightbar;
