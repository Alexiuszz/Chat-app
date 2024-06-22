import { format } from "date-fns";
import "./message.css";

export default function Message({ message, own }) {
  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        <p className="messageText">
          {message.text}
          <span className="messageBottom">
            {format(message.createdAt, "H':'mm")}
          </span>
        </p>
      </div>
    </div>
  );
}
