import { ChartNoAxesColumn, SquareLibrary } from "lucide-react";
import React from "react";
import { Link, Outlet } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="flex ">
      <div className="hidden sm:block w-[250px] sm:w-[300px] border-r space-y-8 border-gray-300 dark:border-gray-700  bg-[#f0f0f0] p-5 sticky top-0 h-screen dark:bg-[#141414]">
        <div className="space-y-4  ">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <ChartNoAxesColumn size={32} />
            <h1>Dashboard</h1>
          </Link>

          <Link to="/admin/course" className="flex items-center gap-2">
            <SquareLibrary size={22} />
            <h1>Courses</h1>
          </Link>
        </div>
      </div>
      <div className="flex-1  p-10 ">
        <Outlet/>
      </div>
    </div>
  );
};


export default Sidebar;