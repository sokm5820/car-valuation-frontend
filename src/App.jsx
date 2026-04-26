import { useEffect, useMemo, useState } from "react";
import PriceScatter from "./components/PriceScatter";
import "./App.css";

export default function App() {
  const API =
    process.env.REACT_APP_API_URL ||
    "https://car-valuation-backend.onrender.com";

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

  const text = useMemo(
    () => ({
      en: {
        title: "Vehicle Valuation",
        subtitle: "Professional market pricing engine",
        getValuation: "Get valuation",
        back: "Back",
        restart: "New search",
        loading: "Loading...",
      },
      tr: {
        title: "Araç Değerleme",
        subtitle: "Profesyonel piyasa fiyatlama sistemi",
        getValuation: "Değeri getir",
        back: "Geri",
        restart: "Yeni arama",
        loading: "Yükleniyor...",
      },
    }),
    [lang]
  );

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

  const progress = (step - 1) * 25;

  // DATA LOAD
  useEffect(() => {
    fetch(`${API}/years`)
      .then((r) => r.json())
      .then((d) => setYears(d.years || d))
      .catch(console.error);
  }, []);

  const handleYear = async (v) => {
    setYear(v);
    setLoading(true);
    setBrands(await (await fetch(`${API}/brands?year=${v}`)).json());
    setLoading(false);
    setStep(2);
  };

  const handleBrand = async (v) => {
    setBrand(v);
    setLoading(true);
    setModels(await (await fetch(`${API}/models?year=${year}&brand=${v}`)).json());
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

  const reset = () => {
    setStep(1);
    setYear("");
    setBrand("");
    setModel("");
    setCategory("");
    setResult(null);
    setAnimatedValue(0);
  };

  const goBack = () => {
    if (step === 4) {
      setStep(3);
      setCategory("");
    } else if (step === 3) {
      setStep(2);
      setModel("");
    } else if (step === 2) {
      setStep(1);
      setBrand("");
    }
  };

  // ANIMATION
  useEffect(() => {
    if (!result?.median_price) return;

    const start = 0;
    const end = result.median_price;
    const duration = 900;
    const startTime = performance.now();

    const animate = (t) => {
      const p = Math.min((t - startTime) / duration, 1);
      setAnimatedValue(Math.floor(start + (end - start) * (1 - (1 - p) ** 3)));
      if (p < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [result]);

  return (
    <div className="app">
      <div className="container">

        {/* LOGO + USERNAME */}
        <div className="header-top">
          <img
            className="logo"
            src="https://res.cloudinary.com/dtaihpiwt/image/upload/v1777154527/SHOPTECH_LOGO_9_hnwij5.png"
          />
          <div className="username">@analist.kibris</div>
        </div>

        {/* HEADER */}
        <div className="header">
          <div>
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>

          <div className="lang">
            {["tr", "en"].map((l) => (
              <button
                key={l}
                className={lang === l ? "active" : ""}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* BACK BUTTON */}
        {step > 1 && step < 5 && (
          <div style={{ marginBottom: 12 }}>
            <button className="back-btn" onClick={goBack}>
              ← {text.back}
            </button>
          </div>
        )}

        {/* PROGRESS */}
        {step < 5 && (
          <div className="progress">
            <div style={{ width: `${progress}%` }} />
          </div>
        )}

        {loading && <div className="loading">{text.loading}</div>}

        {/* STEPS */}
        <div className="stack">
          {step === 1 &&
            years.map((y) => (
              <button key={y} className="btn" onClick={() => handleYear(y)}>
                {y}
              </button>
            ))}

          {step === 2 &&
            brands.map((b) => (
              <button key={b} className="btn" onClick={() => handleBrand(b)}>
                {b}
              </button>
            ))}

          {step === 3 &&
            models.map((m) => (
              <button key={m} className="btn" onClick={() => handleModel(m)}>
                {m}
              </button>
            ))}

          {step === 4 &&
            categories.map((c) => (
              <button
                key={c}
                className="btn"
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}

          {step === 4 && category && (
            <button className="btn-primary" onClick={getValuation}>
              {text.getValuation}
            </button>
          )}
        </div>

        {/* RESULT */}
        {step === 5 && result && (
          <div className="card">
            <div className="price">
              £{animatedValue.toLocaleString()}
            </div>

            <div className="range">
              £{result.min_price} – £{result.max_price}
            </div>

            <PriceScatter data={result.scatter} lang={lang} />

            {/* AD (RESTORED) */}
            <div className="ad">
              <a href={ads[adIndex].url} target="_blank">
                <img src={ads[adIndex].img} />
              </a>
            </div>

            <button className="btn-primary" onClick={reset}>
              {text.restart}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}