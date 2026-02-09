interface FormInputProps {
  id: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  label?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  maxLength?: number;
  min?: string;
  max?: string;
  className?: string;
}

export default function FormInput({
  id,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  required = false,
  maxLength,
  min,
  max,
  className = '',
}: FormInputProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase ml-1"
          style={{ color: 'var(--color-muted)' }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none text-sm transition-all"
        style={{
          backgroundColor: 'var(--color-surface2)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
      />
    </div>
  );
}
