export function StepGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 12,
        color: "#111827"
      }}>
        {title}
      </h2>

      <div>
        {children}
      </div>
    </div>
  );
}