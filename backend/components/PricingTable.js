import { ROUTES, SATURDAY_PRICING, LESSON_PRICE } from "@/lib/data";

export default function PricingTable() {
  const tiers = [
    ...ROUTES.map((r) => ({ label: r.tierLabel, sub: r.name, price: SATURDAY_PRICING[r.tier] })),
    { label: "Kids' rate", sub: "Saturday special, accompanied by a parent", price: SATURDAY_PRICING.kids },
    { label: "Cycling lesson", sub: "Any day, subject to availability", price: LESSON_PRICE },
  ];

  return (
    <div className="price-grid">
      {tiers.map((t) => (
        <div className="price-card" key={t.label}>
          <div className="amount">P{t.price}</div>
          <div className="label">{t.label}</div>
          <div className="desc">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}
