import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import imgLogo from "../assets/img.png";
import { MenuIcon, SearchIcon, XIcon } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import imgPro from "../assets/pro.png";

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const navigate = useNavigate();

  const { user, logout, favoriteMovies } = useAppContext();

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5">

    
      <Link to="/" className="max-md:flex-1">
        <img src={imgLogo} alt="logo" className="w-36 h-auto" />
      </Link>

      
      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 min-md:px-8 py-3 max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${
          isOpen ? "max-md:w-full" : "max-md:w-0"
        }`}>

        <XIcon
          className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => setIsOpen(false)}
        />

        <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/movies" onClick={() => setIsOpen(false)}>Movies</Link>
        <Link to="/" onClick={() => setIsOpen(false)}>Theaters</Link>
        <Link to="/" onClick={() => setIsOpen(false)}>Releases</Link>

        {favoriteMovies.length > 0 && (
          <Link to="/favorites" onClick={() => setIsOpen(false)}>
            Favorites
          </Link>
        )}
      </div>

    
      <div className="flex items-center gap-6">

        <SearchIcon className="w-6 h-6" />

        
        {!user ? (

          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 bg-red-500 rounded-full cursor-pointer text-white font-medium"
          >
            Login
          </button>

        ) : (

          <div className="relative">

            
            <img
              src={imgPro}
              className="w-9 h-9 rounded-full cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
            />

            
            {showMenu && (
              <div className="absolute right-0 mt-3 w-52 bg-white text-black rounded shadow-lg">

                <div className="p-3 border-b text-sm">
                  {user.email}
                </div>

                <div
                  className="p-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate("/my-account")}
                >
                  My Account
                </div>

                <div
                  className="p-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate("/my-bookings")}
                >
                  My Bookings
                </div>

                <div
                  className="p-3 text-red-500 cursor-pointer hover:bg-gray-100"
                  onClick={logout}
                >
                  Logout
                </div>

              </div>
            )}

          </div>

        )}

      </div>

      
      <MenuIcon
        onClick={() => setIsOpen(!isOpen)}
        className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer"
      />

    </div>
  );
};

export default Navbar;