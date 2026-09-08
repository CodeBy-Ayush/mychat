import { useEffect, useState } from "react";
import {
  ref,
  push,
  onValue,
  remove,
} from "firebase/database";

import { db } from "./firebase";
import { uploadFile } from "./fileUpload";

import "./style.css";

function App() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(
    localStorage.getItem("chatName") || ""
  );

  const [nameInput, setNameInput] = useState("");

  // =========================
  // LOAD MESSAGES
  // =========================

  useEffect(() => {

    const messagesRef =
      ref(db, "private-chat/messages");

    const unsubscribe = onValue(
      messagesRef,
      (snapshot) => {

        const data = snapshot.val();

        if (!data) {
          setMessages([]);
          return;
        }

        const messageList =
          Object.entries(data).map(
            ([id, value]) => ({
              id,
              ...value,
            })
          );

        messageList.sort(
          (a, b) => a.time - b.time
        );

        setMessages(messageList);
      }
    );

    return () => unsubscribe();

  }, []);


  // =========================
  // SAVE NAME
  // =========================

  const saveName = (e) => {

    e.preventDefault();

    const cleanName =
      nameInput.trim();

    if (!cleanName) return;

    localStorage.setItem(
      "chatName",
      cleanName
    );

    setName(cleanName);
  };


  // =========================
  // SEND TEXT
  // =========================

  const sendMessage = async (e) => {

    e.preventDefault();

    if (!message.trim()) return;

    if (!name) return;

    try {

      await push(
        ref(db, "private-chat/messages"),
        {
          type: "text",

          text: message.trim(),

          senderName: name,

          time: Date.now(),
        }
      );

      setMessage("");

    } catch (error) {

      console.error(error);

      alert("Message send failed.");

    }
  };


  // =========================
  // UPLOAD FILE
  // =========================

  const handleFileUpload = async (e) => {

    const file =
      e.target.files[0];

    if (!file) return;

    if (!name) return;

    try {

      setUploading(true);

      const uploadedFile =
        await uploadFile(file);

      await push(
        ref(db, "private-chat/messages"),
        {
          type: "file",

          fileName:
            uploadedFile.name,

          fileSize:
            uploadedFile.size,

          fileType:
            uploadedFile.type,

          fileUrl:
            uploadedFile.url,

          senderName: name,

          time: Date.now(),
        }
      );

    } catch (error) {

      console.error(error);

      alert(
        "File upload failed:\n" +
        error.message
      );

    } finally {

      setUploading(false);

      e.target.value = "";

    }
  };


  // =========================
  // DELETE MESSAGE
  // =========================

  const deleteMessage = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this message?"
      );

    if (!confirmDelete) return;

    try {

      await remove(
        ref(
          db,
          `private-chat/messages/${id}`
        )
      );

    } catch (error) {

      console.error(error);

      alert(
        "Unable to delete message."
      );

    }
  };


  // =========================
  // COPY LINK
  // =========================

  const copyLink = async () => {

    try {

      await navigator.clipboard.writeText(
        window.location.href
      );

      alert("Chat link copied!");

    } catch (error) {

      console.error(error);

      alert("Unable to copy link.");

    }
  };


  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (time) => {

    return new Date(time)
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

  };


  // =========================
  // FORMAT FILE SIZE
  // =========================

  const formatFileSize = (bytes) => {

    if (!bytes) return "";

    if (bytes < 1024) {

      return bytes + " B";

    }

    if (bytes < 1024 * 1024) {

      return (
        (bytes / 1024).toFixed(1) +
        " KB"
      );

    }

    return (
      (bytes / (1024 * 1024)).toFixed(1) +
      " MB"
    );

  };


  // =========================
  // NAME SCREEN
  // =========================

  if (!name) {

    return (

      <div className="name-screen">

        <div className="name-card">

          <div className="name-icon">
            💬
          </div>

          <h1>
            Private Chat
          </h1>

          <p>
            What should we call you?
          </p>

          <form
            onSubmit={saveName}
            className="name-form"
          >

            <input
              type="text"
              placeholder="Enter your name"
              value={nameInput}
              onChange={(e) =>
                setNameInput(e.target.value)
              }
              maxLength={30}
              autoFocus
            />

            <button type="submit">
              Continue
            </button>

          </form>

          <small>
            No login or signup required
          </small>

        </div>

      </div>

    );

  }


  // =========================
  // CHAT UI
  // =========================

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

              <h1>
                Private Chat
              </h1>

              <p>
                {name} • Online
              </p>

            </div>

          </div>


          <button
            className="copy-btn"
            onClick={copyLink}
          >
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

              <h3>
                No messages yet
              </h3>

              <p>
                Send a message to start
                the conversation.
              </p>

            </div>

          ) : (

            messages.map((item) => (

              <div
                className="message-wrapper"
                key={item.id}
              >

                <div className="message">


                  {/* SENDER NAME */}

                  <div className="sender-name">
                    {item.senderName || "Unknown"}
                  </div>


                  {/* TEXT */}

                  {item.type !== "file" && (

                    <div className="message-text">

                      {item.text}

                    </div>

                  )}


                  {/* FILE */}

                  {item.type === "file" && (

                    <div className="file-card">

                      <div className="file-icon">
                        📦
                      </div>

                      <div className="file-info">

                        <div className="file-name">
                          {item.fileName}
                        </div>

                        <div className="file-size">
                          {formatFileSize(
                            item.fileSize
                          )}
                        </div>

                        <a
                          className="download-btn"
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          ⬇ Download
                        </a>

                      </div>

                    </div>

                  )}


                  {/* BOTTOM */}

                  <div className="message-bottom">

                    <span className="message-time">

                      {formatTime(
                        item.time
                      )}

                    </span>


                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteMessage(item.id)
                      }
                      title="Delete message"
                    >
                      🗑
                    </button>

                  </div>

                </div>

              </div>

            ))

          )}

        </main>


        {/* INPUT */}

        <form
          className="message-box"
          onSubmit={sendMessage}
        >


          {/* FILE BUTTON */}

          <label
            className="file-button"
            title="Send file"
          >

            📎

            <input
              type="file"
              onChange={handleFileUpload}
              hidden
            />

          </label>


          {/* TEXT */}

          <input
            type="text"
            placeholder={
              uploading
                ? "Uploading file..."
                : "Type a message..."
            }
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            disabled={uploading}
          />


          {/* SEND */}

          <button
            type="submit"
            disabled={uploading}
          >
            ➤
          </button>


        </form>

      </div>

    </div>

  );

}

export default App;