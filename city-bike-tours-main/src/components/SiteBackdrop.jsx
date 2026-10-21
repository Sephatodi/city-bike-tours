import HeaderBike from "./HeaderBike";

export const BACKDROP_PHOTO = "https://images.unsplash.com/photo-1591005383946-16532ba69aee?w=1600&h=900&fit=crop&auto=format";

// One fixed backdrop behind every page: the Gaborone aerial photo, the diamond pattern and
// the roaming bicycles that used to live only in the home page header.
export default function SiteBackdrop() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <img className="site-backdrop-photo" src={BACKDROP_PHOTO} alt="" />
      <div className="site-backdrop-tint" />
      <div className="absolute inset-0 tribal-pattern" />
      <HeaderBike />
    </div>
  );
}
