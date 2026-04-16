import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setIsAdmin(false);
    }
  }, []);

  
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsAdmin(false);
    setFavoriteMovies([]);

    navigate("/login");
  };

  
  const fetchIsAdmin = async () => {
    try {
      const { data } = await axios.get("/api/admin/is-admin");
      setIsAdmin(data.success);
    } catch (error) {
      console.log("ADMIN CHECK ERROR:", error);

      setIsAdmin(false);

      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  
  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all");

      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("SHOW ERROR:", error);
    }
  };

  
  const fetchFavoriteMovies = async () => {
    try {
      const { data } = await axios.get("/api/user/favorites");

      if (data.success) {
        setFavoriteMovies(data.movies);
      }
    } catch (error) {
      console.log("FAVORITE ERROR:", error);

      if (error.response?.status === 401) {
        logout();
      }
    }
  };


  useEffect(() => {
    fetchShows();
  }, []);

  
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        fetchIsAdmin();
      } else {
        setIsAdmin(false);
      }

      fetchFavoriteMovies();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  
  const value = {
    axios,
    user,
    setUser,
    logout,
    navigate,
    isAdmin,
    fetchIsAdmin,
    shows,
    favoriteMovies,
    fetchFavoriteMovies,
    image_base_url,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};


export const useAppContext = () => useContext(AppContext);