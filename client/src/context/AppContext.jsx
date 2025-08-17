import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setIsLoggedIn(res.data.success);
        setUserData(res.data.user);
        setAccessToken(res.data.accessToken);
      } catch (error) {
        setIsLoggedIn(false);
        setUserData(null);
        setAccessToken(null);

        if (error.response && error.response.status !== 401) {
          toast.error(error.response.data?.error || "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    refreshAccessToken();
  }, []);

  if (loading) return <div>Loading...</div>;

  const value = {
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    accessToken,
    setAccessToken,
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
