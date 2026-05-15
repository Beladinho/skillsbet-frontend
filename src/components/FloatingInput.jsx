export default function FloatingInput({ id, label, type = "text", value, onChange, autoComplete, placeholder = " ", disabled, style = {} }) {
  return (
    <div className="input-float-wrap" style={style}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
