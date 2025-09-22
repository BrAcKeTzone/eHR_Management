import React, { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`h-screen bg-gray-800 text-white ${isOpen ? "w-64" : "w-16"} transition-all` }>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2">
        {isOpen ? "Collapse" : "Expand"}
      </button>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
