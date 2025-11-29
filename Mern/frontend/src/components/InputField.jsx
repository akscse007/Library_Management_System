import React from "react";

export default function InputField({ id, label, type = "text", value, onChange, placeholder, autoFocus }) {
  return (
    <div className="input-row">
      <label htmlFor={id} className="input-label">{label}</label>
      <input
        id={id}
        className="input-control"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={label}
      />
    </div>
  );
}
