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
    <div style={{ fontFamily: "Poppins, sans-serif", padding: 20 }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0 }}>{text.title}</h1>
          <p style={{ marginTop: 4, color: "#2563eb" }}>{text.subtitle}</p>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {["tr", "en", "ru", "ar"].map((l) => (
            <button
              key={l}
              onClick={() => changeLang(l)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: lang === l ? "#2563eb" : "transparent",
                color: lang === l ? "#fff" : "#000",
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* PROGRESS */}
      {step < 5 && (
        <div style={{ height: 6, background: "#eee", margin: "10px 0" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "#2563eb" }} />
        </div>
      )}

      {loading && <p>{text.loading}</p>}

      {step === 1 && (
        <div>
          {years.map((y) => (
            <button key={y} onClick={() => handleYear(y)}>{y}</button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          {brands.map((b) => (
            <button key={b} onClick={() => handleBrand(b)}>{b}</button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div>
          {models.map((m) => (
            <button key={m} onClick={() => handleModel(m)}>{m}</button>
          ))}
        </div>
      )}

      {step === 4 && (
        <div>
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)}>{c}</button>
          ))}

          {category && (
            <button onClick={getValuation}>{text.getValuation}</button>
          )}
        </div>
      )}

      {step === 5 && result && (
        <div style={{ textAlign: "center" }}>
          <h2>£{animatedValue.toLocaleString()}</h2>

          <p>
            £{result.min_price} - £{result.max_price}
          </p>

          <PriceScatter data={result.scatter} lang={lang} />

          {/* AD */}
          <div style={{ marginTop: 20 }}>
            <a href={ads[adIndex].url} target="_blank" rel="noreferrer">
              <img
                src={ads[adIndex].img}
                style={{ width: "100%", borderRadius: 12 }}
              />
            </a>
          </div>

          <button onClick={resetFlow} style={{ marginTop: 20 }}>
            {text.restart}
          </button>
        </div>
      )}
    </div>
  );
}