import "./no-avatar.css";

function NoAvatar({ name, online=false }) {
  return (
    <div className="noAvatarContainer">
      {/* Break Name down and return Initials */}
      {online && <div className="online"></div>}
      {name?.split(" ")[0].charAt(0).toUpperCase()}
      {name?.split(" ")[1]?.charAt(0).toUpperCase()}
    </div>
  );
}

export default NoAvatar;
