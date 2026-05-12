export default function GameCard({ title, play }) {

  return (

    <div
      onClick={play}
      style={{
        background: "#1e1e2f",
        borderRadius: "12px",
        padding: "30px",
        margin: "10px",
        width: "200px",
        textAlign: "center",
        cursor: "pointer",
        boxShadow: "0 5px 15px rgba(0,0,0,0.4)",
        transition: "transform 0.2s"
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
    >

      <h3>{title}</h3>

      <p>Play now</p>

    </div>

  );

}