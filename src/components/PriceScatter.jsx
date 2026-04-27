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

export default function PriceScatter({ data, lang = "en" }) {
  const t = {
    en: {
      mileage: "Mileage (km)",
      price: "Price (£)",
      active: "Active listings",
      removed: "Recently removed listings",
      noData: "No data",
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
      active: "Активные объявления",
      removed: "Удалённые объявления",
      noData: "Нет данных",
    },
    ar: {
      mileage: "المسافة (كم)",
      price: "السعر (£)",
      active: "الإعلانات النشطة",
      removed: "إعلانات محذوفة",
      noData: "لا توجد بيانات",
    },
  };

  const text = t[lang] || t.en;

  // =========================
  // DATA NORMALISATION (ROBUST)
  // =========================
  const safeData = (data || [])
    .map((d) => {
      const price = Number(d.price ?? d.Price);
      const mileage = Number(d.mileage ?? d.KM ?? d.km);

      const date = d.DATE || d.date || d.Date;

      return {
        price: Number.isFinite(price) ? Math.round(price) : null,
        mileage: Number.isFinite(mileage) ? Math.round(mileage) : null,
        date: date ? new Date(date) : null,
      };
    })
    .filter((d) => d.price > 0 && d.mileage > 0);

  if (!safeData.length) {
    return (
      <div
        style={{
          height: 320,
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

  // =========================
  // ACTIVE vs REMOVED LOGIC
  // =========================
  const maxDate = Math.max(...safeData.map((d) => d.date?.getTime() || 0));

  const active = safeData.filter(
    (d) => d.date && d.date.getTime() === maxDate
  );

  const removed = safeData.filter(
    (d) => d.date && d.date.getTime() !== maxDate
  );

  // =========================
  // Y AXIS SCALE
  // =========================
  const STEP = 20000;
  const maxPrice = Math.max(...safeData.map((d) => d.price));
  const yMax = (Math.floor(maxPrice / STEP) + 1) * STEP;
  const yTicks = Array.from({ length: yMax / STEP + 1 }, (_, i) => i * STEP);

  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 10,
            right: 30,
            left: 60,   // 🔥 more breathing room for labels
            bottom: 20, // reduced whitespace under chart
          }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />

          {/* X AXIS */}
          <XAxis
            type="number"
            dataKey="mileage"
            stroke="#cbd5e1"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickLine={{ stroke: "#cbd5e1" }}
            tickMargin={10}   // 🔥 spacing fix
          >
            <Label
              value={text.mileage}
              position="bottom"
              offset={0}
              style={{
                fill: "#64748b",
                fontSize: 12,
                marginTop: 8,
              }}
            />
          </XAxis>

          {/* Y AXIS */}
          <YAxis
            type="number"
            dataKey="price"
            domain={[0, yMax]}
            ticks={yTicks}
            stroke="#cbd5e1"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickLine={{ stroke: "#cbd5e1" }}
            tickMargin={10}   // 🔥 spacing fix
          >
            <Label
              value={text.price}
              angle={-90}
              position="left"
              offset={10}
              style={{
                fill: "#64748b",
                fontSize: 12,
              }}
            />
          </YAxis>

          {/* =========================
              TOOLTIP (IMPROVED ORDER)
          ========================= */}
          <Tooltip
            cursor={{ stroke: "#4f46e5", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;

              const p = payload[0].payload;

              return (
                <div
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontSize: 12,
                    boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
                  }}
                >
                  {/* PRICE FIRST */}
                  <div style={{ fontWeight: 700, fontSize: 13 }}>
                    £{p.price.toLocaleString()}
                  </div>

                  {/* MILEAGE SECOND (SMALLER) */}
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>
                    {p.mileage.toLocaleString()} km
                  </div>
                </div>
              );
            }}
          />

          {/* =========================
              LEGEND (LEFT + TOP ALIGNED)
          ========================= */}
          <Legend
            verticalAlign="top"
            align="left"
            wrapperStyle={{
              fontSize: 12,
              color: "#64748b",
              paddingBottom: 6,
            }}
            iconSize={8}
            formatter={(value) => {
              if (value === "active") return text.active;
              if (value === "removed") return text.removed;
              return value;
            }}
          />

          {/* DATA SERIES */}
          <Scatter
            name="active"
            data={active}
            fill="#4f46e5"
          />
          <Scatter
            name="removed"
            data={removed}
            fill="#9ca3af"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}