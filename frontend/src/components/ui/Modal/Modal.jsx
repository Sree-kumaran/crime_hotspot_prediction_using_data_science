import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../../lib/utils";

const sizeMap = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };

function Modal({ open, onClose, title, size = "md", children, footer }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-palette-ink/80 backdrop-blur-sm w-full h-full"
        onClick={onClose}
        aria-label="Close modal overlay"
      />
      <div className="absolute inset-0 p-4 flex items-center justify-center pointer-events-none">
        <div
          className={cn(
            "w-full rounded-xl bg-palette-prussian shadow-2xl border border-[#262c4d] text-palette-almond pointer-events-auto",
            sizeMap[size],
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="px-5 py-3.5 border-b border-[#262c4d] flex items-center justify-between bg-palette-ink/40">
            <h3 className="text-sm font-bold text-palette-almond">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-palette-lilac hover:bg-[#1e2444] hover:text-palette-almond transition"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-5 text-sm text-palette-lilac">{children}</div>
          {footer && (
            <div className="px-5 py-3 border-t border-[#262c4d] bg-palette-ink/30 rounded-b-xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Modal;
