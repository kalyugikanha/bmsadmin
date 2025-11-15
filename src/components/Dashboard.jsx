import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Outlet } from 'react-router-dom';
import { FaLandmark, FaRegListAlt, FaChevronDown, FaChevronUp, FaRegUserCircle } from 'react-icons/fa';
import { FiSettings, FiSearch, FiFilter } from 'react-icons/fi';
import { AiOutlinePlus } from 'react-icons/ai';
import { MdOutlinePostAdd, MdViewList } from 'react-icons/md';

import ViewBookings from './bookings/ViewBookings';
import AddNewBlog from './blogs/AddNewBlog';
import ViewBlogs from './blogs/ViewBlogs';
import EditBlog from './blogs/EditBlog'; // Import EditBlog component

import { useAuth } from '../context/AuthContext'; // Import useAuth

const PlaceholderPage = ({ title }) => (
  <div className="bg-staymaster-white-bg rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold text-staymaster-text-dark mb-4">{title} Content</h2>
    <p className="text-staymaster-text-gray">This is a placeholder page for {title}.</p>
  </div>
);

const Dashboard = () => { // Removed auth, setAuth props
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userRole, logout } = useAuth(); // Use useAuth to get auth state and logout function

  const [openBookings, setOpenBookings] = useState(true);
  const [openBlocks, setOpenBlocks] = useState(false);
  const [openUserManagement, setOpenUserManagement] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);
  const [openBlogManagement, setOpenBlogManagement] = useState(false);

  const handleLogout = () => {
    logout(); // Use context's logout function
    navigate('/login');
  };
  

  // The auth check should ideally be handled by PrivateRoute, but keeping it here for robustness
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);


  const isSubMenuActive = (path) => location.pathname === path;

  const isParentMenuActive = (parentPaths) => {
    return parentPaths.some(path => location.pathname.startsWith(path));
  };

  const renderMainMenuItem = (name, icon, isOpen, toggleOpen, subMenus = [], parentPaths = []) => {
    const isActive = isParentMenuActive(parentPaths);
    const parentClass = `flex items-center justify-between cursor-pointer py-2.5 px-3 text-base rounded-lg transition-colors duration-200
      ${isActive ? 'text-staymaster-primary font-semibold' : 'text-staymaster-text-dark hover:text-staymaster-primary hover:bg-gray-100'}`;

    return (
      <div key={name} className="mb-0.5">
        <div className={parentClass} onClick={toggleOpen}>
          <div className="flex items-center">
            {icon}
            <span className="ml-3">{name}</span>
          </div>
          {isOpen ? <FaChevronUp className="w-3 h-3 text-gray-400" /> : <FaChevronDown className="w-3 h-3 text-gray-400" />}
        </div>
        {isOpen && subMenus.length > 0 && (
          <div className="ml-8 mt-1 space-y-0.5">
            {subMenus.map(subItem => (
              <a
                key={subItem.name}
                href={subItem.path}
                className={`block py-2 px-3 text-sm rounded-lg transition-colors duration-200
                  ${isSubMenuActive(subItem.path) ? 'text-staymaster-primary font-semibold' : 'text-staymaster-text-dark hover:text-staymaster-primary hover:bg-gray-100'}`}
              >
                {subItem.name}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  const sidebarNav = [
    {
      name: "Bookings",
      icon: <FaRegListAlt className="w-4 h-4" />,
      state: openBookings,
      toggle: () => setOpenBookings(!openBookings),
      paths: ['/dashboard/bookings', '/dashboard/upcoming', '/dashboard/ongoing', '/dashboard/cancelled', '/dashboard/completed'],
      subMenus: [
        { name: "Upcoming Bookings", path: "/dashboard/upcoming", roles: ['admin', 'hospitality', 'finance'] },
        { name: "Ongoing Bookings", path: "/dashboard/ongoing", roles: ['admin', 'hospitality', 'finance'] },
        { name: "Cancelled Bookings", path: "/dashboard/cancelled", roles: ['admin', 'hospitality', 'finance'] },
        { name: "Completed Bookings", path: "/dashboard/completed", roles: ['admin', 'hospitality', 'finance'] },
      ],
      roles: ['admin', 'hospitality', 'finance'],
    },
    {
      name: "Blocks",
      icon: <FaRegListAlt className="w-4 h-4" />,
      state: openBlocks,
      toggle: () => setOpenBlocks(!openBlocks),
      paths: ['/dashboard/blocks', '/dashboard/owner', '/dashboard/maintenance'],
      subMenus: [
        { name: "Owner", path: "/dashboard/owner", roles: ['admin', 'hospitality'] },
        { name: "Maintenance", path: "/dashboard/maintenance", roles: ['admin', 'hospitality'] },
      ],
      roles: ['admin', 'hospitality'],
    },
    {
      name: "User Management",
      icon: <FaRegListAlt className="w-4 h-4" />,
      state: openUserManagement,
      toggle: () => setOpenUserManagement(!openUserManagement),
      paths: ['/dashboard/users'],
      subMenus: [],
      roles: ['admin'],
    },
    {
      name: "Blog Management",
      icon: <MdOutlinePostAdd className="w-4 h-4" />,
      state: openBlogManagement,
      toggle: () => setOpenBlogManagement(!openBlogManagement),
      paths: ['/dashboard/blogs/add-new', '/dashboard/blogs/view'],
      subMenus: [
        { name: "Add New Blog", path: "/dashboard/blogs/add-new", roles: ['admin'] },
        { name: "View All Blogs", path: "/dashboard/blogs/view", roles: ['admin', 'hospitality', 'finance'] },
      ],
      roles: ['admin', 'hospitality', 'finance'],
    },
    {
      name: "Setting",
      icon: <FiSettings className="w-4 h-4" />,
      state: openSetting,
      toggle: () => setOpenSetting(!openSetting),
      paths: ['/dashboard/settings'],
      subMenus: [],
      roles: ['admin', 'hospitality', 'finance'],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-staymaster-light-bg font-sans">
      <aside className="w-64 bg-staymaster-white-bg shadow-sm flex flex-col flex-shrink-0 border-r border-staymaster-border-light">
        <div className="p-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <FaLandmark className="w-6 h-6 text-staymaster-primary mr-2" />
            <span className="text-xl font-bold text-staymaster-primary">staymaster</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="border-t border-dashed border-gray-300 mx-6 my-4"></div>

        <nav className="flex-1 px-4 py-0 overflow-y-auto">
          {sidebarNav.map(item => {
            // Ensure userRole is available before checking roles
            if (userRole && item.roles.includes(userRole)) {
              const accessibleSubMenus = item.subMenus.filter(subItem => subItem.roles.includes(userRole));
              return renderMainMenuItem(
                item.name,
                item.icon,
                item.state,
                item.toggle,
                accessibleSubMenus,
                item.paths
              );
            }
            return null;
          })}
        </nav>

        <div className="p-4 border-t border-staymaster-border-light">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-staymaster-white-bg font-bold py-2.5 px-4 rounded-lg transition duration-200 ease-in-out text-sm"
          >
            Logout ({userRole})
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex-shrink-0 flex items-center justify-between py-5 px-6 bg-staymaster-white-bg shadow-sm border-b border-staymaster-border-light">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-staymaster-text-dark mr-4">Welcome to Staymaster</h1>
            <span className="text-base text-staymaster-text-gray">30/08/2025, Saturday</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-staymaster-primary hover:bg-teal-700 text-staymaster-white-bg px-4 py-2.5 rounded-lg flex items-center text-sm font-medium transition duration-200">
              <AiOutlinePlus className="w-4 h-4 mr-2" /> Add New
            </button>
            <div className="relative">
              <FaRegUserCircle className="w-9 h-9 text-staymaster-text-gray cursor-pointer" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/upcoming" element={<ViewBookings title="Upcoming Bookings" />} />
            <Route path="/ongoing" element={<ViewBookings title="Ongoing Bookings" />} />
            <Route path="/cancelled" element={<ViewBookings title="Cancelled Bookings" />} />
            <Route path="/completed" element={<ViewBookings title="Completed Bookings" />} />

            <Route path="/blocks" element={<PlaceholderPage title="Blocks" />} />
            <Route path="/owner" element={<PlaceholderPage title="Owner" />} />
            <Route path="/maintenance" element={<PlaceholderPage title="Maintenance" />} />
            <Route path="/users" element={<PlaceholderPage title="User Management" />} />

            <Route path="/blogs/add-new" element={<AddNewBlog />} />
            <Route path="/blogs/view" element={<ViewBlogs />} />
            <Route path="/blogs/edit/:blogId" element={<EditBlog />} /> {/* New route for editing blogs */}

            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />

            <Route path="/" element={<ViewBookings title="Upcoming Bookings" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;