function Select({
  label,
  options = [],
  placeholder = "Select...",
  error,
  required,
  helperText,
  ...props
}) {
  const id =
    props.id ||
    `select-${label?.replace(/\s+/g, "-").toLowerCase() || "field"}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-100">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={`w-full h-10 rounded-lg border px-3 text-sm bg-[#24353c] text-gray-100 ${
          error
            ? "border-red-500"
            : "border-[#3f535c] focus:border-[#4e6670] focus:ring-2 focus:ring-[#3f535c]"
        }`}
        {...props}
      >
        <option value="" className="text-[#a3a3a3]">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="text-gray-100 bg-[#24353c]"
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
        <p className="text-xs text-[#a3a3a3]">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Select;
