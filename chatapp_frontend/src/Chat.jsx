import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const Chat = () => {
  const [user, setUser] = useState(null);
  const userRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const wsRef = useRef(null);

  const isFromSelf = (senderId) => {
    return String(senderId) === String(userRef.current?.id);
  };

  // Fetch current user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return (window.location.href = "/");
    }

    axios
      .get("http://localhost:8000/auth/user/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const userWithId = { ...res.data, id: res.data.pk }; // ✅ Normalize pk → id
        setUser(userWithId);
        userRef.current = userWithId;
        console.log("👤 Logged in as:", userWithId);
        fetchUsers(token);
      })
      .catch(() => {
        window.location.href = "/";
      });
  }, []);

  const fetchUsers = async (token) => {
    try {
      const response = await axios.get("http://localhost:8000/chat/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(
        response.data.map((u) => ({
          id: u.id,
          name: u.username,
          message: "Say hi 👋",
          unread: 0,
          img: "https://via.placeholder.com/50",
        }))
      );
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
      alert("Failed to fetch users. Check your server or token.");
    }
  };

  const fetchMessages = async (userId) => {
    const token = localStorage.getItem("token");
    if (!user || !token) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/chat/messages/${userId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formattedMessages = response.data.map((msg) => {
        const fromSelf = String(msg.sender) === String(userRef.current?.id);
        console.log(
          `📩 Message ID: ${msg.id}, Sender: ${msg.sender}, You: ${userRef.current?.id}, from_self: ${fromSelf}`
        );
        return {
          id: msg.id,
          message: msg.content || msg.text || msg.message,
          from_self: fromSelf,
          sender: msg.sender,
          receiver: msg.receiver,
          timestamp: msg.timestamp,
        };
      });

      setMessages(formattedMessages);
      console.log("✅ Fetched Messages:", formattedMessages);
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    if (user && selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [user, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId || !user) return;

    const token = localStorage.getItem("token");
    const wsBaseUrl =
      import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";
    const socket = new WebSocket(
      `${wsBaseUrl}/ws/chat/${selectedUserId}/?token=${token}`
    );

    wsRef.current = socket;

    socket.onopen = () => console.log("✅ WebSocket connected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const incomingMessage = {
        message: data.message || data.content,
        from_self: isFromSelf(data.sender_id),
      };
      console.log("📥 WebSocket incoming:", incomingMessage);
      setMessages((prev) => [...prev, incomingMessage]);
    };

    socket.onerror = (e) => console.error("WebSocket error:", e);
    socket.onclose = () => console.log("❌ WebSocket closed");

    return () => socket.close();
  }, [selectedUserId, user]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedUserId) return;

    const messageData = {
      receiver: selectedUserId,
      text: newMessage.trim(),
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageData));
    }

    setNewMessage("");
  };

  const handleUserClick = (id, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    setSelectedUserId(id);
    setNewMessage("");
    setMessages([]);
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return alert("No refresh token found.");

    try {
      await axios.post(
        "http://localhost:8000/auth/token/blacklist/",
        { refresh: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed.");
    }
  };

  return (
    <div className="container-fluid vh-100 bg-light">
      <div className="row h-100">
        {/* User List */}
        <div className="col-md-4 border-end p-3 bg-white overflow-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-primary">Chats</h5>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          <div className="list-group">
            {users.map((chatUser) => (
              <div
                key={chatUser.id}
                className={`list-group-item d-flex align-items-center p-3 ${
                  selectedUserId === chatUser.id
                    ? "active bg-primary text-white"
                    : ""
                }`}
                onClick={(e) => handleUserClick(chatUser.id, e)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={chatUser.img}
                  className="rounded-circle me-3"
                  alt="Profile"
                  width="50"
                  height="50"
                />
                <div className="flex-grow-1">
                  <h6 className="mb-0">{chatUser.name}</h6>
                  <small>{chatUser.message}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="col-md-8 p-3 d-flex flex-column">
          {selectedUserId ? (
            <>
              <div
                className="border rounded p-3 bg-white flex-grow-1 overflow-auto"
                style={{ maxHeight: "80vh" }}
              >
                {messages.map((msg, index) => {
                  console.log(
                    `🖥️ Rendering msg[${index}] => "${msg.message}" | from_self: ${msg.from_self}`
                  );
                  return (
                    <div
                      key={index}
                      className={`d-flex mb-2 ${
                        msg.from_self
                          ? "justify-content-end"
                          : "justify-content-start"
                      }`}
                    >
                      <div
                        className={`p-2 rounded ${
                          msg.from_self
                            ? "bg-primary text-white"
                            : "bg-light text-dark"
                        }`}
                        style={{
                          maxWidth: "60%",
                          border: "1px solid #ccc",
                          wordWrap: "break-word",
                        }}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 d-flex">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button className="btn btn-primary px-4" onClick={handleSend}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <h5 className="text-muted">Select a user to start chatting</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
