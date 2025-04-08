import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const Chat = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const wsRef = useRef(null);

  const isFromSelf = (msgSender, userId) => {
    if (!msgSender || !userId) return false;
    return msgSender.id === userId;
};


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
          fetchUsers(token);
        })
        .catch(() => {
          window.location.href = "/";
        });
    }
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
      console.error("Failed to fetch users", error);
    }
  };

  const fetchMessages = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`http://localhost:8000/chat/messages/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const formattedMessages = response.data.map((msg) => ({
        message: msg.content || msg.text || msg.message,
        from_self: isFromSelf(msg.sender, user.id),  // Ensure sender comparison is accurate
      }));
  
      setMessages(formattedMessages);  // Update the messages state with properly formatted messages
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };
  
  

  // Fetch messages when both user and selectedUserId are set
  useEffect(() => {
    if (user && selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [user, selectedUserId]);

  // Setup WebSocket
  useEffect(() => {
    if (!selectedUserId || !user) return;

    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${selectedUserId}/`);
    wsRef.current = socket;

    socket.onopen = () => console.log("✅ WebSocket connected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Incoming message data:", data);
      setMessages((prev) => [
        ...prev,
        {
          message: data.message || data.content,
          from_self: isFromSelf(data.sender_id, user?.id),
        },
      ]);
    };
    

    socket.onerror = (e) => console.error("WebSocket error:", e);
    socket.onclose = () => console.log("❌ WebSocket closed");

    return () => socket.close();
  }, [selectedUserId, user]);

  const handleSend = async () => {
    if (!newMessage || !selectedUserId) return;

    const messageData = {
      receiver: selectedUserId,
      text: newMessage,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageData));
    }

    try {
      await axios.post("http://localhost:8000/chat/messages/send/", messageData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Failed to send message via API", error);
    }

    setMessages((prev) => [...prev, { message: newMessage, from_self: true }]);
    setNewMessage("");
  };

  const handleUserClick = async (id, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    setSelectedUserId(id);
    setNewMessage("");
    setMessages([]); // We'll fetch after user is loaded
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
        <div className="col-md-4 border-end p-3 bg-white overflow-auto" style={{ maxHeight: "100vh" }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-primary">Chats</h5>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div className="list-group">
            {users.map((chatUser, index) => (
              <div
                key={index}
                className={`list-group-item d-flex align-items-center p-3 ${
                  selectedUserId === chatUser.id ? "active bg-primary text-white" : ""
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
              <div className="border rounded p-3 bg-white flex-grow-1 overflow-auto" style={{ maxHeight: "80vh" }}>
              {messages.map((msg, idx) => {
  console.log(msg);  // Debug log to see what each message contains
  return (
    <div
      key={idx}
      className={`d-flex my-2 ${msg.from_self ? "justify-content-end" : "justify-content-start"}`}
    >
      <div
        className={`p-3 rounded-4 shadow-sm ${
          msg.from_self ? "bg-primary text-white" : "bg-light text-dark"
        }`}
        style={{ maxWidth: "75%", wordWrap: "break-word" }}
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
