import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/");
          return;
        }

        // Fetch user details from Django
        const res = await axios.get("http://127.0.0.1:8000/auth/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/");
      }
    };

    fetchUserProfile();
  }, [navigate]);

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.first_name}!</h2>
          <img src={user.profile_picture} alt="Profile" width="100" />
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Chat;
