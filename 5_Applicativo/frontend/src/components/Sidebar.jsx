import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
      ? users.filter((user) => onlineUsers.includes(user._id))
      : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
      <aside className="h-full w-20 lg:w-80 bg-gray-900 flex flex-col transition-all duration-200">
        {/* Header */}
        <div className="border-b border-purple-900/50 w-full p-5">
          <div className="flex items-center gap-2">
            <Users className="size-6 text-purple-400" />
            <span className="font-medium hidden lg:block text-purple-400">Contatti</span>
          </div>


        </div>

        {/* Online users */}
        <div className="px-4 py-3 bg-gray-800 border-b border-purple-900/30 hidden lg:flex items-center justify-between">
          <label className="cursor-pointer flex items-center gap-2">
            <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm bg-purple-600 border-purple-500"
            />
            <span className="text-sm text-purple-200">Solo utenti online</span>
          </label>
          <span className="text-xs text-purple-300 bg-purple-900/30 px-2 py-1 rounded-full">
            {onlineUsers.length - 1} online
            </span>
        </div>

        {/* Contacts List */}
        <div className="overflow-y-auto w-full flex-1 bg-gray-900">
          {filteredUsers.map((user) => (
              <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`
              w-full p-4 flex items-center gap-3 border-b border-purple-900/20
              hover:bg-purple-900/20 transition-colors
              ${selectedUser?._id === user._id ? "bg-purple-900/30 border-l-4 border-l-purple-500" : ""}
            `}
              >
                <div className="relative">
                  <img
                      src={"/avatar.png"}
                      alt={user.name}
                      className="size-12 object-cover rounded-full border-2 border-purple-700/50"
                  />
                  {onlineUsers.includes(user._id) && (
                      <span
                          className="absolute bottom-0 right-0 size-3 bg-purple-500
                  rounded-full ring-2 ring-gray-900"
                      />
                  )}
                </div>

                {/* User info - only visible on larger screens */}
                <div className="hidden lg:block text-left flex-1 min-w-0">
                  <div className="font-semibold text-purple-100 truncate">{user.username}</div>
                  <div className="text-sm text-purple-300 flex items-center gap-1">
                    <span className={`${onlineUsers.includes(user._id) ? "bg-purple-500" : "bg-purple-700"}`}></span>
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
          ))}

          {filteredUsers.length === 0 && (
              <div className="text-center text-purple-400 py-8">
                <Users className="size-12 mx-auto mb-2 text-purple-700" />
                <p>Nessun utente online</p>
              </div>
          )}
        </div>
      </aside>
  );
};
export default Sidebar;