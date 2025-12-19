import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageCircle, User, Bell } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
      <header
          className="bg-gray-900 fixed w-full top-0 z-40
    backdrop-blur-lg bg-gray-900/90"
      >
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all">
                <div className="size-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-100" />
                </div>
                <h1 className="text-xl font-bold text-purple-100">SecureChat</h1>
              </Link>
            </div>

            <div className="flex items-center gap-2">


              {authUser && (
                  <>
                    <button className="btn btn-ghost btn-circle text-purple-300 relative hover:bg-purple-900/30">
                      <Bell className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 size-3 bg-purple-500 rounded-full"></span>
                    </button>
                    <Link to={"/profile"} className="btn btn-ghost gap-2 text-purple-300 hover:text-purple-200 hover:bg-purple-900/30">
                      <User className="size-5" />
                      <span className="hidden sm:inline">Profilo</span>
                    </Link>

                    <button
                        className="flex gap-2 items-center btn btn-ghost text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
                        onClick={logout}
                    >
                      <LogOut className="size-5" />
                      <span className="hidden sm:inline">Esci</span>
                    </button>
                  </>
              )}
            </div>
          </div>
        </div>
      </header>
  );
};
export default Navbar;