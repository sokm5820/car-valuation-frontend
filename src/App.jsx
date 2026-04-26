import { useEffect, useState } from "react";
import PriceScatter from "./components/PriceScatter";

// ✅ FIX: production-safe API handling
const API =
  import.meta.env.VITE_API_URL ||
  "https://car-valuation-backend.onrender.com";

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

  // ✅ FIX: safe localStorage access for deployment
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "tr";
    return localStorage.getItem("lang") || "tr";
  });

  const changeLang = (l) => {
    setLang(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", l);
    }
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
      img: "https://res.cloudinary.com/dtaihpiwt/image/upload/v1777148950/ChatGPT_Image_Apr_25_2026_11_26_50_PM_qq8lfa.png",
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

  useEffect(() => {
    fetch(`${API}/years`)
      .then((r) => r.json())
      .then((data) => {
        const normalized = Array.isArray(data) ? data : data.years || [];
        setYears([...normalized].sort((a, b) => b - a));
      });
  }, []);

  const handleYear = async (v) => {
    setYear(v);
    setLoading(true);
    const res = await fetch(`${API}/brands?year=${v}`);
    setBrands(await res.json());
    setLoading(false);
    setStep(2);
  };

  const handleBrand = async (v) => {
    setBrand(v);
    setLoading(true);
    const res = await fetch(`${API}/models?year=${year}&brand=${v}`);
    setModels(await res.json());
    setLoading(false);
    setStep(3);
  };

  const handleModel = async (v) => {
    setModel(v);
    setLoading(true);

    const res = await fetch(
      `${API}/categories?year=${year}&brand=${brand}&model=${v}`
    );

    const data = await res.json();

    setCategories(Array.isArray(data) ? data : data.categories || []);

    setLoading(false);
    setStep(4);
  };

  const getValuation = async () => {
    setLoading(true);

    const res = await fetch(`${API}/get_valuation`, {
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
    <div className="app-container">
      {/* unchanged UI below */}
      <div className="header-top">
        <img
          src="https://res.cloudinary.com/dtaihpiwt/image/upload/v1777154527/SHOPTECH_LOGO_9_hnwij5.png"
          style={{ height: 24 }}
        />
        <div className="username">@analist.kibris</div>
      </div>

      <div className="header">
        <div>
          <h1>{text.title}</h1>
          <p>{text.subtitle}</p>
        </div>

        <div className="lang-box">
          <div className="lang-row">
            {["tr", "en", "ru", "ar"].map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={lang === l ? "lang-active" : "lang-btn"}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {step > 1 && step < 5 && (
            <button className="back-btn" onClick={goBack}>
              ← {text.back}
            </button>
          )}
        </div>
      </div>

      {step < 5 && (
        <div className="progress-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
      )}

      {loading && <p>{text.loading}</p>}

      {step === 1 && (
        <div className="step-column">
          {years.map((y) => (
            <button key={y} onClick={() => handleYear(y)} className="btn">
              {y}
            </button>
          ))}
        </div>
      )}

      {step === 5 && result && (
        <div className="result">
          <h2>£{animatedValue.toLocaleString()}</h2>
          <p>£{result.min_price} – £{result.max_price}</p>

          <PriceScatter data={result.scatter} lang={lang} />

          <div className="ad">
            <a href={ads[adIndex].url} target="_blank" rel="noreferrer">
              <img src={ads[adIndex].img} />
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