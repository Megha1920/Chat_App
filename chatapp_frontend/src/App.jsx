import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./Login";
import Chat from "./Chat";

function App() {
  return (
    <GoogleOAuthProvider clientId="1055989923258-vvjhdbjqib8kj83nv8mbfbucofn7jcdh.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
