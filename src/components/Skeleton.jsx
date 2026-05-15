export default function Skeleton({ width = "100%", height = 16, borderRadius = 6, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, display: "block", ...style }}
    />
  );
}
