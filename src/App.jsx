import "./App.css";
import { useEffect, useState } from "react";
import PriceScatter from "./components/PriceScatter";

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

  const [lang, setLang] = useState(localStorage.getItem("lang") || "tr");

  const API = "https://car-valuation-backend.onrender.com";

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
    const res = await fetch(`${API}/brands?year=${v}`);
    setBrands(await res.json());
    setStep(2);
  };

  const handleBrand = async (v) => {
    setBrand(v);
    const res = await fetch(`${API}/models?year=${year}&brand=${v}`);
    setModels(await res.json());
    setStep(3);
  };

  const handleModel = async (v) => {
    setModel(v);

    const res = await fetch(
      `${API}/categories?year=${year}&brand=${brand}&model=${v}`
    );

    const data = await res.json();
    const normalized = Array.isArray(data)
      ? data
      : data.categories || [];

    setCategories(normalized);

    setStep(4);
  };

  const getValuation = async () => {
    const res = await fetch(`${API}/get_valuation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, brand, model, category }),
    });

    setResult(await res.json());
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
    if (step === 4) setStep(3);
    else if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
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

      {/* LOGO + USERNAME (RESTORED EXACTLY) */}
      <div style={{ position: "relative", fontFamily: "Poppins, sans-serif" }}>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 6,
            marginBottom: 6,
          }}
        >
          <img
            src="https://res.cloudinary.com/dtaihpiwt/image/upload/v1777154527/SHOPTECH_LOGO_9_hnwij5.png"
            style={{ height: 24, width: "auto" }}
          />
          <div style={{ fontSize: 12, color: "#0f172a" }}>
            @analist.kibris
          </div>
        </div>

        {/* HEADER */}
        <div className="header-row">

          <div style={{ textAlign: "left" }}>
            <div className="title">{text.title}</div>

            {/* FIX: ensured blue stays consistent via CSS class or inline fallback */}
            <div style={{ fontSize: 12, color: "#2563eb" }}>
              {text.subtitle}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>

            <div style={{ display: "flex", gap: 6 }}>
              {["tr", "en", "ru"].map((l) => (
                <button
                  key={l}
                  onClick={() => changeLang(l)}
                  className={`lang-btn ${lang === l ? "active" : ""}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {step > 1 && step < 5 && (
              <button onClick={goBack} className="back-btn">
                ← {text.back}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* PROGRESS */}
      {step < 5 && (
        <div className="progress">
          <div className="progress-inner" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* STEPS (UNCHANGED) */}
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
            <button onClick={getValuation} className="btn-primary">
              {text.getValuation}
            </button>
          )}
        </div>
      )}

      {/* VALUATION (FULL RESTORED LAYOUT) */}
      {step === 5 && result && (
        <div className="result">

          <h1>£{animatedValue.toLocaleString()}</h1>

          <p>
            £{result.min_price.toLocaleString()} – £{result.max_price.toLocaleString()}
          </p>

          <PriceScatter data={result.scatter} lang={lang} />

          <div className="ad">
            <a href={ads[adIndex].url} target="_blank" rel="noopener noreferrer">
              <img src={ads[adIndex].img} />
            </a>
          </div>

          <button onClick={resetFlow} className="btn-primary">
            {text.restart}
          </button>

        </div>
      )}

    </div>
  );
}