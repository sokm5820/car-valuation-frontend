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
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

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

  const safeData = (data || [])
    .map((d) => {
      const price = Number(d.price ?? d.Price);
      const mileage = Number(d.mileage ?? d.KM ?? d.km);

      return {
        price: Number.isFinite(price) ? Math.round(price) : null,
        mileage: Number.isFinite(mileage) ? Math.round(mileage) : null,
      };
    })
    .filter((d) => d.price > 0 && d.mileage > 0)
    .sort((a, b) => a.mileage - b.mileage);

  if (!safeData.length) {
    return (
      <div
        style={{
          height: isMobile ? 220 : 300,
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

  const STEP = 20000;

  const maxPrice = Math.max(...safeData.map((d) => d.price));

  // ✅ FIX 1: dynamic headroom instead of +2 STEP padding
  const yMaxRaw = maxPrice * 1.1; // 10% padding above max
  const yMax = Math.ceil(yMaxRaw / STEP) * STEP;

  const yTicks = Array.from(
    { length: yMax / STEP + 1 },
    (_, i) => i * STEP
  );

  const maxMileage = Math.max(...safeData.map((d) => d.mileage));
  const xMax = Math.ceil(maxMileage / 250) * 250 + 250;

  const xTicks = Array.from(
    { length: xMax / 250 + 1 },
    (_, i) => i * 250
  );

  const chartHeight = isMobile ? 240 : 350;

  return (
    <div style={{ width: "100%", height: chartHeight + 40 }}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ScatterChart
          margin={{
            top: 10,
            right: isMobile ? 10 : 20,
            left: isMobile ? 10 : 40,
            bottom: isMobile ? 20 : 50,
          }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />

          {/* X AXIS */}
          <XAxis
            type="number"
            dataKey="mileage"
            domain={[0, xMax]}
            ticks={xTicks}
            stroke="#cbd5e1"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={{ stroke: "#cbd5e1" }}
            tickMargin={8}
          >
            <Label
              value={text.mileage}
              position="bottom"
              offset={0}
              style={{ fill: "#64748b", fontSize: 12 }}
            />
          </XAxis>

          {/* Y AXIS (FIXED SCALING) */}
          <YAxis
            type="number"
            dataKey="price"
            domain={[0, yMax]}
            ticks={yTicks}
            stroke="#cbd5e1"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={{ stroke: "#cbd5e1" }}
            width={isMobile ? 45 : 70}
            tickMargin={6}
          >
            {!isMobile && (
              <Label
                value={text.price}
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{ fill: "#64748b", fontSize: 12 }}
              />
            )}
          </YAxis>

          {/* TOOLTIP */}
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
                    padding: 10,
                    fontSize: 12,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13 }}>
                    £{p.price.toLocaleString()}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>
                    {p.mileage.toLocaleString()} km
                  </div>
                </div>
              );
            }}
          />

          {/* LEGEND */}
          <Legend
            verticalAlign={isMobile ? "bottom" : "top"}
            align={isMobile ? "center" : "right"}
            layout={isMobile ? "horizontal" : "vertical"}
            wrapperStyle={{
              fontSize: 12,
              color: "#64748b",
              paddingTop: isMobile ? 10 : 0,
              paddingRight: isMobile ? 0 : 10,
            }}
            iconSize={10}
            formatter={(value) => {
              if (value === "active") return text.active;
              if (value === "removed") return text.removed;
              return value;
            }}
          />

          {/* DATA */}
          <Scatter name="active" data={safeData} fill="#4f46e5" />
          <Scatter name="removed" data={[]} fill="#9ca3af" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}