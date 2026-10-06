import { useEffect, useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import HeaderBike from "../components/HeaderBike";
import { ROUTES_DATA } from "../data";

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

const FEATURES = [
  { label: "Expert local guide", complete: true, loop: false },
  { label: "Guided heritage stories", complete: true, loop: false },
  { label: "All 6 heritage sites", complete: true, loop: true },
  { label: "Cycling lessons for kids and adults", complete: false, loop: true },
  { label: "Bike provided", complete: true, loop: true },
  { label: "Wednesday–Friday · 9am or 2pm", complete: true, loop: false },
  { label: "Maximum 10 riders per group", complete: "10 riders", loop: false },
  { label: "Casual Saturday · no rigid schedule", complete: false, loop: true },
];

function Cell({ value }) {
  if (value === true) return <span style={{ color: "#D4A017", fontSize: "1.1rem" }}>✓</span>;
  if (value === false) return <span style={{ color: "rgba(245,237,217,0.2)", fontSize: "1.1rem" }}>—</span>;
  return <span className="text-xs font-semibold" style={{ color: "#D4A017" }}>{value}</span>;
}

export default function PricingPage() {
  useScrollReveal();
  const [riders, setRiders] = useState(1);
  const [selected, setSelected] = useState("complete");

  const route = ROUTES_DATA.find((r) => r.id === selected);
  const total = route.price * riders;
  const maxRiders = selected === "complete" ? 10 : 20;

  return (
    <div style={{ backgroundColor: "#0D0805", minHeight: "100vh" }}>
      {/* Page hero */}
      <div className="relative overflow-hidden pt-32 pb-16 tribal-pattern" style={{ backgroundColor: "#1A3A2A" }}>
        <HeaderBike />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Transparent Pricing</p>
          <h1 className="font-display font-bold" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "#F5EDD9", lineHeight: 1.05 }}>
            Pricing &<br />What's Included
          </h1>
          <p className="mt-4 text-base max-w-lg" style={{ color: "rgba(245,237,217,0.65)" }}>
            No hidden fees. Payment on the day. No deposit required.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Price cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-20 reveal">
          {ROUTES_DATA.map((r) => (
            <div
              key={r.id}
              className="p-8 rounded-sm flex flex-col relative"
              style={{
                backgroundColor: r.id === "complete" ? "#C1440E" : "#0F0B06",
                border: r.id === "complete" ? "none" : "1px solid rgba(245,237,217,0.12)",
              }}
            >
              {r.id === "complete" && (
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10" style={{ backgroundColor: "#F5EDD9", transform: "translate(30%,-30%)" }} />
              )}
              <div
                className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm inline-block self-start mb-4"
                style={{ backgroundColor: r.id === "complete" ? "rgba(245,237,217,0.2)" : `${r.badgeColor}22`, color: r.id === "complete" ? "#F5EDD9" : r.badgeColor }}
              >
                {r.badge}
              </div>
              <div className="font-display font-bold text-xl mb-1 leading-tight" style={{ color: "#F5EDD9" }}>{r.name}</div>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: r.id === "complete" ? "rgba(245,237,217,0.85)" : "rgba(245,237,217,0.6)" }}>{r.desc}</p>
              <div className="mt-auto">
                <div className="font-display font-bold" style={{ fontSize: "3rem", color: r.id === "complete" ? "#F5EDD9" : "#D4A017", lineHeight: 1 }}>
                  P{r.price}
                </div>
                <div className="text-xs mb-4 mt-1" style={{ color: r.id === "complete" ? "rgba(245,237,217,0.6)" : "rgba(245,237,217,0.4)" }}>per rider · payable on the day</div>
                <div className="text-xs mb-6" style={{ color: r.id === "complete" ? "rgba(245,237,217,0.7)" : "rgba(245,237,217,0.45)" }}>
                  ⏱ {r.duration} &nbsp;·&nbsp; {r.distance} &nbsp;·&nbsp; {r.sites} sites
                </div>
                <Link
                  to="/book"
                  className="block text-center py-3 font-bold uppercase tracking-widest text-sm rounded-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: r.id === "complete" ? "rgba(245,237,217,0.2)" : r.badgeColor,
                    color: "#F5EDD9",
                    border: r.id === "complete" ? "1px solid rgba(245,237,217,0.4)" : "none",
                  }}
                >
                  Book This Route
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-20 p-5 rounded-sm reveal" style={{ backgroundColor: "#0F0B06", border: "1px solid rgba(212,160,23,0.25)" }}>
          <p className="text-sm" style={{ color: "rgba(245,237,217,0.75)" }}>
            Cycling lessons for kids and adults are included with the Casual Saturday ride. There is no separate lesson booking or lesson fee.
          </p>
        </div>

        {/* Feature comparison table */}
        <div className="mb-20 reveal">
          <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "#F5EDD9" }}>What's Included — Full Comparison</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(245,237,217,0.5)" }}>Compare our two rides: a guided weekday heritage tour and a relaxed Saturday ride with cycling lessons included.</p>

          <div className="overflow-x-auto rounded-sm" style={{ border: "1px solid rgba(245,237,217,0.08)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Outfit, sans-serif" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(26,58,42,0.6)" }}>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(245,237,217,0.5)", width: "40%" }}>Feature</th>
                  {ROUTES_DATA.map((r) => (
                    <th key={r.id} className="p-4 text-center text-xs font-bold uppercase tracking-widest" style={{ color: r.badgeColor }}>
                      {r.name.split(" ").slice(0, 2).join(" ")}<br />
                      <span className="font-display text-xl" style={{ color: "#F5EDD9" }}>P{r.price}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr
                    key={f.label}
                    style={{ backgroundColor: i % 2 === 0 ? "rgba(245,237,217,0.02)" : "rgba(245,237,217,0.005)", borderTop: "1px solid rgba(245,237,217,0.05)" }}
                  >
                    <td className="p-4 text-sm" style={{ color: "rgba(245,237,217,0.75)" }}>{f.label}</td>
                    {ROUTES_DATA.map((r) => <td key={r.id} className="p-4 text-center"><Cell value={f[r.id]} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live price calculator */}
        <div className="mb-16 reveal">
          <h2 className="font-display font-bold text-2xl mb-6" style={{ color: "#F5EDD9" }}>Price Calculator</h2>
          <div className="grid md:grid-cols-2 gap-8 p-8 rounded-sm" style={{ backgroundColor: "#0F0B06", border: "1px solid rgba(245,237,217,0.08)" }}>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#D4A017" }}>Select Route</div>
              <div className="flex flex-col gap-2 mb-8">
                {ROUTES_DATA.map((r) => (
                  <label
                    key={r.id}
                    className="flex items-center gap-3 p-4 rounded-sm cursor-pointer transition-all"
                    style={{
                      backgroundColor: selected === r.id ? `${r.badgeColor}20` : "rgba(245,237,217,0.04)",
                      border: `1px solid ${selected === r.id ? r.badgeColor : "rgba(245,237,217,0.08)"}`,
                    }}
                  >
                    <input
                      type="radio"
                      name="calc-route"
                      value={r.id}
                      checked={selected === r.id}
                      onChange={() => {
                        setSelected(r.id);
                        if (r.id === "complete") setRiders((current) => Math.min(current, 10));
                      }}
                      style={{ accentColor: r.badgeColor }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm" style={{ color: "#F5EDD9" }}>{r.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(245,237,217,0.45)" }}>{r.when}</div>
                    </div>
                    <div className="font-bold text-sm" style={{ color: r.badgeColor }}>P{r.price}</div>
                  </label>
                ))}
              </div>

              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#D4A017" }}>
                Number of Riders · <span style={{ color: "#F5EDD9" }}>{riders}</span>
              </div>
              <input
                type="range"
                min={1}
                max={maxRiders}
                value={riders}
                onChange={(e) => setRiders(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: "rgba(245,237,217,0.3)" }}>
                <span>1 rider</span><span>{maxRiders} riders{selected === "complete" ? " · group limit" : ""}</span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="p-8 rounded-sm text-center" style={{ backgroundColor: "rgba(212,160,23,0.07)", border: "1px solid rgba(212,160,23,0.2)" }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>Your Total</div>
                <div className="font-display font-bold" style={{ fontSize: "4rem", color: "#F5EDD9", lineHeight: 1 }}>P{total}</div>
                <div className="text-sm mt-2 mb-1" style={{ color: "rgba(245,237,217,0.5)" }}>
                  {riders} rider{riders > 1 ? "s" : ""} × P{route.price}
                </div>
                <div className="text-xs mb-6" style={{ color: "rgba(245,237,217,0.35)" }}>Payable on the day · No deposit</div>
                <Link
                  to="/book"
                  className="inline-block px-8 py-3 font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#C1440E", color: "#F5EDD9" }}
                >
                  Book Now — P{total}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ strip */}
        <div className="reveal">
          <h2 className="font-display font-bold text-2xl mb-6" style={{ color: "#F5EDD9" }}>Common Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: "When do the guided rides run?", a: "The Heritage City Ride runs Wednesday to Friday, with 9am and 2pm start times. Each guided group is limited to 10 riders." },
              { q: "What happens on Saturdays?", a: "Saturdays are casual, flexible rides for friends, families, and other riders. Cycling lessons for kids and adults are included." },
              { q: "Is a bike provided?", a: "Yes, all routes include a bicycle. You're welcome to bring your own if you prefer." },
              { q: "When do I pay?", a: "Payment is on the day of your ride. No deposit, no online payment required." },
              { q: "Are children welcome?", a: "Yes. Kids and adults are welcome on Casual Saturday rides, and cycling lessons are included. The guided Heritage City Ride welcomes all ages and fitness levels." },
            ].map(({ q, a }) => (
              <div key={q} className="p-5 rounded-sm" style={{ backgroundColor: "rgba(245,237,217,0.03)", border: "1px solid rgba(245,237,217,0.07)" }}>
                <div className="font-semibold text-sm mb-2" style={{ color: "#D4A017" }}>{q}</div>
                <div className="text-sm leading-relaxed" style={{ color: "rgba(245,237,217,0.65)" }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
