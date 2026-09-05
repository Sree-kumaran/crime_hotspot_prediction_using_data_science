import { cn } from "../../../lib/utils";

function Input({
  label,
  helperText,
  error,
  required,
  className,
  type = "text",
  ...props
}) {
  const id =
    props.id || `input-${label?.replace(/\s+/g, "-").toLowerCase() || "field"}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-100">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <input
        id={id}
        type={type}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full h-10 rounded-lg border bg-[#24353c] px-3 text-sm text-gray-100 placeholder:text-[#a3a3a3]",
          error ? "border-red-500" : "border-[#3f535c] focus:border-[#4e6670]",
          "focus:outline-none focus:ring-2 focus:ring-[#3f535c] disabled:bg-[#2a3d45] disabled:text-gray-400",
          className,
        )}
        {...props}
      />

      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-[#a3a3a3]">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Input;
