import { cn } from "../../../lib/utils";

function Select({
  label,
  options = [],
  placeholder = "Select...",
  error,
  required,
  helperText,
  className,
  ...props
}) {
  const id =
    props.id ||
    `select-${label?.replace(/\s+/g, "-").toLowerCase() || "field"}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-palette-lilac">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full h-10 rounded-lg border px-3 text-sm bg-palette-ink text-palette-almond",
          error
            ? "border-red-500/80 focus:border-red-400 focus:ring-red-400/20"
            : "border-[#2b3254] focus:border-palette-lilac focus:ring-1 focus:ring-palette-lilac/30",
          "focus:outline-none transition-colors duration-150 disabled:bg-[#12162a] disabled:text-palette-muted",
          className,
        )}
        {...props}
      >
        <option value="" className="text-palette-lilac bg-palette-ink">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="text-palette-almond bg-palette-prussian"
          >
            {opt.label}
          </option>
        ))}
      </select>

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

export default Select;
