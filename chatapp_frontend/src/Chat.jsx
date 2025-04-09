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

  function isFromSelf(senderId) {
    const currentUserId = userRef.current?.id;
    console.log("🔍 senderId:", senderId, " | currentUserId:", currentUserId);
    return String(senderId) === String(currentUserId);
  }
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    } else {
      axios
        .get("http://localhost:8000/auth/user/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          userRef.current = res.data;
          fetchUsers(token);
        })
        .catch(() => {
          window.location.href = "/";
        });
    }
  }, []);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

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
      console.error("Failed to fetch users", error);
    }
  };

  const fetchMessages = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8000/chat/messages/${userId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formattedMessages = response.data.map((msg) => ({
        message: msg.content || msg.text || msg.message,
        from_self: isFromSelf(msg.sender),
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to fetch messages", error);
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
      console.log("📥 Incoming WebSocket Message:", data);
    
      const incomingMessage = {
        message: data.message || data.content,
        from_self: isFromSelf(data.sender_id),
      };
    
      setMessages((prev) => [...prev, incomingMessage]);
    };
    

    socket.onerror = (e) => console.error("WebSocket error:", e);
    socket.onclose = () => console.log("❌ WebSocket closed");

    return () => socket.close();
  }, [selectedUserId, user]);

  const handleSend = () => {
    if (!newMessage || !selectedUserId) return;

    const messageData = {
      receiver: selectedUserId,
      text: newMessage,
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
    if (!refreshToken) {
      alert("No refresh token found.");
      return;
    }

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
      alert("Logout failed.");
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="container-fluid vh-100 bg-light">
      <div className="row h-100">
        {/* User List */}
        <div
          className="col-md-4 border-end p-3 bg-white overflow-auto"
          style={{ maxHeight: "100vh" }}
        >
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
            {users.map((chatUser, index) => (
              <div
                key={index}
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
                {messages.map((msg, index) => (
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
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
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
