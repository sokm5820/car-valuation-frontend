import { Button } from "./Button";

export function ListSelect({ options, value, onChange }) {
  return (
    <div className="space-y-3 flex flex-col">
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