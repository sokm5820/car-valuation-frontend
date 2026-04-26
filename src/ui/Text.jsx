export function Text({ children, variant = "body" }) {
  const styles = {
    title: "text-xl font-medium text-gray-900 tracking-tight",
    body: "text-sm text-gray-600 leading-relaxed",
    muted: "text-xs text-gray-400",
  };

  return <p className={styles[variant]}>{children}</p>;
}