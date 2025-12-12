import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile, Paperclip } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
      <div className="p-4 w-full bg-gray-900 border-t border-purple-900/50">
        {imagePreview && (
            <div className="mb-3 flex items-center gap-2">
              <div className="relative">
                <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-purple-700/50"
                />
                <button
                    onClick={removeImage}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-purple-100
              flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
                    type="button"
                >
                  <X className="size-3" />
                </button>
              </div>
              <span className="text-sm text-purple-400">Anteprima immagine</span>
            </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 flex gap-1">
            {/* Action buttons */}
            <button
                type="button"
                className="btn btn-ghost btn-circle text-purple-400 hover:text-purple-300 hover:bg-purple-900/30"
                onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="size-5" />
            </button>

            <button
                type="button"
                className="btn btn-ghost btn-circle text-purple-400 hover:text-purple-300 hover:bg-purple-900/30"
            >
              <Smile className="size-5" />
            </button>

            {/* Text input */}
            <input
                type="text"
                className="flex-1 input rounded-full bg-gray-800 border-purple-700/50 text-purple-100 placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Scrivi un messaggio..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
            />
          </div>

          {/* Send button */}
          <button
              type="submit"
              className="btn btn-circle bg-purple-600 hover:bg-purple-700 border-none text-purple-100"
              disabled={!text.trim() && !imagePreview}
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>
  );
};
export default MessageInput;