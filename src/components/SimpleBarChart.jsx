export default function SimpleBarChart({ title, rows = [] }) {
  const maxValue = rows.length > 0
    ? Math.max(...rows.map((row) => Number(row.value || 0)), 1)
    : 1;

  return (
    <div className="card" style={{ marginTop: "20px", padding: "16px" }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>

      {rows.length === 0 ? (
        <p>Aucune donnée</p>
      ) : (
        rows.map((row, index) => {
          const width = `${Math.max(6, (Number(row.value || 0) / maxValue) * 100)}%`;

          return (
            <div key={`${row.label}-${index}`} style={{ marginBottom: "14px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <strong>{row.label}</strong>
                <span>{row.value}</span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "12px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width,
                    height: "100%",
                    background: "linear-gradient(90deg, #3b82f6, #22c55e)",
                    borderRadius: "999px",
                  }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}