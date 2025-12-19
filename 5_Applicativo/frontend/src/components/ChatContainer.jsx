import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
    const {
        messages,
        getMessages,
        isMessagesLoading,
        selectedUser,
        subscribeToMessages,
        unsubscribeFromMessages,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);

    useEffect(() => {
        getMessages(selectedUser._id);

        subscribeToMessages();

        return () => unsubscribeFromMessages();
    }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto bg-gray-900">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto bg-gray-900">
            <ChatHeader />

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-900 to-purple-900/20">
                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`flex ${message.senderId === authUser._id ? "justify-end" : "justify-start"}`}
                        ref={messageEndRef}
                    >
                        <div className={`max-w-xs lg:max-w-md rounded-2xl p-3 ${message.senderId === authUser._id
                            ? "bg-purple-600 text-purple-50 rounded-br-none shadow-lg"
                            : "bg-gray-800 text-gray-100 rounded-bl-none shadow-lg border border-purple-900/30"}`}
                        >
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="rounded-lg mb-2 max-w-full border border-purple-900/30"
                                />
                            )}
                            {message.text && <p className="text-sm">{message.text}</p>}
                            <div className={`text-xs mt-1 ${message.senderId === authUser._id ? "text-purple-200" : "text-purple-400"}`}>
                                {formatMessageTime(message.createdAt)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <MessageInput />
        </div>
    );
};
export default ChatContainer;