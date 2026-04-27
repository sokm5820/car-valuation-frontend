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
          height: 220,
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

  const STEP = 25000;

  const maxPrice = Math.max(...safeData.map((d) => d.price));
  const minMileage = Math.min(...safeData.map((d) => d.mileage));
  const maxMileage = Math.max(...safeData.map((d) => d.mileage));

  const yMax = Math.ceil(maxPrice / STEP) * STEP + STEP;

  const xMin = Math.max(0, Math.floor(minMileage / 10000) * 10000);
  const xMax = Math.ceil(maxMileage / 10000) * 10000 + 10000;

  const yTicks = Array.from(
    { length: yMax / STEP + 1 },
    (_, i) => i * STEP
  );

  return (
    <div style={{ width: "100%" }}>

      {/* ================= CHART ================= */}
      <div className="scatter-chart-wrapper">
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart
            margin={{
              top: 10,
              right: 20,
              bottom: 35,
              left: 45,
            }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />

            <XAxis
              type="number"
              dataKey="mileage"
              domain={[xMin, xMax]}
              stroke="#cbd5e1"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={{ stroke: "#cbd5e1" }}
            >
              <Label
                value={text.mileage}
                position="bottom"
                offset={2}
                style={{ fill: "#64748b", fontSize: 11 }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="price"
              domain={[0, yMax]}
              ticks={yTicks}
              stroke="#cbd5e1"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={{ stroke: "#cbd5e1" }}
            >
              <Label
                value={text.price}
                angle={-90}
                position="left"
                offset={10}
                style={{ fill: "#64748b", fontSize: 11 }}
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
                      padding: 10,
                      fontSize: 12,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      £{p.price.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {p.mileage.toLocaleString()} km
                    </div>
                  </div>
                );
              }}
            />

            {/* ❌ REMOVE RECHARTS LEGEND (we handle it ourselves) */}
            <Scatter name="active" data={safeData} fill="#4f46e5" />
            <Scatter name="removed" data={[]} fill="#9ca3af" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* ================= MOBILE LEGEND ================= */}
      <div className="scatter-legend">
        <div className="legend-item">
          <span className="dot active" />
          {text.active}
        </div>

        <div className="legend-item">
          <span className="dot removed" />
          {text.removed}
        </div>
      </div>

      {/* ================= RESPONSIVE STYLE ================= */}
      <style>{`
        .scatter-chart-wrapper {
          height: 280px;
        }

        .scatter-legend {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 6px;
          font-size: 12px;
          color: #64748b;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          display: inline-block;
        }

        .dot.active {
          background: #4f46e5;
        }

        .dot.removed {
          background: #9ca3af;
        }

        /* 🔥 MOBILE COMPRESSION */
        @media (max-width: 768px) {
          .scatter-chart-wrapper {
            height: 220px;
          }

          .scatter-legend {
            margin-top: 4px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}