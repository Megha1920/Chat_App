import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
    } else {
      setUser({ name: "Demo User" });
      fetchUsers(token);
    }
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const response = await axios.get("http://localhost:8000/chat/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(
        response.data.map((u) => ({
          name: u.username,
          message: "Say hi 👋", // Placeholder, you can replace with actual data
          unread: Math.floor(Math.random() * 4), // Temporary mock
          img: "https://via.placeholder.com/50",
        }))
      );
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      alert("No refresh token found. Please log in again.");
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
      console.log("Logged out successfully.");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
      alert("Logout failed.");
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    navigate("/", { replace: true });
  };

  return (
    <div className="container-fluid vh-100 bg-light">
      <div className="row h-100">
        <div
          className="col-md-4 border-end p-3 bg-white overflow-auto"
          style={{ maxHeight: "100vh" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-primary">Chats</h5>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div className="list-group">
            {users.map((chatUser, index) => (
              <div key={index} className="list-group-item d-flex align-items-center p-3">
                <img
                  src={chatUser.img}
                  className="rounded-circle me-3"
                  alt="Profile"
                  width="50"
                  height="50"
                />
                <div className="flex-grow-1">
                  <h6 className="mb-0">{chatUser.name}</h6>
                  <small className="text-muted">{chatUser.message}</small>
                </div>
                {chatUser.unread > 0 && (
                  <span className="badge bg-danger rounded-pill">{chatUser.unread}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-8 p-3 d-flex flex-column">
          <div className="border rounded p-3 bg-white flex-grow-1 overflow-auto" style={{ maxHeight: "80vh" }}>
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
