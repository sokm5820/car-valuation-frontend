import { Button } from "./Button";

export function SelectButton({ options, value, onChange }) {
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <Button
          key={opt}
          selected={value === opt}
          onClick={() => onChange(opt)}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}