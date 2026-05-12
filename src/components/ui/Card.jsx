export default function Card({ title, children }) {

  return (

    <div
      style={{
        background: "#1e1e2f",
        padding: "20px",
        borderRadius: "12px",
        color: "white",
        width: "300px",
        margin: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.4)"
      }}
    >

      <h3>{title}</h3>

      {children}

    </div>

  );

}