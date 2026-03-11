import React from 'react'
import { Link } from "react-router-dom";
import imgPlace from "../../assets/img.png"

function AdminNavbar() {
  return (
     <div className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30">
      <Link to="/">
        <img src={imgPlace} alt="logo" className="w-36 h-auto" />
      </Link>
    </div>
  );
};

export default AdminNavbar;
