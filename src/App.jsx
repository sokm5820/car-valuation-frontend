import { useEffect, useState } from "react";
import PriceScatter from "./components/PriceScatter";
import "./App.css";

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

  const API = "https://car-valuation-backend.onrender.com";

  const t = {
    en: {
      title: "VEHICLE VALUATION",
      subtitle: "Step-by-step market pricing",
      getValuation: "Get valuation",
      restart: "Search another car",
      back: "Back",
      loading: "Loading...",
    },
  };

  const text = t.en;

  useEffect(() => {
    fetch(`${API}/years`)
      .then((r) => r.json())
      .then(setYears);
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

    setCategories(await res.json());
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
    <div style={{ fontFamily: "Poppins, sans-serif", padding: 20 }}>
      <h1>{text.title}</h1>
      <p>{text.subtitle}</p>

      {loading && <p>{text.loading}</p>}

      {step === 1 && (
        <div>
          {years.map((y) => (
            <button key={y} onClick={() => handleYear(y)}>
              {y}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          {brands.map((b) => (
            <button key={b} onClick={() => handleBrand(b)}>
              {b}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div>
          {models.map((m) => (
            <button key={m} onClick={() => handleModel(m)}>
              {m}
            </button>
          ))}
        </div>
      )}

      {step === 4 && (
        <div>
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}

          {category && (
            <button onClick={getValuation}>{text.getValuation}</button>
          )}
        </div>
      )}

      {step === 5 && result && (
        <div>
          <h2>£{animatedValue.toLocaleString()}</h2>

          <p>
            £{result.min_price} - £{result.max_price}
          </p>

          <PriceScatter data={result.scatter} />

          <button onClick={reset}>{text.restart}</button>
        </div>
      )}
    </div>
  );
}