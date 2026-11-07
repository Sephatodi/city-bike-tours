import { Link } from "react-router";
import Footer from "../components/Footer";
import HeritageMap from "../components/HeritageMap";
import SiteFolders from "../components/SiteFolders";

export default function HeritageTrailPage() {
  return (
    <main className="heritage-trail-page">
      <header className="trail-hero" style={{ textAlign: "left", paddingLeft: 0, marginLeft: 0 }}>
        <div className="trail-hero-content" style={{ display: "block", textAlign: "left" }}>
          <p className="trail-eyebrow">GABORONE · SIX LANDMARKS · ONE SHARED STORY</p>
          <h1 className="trail-wave" style={{ textAlign: "left" }}>
            R<span style={{ animationDelay: "0.05s" }}>i</span><span style={{ animationDelay: "0.1s" }}>d</span><span style={{ animationDelay: "0.15s" }}>e</span><span style={{ animationDelay: "0.2s" }}> </span><span style={{ animationDelay: "0.25s" }}>t</span><span style={{ animationDelay: "0.3s" }}>h</span><span style={{ animationDelay: "0.35s" }}>r</span><span style={{ animationDelay: "0.4s" }}>o</span><span style={{ animationDelay: "0.45s" }}>u</span><span style={{ animationDelay: "0.5s" }}>g</span><span style={{ animationDelay: "0.55s" }}>h</span><span style={{ animationDelay: "0.6s" }}> </span><span style={{ animationDelay: "0.65s" }}>l</span><span style={{ animationDelay: "0.7s" }}>i</span><span style={{ animationDelay: "0.75s" }}>v</span><span style={{ animationDelay: "0.8s" }}>i</span><span style={{ animationDelay: "0.85s" }}>n</span><span style={{ animationDelay: "0.9s" }}>g</span><span style={{ animationDelay: "0.95s" }}> </span><span style={{ animationDelay: "1s" }}>h</span><span style={{ animationDelay: "1.05s" }}>i</span><span style={{ animationDelay: "1.1s" }}>s</span><span style={{ animationDelay: "1.15s" }}>t</span><span style={{ animationDelay: "1.2s" }}>o</span><span style={{ animationDelay: "1.25s" }}>r</span><span style={{ animationDelay: "1.3s" }}>y</span><span style={{ animationDelay: "1.35s" }}>.</span>
          </h1>
          <p className="trail-hero-lede">
            From the civic heart of the city to the places that hold Botswana's memory, take the long way through stories worth knowing.
          </p>
          <div className="trail-hero-facts" aria-label="Trail details" style={{ marginTop: "1.5rem" }}>
            <span><strong>6</strong> heritage sites</span>
            <span><strong>~8.8 km</strong> by bicycle</span>
            <span><strong>Main Mall</strong> start and finish</span>
          </div>
        </div>
      </header>

      <section className="trail-map-section" aria-labelledby="trail-map-heading">
        <div className="trail-section-heading">
          <div>
            <p className="trail-eyebrow">THE ROUTE</p>
            <h2 id="trail-map-heading">A city-sized story.</h2>
          </div>
          <p>Explore the six stops on the map. Select a marker or a site name to bring that place into focus.</p>
        </div>
        <div className="trail-map-frame">
          <HeritageMap height="min(64vh, 600px)" trail />
        </div>
      </section>

      <section className="trail-sites-section" aria-labelledby="trail-sites-heading">
        <div className="trail-section-heading trail-sites-heading">
          <div>
            <p className="trail-eyebrow">THE NATION'S STORY</p>
            <h2 id="trail-sites-heading">Six stops. Six perspectives.</h2>
          </div>
          <p>Each landmark marks a different chapter in the making of modern Botswana. Open a folder to see its photos, story and videos.</p>
        </div>
        <SiteFolders />
      </section>

      <section className="trail-booking-cta" aria-labelledby="trail-booking-heading" style={{ marginTop: "3rem" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <p className="trail-eyebrow">THE CITY IS WAITING</p>
          <h2 id="trail-booking-heading">Let's go find a story.</h2>
          <p>Choose your pace, see the live price, and meet us at Main Mall. Pay on the day; no deposit is needed.</p>
          <div className="trail-booking-button-wrap" style={{ marginTop: "1.5rem" }}>
            <Link to="/schedule" className="trail-booking-button">
              Check Availability <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
