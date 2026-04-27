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

  // ----------------------------
  // SAFE NORMALIZATION (UNCHANGED CORE LOGIC)
  // ----------------------------
  const safeData = (data || [])
    .map((d) => {
      const price = Number(d.price ?? d.Price);
      const mileage = Number(d.mileage ?? d.KM ?? d.km);

      // IMPORTANT: keep raw date but DO NOT break dataset if invalid
      const date = d.DATE || d.date || d.Date;

      return {
        price: Number.isFinite(price) ? Math.round(price) : null,
        mileage: Number.isFinite(mileage) ? Math.round(mileage) : null,
        date: date ? new Date(date) : null,
      };
    })
    .filter((d) => d.price > 0 && d.mileage > 0);

  // ----------------------------
  // FIX: DO NOT BLOCK RENDER ON DATE ISSUES
  // ----------------------------
  if (!safeData.length) {
    return (
      <div
        style={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        {text.noData}
      </div>
    );
  }

  // ----------------------------
  // DATE SPLIT (SAFE FALLBACK)
  // ----------------------------
  const validDates = safeData
    .map((d) => d.date?.getTime())
    .filter(Boolean);

  const maxDate =
    validDates.length > 0 ? Math.max(...validDates) : null;

  const active = maxDate
    ? safeData.filter((d) => d.date?.getTime() === maxDate)
    : safeData;

  const removed = maxDate
    ? safeData.filter((d) => d.date?.getTime() !== maxDate)
    : [];

  // ----------------------------
  // AXIS CALC
  // ----------------------------
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
        width: "100%",
        height: 340,
        display: "flex",
        gap: 12,
      }}
    >
      {/* CHART */}
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
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

            <Tooltip />

            {/* ACTIVE */}
            <Scatter
              name="active"
              data={active}
              fill="#2563eb"
            />

            {/* REMOVED */}
            <Scatter
              name="removed"
              data={removed}
              fill="#94a3b8"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND RIGHT SIDE */}
      <div
        style={{
          width: 150,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 11, color: "#64748b" }}>Legend</div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 99, background: "#2563eb" }} />
          <div style={{ fontSize: 12 }}>{text.active}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 99, background: "#94a3b8" }} />
          <div style={{ fontSize: 12 }}>{text.removed}</div>
        </div>
      </div>
    </div>
  );
}