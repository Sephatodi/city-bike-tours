import { useLiveData } from "../hooks/LiveDataContext";

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

export default function PricingSection() {
  const { routes } = useLiveData();

  return (
    <section id="included" className="pricing-section" aria-labelledby="pricing-heading">
      <div className="schedule-section-heading">
        <div><p className="schedule-section-kicker">COMPARE THE RIDES</p><h2 id="pricing-heading">What's included</h2></div>
        <p>Cycling lessons for kids and adults are included with the Casual Saturday ride, with no separate lesson fee.</p>
      </div>
      <div>
        {/* Feature comparison table */}
        <div className="mb-14">
          <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "#F5EDD9" }}>What's Included — Full Comparison</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(245,237,217,0.5)" }}>Compare our two rides: a guided weekday heritage tour and a relaxed Saturday ride with cycling lessons included.</p>

          <div className="overflow-x-auto rounded-sm" style={{ border: "1px solid rgba(245,237,217,0.08)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Outfit, sans-serif" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(26,58,42,0.55)" }}>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(245,237,217,0.5)", width: "40%" }}>Feature</th>
                  {routes.map((r) => (
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
                    {routes.map((r) => <td key={r.id} className="p-4 text-center"><Cell value={f[r.id]} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ strip */}
        <div>
          <h2 className="font-display font-bold text-2xl mb-6" style={{ color: "#F5EDD9" }}>Common Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: "When do the guided rides run?", a: "The Heritage City Ride runs Wednesday to Friday, with 9am and 2pm start times. Each guided group is limited to 10 riders." },
              { q: "What happens on Saturdays?", a: "Saturdays are casual, flexible rides for friends, families, and other riders. Cycling lessons for kids and adults are included." },
              { q: "Is a bike provided?", a: "Yes, all routes include a bicycle. You're welcome to bring your own if you prefer." },
              { q: "When do I pay?", a: "Payment is on the day of your ride. No deposit, no online payment required." },
              { q: "Are children welcome?", a: "Yes. Kids and adults are welcome on Casual Saturday rides, and cycling lessons are included. The guided Heritage City Ride welcomes all ages and fitness levels." },
            ].map(({ q, a }) => (
              <div key={q} className="p-5 rounded-sm" style={{ backgroundColor: "rgba(13,8,5,0.35)", border: "1px solid rgba(245,237,217,0.14)" }}>
                <div className="font-semibold text-sm mb-2" style={{ color: "#D4A017" }}>{q}</div>
                <div className="text-sm leading-relaxed" style={{ color: "rgba(245,237,217,0.65)" }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
