import { useEffect, useState } from "react";
import instance from "@/configs/axios"; // Axios instance configured

const AuthCallback = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await instance.get("auth/login/success", {
          withCredentials: true,
        });

        if (response.status === 200) {
          setUser(response.data.user); // Set the user data from the response
        } else {
          throw new Error("Failed to fetch user info");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);
  console.log(user);

  return null;
};

export default AuthCallback;
