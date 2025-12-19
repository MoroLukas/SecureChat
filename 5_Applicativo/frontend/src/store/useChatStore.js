import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isPasswordModalOpen: false,
  passwordModalResolver: null,

  openPasswordModal: (resolver) => {
    set({ isPasswordModalOpen: true, passwordModalResolver: resolver });
  },

  closePasswordModal: (password) => {
    const resolver = get().passwordModalResolver;
    set({ isPasswordModalOpen: false, passwordModalResolver: null });
    if (resolver) {
      resolver(password);
    }
  },

  askPasswordIfMissing: async () => {
    const current = useAuthStore.getState().decryptionPassword;
    if (current) return current;

    return new Promise((resolve) => {
      get().openPasswordModal((password) => {
        const pwd = password && password.trim().length > 0 ? password.trim() : null;
        if (pwd) {
          useAuthStore.getState().setDecryptionPassword(pwd);
        }
        resolve(pwd);
      });
    });
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const password = await get().askPasswordIfMissing();
      if (password) {
        await get().getDecryptedMessages(userId, password);
        return;
      }

      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Errore nel caricamento dei messaggi");
    } finally {
      set({ isMessagesLoading: false });
    }
  },


  //Parte del codice generata con Deepseek
  getDecryptedMessages: async (userId, password) => {
    try {
      const res = await axiosInstance.post(`/messages/${userId}/decrypted`, { password });
      const decryptedMessages = res.data;
      

      const currentMessages = get().messages;
      const messagesWithOriginalText = decryptedMessages.map(decryptedMsg => {

        if (decryptedMsg.isSentByMe) {
          const existingMessage = currentMessages.find(msg => msg._id === decryptedMsg._id);

          if (existingMessage && existingMessage.text && !existingMessage.text.match(/^[A-Za-z0-9+/=]{100,}$/)) {
            return {
              ...decryptedMsg,
              text: existingMessage.text
            };
          }
        }
        return decryptedMsg;
      });
      
      set({ messages: messagesWithOriginalText });
    } catch (error) {
      toast.error(error.response?.data?.error || "Errore nella decifratura dei messaggi");
      // Fallback: carica i messaggi non decifrati
      try {
        const res = await axiosInstance.get(`/messages/${userId}`);
        set({ messages: res.data });
      } catch (fallbackError) {
        console.error("Errore nel fallback:", fallbackError);
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const messageWithOriginalText = {
        ...res.data,
        text: messageData.text,
        isSentByMe: true,
        isDecrypted: true
      };
      set({ messages: [...messages, messageWithOriginalText] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Errore nell'invio del messaggio");
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    socket.on("newMessage", async (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      if (newMessage.receiverId === authUser._id && newMessage.text) {
        const pwd = useAuthStore.getState().decryptionPassword;
        if (pwd) {
          await get().getDecryptedMessages(selectedUser._id, pwd);
          return;
        }
        return;
      }

      if (newMessage.senderId === authUser._id) {
        const pwd = useAuthStore.getState().decryptionPassword;
        if (pwd) {
          await get().getDecryptedMessages(selectedUser._id, pwd);
          return;
        }
      }

      const currentMessages = get().messages;
      const messageExists = currentMessages.some(msg => msg._id === newMessage._id);
      if (!messageExists) {
        set({
          messages: [...currentMessages, newMessage],
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
