import { Link } from "react-router";
import SiteFolders from "../components/SiteFolders";
import { useLiveData } from "../hooks/LiveDataContext";
import Footer from "../components/Footer";
import FoodStops from "../components/FoodStops";
import HeritageMap from "../components/HeritageMap";

export default function HeritageTrailPage() {
  const { content = [] } = useLiveData();
  return (
    <main className="heritage-trail-page">
      <header className="trail-hero">
        <p className="trail-eyebrow">GABORONE · SIX LANDMARKS · ONE SHARED STORY</p>
        <h1>Ride through<br /><span>living history.</span></h1>
        <p className="trail-hero-lede">
          From the civic heart of the city to the places that hold Botswana’s memory, take the long way through stories worth knowing.
        </p>
        <div className="trail-hero-facts" aria-label="Trail details">
          <span><strong>6</strong> heritage sites</span>
          <span><strong>~12 km</strong> by bicycle</span>
          <span><strong>Main Mall</strong> start and finish</span>
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
          <HeritageMap height="min(64vh, 600px)" />
        </div>
      </section>

      <section className="trail-sites-section" aria-labelledby="trail-sites-heading">
        <div className="trail-section-heading trail-sites-heading">
          <div>
            <p className="trail-eyebrow">THE NATION’S STORY</p>
            <h2 id="trail-sites-heading">Six stops. Six perspectives.</h2>
          </div>
          <p>Each landmark marks a different chapter in the making of modern Botswana.</p>
        </div>
        <SiteFolders content={content} />
      </section>

      <section className="trail-booking-cta" aria-labelledby="trail-booking-heading">
        <div>
          <p className="trail-eyebrow">THE CITY IS WAITING</p>
          <h2 id="trail-booking-heading">Let’s go find a story.</h2>
          <p>Choose your pace, see the live price, and meet us at Main Mall. Pay on the day; no deposit is needed.</p>
        </div>
        <Link to="/schedule#price-calculator" className="trail-booking-button">
          Choose your ride <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <div className="trail-food-wrap">
        <FoodStops />
      </div>
      <Footer />
    </main>
  );
}
