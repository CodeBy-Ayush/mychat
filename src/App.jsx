import { useEffect, useState } from "react";
import { ref, push, onValue } from "firebase/database";
import { db } from "./firebase";
import "./style.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const messagesRef = ref(db, "private-chat/messages");

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setMessages([]);
        return;
      }

      const messageList = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      messageList.sort((a, b) => a.time - b.time);

      setMessages(messageList);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    await push(ref(db, "private-chat/messages"), {
      text: message.trim(),
      time: Date.now(),
    });

    setMessage("");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert("Chat link copied!");
  };

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="app">
      <div className="chat-container">

        {/* HEADER */}
        <header className="chat-header">

          <div className="profile">

            <div className="avatar">
              💬
            </div>

            <div>
              <h1>Private Chat</h1>
              <p>Online • No Login Required</p>
            </div>

          </div>

          <button className="copy-btn" onClick={copyLink}>
            🔗 Copy Link
          </button>

        </header>


        {/* MESSAGES */}
        <main className="messages">

          {messages.length === 0 ? (

            <div className="empty">
              <div className="empty-icon">
                💬
              </div>

              <h3>No messages yet</h3>

              <p>
                Send a message to start the conversation.
              </p>
            </div>

          ) : (

            messages.map((item) => (

              <div className="message-wrapper" key={item.id}>

                <div className="message">

                  <div className="message-text">
                    {item.text}
                  </div>

                  <span className="message-time">
                    {formatTime(item.time)}
                  </span>

                </div>

              </div>

            ))

          )}

        </main>


        {/* INPUT */}
        <form className="message-box" onSubmit={sendMessage}>

          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit">
            ➤
          </button>

        </form>

      </div>
    </div>
  );
}

export default App;