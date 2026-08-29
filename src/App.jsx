import "./App.css";
import { useEffect, useState } from "react";
import PriceScatter from "./components/PriceScatter";
import { Analytics } from "@vercel/analytics/react";

const API = "https://car-valuation-backend.onrender.com";

const ad = {
  img: "https://res.cloudinary.com/dtaihpiwt/image/upload/v1787942611/ChatGPT_Image_Aug_28_2026_09_42_34_PM_qb3sh6.png",
  url: "https://wa.me/905488940154?text=Merhaba,%20ara%C3%A7%20sigortas%C4%B1%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.",
};

const t = {
  en: {
    title: "VEHICLE VALUATION",
    subtitle: "Your vehicle's value in just 4 clicks",
    seoTitle: "North Cyprus Car Valuation",
    seoText: "OtoDeğer uses current North Cyprus used-car market data to help estimate your vehicle's market value. Select the year, make, model and category to see an estimated value and current price range in seconds.",
    restart: "Search another Vehicle",

    sell: "Sell this Vehicle",
    formTitle: "Receive Purchase Offers",
    formSubtitle: "Interested buyers can contact you directly.",

    name: "Name",
    namePlaceholder: "Enter your name",
    phone: "Phone Number",
    phonePlaceholder: "Enter your phone number",

    submit: "Submit",
    submitting: "Submitting...",
    close: "Close",

    successTitle: "Thank you!",
    successMessage:
      "Your request has been submitted. Interested buyers will contact you.",

    submitted: "Vehicle Submitted",

    errorName: "Please enter your name.",
    errorPhone: "Please enter your phone number.",
    errorSubmission:
      "Something went wrong. Please try again.",

    back: "Back",
    step1: "Select Year",
    step2: "Select Brand",
    step3: "Select Model",
    step4: "Select Category",
  },

  tr: {
    title: "ARAÇ DEĞERLEME",
    subtitle: "Aracınızın değeri sadece 4 adımda",
    seoTitle: "Kuzey Kıbrıs Araç Değerleme",
    seoText: "OtoDeğer, Kuzey Kıbrıs ikinci el araç piyasasındaki güncel verileri kullanarak aracınızın tahmini piyasa değerini öğrenmenize yardımcı olur. Yıl, marka, model ve kategori seçerek aracınızın güncel değerini ve fiyat aralığını saniyeler içinde görebilirsiniz.",
    restart: "Başka Araç Ara",

    sell: "Bu Aracı Sat",
    formTitle: "Satın Alma Teklifleri Al",
    formSubtitle: "İlgilenen alıcılar sizinle doğrudan iletişime geçebilir.",

    name: "Adınız",
    namePlaceholder: "Adınızı girin",
    phone: "Telefon Numaranız",
    phonePlaceholder: "Telefon numaranızı girin",

    submit: "Gönder",
    submitting: "Gönderiliyor...",
    close: "Kapat",

    successTitle: "Teşekkürler!",
    successMessage:
      "Talebiniz gönderildi. İlgilenen alıcılar sizinle iletişime geçecektir.",

    submitted: "Araç Gönderildi",

    errorName: "Lütfen adınızı girin.",
    errorPhone: "Lütfen telefon numaranızı girin.",
    errorSubmission:
      "Bir sorun oluştu. Lütfen tekrar deneyin.",

    back: "Geri",
    step1: "Yıl Seç",
    step2: "Marka Seç",
    step3: "Model Seç",
    step4: "Kategori Seç",
  },

  ru: {
    title: "ОЦЕНКА АВТОМОБИЛЯ",
    subtitle: "Оценка автомобиля всего за 4 шага",
    seoTitle: "Оценка автомобиля на Северном Кипре",
    seoText: "OtoDeğer использует актуальные данные рынка подержанных автомобилей Северного Кипра, чтобы помочь оценить рыночную стоимость вашего автомобиля. Выберите год, марку, модель и категорию, чтобы увидеть ориентировочную стоимость и текущий диапазон цен.",
    restart: "Найти другой автомобиль",

    sell: "Продать автомобиль",
    formTitle: "Получить предложения о покупке",
    formSubtitle: "Заинтересованные покупатели смогут связаться с вами напрямую.",

    name: "Ваше имя",
    namePlaceholder: "Введите ваше имя",
    phone: "Номер телефона",
    phonePlaceholder: "Введите номер телефона",

    submit: "Отправить",
    submitting: "Отправка...",
    close: "Закрыть",

    successTitle: "Спасибо!",
    successMessage:
      "Ваш запрос отправлен. Заинтересованные покупатели свяжутся с вами.",

    submitted: "Автомобиль отправлен",

    errorName: "Введите ваше имя.",
    errorPhone: "Введите номер телефона.",
    errorSubmission:
      "Произошла ошибка. Попробуйте еще раз.",

    back: "Назад",
    step1: "Выберите год",
    step2: "Выберите марку",
    step3: "Выберите модель",
    step4: "Выберите категорию",
  },
};

