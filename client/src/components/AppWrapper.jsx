import { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import socket from "../socket";

function AppWrapper({ children }) {
  const { userData } = useContext(AppContext);

  useEffect(() => {
    if (userData) {
      socket.auth = { userId: userData.id };
      socket.connect();
    }
  }, [userData]);

  return children;
}

export default AppWrapper;
