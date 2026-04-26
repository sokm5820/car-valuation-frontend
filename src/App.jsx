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

  const [lang, setLang] = useState("tr");

  const text = useMemo(
    () => ({
      en: { title: "Vehicle Valuation", subtitle: "Market pricing engine", getValuation: "Get valuation", restart: "New search", back: "Back" },
      tr: { title: "Araç Değerleme", subtitle: "Piyasa fiyatlama sistemi", getValuation: "Değeri getir", restart: "Yeni arama", back: "Geri" }
    }),
    []
  )[lang];

  const progress = (step - 1) * 25;

  /* INIT */
  useEffect(() => {
    fetch(`${API}/years`)
      .then(r => r.json())
      .then(d => setYears(d.years || d))
      .catch(console.error);
  }, []);

  /* FLOW */
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

    const data = await (await fetch(`${API}/categories?year=${year}&brand=${brand}&model=${v}`)).json();
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
    setYear(""); setBrand(""); setModel(""); setCategory("");
    setResult(null);
    setAnimatedValue(0);
  };

  /* ANIMATION */
  useEffect(() => {
    if (!result?.median_price) return;

    const start = 0;
    const end = result.median_price;
    const startTime = performance.now();

    const animate = (t) => {
      const p = Math.min((t - startTime) / 900, 1);
      setAnimatedValue(Math.floor(start + (end - start) * (1 - (1 - p) ** 3)));
      if (p < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [result]);

  return (
    <div className="app">
      <div className="container">

        {/* HEADER */}
        <div className="header">
          <div>
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>

          <div className="lang">
            {["tr", "en"].map(l => (
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

        {/* PROGRESS */}
        <div className="progress">
          <div style={{ width: `${progress}%` }} />
        </div>

        {loading && <div className="loading">Loading...</div>}

        {/* STEPS */}
        {step === 1 && (
          <div className="stack">
            {years.map(y => (
              <button key={y} className="btn" onClick={() => handleYear(y)}>
                {y}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="stack">
            {brands.map(b => (
              <button key={b} className="btn" onClick={() => handleBrand(b)}>
                {b}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="stack">
            {models.map(m => (
              <button key={m} className="btn" onClick={() => handleModel(m)}>
                {m}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="stack">
            {categories.map(c => (
              <button key={c} className="btn" onClick={() => setCategory(c)}>
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
          <div className="card">
            <div className="price">£{animatedValue.toLocaleString()}</div>

            <div className="range">
              £{result.min_price} – £{result.max_price}
            </div>

            <PriceScatter data={result.scatter} lang={lang} />

            <button className="btn-primary" onClick={reset}>
              {text.restart}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}