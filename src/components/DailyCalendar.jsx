import "./daily.css";

const rewards = [
  { day: 1, rarity: "common", xp: 50 },
  { day: 2, rarity: "common", xp: 75 },
  { day: 3, rarity: "rare", xp: 100 },
  { day: 4, rarity: "rare", xp: 150 },
  { day: 5, rarity: "epic", xp: 200 },
  { day: 6, rarity: "epic", xp: 300 },
  { day: 7, rarity: "legendary", xp: 500 },
];

export default function DailyCalendar({ streak }) {
  return (
    <div className="daily-calendar">
      {rewards.map((r) => (
        <div
          key={r.day}
          className={`day-box rarity-${r.rarity} ${
            streak >= r.day ? "claimed" : ""
          }`}
        >
          <div className="day">Jour {r.day}</div>
          <div className="xp">{r.xp} XP</div>
          <div className="rarity">{r.rarity}</div>
        </div>
      ))}
    </div>
  );
}
