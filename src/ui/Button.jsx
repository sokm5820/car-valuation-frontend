export function Button({ children, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 16px",
        marginBottom: 10,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: 500,
        cursor: "pointer",
        textAlign: "left",

        background: selected ? "#4f46e5" : "#ffffff",
        color: selected ? "#ffffff" : "#111827",

        border: "1px solid #e5e7eb"
      }}
    >
      {children}
    </button>
  );
}