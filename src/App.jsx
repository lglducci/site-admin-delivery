import React from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  return isLoggedIn ? <Dashboard /> : <Login onLogin={() => setIsLoggedIn(true)} />;
}
