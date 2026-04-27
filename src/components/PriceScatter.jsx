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
      active: "Активные объявления",
      removed: "Недавние удалённые",
      noData: "Нет данных",
    },
  };

  const text = t[lang] || t.en;

  // -------------------------------
  // NORMALISE DATA
  // -------------------------------
  const safeData = (data || [])
    .map((d) => {
      const price = Number(d.price ?? d.Price);
      const mileage = Number(d.mileage ?? d.KM ?? d.km);
      const date = d.date ? new Date(d.date).getTime() : null;

      return {
        price: Number.isFinite(price) ? Math.round(price) : null,
        mileage: Number.isFinite(mileage) ? Math.round(mileage) : null,
        date: Number.isFinite(date) ? date : null,
      };
    })
    .filter((d) => d.price > 0 && d.mileage > 0 && d.date)
    .sort((a, b) => a.mileage - b.mileage);

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

  // -------------------------------
  // SPLIT BY MAX DATE (KEY LOGIC FIX)
  // -------------------------------
  const maxDate = Math.max(...safeData.map((d) => d.date));

  const activeListings = safeData.filter((d) => d.date === maxDate);
  const removedListings = safeData.filter((d) => d.date < maxDate);

  // -------------------------------
  // Y AXIS SCALING
  // -------------------------------
  const STEP = 20000;
  const maxPrice = Math.max(...safeData.map((d) => d.price));
  const yMax = (Math.floor(maxPrice / STEP) + 1) * STEP;

  const yTicks = Array.from({ length: yMax / STEP + 1 }, (_, i) => i * STEP);

  return (
    <div
      style={{
        width: "100%",
        height: 320,
        display: "flex",
        gap: 14,
        marginTop: 6,
        marginBottom: 0,
      }}
    >
      {/* ================= CHART ================= */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 10,
              right: 5,
              bottom: 10,
              left: 5,
            }}
          >
            <CartesianGrid
              stroke="#eef2f7"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              type="number"
              dataKey="mileage"
              tick={false}
              axisLine={false}
              tickLine={false}
            >
              <Label
                value={text.mileage}
                position="insideBottom"
                offset={-5}
                style={{ fill: "#64748b", fontSize: 11 }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="price"
              domain={[0, yMax]}
              ticks={yTicks}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            >
              <Label
                value={text.price}
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{ fill: "#64748b", fontSize: 11 }}
              />
            </YAxis>

            <Tooltip
              cursor={{ stroke: "#2563eb", strokeWidth: 1, opacity: 0.2 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;

                const p = payload[0].payload;

                return (
                  <div
                    style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "8px 10px",
                      fontSize: 12,
                      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      £{p.price.toLocaleString()}
                    </div>
                    <div style={{ color: "#64748b", marginTop: 2 }}>
                      {p.mileage.toLocaleString()} km
                    </div>
                  </div>
                );
              }}
            />

            {/* ACTIVE LISTINGS */}
            <Scatter
              name="active"
              data={activeListings}
              fill="#2563eb"
              fillOpacity={0.8}
            />

            {/* REMOVED LISTINGS */}
            <Scatter
              name="removed"
              data={removedListings}
              fill="#94a3b8"
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* ================= LEGEND (RIGHT SIDE) ================= */}
      <div
        style={{
          width: 150,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 12,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#2563eb",
            }}
          />
          {text.active}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#94a3b8",
            }}
          />
          {text.removed}
        </div>
      </div>
    </div>
  );
}