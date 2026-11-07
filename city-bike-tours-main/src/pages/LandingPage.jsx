import { useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import BicycleLoader from "../components/BicycleLoader";

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  const [loaderOpen, setLoaderOpen] = useState(false);

  const handleCta = (event) => {
    event.preventDefault();
    setLoaderOpen(true);
    setTimeout(() => {
      window.location.href = "/schedule";
      setLoaderOpen(false);
    }, 2000);
  };

  const handleTrail = (event) => {
    event.preventDefault();
    setLoaderOpen(true);
    setTimeout(() => {
      window.location.href = "/heritage-trail";
      setLoaderOpen(false);
    }, 2000);
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display font-bold leading-none mb-8" style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", color: "#F5EDD9" }}>
              Ride the<br />
              <span style={{ color: "#D4A017" }}>Heart</span> of<br />
              the City
            </h1>
            <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: "#E8DFCC", opacity: 0.85 }}>
              Two ways to explore living heritage: a guided city ride for the curious, and a
              carefree Saturday spin for friends and families.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-8 max-w-2xl">
              <div className="p-4 rounded-sm" style={{ backgroundColor: "rgba(193,68,14,0.88)", color: "#F5EDD9" }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-2">Heritage City Ride</div>
                <div className="text-sm leading-relaxed">Wed–Fri · 9am or 2pm · Guided · Max 10 riders</div>
              </div>
              <div className="p-4 rounded-sm border" style={{ borderColor: "#D4A017", color: "#F5EDD9", backgroundColor: "rgba(26,58,42,0.78)" }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#D4A017" }}>Casual Saturday</div>
                <div className="text-sm leading-relaxed">Friends, families, and fellow riders · lessons for kids and adults included</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCta}
                className="px-8 py-3 font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#D4A017", color: "#0D0805" }}
              >
                Check Availability
              </button>
              <button
                onClick={handleTrail}
                className="px-8 py-3 font-semibold uppercase tracking-widest text-sm rounded-sm border hover:bg-white/5 transition-colors"
                style={{ borderColor: "rgba(245,237,217,0.4)", color: "#F5EDD9" }}
              >
                The Trail →
              </button>
            </div>
          </div>
        </div>
      </div>
      {loaderOpen && <BicycleLoader isActive={true} />}
    </section>
  );
}

// ─── ABOUT STRIP ──────────────────────────────────────────────────────────────

function AboutStrip() {
  return (
    <section className="py-20 relative">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal" style={{ position: "relative", zIndex: 2 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C1440E" }}>— What We Do</p>
            <h2 className="font-display font-bold mb-8" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#F5EDD9", lineHeight: 1.1 }}>
              City Bike Tours<br /><span style={{ color: "#D4A017" }}>through living history</span>
            </h2>
            <ul className="space-y-4 text-sm leading-relaxed" style={{ color: "#E8DFCC", opacity: 0.85 }}>
              <li className="flex items-start gap-3">
                <Icon name="mapPin" size={18} className="mt-0.5" style={{ color: "#D4A017" }} />
                <span>Meet at Main Mall, Gaborone City Centre — every Wednesday to Friday at 9am or 2pm.</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="bicycle" size={18} className="mt-0.5" style={{ color: "#D4A017" }} />
                <span>Guided groups of up to 10 riders on the Heritage City Ride.</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="graduationCap" size={18} className="mt-0.5" style={{ color: "#D4A017" }} />
                <span>Cycling lessons included on Casual Saturdays for kids and adults.</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="clock" size={18} className="mt-0.5" style={{ color: "#D4A017" }} />
                <span>Pay on the day at Main Mall — no deposit, no online payment.</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-6">
              <Link to="/schedule" className="px-5 py-2 text-sm font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}>
                Reserve
              </Link>
              <Link to="/heritage-trail" className="px-5 py-2 text-sm font-semibold uppercase tracking-widest rounded-sm border hover:bg-white/5 transition-colors" style={{ borderColor: "rgba(245,237,217,0.3)", color: "#F5EDD9" }}>
                Heritage Trail
              </Link>
            </div>
          </div>

          <div className="reveal hidden lg:flex items-center justify-center">
            <div className="relative" style={{ width: "100%", maxWidth: 500, height: "clamp(300px, 35vw, 500px)" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#0D0805]/60 to-[#1A3A2A]/40 rounded-sm" />
              <img src="/bike1.jfif" alt="Tour bicycle" className="relative w-full h-full object-cover rounded-sm" style={{ filter: "brightness(0.95) contrast(1.05)", zIndex: 1 }} />
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="font-display font-bold text-xl mb-1" style={{ color: "#D4A017" }}>Ride the Heart of Gaborone</div>
                <div className="text-sm" style={{ color: "#F5EDD9", opacity: 0.9 }}>
                  Six heritage sites, one story, two wheels.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="relative">
      <Hero />
      <AboutStrip />
      <Footer />
    </div>
  );
}
