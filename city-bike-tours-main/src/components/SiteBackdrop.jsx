import HeaderBike from "./HeaderBike";

export const BACKDROP_PHOTO = "https://images.unsplash.com/photo-1591005383946-16532ba69aee?w=1600&h=900&fit=crop&auto=format";

// Fixed backdrop: green + diamond pattern, darker/intense tint, photo visible through transparency.
export default function SiteBackdrop() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <img className="site-backdrop-photo" src={BACKDROP_PHOTO} alt="" />
      <div className="site-backdrop-tint" />
      <div className="absolute inset-0 tribal-pattern site-backdrop-diamonds" />
      <HeaderBike />
    </div>
  );
}
