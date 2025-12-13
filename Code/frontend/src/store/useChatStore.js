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
    
    // Apri il modal e aspetta la risposta
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

  getDecryptedMessages: async (userId, password) => {
    try {
      const res = await axiosInstance.post(`/messages/${userId}/decrypted`, { password });
      const decryptedMessages = res.data;
      
      // Mantieni il testo originale per i messaggi che hai inviato tu e che erano già nella lista
      const currentMessages = get().messages;
      const messagesWithOriginalText = decryptedMessages.map(decryptedMsg => {
        // Se è un messaggio che hai inviato tu, cerca se c'era già nella lista con il testo originale
        if (decryptedMsg.isSentByMe) {
          const existingMessage = currentMessages.find(msg => msg._id === decryptedMsg._id);
          // Se esisteva già e aveva il testo originale (non cifrato), mantienilo
          if (existingMessage && existingMessage.text && !existingMessage.text.match(/^[A-Za-z0-9+/=]{100,}$/)) {
            return {
              ...decryptedMsg,
              text: existingMessage.text // Mantieni il testo originale
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
      // Aggiungi il messaggio con il testo originale per mostrarlo all'utente
      const messageWithOriginalText = {
        ...res.data,
        text: messageData.text, // Salva il testo originale per mostrarlo all'utente
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

      // Se il messaggio è per me, prova a decifrarlo subito se ho già la password
      if (newMessage.receiverId === authUser._id && newMessage.text) {
        const pwd = useAuthStore.getState().decryptionPassword;
        if (pwd) {
          await get().getDecryptedMessages(selectedUser._id, pwd);
          return;
        }
        return;
      }

      // Se è un messaggio che ho inviato io, ricarica in chiaro usando la password già inserita
      if (newMessage.senderId === authUser._id) {
        const pwd = useAuthStore.getState().decryptionPassword;
        if (pwd) {
          await get().getDecryptedMessages(selectedUser._id, pwd);
          return;
        }
      }

      // Se è un messaggio che ho inviato io o non riusciamo a decifrarlo, aggiungilo così com'è
      // Ma controlla che non sia già presente per evitare duplicati
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
