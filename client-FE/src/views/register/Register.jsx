import { useRef } from "react";
import "./register.css";
import { register } from "../../utils/storage";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/icons/icon.svg";

export default function Register() {
  const name = useRef();
  const email = useRef();
  const phoneNumber = useRef();

  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    const user = {
      name: name.current.value,
      email: email.current.value,
      phoneNumber: phoneNumber.current.value,
    };
    // clear session
    localStorage.removeItem("sessionID");
    //register user in local storge
    register(user);
    navigate("/");
    navigate(0);
  };

  return (
    <div className="auth">
      <form className="authBox" onSubmit={handleClick}>
        <img src={Logo} alt="logo" />
        <input
          placeholder="Username"
          required
          ref={name}
          className="authInput"
        />
        <input
          placeholder="Email"
          required
          ref={email}
          className="authInput"
          type="email"
        />
        <input
          placeholder="Phone Number"
          required
          ref={phoneNumber}
          className="authInput"
        />
        <button className="authButton" type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
}
