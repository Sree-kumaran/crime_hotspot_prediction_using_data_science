import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

const variantClasses = {
  primary:
    "bg-palette-almond text-palette-ink font-semibold hover:bg-[#e4cbaf] active:scale-[0.98] shadow-glow",
  secondary:
    "bg-palette-grape text-palette-almond font-medium hover:bg-[#575a8a] active:scale-[0.98] border border-[#575a8a]",
  outline:
    "border border-palette-grape bg-transparent hover:bg-palette-prussian text-palette-lilac hover:text-palette-almond active:scale-[0.98]",
  ghost:
    "bg-transparent hover:bg-palette-prussian text-palette-lilac hover:text-palette-almond",
  danger:
    "bg-red-950/80 border border-red-700/60 text-red-200 hover:bg-red-900/80 active:scale-[0.98]",
  success:
    "bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 hover:bg-emerald-900/80 active:scale-[0.98]",
  warning:
    "bg-amber-950/80 border border-amber-700/60 text-amber-200 hover:bg-amber-900/80 active:scale-[0.98]",
};

const sizeClasses = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-small",
  lg: "h-11 px-5 text-body",
};

function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  children,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : icon}
      {children}
    </button>
  );
}

export default Button;
