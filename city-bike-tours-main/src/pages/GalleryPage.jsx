import {useEffect,useState} from "react";
import {Link,useLocation} from "react-router";
import {SITES} from "../data";
import Footer from "../components/Footer";
import "../rr-theme.css";
import "../gallery-reviews.css";

export default function GalleryPage(){
 const {hash}=useLocation();
 const [active,setActive]=useState(0);
 const featured=SITES[active]||SITES[0];
 useEffect(()=>{if(!hash)return;const t=setTimeout(()=>document.getElementById(hash.slice(1))?.scrollIntoView({behavior:"smooth"}),200);return()=>clearTimeout(t)},[hash]);
 const move=(direction)=>setActive(index=>(index+direction+SITES.length)%SITES.length);
 useEffect(()=>{const onKey=e=>{if(e.key==="ArrowRight")move(1);if(e.key==="ArrowLeft")move(-1)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[]);
 return <><main className="rr rr-bg rr-page rr-gallery-page"><div className="rr-container">
  <header className="rr-hero rr-gallery-hero"><p className="rr-kicker">City Bike Tours · Gaborone heritage</p><h1>See the city.<br/><em>Feel its stories.</em></h1><p className="rr-muted">A visual journey through the landmarks, people and places that make Gaborone unique. Explore a featured stop or browse the full collection below.</p></header>
  <section className="rr-gallery-feature" aria-label="Featured heritage site carousel">
   <div className="rr-gallery-feature-image"><img key={featured.imgs[0]} src={featured.imgs[0]} alt={featured.name} fetchPriority="high"/><span className="rr-gallery-counter">{String(active+1).padStart(2,"0")} <i>/</i> {String(SITES.length).padStart(2,"0")}</span></div>
   <div className="rr-gallery-feature-copy"><p className="rr-kicker">Featured heritage stop · {String(active+1).padStart(2,"0")}</p><h2>{featured.name}</h2><p className="rr-muted">{featured.short}</p><div className="rr-gallery-feature-actions"><Link className="rr-btn-primary" to={`/gallery/${featured.id}`}>Explore photo collection ↗</Link><div className="rr-carousel-controls"><button type="button" onClick={()=>move(-1)} aria-label="Previous heritage site">←</button><button type="button" onClick={()=>move(1)} aria-label="Next heritage site">→</button></div></div>
    <div className="rr-carousel-dots" aria-label="Choose featured site">{SITES.map((site,index)=><button key={site.id} type="button" className={index===active?"active":""} aria-label={`Show ${site.name}`} aria-pressed={index===active} onClick={()=>setActive(index)}/>)}</div>
   </div>
  </section>
  <section className="rr-gallery-collection" aria-labelledby="gallery-collection-title"><div className="rr-gallery-section-heading"><div><p className="rr-kicker">The heritage collection</p><h2 id="gallery-collection-title">Explore all six sites</h2></div><span className="rr-chip">06 locations · Gaborone</span></div>
   <div className="rr-gallery-grid">{SITES.map((site,index)=><Link className={`rr-plate rr-gallery-card ${index===active?"is-featured":""}`} key={site.id} to={`/gallery/${site.id}`} onMouseEnter={()=>setActive(index)}><div className="rr-gallery-card-image"><img src={site.imgs[0]} alt={site.name} loading="lazy" decoding="async"/><span>{String(index+1).padStart(2,"0")}</span></div><div className="rr-gallery-card-copy"><p className="rr-kicker">{site.street}</p><h3>{site.name}</h3><p className="rr-muted">{site.short}</p><span className="rr-gallery-card-link">View collection <b>↗</b></span></div></Link>)}</div>
  </section>
  <section id="photos" className="rr-gallery-community rr-plate-elevated"><div><p className="rr-kicker">The ride through your eyes</p><h2>Every journey has a story.</h2><p className="rr-muted">Discover photographs and experiences shared by the City Bike Tours community.</p></div><Link to="/connect" className="rr-btn-ghost">Read rider stories ↗</Link></section>
 </div></main><Footer/></>;
}
