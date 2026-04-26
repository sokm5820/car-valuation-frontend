export function Card({ children }) {
  return (
    <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-10 space-y-8 border border-slate-100">
      {children}
    </div>
  );
}