import "./App.css";
import { useEffect, useState } from "react";
import PriceScatter from "./components/PriceScatter";
import { Analytics } from "@vercel/analytics/react";

const API = "https://car-valuation-backend.onrender.com";

const ad = {
  img: "https://res.cloudinary.com/dtaihpiwt/image/upload/v1780330704/5F1C41C2-69A1-41B3-8306-E70BA17DDC76_f29ibs.png",
  url: "https://www.instagram.com/osmancivan.cars/",
};

const t = {
  en: {
    title: "VEHICLE VALUATION",
    subtitle: "Your vehicle's value in just 4 clicks",
    restart: "Search another car",
    back: "Back",
    step1: "Select Year",
    step2: "Select Brand",
    step3: "Select Model",
    step4: "Select Category",
  },
  tr: {
    title: "ARAÇ DEĞERLEME",
    subtitle: "Aracınızın değeri sadece 4 adımda",
    restart: "Yeni araç ara",
    back: "Geri",
    step1: "Yıl Seç",
    step2: "Marka Seç",
    step3: "Model Seç",
    step4: "Kategori Seç",
  },
  ru: {
    title: "ОЦЕНКА АВТОМОБИЛЯ",
    subtitle: "Оценка за 4 шага",
    restart: "Новый поиск",
    back: "Назад",
    step1: "Выберите год",
    step2: "Выберите марку",
    step3: "Выберите модель",
    step4: "Выберите категорию",
  },
};

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

  const [lang, setLang] = useState(
    () => localStorage.getItem("lang") || "tr"
  );

  const text = t[lang] || t.en;

  const fetchJSON = async (url, options) => {
    const res = await fetch(url, options);
    return res.json();
  };

  useEffect(() => {
    fetchJSON(`${API}/years`).then((data) => {
      const normalized = Array.isArray(data) ? data : data.years || [];
      setYears([...normalized].sort((a, b) => b - a));
    });
  }, []);

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  const handleYear = async (v) => {
    setYear(v);
    setBrands(await fetchJSON(`${API}/brands?year=${v}`));
    setStep(2);
  };

  const handleBrand = async (v) => {
    setBrand(v);
    setModels(await fetchJSON(`${API}/models?year=${year}&brand=${v}`));
    setStep(3);
  };

  const handleModel = async (v) => {
    setModel(v);

    const data = await fetchJSON(
      `${API}/categories?year=${year}&brand=${brand}&model=${v}`
    );

    const normalized = Array.isArray(data) ? data : data.categories || [];
    setCategories(normalized);
    setStep(4);
  };

  const handleCategory = async (c) => {
    setCategory(c);

    const data = await fetchJSON(`${API}/get_valuation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, brand, model, category: c }),
    });

    setResult(data);
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

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const progress = Math.min(100, Math.max(0, ((step - 1) / 3) * 100));

  const stepConfig = {
    1: { items: years, handler: handleYear },
    2: { items: brands, handler: handleBrand },
    3: { items: models, handler: handleModel },
    4: { items: categories, handler: handleCategory },
  };

  const stepLabel = {
    1: text.step1,
    2: text.step2,
    3: text.step3,
    4: text.step4,
  }[step];

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

  const current = stepConfig[step];

  return (
    <div className="app-container">
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
            style={{ height: 24 }}
            alt="logo"
          />
          <div style={{ fontSize: 12, color: "#0f172a" }}>
            @analist.kibris
          </div>
        </div>

        <div className="header-row">
          <div style={{ textAlign: "left" }}>
            <div className="title">{text.title}</div>
            <div style={{ fontSize: 12, color: "#2563eb" }}>
              {text.subtitle}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
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

            {step > 1 && (
              <button onClick={goBack} className="back-btn">
                ← {text.back}
              </button>
            )}
          </div>
        </div>
      </div>

      {step < 5 && (
        <div className="step-block">
          <div className="progress">
            <div
              className="progress-inner"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="step-label">{stepLabel}</div>
        </div>
      )}

      {current && (
        <div className="step-column">
          {current.items.map((item) => (
            <button
              key={item}
              onClick={() => current.handler(item)}
              className="btn"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {step === 5 && result && (
        <div className="result">
          <h1>£{animatedValue.toLocaleString()}</h1>

          <p>
            £{result.min_price.toLocaleString()} – £
            {result.max_price.toLocaleString()}
          </p>

          <PriceScatter data={result.scatter} lang={lang} />

          <div className="ad">
            <a href={ad.url} target="_blank" rel="noopener noreferrer">
              <img src={ad.img} alt="ad" />
            </a>
          </div>

          <button onClick={resetFlow} className="btn-primary">
            {text.restart}
          </button>
        </div>
      )}

      <Analytics />
    </div>
  );
}