export default function App() {
  const [step, setStep] = useState(1);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState("");

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
  useEffect(() => {
  const seo = {
    tr: {
      title: "Kıbrıs Araç Değerleme | Aracınız Ne Kadar Eder? | OtoDeğer",
      description:
        "Kuzey Kıbrıs araç değerleme aracı. Aracınızın güncel piyasa değerini ve fiyat aralığını saniyeler içinde öğrenin.",
    },
    en: {
      title: "North Cyprus Car Valuation | OtoDeğer",
      description:
        "Find out how much your car is worth in North Cyprus using current vehicle market data.",
    },
    ru: {
      title: "Оценка автомобиля на Северном Кипре | OtoDeğer",
      description:
        "Узнайте ориентировочную стоимость автомобиля на Северном Кипре на основе актуальных рыночных данных.",
    },
  };

  const currentSeo = seo[lang] || seo.tr;

  document.title = currentSeo.title;
  document.documentElement.lang = lang;

  const metaDescription = document.querySelector(
    'meta[name="description"]'
  );

  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      currentSeo.description
    );
  }
}, [lang]);

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

  // ✅ Google Analytics (gtag.js) added here
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-RR4B3F29EH";
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];

    function gtag() {
      window.dataLayer.push(arguments);
    }

    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", "G-RR4B3F29EH");
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

  const submitLead = async () => {
  setLeadError("");

  if (!leadName.trim()) {
    setLeadError(text.errorName);
    return;
  }

  if (!leadPhone.trim()) {
    setLeadError(text.errorPhone);
    return;
  }

  setLeadSubmitting(true);

  try {
    const response = await fetch(`${API}/submit_lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        year,
        brand,
        model,
        category,
        valuation: result?.median_price,
        min_price: result?.min_price,
        max_price: result?.max_price,
        name: leadName.trim(),
        phone: leadPhone.trim(),
        consent: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setLeadError(text.errorSubmission);
      return;
    }

    setLeadSubmitted(true);

  } catch (error) {
    console.error("Lead submission error:", error);
    setLeadError(text.errorSubmission);
  } finally {
    setLeadSubmitting(false);
  }
};

const resetFlow = () => {
  setStep(1);
  setYear("");
  setBrand("");
  setModel("");
  setCategory("");
  setResult(null);
  setAnimatedValue(0);

  setShowLeadForm(false);
  setLeadName("");
  setLeadPhone("");
  setLeadSubmitting(false);
  setLeadSubmitted(false);
  setLeadError("");
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
            <h1 className="title">{text.title}</h1>

            <div
              style={{
                fontSize: 12,
                color: "#2563eb",
                marginTop: 2,
              }}
            >
              {text.subtitle}
            </div>
          </div>

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
        </div>

        {step > 1 && (
          <div className="back-row">
            <button onClick={goBack} className="back-btn">
              ← {text.back}
            </button>
          </div>
        )}
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
          <h2 className="result-value">
            £{animatedValue.toLocaleString()}
          </h2>

          <p>
            £{result.min_price.toLocaleString()} – £
            {result.max_price.toLocaleString()}
          </p>

          <PriceScatter data={result.scatter} lang={lang} />

<div className="result-actions">

  <button
    onClick={resetFlow}
    className="btn-secondary-action"
  >
    {text.restart}
  </button>

  <button
    onClick={() => {
      if (!leadSubmitted) {
        setShowLeadForm(true);
        setLeadError("");
      }
    }}
    className={`btn-sell-action ${
      leadSubmitted ? "submitted" : ""
    }`}
    disabled={leadSubmitted}
  >
    {leadSubmitted ? `✓ ${text.submitted}` : text.sell}
  </button>

</div>

<div className="ad">
  <a
    href={ad.url}
    target="_blank"
    rel="noopener noreferrer"
  >
    <img src={ad.img} alt="ad" />
  </a>
</div>
        </div>
      )}

{showLeadForm && (
  <div
    className="lead-overlay"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowLeadForm(false);
      }
    }}
  >
    <div className="lead-modal">

      <button
        className="lead-close"
        onClick={() => setShowLeadForm(false)}
        aria-label={text.close}
      >
        ×
      </button>

      {!leadSubmitted ? (
        <>
          <div className="lead-modal-header">
            <h2>{text.formTitle}</h2>
          </div>

          <div className="lead-form">

            <div className="lead-field">
              <label>{text.name}</label>

              <input
                type="text"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder={text.namePlaceholder}
              />
            </div>

            <div className="lead-field">
              <label>{text.phone}</label>

              <input
                type="tel"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                placeholder={text.phonePlaceholder}
              />
            </div>

            {leadError && (
              <div className="lead-error">
                {leadError}
              </div>
            )}

            <button
              className="lead-submit"
              onClick={submitLead}
              disabled={leadSubmitting}
            >
              {leadSubmitting
                ? text.submitting
                : text.submit}
            </button>

          </div>
        </>
      ) : (
        <div className="lead-success">

          <div className="success-icon">
            ✓
          </div>

          <h2>{text.successTitle}</h2>

          <p>{text.successMessage}</p>

          <button
            className="lead-submit"
            onClick={() => setShowLeadForm(false)}
          >
            {text.close}
          </button>

        </div>
      )}

    </div>
  </div>
)}
      <section
        className="seo-section"
        aria-label={text.seoTitle}
      >
        <h2>{text.seoTitle}</h2>
        <p>{text.seoText}</p>
      </section>

      <Analytics />
    </div>
  );
}