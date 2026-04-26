export function Select({ options = [], value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full px-4 py-4 rounded-2xl border border-slate-200
        bg-white text-slate-900 text-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-400
      "
    >
      <option value="">Select...</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}