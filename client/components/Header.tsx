import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import {
  HomeIcon,
  UploadIcon,
  SettingsIcon,
  SearchAltIcon,
} from "@/components/Icons";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isSidebarOpen]);

  const closeSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsSidebarOpen(false);
      setIsClosing(false);
    }, 350);
  };

  const handleLogout = async () => {
    await logout();
    closeSidebar();
    navigate("/");
  };

  return (
    <header className="w-full bg-[#000000] backdrop-blur-md border-b border-[#666666] shadow-lg animate-slideInDown sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity flex-shrink-0 group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-md flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#0088CC]/30 transition-all">
            <img
              src="https://i.ibb.co/PzNWvp7N/doxinglifelogo.png"
              alt="Doxing Dot Life Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-black text-base sm:text-lg text-white hidden xs:inline line-clamp-1 group-hover:text-[#0088CC] transition-colors">
            Doxing Dot Life
          </span>
          <span className="font-black text-base sm:text-lg text-white xs:hidden group-hover:text-[#0088CC] transition-colors">
            DDL
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center gap-6 xl:gap-8 animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#979797] hover:text-white transition-all duration-200 hover:scale-110 group"
          >
            <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-[#0088CC]" />
            <span className="hidden xl:inline group-hover:text-[#0088CC]">
              Home
            </span>
          </Link>
          <Link
            to="/all-posts"
            className="text-sm font-semibold text-[#979797] hover:text-white transition-all duration-200 group"
          >
            <span className="group-hover:text-[#0088CC]">Posts</span>
          </Link>
          <Link
            to="/dox-anyone"
            className="flex items-center gap-2 px-5 py-2 bg-[#0088CC] text-white font-semibold rounded-lg hover:bg-[#0077BB] transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#0088CC]/40 active:scale-95 group"
          >
            <SearchAltIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Dox Now</span>
          </Link>
          {isAuthenticated && (
            <>
              {location.pathname !== "/uppostpanel" && (
                <Link
                  to="/uppostpanel"
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-purple-600/40 active:scale-95 group"
                >
                  <UploadIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden xl:inline">Upload</span>
                </Link>
              )}
              {location.pathname !== "/admin-panel" && (
                <Link
                  to="/admin-panel"
                  className="flex items-center gap-2 px-5 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-amber-600/40 active:scale-95 group"
                >
                  <SettingsIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden xl:inline">Admin</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-red-600/40 active:scale-95 group"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button - Modern Hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg transition-all duration-300 relative touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#0088CC] focus:ring-offset-2 focus:ring-offset-[#000000] group hover:bg-[#666666]/40"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={
            isSidebarOpen ? "Close navigation menu" : "Toggle navigation menu"
          }
          aria-expanded={isSidebarOpen}
          aria-controls="mobile-menu"
        >
          <div className="relative w-6 h-5 flex items-center justify-center">
            {/* Hamburger lines with modern animation */}
            <div
              className="absolute w-full h-px bg-white transition-all duration-300 ease-in-out"
              style={{
                transform: isSidebarOpen
                  ? "rotate(45deg) translateY(0)"
                  : "translateY(-8px)",
              }}
            />
            <div
              className="absolute w-full h-px bg-white transition-all duration-300 ease-in-out"
              style={{
                opacity: isSidebarOpen ? 0 : 1,
              }}
            />
            <div
              className="absolute w-full h-px bg-white transition-all duration-300 ease-in-out"
              style={{
                transform: isSidebarOpen
                  ? "rotate(-45deg) translateY(0)"
                  : "translateY(8px)",
              }}
            />
          </div>
        </button>

        {/* Right-to-Left Sidebar Navigation */}
        {isSidebarOpen && (
          <>
            {/* Blur Overlay */}
            <div
              className={`fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden ${
                isClosing ? "animate-overlayBlurOut" : "animate-overlayBlur"
              }`}
              onClick={closeSidebar}
              role="presentation"
              aria-hidden="true"
              style={{ zIndex: 40 }}
            />

            {/* Sidebar from Right */}
            <div
              id="mobile-menu"
              className={`fixed top-0 right-0 h-screen w-80 max-w-[85vw] bg-[#000000] lg:hidden shadow-2xl flex flex-col overflow-hidden border-l border-[#666666] ${
                isClosing
                  ? "animate-slideOutToRight"
                  : "animate-slideInFromRight"
              }`}
              style={{
                zIndex: 50,
              }}
              role="navigation"
              aria-label="Mobile navigation"
            >
              {/* Header with close button */}
              <div className="h-16 sm:h-20 border-b border-[#666666] flex items-center justify-between px-4 sm:px-6 flex-shrink-0 bg-gradient-to-r from-[#0a0a0a] to-transparent">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Menu
                </h2>
                <button
                  onClick={closeSidebar}
                  aria-label="Close navigation menu"
                  className="p-2 rounded-lg hover:bg-[#666666]/40 transition-all duration-200 group hover:shadow-lg hover:shadow-[#0088CC]/20"
                >
                  <ChevronRight className="w-6 h-6 text-white group-hover:text-[#0088CC] group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              {/* Scrollable menu content */}
              <nav className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-2">
                <Link
                  to="/"
                  onClick={closeSidebar}
                  className="flex items-center gap-4 w-full px-4 py-3 sm:py-4 text-[#979797] font-semibold hover:bg-gradient-to-r hover:from-[#0088CC]/20 hover:to-transparent hover:text-white rounded-lg transition-all duration-200 active:bg-[#0088CC]/40 text-base sm:text-lg touch-target hover:translate-x-2 group"
                >
                  <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="flex-1">Home</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  to="/all-posts"
                  onClick={closeSidebar}
                  className="flex items-center gap-4 w-full px-4 py-3 sm:py-4 text-[#979797] font-semibold hover:bg-gradient-to-r hover:from-[#0088CC]/20 hover:to-transparent hover:text-white rounded-lg transition-all duration-200 active:bg-[#0088CC]/40 text-base sm:text-lg touch-target hover:translate-x-2 group"
                >
                  <span className="text-lg sm:text-2xl flex-shrink-0">📋</span>
                  <span className="flex-1">All Posts</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  to="/dox-anyone"
                  onClick={closeSidebar}
                  className="flex items-center gap-4 w-full px-4 py-3 sm:py-4 text-white font-semibold bg-gradient-to-r from-[#0088CC] to-[#0066AA] hover:from-[#0099DD] hover:to-[#0077BB] rounded-lg transition-all duration-200 active:shadow-inner shadow-lg shadow-[#0088CC]/40 text-base sm:text-lg touch-target hover:translate-x-1 group"
                >
                  <SearchAltIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="flex-1">Dox Now</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                {isAuthenticated && (
                  <>
                    <div className="my-4 border-t border-[#666666]" />
                    {location.pathname !== "/uppostpanel" && (
                      <Link
                        to="/uppostpanel"
                        onClick={closeSidebar}
                        className="flex items-center gap-4 w-full px-4 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-500 hover:to-purple-600 rounded-lg transition-all duration-200 active:shadow-inner shadow-lg shadow-purple-600/40 text-base sm:text-lg touch-target hover:translate-x-1 group"
                      >
                        <UploadIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="flex-1">Upload Post</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                    {location.pathname !== "/admin-panel" && (
                      <Link
                        to="/admin-panel"
                        onClick={closeSidebar}
                        className="flex items-center gap-4 w-full px-4 py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-500 hover:to-amber-600 rounded-lg transition-all duration-200 active:shadow-inner shadow-lg shadow-amber-600/40 text-base sm:text-lg touch-target hover:translate-x-1 group"
                      >
                        <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="flex-1">Admin Panel</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </>
                )}
              </nav>

              {/* Footer section with logout button */}
              {isAuthenticated && (
                <div className="p-4 sm:p-5 border-t border-[#666666] bg-gradient-to-t from-[#0a0a0a] to-transparent flex-shrink-0">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-lg hover:shadow-red-600/40 active:shadow-inner text-base sm:text-lg touch-target group"
                  >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
