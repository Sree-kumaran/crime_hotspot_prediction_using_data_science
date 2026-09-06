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
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-palette-lilac">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <input
        id={id}
        type={type}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full h-10 rounded-lg border bg-palette-ink px-3 text-sm text-palette-almond placeholder:text-palette-lilac/50",
          error
            ? "border-red-500/80 focus:border-red-400 focus:ring-red-400/20"
            : "border-[#2b3254] focus:border-palette-lilac focus:ring-1 focus:ring-palette-lilac/30",
          "focus:outline-none transition-colors duration-150 disabled:bg-[#12162a] disabled:text-palette-muted",
          className,
        )}
        {...props}
      />

      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-palette-lilac/70">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Input;
