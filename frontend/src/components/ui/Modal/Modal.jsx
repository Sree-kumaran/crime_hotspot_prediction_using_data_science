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
      <button
        className="absolute inset-0 bg-black/50 w-full h-full"
        onClick={onClose}
        aria-label="Close modal overlay"
      />
      <div className="absolute inset-0 p-4 flex items-center justify-center">
        <div
          className={cn(
            "w-full rounded-xl bg-white shadow-card border border-border",
            sizeMap[size],
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-h3">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-bg-muted"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-5">{children}</div>
          {footer && (
            <div className="px-5 py-3 border-t border-border bg-bg-muted/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Modal;
