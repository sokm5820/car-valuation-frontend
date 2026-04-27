import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Label,
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
  // SAFE DATA (RESTORED LOGIC)
  // =========================
  const safeData = (data || [])
    .map((d) => {
      const price = Number(d.price ?? d.Price);
      const mileage = Number(d.mileage ?? d.KM ?? d.km);

      // IMPORTANT: backend uses DATE (uppercase)
      const dateRaw = d.DATE ?? d.date ?? d.Date;

      return {
        price: Number.isFinite(price) ? Math.round(price) : null,
        mileage: Number.isFinite(mileage) ? Math.round(mileage) : null,
        date: dateRaw ? new Date(dateRaw) : null,
      };
    })
    .filter((d) => d.price > 0 && d.mileage > 0);

  if (!safeData.length) {
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

  // =========================
  // ACTIVE / REMOVED SPLIT (SAFE)
  // =========================
  const validDates = safeData
    .map((d) => d.date?.getTime())
    .filter(Boolean);

  const maxDate = validDates.length ? Math.max(...validDates) : null;

  const active = maxDate
    ? safeData.filter((d) => d.date?.getTime() === maxDate)
    : safeData;

  const removed = maxDate
    ? safeData.filter((d) => d.date?.getTime() !== maxDate)
    : [];

  // =========================
  // AXIS SCALE (UNCHANGED)
  // =========================
  const STEP = 20000;
  const maxPrice = Math.max(...safeData.map((d) => d.price));
  const yMax = (Math.floor(maxPrice / STEP) + 1) * STEP;

  const yTicks = Array.from(
    { length: yMax / STEP + 1 },
    (_, i) => i * STEP
  );

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: 350,
        gap: 12,
      }}
    >
      {/* =========================
          CHART AREA
      ========================= */}
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 10,
              right: 10,
              bottom: 20,
              left: 55, // keeps axis labels visible
            }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />

            <XAxis
              type="number"
              dataKey="mileage"
              stroke="#cbd5e1"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickLine={{ stroke: "#cbd5e1" }}
              tickMargin={10}
            >
              <Label
                value={text.mileage}
                position="bottom"
                offset={0}
                style={{ fill: "#64748b", fontSize: 12 }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="price"
              domain={[0, yMax]}
              ticks={yTicks}
              stroke="#cbd5e1"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickLine={{ stroke: "#cbd5e1" }}
              tickMargin={10}
            >
              <Label
                value={text.price}
                angle={-90}
                position="left"
                offset={10}
                style={{ fill: "#64748b", fontSize: 12 }}
              />
            </YAxis>

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
                      borderRadius: 10,
                      padding: 8,
                      fontSize: 12,
                      boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      £{p.price.toLocaleString()}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>
                      {p.mileage.toLocaleString()} km
                    </div>
                  </div>
                );
              }}
            />

            <Scatter name="active" data={active} fill="#4f46e5" />
            <Scatter name="removed" data={removed} fill="#9ca3af" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* =========================
          LEGEND (RIGHT SIDE, VERTICAL)
      ========================= */}
      <div
        style={{
          width: 160,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          paddingTop: 10,
          gap: 12,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#4f46e5",
            }}
          />
          {text.active}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#9ca3af",
            }}
          />
          {text.removed}
        </div>
      </div>
    </div>
  );
}