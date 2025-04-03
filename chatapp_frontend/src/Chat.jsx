import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const dummyUsers = [
    { name: "Alice", img: "https://via.placeholder.com/50", message: "Hey, how's it going?", unread: 2 },
    { name: "Bob", img: "https://via.placeholder.com/50", message: "Are we meeting today?", unread: 0 },
    { name: "Charlie", img: "https://via.placeholder.com/50", message: "Let's catch up soon!", unread: 1 },
    { name: "Diana", img: "https://via.placeholder.com/50", message: "Good morning!", unread: 0 },
    { name: "Eve", img: "https://via.placeholder.com/50", message: "See you later!", unread: 3 },
    { name: "Frank", img: "https://via.placeholder.com/50", message: "I'll call you back.", unread: 0 }
  ];
  useEffect(() => {
    // ✅ Check if user is "logged in"
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to login if no token
    } else {
      setUser({ name: "Demo User" }); // Dummy user info
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    navigate("/"); // Redirect to login
  };

  return (
    <div className="container-fluid vh-100 bg-light">
      <div className="row h-100">
        {/* Sidebar Chat List */}
        <div className="col-md-4 border-end p-3 bg-white overflow-auto chat-list" style={{ maxHeight: "100vh" }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-primary">Chats</h5>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
          </div>
          <div className="list-group">
            {dummyUsers.map((chatUser, index) => (
              <div key={index} className="list-group-item d-flex align-items-center p-3">
                <img src={chatUser.img} className="rounded-circle me-3" alt="Profile" width="50" height="50" />
                <div className="flex-grow-1">
                  <h6 className="mb-0">{chatUser.name}</h6>
                  <small className="text-muted">{chatUser.message}</small>
                </div>
                {chatUser.unread > 0 && <span className="badge bg-danger rounded-pill">{chatUser.unread}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Box */}
        <div className="col-md-8 p-3 d-flex flex-column">
          <div className="border rounded p-3 bg-white flex-grow-1 overflow-auto chat-box" style={{ maxHeight: "80vh" }}>
            <div className="text-start bg-secondary text-white p-2 rounded my-1 w-75">
              <strong>Friend:</strong> Hello!
            </div>
            <div className="text-end bg-primary text-white p-2 rounded my-1 w-75 ms-auto">
              <strong>You:</strong> How are you?
            </div>
          </div>
          <div className="mt-3 d-flex">
            <input type="text" className="form-control me-2" placeholder="Type a message..." />
            <button className="btn btn-primary px-4">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
