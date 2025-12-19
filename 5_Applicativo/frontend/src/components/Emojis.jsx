import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";

const EMOJIS = ["😀","😁","😂","🤣","😊","😍","😘","😎","🤩","😇","🤔","🤨","🙄","😢","😭","😡","👍","👏","🔥","✨","🎉","❤️","✅", "🌚"];

const Emojis = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        className="btn btn-ghost btn-circle text-purple-400 hover:text-purple-300 hover:bg-purple-900/30"
        onClick={() => setOpen((o) => !o)}
      >
        <Smile className="size-5" />
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 z-20 w-52 max-h-52 overflow-y-auto rounded-xl bg-gray-900 border border-purple-800/60 shadow-xl p-2 grid grid-cols-6 gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="text-xl hover:scale-110 transition-transform"
              onClick={() => {
                onSelect?.(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Emojis;

