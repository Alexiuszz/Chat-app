import NoAvatar from "../../components/no-avatar/NoAvatar";
import Close from "../../assets/icons/close.svg";
import "./rightbar.css";
import { useEffect, useState } from "react";

function Rightbar({
  user,
  open,
  close,
  blockUser,
  currChat,
  unblock,
}) {
  const [isBlocked, setIsBlocked] = useState(false);

  // useEffect(() => {
  //   console.log(user);
  //   if (user?.blockedUsers && currChat) {
  //     setIsBlocked(
  //       user?.blockedUsers?.some((u) => u.email === currChat.email)
  //     );
  //   }
  // });

  return (
    <div className={`rightBarContainer ${open && "barOpen"}`}>
      <img onClick={close} src={Close} alt="close" />
      <div className="rightBarContent">
        <NoAvatar name={currChat?.name} />
        <p className="userName">{currChat?.name}</p>
        <p className="userContact">{currChat?.phoneNumber}</p>
        <p className="userContact">{currChat?.email}</p>
        {isBlocked? (
          <button
            onClick={() => {
              setIsBlocked((prevState) => !prevState);
              unblock();
            }}
            className="unblock block authButton"
          >
            Unblock
          </button>
        ) : (
          <button
            className="block authButton"
            onClick={() => {
              setIsBlocked((prevState) => !prevState);
              blockUser();
            }}
          >
            Block User
          </button>
        )}
      </div>
    </div>
  );
}

export default Rightbar;
