export default function SectionCard({ title, children, style = {}, right = null }) {
  return (
    <div className="section-card" style={style}>
      <div className="section-card__header">
        <h3 className="section-card__title">{title}</h3>
        {right && <div>{right}</div>}
      </div>
      {children}
    </div>
  );
}
