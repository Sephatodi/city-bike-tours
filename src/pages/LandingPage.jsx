import { useEffect, useState } from "react";
import { Link } from "react-router";
import BikeSVG from "../components/BikeSVG";
import Carousel from "../components/Carousel";
import HeritageMap from "../components/HeritageMap";
import Footer from "../components/Footer";
import HeaderBike from "../components/HeaderBike";
import Icon from "../components/Icon";
import { SITES } from "../data";

// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden clip-diagonal" style={{ backgroundColor: "#0D0805" }}>
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1591005383946-16532ba69aee?w=1600&h=900&fit=crop&auto=format"
          alt="Gaborone aerial"
          className="w-full h-full object-cover"
          style={{ opacity: 0.35 }}
        />
        <div className="absolute inset-0 tribal-pattern" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(13,8,5,0.85) 0%, rgba(26,58,42,0.5) 50%, rgba(13,8,5,0.9) 100%)" }} />
      </div>
      <HeaderBike />
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display font-bold leading-none mb-6" style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", color: "#F5EDD9" }}>
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
              <Link
                to="/book"
                className="px-8 py-3 font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#D4A017", color: "#0D0805" }}
              >
                Book a Ride
              </Link>
              <a
                href="#heritage"
                className="px-8 py-3 font-semibold uppercase tracking-widest text-sm rounded-sm border hover:bg-white/5 transition-colors"
                style={{ borderColor: "rgba(245,237,217,0.4)", color: "#F5EDD9" }}
              >
                The Trail →
              </a>
            </div>
          </div>

          <div className="hero-feature-list grid gap-4">
            {[
              { n: "01", label: "Guided heritage ride", sub: "Stories, landmarks, and a steady pace" },
              { n: "02", label: "Casual Saturday", sub: "A loose, social ride made for togetherness" },
            ].map((s) => (
              <div
                key={s.n}
                className="p-5 rounded-sm border flex items-start gap-4"
                style={{ borderColor: "rgba(212,160,23,0.25)", backgroundColor: "rgba(26,58,42,0.2)" }}
              >
                <div className="font-display font-bold text-2xl leading-none" style={{ color: "#D4A017" }}>{s.n}</div>
                <div>
                  <div className="font-semibold text-sm mb-0.5" style={{ color: "#F5EDD9" }}>{s.label}</div>
                  <div className="text-xs" style={{ color: "#E8DFCC", opacity: 0.6 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

// ─── ABOUT STRIP ──────────────────────────────────────────────────────────────

function AboutStrip() {
  return (
    <section className="py-16 relative" style={{ backgroundColor: "#0F0B06" }}>
      <div className="absolute inset-0 tribal-pattern opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C1440E" }}>— What We Do</p>
            <h2 className="font-display font-bold mb-5" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#F5EDD9", lineHeight: 1.1 }}>
              City Bike Tours<br /><span style={{ color: "#D4A017" }}>through living history</span>
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "#E8DFCC", opacity: 0.85 }}>
              City Bike Tours runs Gaborone's only heritage-focused bicycle tour, guiding riders through six landmark sites.
              Wednesday to Friday, we meet at <strong style={{ color: "#D4A017" }}>Main Mall</strong> at 9am or 2pm for a guided ride through Gaborone's heritage sites. Each group is limited to 10 riders.
            </p>
            <div className="flex flex-col gap-3 mb-6">
              {[
                ["mapPin", "Meet at Main Mall, Gaborone City Centre"],
                ["clock", "Wednesday–Friday at 9am or 2pm — guided groups of up to 10"],
                ["bicycle", "Casual Saturdays — relaxed ride with friends, family, and fellow riders"],
                ["graduationCap", "Cycling lessons included on Casual Saturdays for kids and adults"],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-start gap-3 text-sm" style={{ color: "#E8DFCC" }}>
                  <Icon name={icon} size={17} className="mt-0.5" style={{ color: "#D4A017" }} /><span>{text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Link to="/schedule" className="px-5 py-2 text-sm font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}>
                See Schedule
              </Link>
              <Link to="/routes" className="px-5 py-2 text-sm font-semibold uppercase tracking-widest rounded-sm border hover:bg-white/5 transition-colors" style={{ borderColor: "rgba(245,237,217,0.3)", color: "#F5EDD9" }}>
                View Routes
              </Link>
            </div>
          </div>

          <div className="reveal grid grid-cols-1 gap-4">
            <div className="relative overflow-hidden rounded-sm" style={{ backgroundColor: "#1A3A2A" }}>
              <img
                src="https://images.unsplash.com/photo-1738145133893-a9c9aa180f8f?w=700&h=420&fit=crop&auto=format"
                alt="Group cycling in Africa"
                className="w-full object-cover"
                style={{ height: "240px", opacity: 0.85 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="font-display font-bold text-xl mb-1" style={{ color: "#D4A017" }}>Experience the City's Heritage</div>
                <div className="text-sm" style={{ color: "#F5EDD9", opacity: 0.8 }}>
                  Meet us at Main Mall and begin your journey through history — together, curious, unhurried.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Every Wed", sub: "Flagship ride", color: "#C1440E" },
                { label: "6 Sites", sub: "Heritage trail", color: "#1A3A2A" },
                { label: "All Levels", sub: "Welcome", color: "#D4A017" },
              ].map((c) => (
                <div key={c.label} className="p-4 rounded-sm text-center" style={{ backgroundColor: c.color + "33", borderLeft: `3px solid ${c.color}` }}>
                  <div className="font-display font-bold text-lg" style={{ color: "#F5EDD9" }}>{c.label}</div>
                  <div className="text-xs mt-1" style={{ color: "#E8DFCC", opacity: 0.7 }}>{c.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── HERITAGE SITES ───────────────────────────────────────────────────────────

function HeritageSiteCard({ site, index }) {
  return (
    <div className="site-card reveal" style={{ transitionDelay: `${index * 0.08}s` }}>
      <Carousel imgs={site.imgs} accent={site.color} title={site.name} subtitle={site.street} />
      <div className="p-6 rounded-b-sm" style={{ backgroundColor: "rgba(13,8,5,0.9)", borderLeft: `4px solid ${site.color}` }}>
        <div className="flex items-start gap-3 mb-3">
          <Icon name={site.icon} size={24} style={{ color: site.color }} />
          <div>
            <h3 className="font-display font-bold text-xl leading-tight" style={{ color: "#F5EDD9" }}>{site.name}</h3>
            <p className="text-xs italic mt-0.5" style={{ color: site.color }}>{site.short}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(245,237,217,0.75)" }}>{site.history}</p>
      </div>
    </div>
  );
}

function HeritageSection() {
  return (
    <section id="heritage" className="py-24" style={{ backgroundColor: "#0D0805" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C1440E" }}>— The Heritage Trail</p>
          <h2 className="font-display font-bold mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#F5EDD9" }}>
            Six Sites. One Nation's Story.
          </h2>
          <p className="max-w-2xl mx-auto text-base" style={{ color: "rgba(245,237,217,0.65)" }}>
            Each stop carries the weight of a decisive moment in Botswana's history.
            Arrive by bicycle and the scale becomes human — a monument that looks imposing from a car becomes personal at cycling pace.
          </p>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {SITES.map((site, i) => <HeritageSiteCard key={site.id} site={site} index={i} />)}
        </div>
      </div>
    </section>
  );
}

// ─── MAP SECTION ──────────────────────────────────────────────────────────────

function MapSection() {
  return (
    <section id="map" className="py-24" style={{ backgroundColor: "#1A3A2A" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10 reveal">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Where We Ride</p>
          <h2 className="font-display font-bold mb-3" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#F5EDD9" }}>Heritage Route Map</h2>
          <p className="max-w-xl mx-auto text-sm" style={{ color: "rgba(245,237,217,0.65)" }}>
            All 6 sites within cycling distance of Main Mall · Click any marker for details
          </p>
        </div>
        <div className="reveal mb-4 flex flex-wrap gap-4 justify-center text-xs">
          {[
            { color: "#D4A017", label: "Main Mall (start/end)" },
            { color: "#C1440E", label: "Heritage sites" },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-2" style={{ color: "rgba(245,237,217,0.7)" }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: color, display: "inline-block" }} />
              {label}
            </span>
          ))}
        </div>
        <div className="reveal">
          <HeritageMap height="500px" />
        </div>
        <div className="mt-8 text-center reveal">
          <Link
            to="/routes"
            className="inline-block px-8 py-3 font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}
          >
            Explore Route Options →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const [showCursor, setShowCursor] = useState(false);
  useScrollReveal();

  useEffect(() => {
    let timeout;
    const onMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      setShowCursor(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowCursor(false), 3000);
    };
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); clearTimeout(timeout); };
  }, []);

  return (
    <div className="relative">
      <div
        className="bike-cursor"
        style={{ left: cursorPos.x + 16, top: cursorPos.y - 24, opacity: showCursor ? 0.7 : 0, transition: "opacity 0.5s ease" }}
      >
        <BikeSVG size={32} color="#D4A017" />
      </div>
      <Hero />
      <AboutStrip />
      <HeritageSection />
      <MapSection />
      <Footer />
    </div>
  );
}
