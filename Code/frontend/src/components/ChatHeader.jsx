import { X, Phone, Video, MoreVertical } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
      <div className="p-4 border-b border-purple-900/50 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back button for mobile */}
            <button
                onClick={() => setSelectedUser(null)}
                className="lg:hidden p-2 rounded-full hover:bg-purple-900/30 text-purple-300"
            >
              <X className="size-5" />
            </button>

            {/* Avatar */}
            <div className="relative">
              <div className="size-12 rounded-full">
                <img
                    src={selectedUser.profilePic || "/avatar.png"}
                    alt={selectedUser.username}
                    className="rounded-full border-2 border-purple-700/50"
                />
              </div>
              {onlineUsers.includes(selectedUser._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-purple-500 rounded-full border-2 border-gray-900" />
              )}
            </div>

            {/* User info */}
            <div>
              <h3 className="font-semibold text-purple-100">{selectedUser.username}</h3>
              <p className="text-sm text-purple-300 flex items-center gap-1">
                <span className={`size-2 rounded-full ${onlineUsers.includes(selectedUser._id) ? "bg-purple-500" : "bg-purple-700"}`}></span>
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button className="text-purple-400" onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
  );
};
export default ChatHeader;