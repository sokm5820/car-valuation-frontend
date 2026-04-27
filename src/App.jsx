import "./App.css";
import { useEffect, useState } from "react";
import PriceScatter from "./components/PriceScatter";

export default function App() {
  const [step, setStep] = useState(1);

  // 🔥 NEW: transition control
  const [prevStep, setPrevStep] = useState(null);
  const [direction, setDirection] = useState("forward");

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

  const [lang, setLang] = useState(
    localStorage.getItem("lang") || "tr"
  );

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
    },
    tr: {
      title: "ARAÇ DEĞERLEME",
      subtitle: "Adım adım piyasa fiyatlandırması",
      getValuation: "Değeri getir",
      restart: "Yeni araç ara",
      back: "Geri",
    },
    ru: {
      title: "ОЦЕНКА АВТОМОБИЛЯ",
      subtitle: "Пошаговая рыночная оценка",
      getValuation: "Получить оценку",
      restart: "Новый поиск",
      back: "Назад",
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

  // =========================
  // 🔥 STEP TRANSITION WRAPPER
  // =========================
  const changeStep = (nextStep) => {
    setPrevStep(step);
    setDirection(nextStep > step ? "forward" : "backward");

    setTimeout(() => {
      setStep(nextStep);
      setPrevStep(null);
    }, 180); // small native delay
  };

  const handleYear = async (v) => {
    setYear(v);
    const res = await fetch(`${API}/brands?year=${v}`);
    setBrands(await res.json());
    changeStep(2);
  };

  const handleBrand = async (v) => {
    setBrand(v);
    const res = await fetch(`${API}/models?year=${year}&brand=${v}`);
    setModels(await res.json());
    changeStep(3);
  };

  const handleModel = async (v) => {
    setModel(v);

    const res = await fetch(
      `${API}/categories?year=${year}&brand=${brand}&model=${v}`
    );

    const data = await res.json();
    const normalized = Array.isArray(data) ? data : data.categories || [];

    setCategories(normalized);
    changeStep(4);
  };

  const getValuation = async () => {
    const res = await fetch(`${API}/get_valuation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, brand, model, category }),
    });

    setResult(await res.json());
    changeStep(5);
  };

  const goBack = () => {
    if (step === 4) {
      setCategory("");
      changeStep(3);
    } else if (step === 3) {
      setModel("");
      changeStep(2);
    } else if (step === 2) {
      setBrand("");
      changeStep(1);
    } else if (step === 5) {
      changeStep(4);
    }
  };

  useEffect(() => {
    if (!result?.median_price) return;

    const startTime = performance.now();
    const duration = 900;
    const end = result.median_price;

    const animate = (t) => {
      const p = Math.min((t - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedValue(Math.floor(end * eased));
      if (p < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [result]);

  // =========================
  // 🔥 CARD RENDER WRAPPER
  // =========================
  const cardClass = (s) => {
    if (s !== step && s !== prevStep) return "step-card-hidden";

    if (s === step) return "step-card step-card-active";
    if (s === prevStep && direction === "forward") return "step-card step-card-exit-up";
    if (s === prevStep && direction === "backward") return "step-card step-card-exit-down";

    return "step-card";
  };

  return (
    <div className="app-container">

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>

        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {text.title}
          </div>
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
                style={{
                  background: lang === l ? "#2563eb" : "#f1f5f9",
                  color: lang === l ? "white" : "#475569",
                  borderRadius: 999,
                  border: "none",
                  padding: "6px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {step > 1 && (
            <button onClick={goBack} className="back-btn">
              ← {text.back}
            </button>
          )}

        </div>
      </div>

      {/* PROGRESS */}
      {step < 5 && (
        <div className="progress">
          <div className="progress-inner" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* =========================
          STEP SYSTEM (ANIMATED)
      ========================= */}

      <div className="step-stack">

        {/* STEP 1 */}
        {cardClass(1) && step === 1 && (
          <div className={cardClass(1)}>
            <div className="step-column">
              {years.map((y) => (
                <button key={y} onClick={() => handleYear(y)} className="btn">
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {cardClass(2) && step === 2 && (
          <div className={cardClass(2)}>
            <div className="step-column">
              {brands.map((b) => (
                <button key={b} onClick={() => handleBrand(b)} className="btn">
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {cardClass(3) && step === 3 && (
          <div className={cardClass(3)}>
            <div className="step-column">
              {models.map((m) => (
                <button key={m} onClick={() => handleModel(m)} className="btn">
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {cardClass(4) && step === 4 && (
          <div className={cardClass(4)}>
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
          </div>
        )}

        {/* STEP 5 */}
        {cardClass(5) && step === 5 && result && (
          <div className={cardClass(5)} style={{ textAlign: "center" }}>

            <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>
              £{animatedValue.toLocaleString()}
            </h1>

            <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
              £{result.min_price.toLocaleString()} – £{result.max_price.toLocaleString()}
            </p>

            <PriceScatter data={result.scatter} lang={lang} />

            <div style={{ marginTop: 10, height: 150, borderRadius: 14, overflow: "hidden" }}>
              <a href={ads[adIndex].url} target="_blank" rel="noopener noreferrer">
                <img src={ads[adIndex].img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </a>
            </div>

            <button onClick={goBack} className="btn-primary">
              {text.restart}
            </button>

          </div>
        )}

      </div>
    </div>
  );
}