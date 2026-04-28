import "./App.css";
import { useEffect, useState } from "react";
import PriceScatter from "./components/PriceScatter";

export default function App() {
  const [step, setStep] = useState(1);

  const [year, setYear] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");

  // ALWAYS SAFE DEFAULTS
  const [years, setYears] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);

  const [result, setResult] = useState(null);
  const [animatedValue, setAnimatedValue] = useState(0);

  const [lang, setLang] = useState(localStorage.getItem("lang") || "tr");

  const [apiError, setApiError] = useState(false);
  const API = "https://car-valuation-backend.onrender.com";

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem("lang", l);
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
      retry: "Retry loading data",
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
      retry: "Tekrar dene",
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
      retry: "Повторить",
    },
  };

  const text = t[lang] || t.en;

  const ads = [
    {
      img: "https://res.cloudinary.com/dtaihpiwt/image/upload/v1777294450/ChatGPT_Image_Apr_27_2026_09_06_32_AM_cryytk.png",
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

  // -----------------------
  // ULTRA SAFE FETCH (RETRY + TIMEOUT)
  // -----------------------
  const safeFetch = async (url, options = {}, retries = 1, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(id);
      setApiError(false);
      return await res.json();
    } catch (err) {
      clearTimeout(id);

      if (retries > 0) {
        return safeFetch(url, options, retries - 1, timeout);
      }

      console.warn("API failed:", url);
      setApiError(true);
      return null;
    }
  };

  // -----------------------
  // INITIAL LOAD (SAFE)
  // -----------------------
  useEffect(() => {
    safeFetch(`${API}/years`).then((data) => {
      const safe = Array.isArray(data) ? data : [];
      setYears(safe.sort((a, b) => b - a));
    });
  }, []);

  const handleYear = async (v) => {
    setYear(v);

    const data = await safeFetch(`${API}/brands?year=${v}`);
    setBrands(Array.isArray(data) ? data : []);

    setStep(2);
  };

  const handleBrand = async (v) => {
    setBrand(v);

    const data = await safeFetch(`${API}/models?year=${year}&brand=${v}`);
    setModels(Array.isArray(data) ? data : []);

    setStep(3);
  };

  const handleModel = async (v) => {
    setModel(v);

    const data = await safeFetch(
      `${API}/categories?year=${year}&brand=${brand}&model=${v}`
    );

    setCategories(Array.isArray(data) ? data : []);
    setStep(4);
  };

  const handleCategory = async (c) => {
    setCategory(c);

    const data = await safeFetch(`${API}/get_valuation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, brand, model, category: c }),
    });

    setResult(data || {
      median_price: 0,
      min_price: 0,
      max_price: 0,
      scatter: []
    });

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
    setStep((s) => Math.max(1, s - 1));
  };

  useEffect(() => {
    if (!result?.median_price) return;

    const start = 0;
    const end = result.median_price || 0;
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

      {/* HEADER ALWAYS RENDERS */}
      <div>
        <div style={{ fontFamily: "Poppins, sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src="https://res.cloudinary.com/dtaihpiwt/image/upload/v1777154527/SHOPTECH_LOGO_9_hnwij5.png"
              style={{ height: 24 }}
            />
            <div style={{ fontSize: 12 }}>@analist.kibris</div>
          </div>

          <div className="header-row">
            <div>
              <div className="title">{text.title}</div>
              <div style={{ fontSize: 12 }}>{text.subtitle}</div>
            </div>

            <div>
              {["tr", "en", "ru"].map((l) => (
                <button key={l} onClick={() => changeLang(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* API ERROR STATE (NO BLANK SCREEN EVER) */}
        {apiError && (
          <div style={{ padding: 10, color: "red" }}>
            Backend slow or unavailable.
            <button onClick={() => window.location.reload()}>
              {text.retry}
            </button>
          </div>
        )}
      </div>

      {/* SAFE STEP RENDERING */}
      {step === 1 && (
        <div>
          {years.length === 0 ? (
            <p>Loading years...</p>
          ) : (
            years.map((y) => (
              <button key={y} onClick={() => handleYear(y)}>
                {y}
              </button>
            ))
          )}
        </div>
      )}

      {step === 5 && (
        <div>
          <h1>£{animatedValue.toLocaleString()}</h1>

          <p>
            £{result?.min_price || 0} – £{result?.max_price || 0}
          </p>

          <PriceScatter data={result?.scatter || []} lang={lang} />

          <button onClick={resetFlow}>
            {text.restart}
          </button>
        </div>
      )}

    </div>
  );
}