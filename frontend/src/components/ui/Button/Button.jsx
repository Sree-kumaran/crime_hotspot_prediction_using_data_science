import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

const variantClasses = {
  primary: "bg-[#2a3d45] text-white hover:bg-[#35505b]",
  secondary: "bg-[#3f535c] text-white hover:bg-[#4e6670]",
  outline:
    "border border-[#3f535c] bg-transparent hover:bg-[#31464f] text-gray-100",
  ghost: "bg-transparent hover:bg-[#31464f] text-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  warning: "bg-amber-600 text-white hover:bg-amber-700",
};

const sizeClasses = {
  sm: "h-9 px-3 text-small",
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
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed",
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
