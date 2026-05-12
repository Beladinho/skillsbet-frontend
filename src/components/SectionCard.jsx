export default function SectionCard({ title, children, style = {}, right = null }) {
  return (
    <div
      className="card"
      style={{
        marginTop: "24px",
        padding: "20px",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        {right}
      </div>

      {children}
    </div>
  );
}