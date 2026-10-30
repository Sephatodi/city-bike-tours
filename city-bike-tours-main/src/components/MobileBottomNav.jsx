import {NavLink} from "react-router";
const items=[["Heritage","/heritage-trail"],["Gallery","/gallery"],["Reviews","/connect"],["Book","/schedule#pricing"]];
export default function MobileBottomNav(){return <nav className="mobile-bottom-nav" aria-label="Main mobile navigation">{items.map(([label,to])=><NavLink key={label} to={to} end={label==="Book"?false:true} className={({isActive})=>isActive?"active":""}>{label}</NavLink>)}</nav>}
