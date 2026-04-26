import { useEffect, useState } from "react";
import PriceScatter from "./components/PriceScatter";

// ✅ IMPORTANT: replace this with your deployed backend URL
const API_BASE = "https://car-valuation-backend.onrender.com";

export default function App() {
  const [step, setStep] = useState(1);

  const [year, setYear] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");

  const [years, setYears] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);

  const [result, setResult] = useState(null);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const [lang, setLang] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("lang") || "tr"
      : "tr"
  );

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  const t = {
    en: {
      title: "VEHICLE VALUATION",
      subtitle: "Step-by-step market pricing",
      getValuation: "Get valuation",
      restart: "Search another car",
      back: "Back",
      loading: "Loading...",
    },
    tr: {
      title: "ARAÇ DEĞERLEME",
      subtitle: "Adım adım piyasa fiyatlandırması",
      getValuation: "Değeri getir",
      restart: "Yeni araç ara",
      back: "Geri",
      loading: "Yükleniyor...",
    },
    ru: {
      title: "ОЦЕНКА АВТОМОБИЛЯ",
      subtitle: "Пошаговая рыночная оценка",
      getValuation: "Получить оценку",
      restart: "Новый поиск",
      back: "Назад",
      loading: "Загрузка...",
    },
    ar: {
      title: "تقييم المركبة",
      subtitle: "تسعير السوق خطوة بخطوة",
      getValuation: "احصل على التقييم",
      restart: "بحث جديد",
      back: "رجوع",
      loading: "جار التحميل...",
    },
  };

  const text = t[lang] || t.en;

  const ads = [
    {
      img: "https://res.cloudinary.com/dtaihpiwt/image/upload/v1777148944/ChatGPT_Image_Apr_25_2026_11_26_08_PM_r8afuy.png",
      url: "https://wa.me/+905338760100",
    },
    {
      img: "https://res.cloudinary.com/dtaihpiwt/image/upload/v1777182806/ChatGPT_Image_Apr_26_2026_08_52_24_AM_bsvbwd.png",
      url: "https://wa.me/+905338760100",
    },
  ];

  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % ads.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min(100, Math.max(0, ((step - 1) / 3) * 100));

  // 🔁 DEPLOY FIXED API CALLS
  useEffect(() => {
    fetch(`${API_BASE}/years`)
      .then((r) => r.json())
      .then((data) => {
        const normalized = Array.isArray(data) ? data : data.years || [];
        setYears([...normalized].sort((a, b) => b - a));
      });
  }, []);

  const handleYear = async (v) => {
    setYear(v);
    setLoading(true);

    const res = await fetch(`${API_BASE}/brands?year=${v}`);
    setBrands(await res.json());

    setLoading(false);
    setStep(2);
  };

  const handleBrand = async (v) => {
    setBrand(v);
    setLoading(true);

    const res = await fetch(`${API_BASE}/models?year=${year}&brand=${v}`);
    setModels(await res.json());

    setLoading(false);
    setStep(3);
  };

  const handleModel = async (v) => {
    setModel(v);
    setLoading(true);

    const res = await fetch(
      `${API_BASE}/categories?year=${year}&brand=${brand}&model=${v}`
    );

    const data = await res.json();
    const normalized = Array.isArray(data) ? data : data.categories || [];

    setCategories(normalized);

    setLoading(false);
    setStep(4);
  };

  const getValuation = async () => {
    setLoading(true);

    const res = await fetch(`${API_BASE}/get_valuation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, brand, model, category }),
    });

    setResult(await res.json());
    setLoading(false);
    setStep(5);
  };

  const resetFlow = () => {
    setStep(1);
    setYear("");
    setBrand("");
    setModel("");
    setCategory("");
    setResult(null);
    setAnimatedValue(0);
  };

  const goBack = () => {
    if (step === 4) setStep(3), setCategory("");
    else if (step === 3) setStep(2), setModel("");
    else if (step === 2) setStep(1), setBrand("");
  };

  useEffect(() => {
    if (!result?.median_price) return;

    const start = 0;
    const end = result.median_price;
    const duration = 900;
    const startTime = performance.now();

    const animate = (t) => {
      const p = Math.min((t - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedValue(Math.floor(start + (end - start) * eased));
      if (p < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [result]);

  return (
    <div
      className="app-container"
      style={{
        position: "relative",
        fontFamily: "Poppins, sans-serif",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {/* LOGO */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
        <img
          src="https://res.cloudinary.com/dtaihpiwt/image/upload/v1777154527/SHOPTECH_LOGO_9_hnwij5.png"
          style={{ height: 24 }}
        />
        <div style={{ fontSize: 12, color: "#0f172a" }}>
          @analist.kibris
        </div>
      </div>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{text.title}</div>
          <div style={{ fontSize: 13, color: "#2563eb" }}>{text.subtitle}</div>
        </div>

        {/* LANG */}
        <div style={{ display: "flex", gap: 6 }}>
          {["tr", "en", "ru", "ar"].map((l) => (
            <button
              key={l}
              onClick={() => changeLang(l)}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "none",
                fontSize: 12,
                background: lang === l ? "#2563eb" : "#f1f5f9",
                color: lang === l ? "white" : "#475569",
                cursor: "pointer",
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* PROGRESS */}
      {step < 5 && (
        <div style={{ height: 6, background: "#e2e8f0", borderRadius: 999 }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#2563eb",
              transition: "width 0.3s",
            }}
          />
        </div>
      )}

      {loading && <p>{text.loading}</p>}

      {/* STEPS */}
      {step === 1 && (
        <div className="step-column">
          {years.map((y) => (
            <button key={y} onClick={() => handleYear(y)} className="btn">
              {y}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="step-column">
          {brands.map((b) => (
            <button key={b} onClick={() => handleBrand(b)} className="btn">
              {b}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="step-column">
          {models.map((m) => (
            <button key={m} onClick={() => handleModel(m)} className="btn">
              {m}
            </button>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="step-column">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className="btn">
              {c}
            </button>
          ))}

          {category && (
            <button className="btn-primary" onClick={getValuation}>
              {text.getValuation}
            </button>
          )}
        </div>
      )}

      {/* RESULT */}
      {step === 5 && result && (
        <div style={{ textAlign: "center" }}>
          <h1>£{animatedValue.toLocaleString()}</h1>
          <p>
            £{result.min_price} – £{result.max_price}
          </p>

          <PriceScatter data={result.scatter} lang={lang} />

          <div style={{ marginTop: 12 }}>
            <a href={ads[adIndex].url}>
              <img
                src={ads[adIndex].img}
                style={{ width: "100%", borderRadius: 12 }}
              />
            </a>
          </div>

          <button className="btn-primary" onClick={resetFlow}>
            {text.restart}
          </button>
        </div>
      )}
    </div>
  );
}