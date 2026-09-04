import { useEffect, useState } from "react";
import { timeRemaining } from "../lib/format";

export default function CountdownTimer({
  endsAt,
  status,
  compact = false,
}: {
  endsAt: string;
  status?: string;
  compact?: boolean;
}) {
  const [remaining, setRemaining] = useState(() => timeRemaining(endsAt));

  useEffect(() => {
    const id = setInterval(() => setRemaining(timeRemaining(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (status && status !== "active") {
    return <span className="font-medium text-slate-500">Auction ended</span>;
  }

  if (remaining.done) {
    return <span className="font-medium text-rose-600">Ending...</span>;
  }

  const urgent = remaining.days === 0 && remaining.hours < 1;

  if (compact) {
    return (
      <span className={urgent ? "font-semibold text-rose-600" : "font-semibold text-slate-700"}>
        {remaining.days > 0 && `${remaining.days}d `}
        {String(remaining.hours).padStart(2, "0")}:{String(remaining.minutes).padStart(2, "0")}:
        {String(remaining.seconds).padStart(2, "0")}
      </span>
    );
  }

  return (
    <div className={`flex gap-3 ${urgent ? "text-rose-600" : "text-slate-800"}`}>
      {[
        { label: "days", value: remaining.days },
        { label: "hrs", value: remaining.hours },
        { label: "min", value: remaining.minutes },
        { label: "sec", value: remaining.seconds },
      ].map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <span className="text-2xl font-bold tabular-nums">{String(unit.value).padStart(2, "0")}</span>
          <span className="text-xs uppercase tracking-wide text-slate-400">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
