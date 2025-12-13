import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const PasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { selectedUser, setSelectedUser } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShowPassword(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onSubmit(null);
        setPassword("");
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onSubmit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const pwd = password.trim().length > 0 ? password.trim() : null;
    onSubmit(pwd);
    setPassword("");
  };

  const handleCancel = () => {
    onSubmit(null);
    setPassword("");
    setSelectedUser(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop opaco scuro */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-purple-800/50 w-full max-w-md mx-4 z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-400/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-100">Password di decifratura</h2>
              <p className="text-sm text-purple-300">Inserisci la password per decifrare i messaggi</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-purple-400">Password</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-purple-400/40" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full pl-10 bg-gray-800 border-purple-800/50 text-purple-100 focus:border-purple-400 focus:outline-none"
                placeholder="Inserisci la password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400/60 hover:text-purple-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <label className="label">
              <span className="label-text-alt text-purple-300/70">
                Lascia vuoto per vedere il testo cifrato
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="btn flex-1 bg-gray-800 hover:bg-gray-700 text-purple-300 border-purple-800/50 hover:border-purple-700"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="btn flex-1 bg-purple-400 hover:bg-purple-300 text-gray-900 border-purple-400 hover:border-purple-300 font-medium"
            >
              Conferma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
