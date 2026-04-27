import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Label,
  Legend,
} from "recharts";
import { useMemo } from "react";

export default function PriceScatter({ data, lang = "en" }) {
  const t = {
    en: {
      mileage: "Mileage (km)",
      price: "Price (£)",
      active: "Active listings",
      removed: "Recently removed",
      noData: "No data available",
    },
    tr: {
      mileage: "KM",
      price: "Fiyat (£)",
      active: "Aktif ilanlar",
      removed: "Kaldırılan ilanlar",
      noData: "Veri yok",
    },
    ru: {
      mileage: "Пробег (км)",
      price: "Цена (£)",
      active: "Активные",
      removed: "Удалённые",
      noData: "Нет данных",
    },
  };

  const text = t[lang] || t.en;

  const { active, removed } = useMemo(() => {
    if (!Array.isArray(data)) return { active: [], removed: [] };

    const normalized = data
      .map((d) => {
        const price = Number(d.price ?? d.Price);
        const mileage = Number(d.mileage ?? d.KM ?? d.km);
        const date = new Date(d.DATE || d.date || d.Date);

        if (!Number.isFinite(price) || !Number.isFinite(mileage) || isNaN(date)) {
          return null;
        }

        return {
          price: Math.round(price),
          mileage: Math.round(mileage),
          date,
        };
      })
      .filter(Boolean);

    if (!normalized.length) return { active: [], removed: [] };

    const maxDate = new Date(
      Math.max(...normalized.map((d) => d.date.getTime()))
    ).getTime();

    const active = normalized.filter((d) => d.date.getTime() === maxDate);
    const removed = normalized.filter((d) => d.date.getTime() !== maxDate);

    return { active, removed };
  }, [data]);

  if (!active.length && !removed.length) {
    return (
      <div
        style={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 13,
        }}
      >
        {text.noData}
      </div>
    );
  }

  const allPrices = [...active, ...removed].map((d) => d.price);
  const maxPrice = Math.max(...allPrices);
  const STEP = 20000;
  const yMax = (Math.floor(maxPrice / STEP) + 1) * STEP;
  const yTicks = Array.from({ length: yMax / STEP + 1 }, (_, i) => i * STEP);

  return (
    <div
      style={{
        width: "100%",
        height: 340,
        display: "flex",
        gap: 12,
        alignItems: "stretch",
      }}
    >
      {/* CHART */}
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />

            <XAxis
              type="number"
              dataKey="mileage"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            >
              <Label
                value={text.mileage}
                offset={-5}
                position="insideBottom"
                style={{ fill: "#64748b", fontSize: 11 }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="price"
              domain={[0, yMax]}
              ticks={yTicks}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            >
              <Label
                value={text.price}
                angle={-90}
                position="insideLeft"
                style={{ fill: "#64748b", fontSize: 11 }}
              />
            </YAxis>

            <Tooltip
              cursor={{ stroke: "#2563eb", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;

                return (
                  <div
                    style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      padding: 8,
                      fontSize: 12,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      £{p.price.toLocaleString()}
                    </div>
                    <div style={{ color: "#64748b" }}>
                      {p.mileage.toLocaleString()} km
                    </div>
                  </div>
                );
              }}
            />

            {/* ACTIVE */}
            <Scatter
              name="active"
              data={active}
              fill="#2563eb"
              shape={(props) => {
                const { cx, cy } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="#2563eb"
                    style={{
                      opacity: 0,
                      transform: "scale(0.6)",
                      animation: "fadeInPoint 500ms ease forwards",
                    }}
                  />
                );
              }}
            />

            {/* REMOVED */}
            <Scatter
              name="removed"
              data={removed}
              fill="#94a3b8"
              shape={(props) => {
                const { cx, cy } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="#94a3b8"
                    style={{
                      opacity: 0,
                      transform: "scale(0.6)",
                      animation: "fadeInPoint 650ms ease forwards",
                    }}
                  />
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND (RIGHT SIDE PREMIUM PANEL) */}
      <div
        style={{
          width: 140,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 10,
          paddingLeft: 6,
        }}
      >
        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
          LEGEND
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: "#2563eb",
            }}
          />
          <div style={{ fontSize: 12 }}>{text.active}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: "#94a3b8",
            }}
          />
          <div style={{ fontSize: 12 }}>{text.removed}</div>
        </div>
      </div>

      {/* ANIMATION */}
      <style>
        {`
          @keyframes fadeInPoint {
            from {
              opacity: 0;
              transform: scale(0.6);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}