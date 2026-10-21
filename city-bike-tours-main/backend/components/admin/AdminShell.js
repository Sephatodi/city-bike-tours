"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { can as canRole, ROLE_LABELS } from "@/lib/permissions";
import { DashProvider, Icon, ToastProvider, initials, useDash } from "./ui";

// Groups expand to show their pages (like the reference); single items are plain links.
const NAV = [
  {
    id: "dashboard", label: "Dashboard", icon: "dashboard",
    children: [
      { href: "/admin", label: "Overview", perm: "dashboard:read", exact: true },
      { href: "/admin/analytics", label: "Website traffic", perm: "analytics:read" },
      { href: "/admin/bookings", label: "Bookings", perm: "bookings:read", badge: "pending" },
      { href: "/admin/check-in", label: "Check-in", perm: "checkin:write" },
    ],
  },
  {
    id: "customers", label: "Customers", icon: "inbox",
    children: [
      { href: "/admin/inbox", label: "Inbox & reviews", perm: "inbox:read", badge: "inbox" },
      { href: "/admin/messages", label: "Messages", perm: "messages:read" },
    ],
  },
  {
    id: "website", label: "Website", icon: "image",
    children: [
      { href: "/admin/routes", label: "Routes & prices", perm: "routes:read" },
      { href: "/admin/content", label: "Content", perm: "content:read" },
      { href: "/admin/media", label: "Media library", perm: "media:read" },
      { href: "/admin/seo", label: "Search (SEO)", perm: "seo:read" },
    ],
  },
  {
    id: "admin", label: "Administration", icon: "settings",
    children: [
      { href: "/admin/users", label: "Users & roles", perm: "users:read" },
      { href: "/admin/settings", label: "Site settings", perm: "settings:read" },
      { href: "/admin/integrations", label: "Integrations", perm: "settings:read" },
      { href: "/admin/security", label: "Security", perm: "dashboard:read" },
      { href: "/admin/system", label: "System & backups", perm: "system:read" },
      { href: "/admin/audit", label: "Audit log", perm: "audit:read" },
    ],
  },
];

const isActive = (item, pathname) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

function Sidebar({ staff, can, onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useDash();
  const [q, setQ] = useState("");
  const pending = data?.summary?.pendingCount || 0;
  const newInbox = data?.summary?.inboxCount || 0;

  const nav = NAV.map((item) => (item.children ? { ...item, children: item.children.filter((c) => can(c.perm)) } : item))
    .filter((item) => (item.children ? item.children.length > 0 : can(item.perm)));
  const activeGroup = nav.find((g) => g.children?.some((c) => isActive(c, pathname)))?.id;
  const [openGroups, setOpenGroups] = useState(() => ({ [activeGroup || "dashboard"]: true }));
  useEffect(() => { if (activeGroup) setOpenGroups((o) => (o[activeGroup] ? o : { ...o, [activeGroup]: true })); }, [activeGroup]);

  function search(event) {
    event.preventDefault();
    const term = q.trim();
    if (!term || !can("bookings:read")) return;
    router.push(`/admin/bookings?q=${encodeURIComponent(term)}`);
    onNavigate();
  }

  return (
    <aside className="adm-side" aria-label="Dashboard navigation">
      <div className="adm-brand">
        <span className="adm-brand-mark"><Icon name="bike" size={17} style={{ color: "#fff" }} /></span>
        <span>City Bike Tours</span>
      </div>
      {can("bookings:read") && (
        <form className="adm-search" onSubmit={search} role="search">
          <Icon name="search" size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search here..." aria-label="Find a rider or booking" />
        </form>
      )}
      <nav className="adm-nav">
        {nav.map((item) => {
          if (!item.children) {
            return (
              <Link key={item.href} href={item.href} className="adm-link" onClick={onNavigate} aria-current={isActive(item, pathname) ? "page" : undefined}>
                <Icon name={item.icon} size={17} />{item.label}
              </Link>
            );
          }
          const hasActive = item.children.some((c) => isActive(c, pathname));
          const open = !!openGroups[item.id];
          return (
            <div key={item.id}>
              <button type="button" className={`adm-link adm-parent${hasActive ? " has-active" : ""}`} aria-expanded={open}
                onClick={() => setOpenGroups((o) => ({ ...o, [item.id]: !open }))}>
                <Icon name={item.icon} size={17} />{item.label}
                <Icon name="chevron" size={15} className="chev" style={{ transform: open ? "rotate(180deg)" : "none" }} />
              </button>
              {open && (
                <div className="adm-sub">
                  {item.children.map((c) => (
                    <Link key={c.href} href={c.href} className="adm-sublink" onClick={onNavigate} aria-current={isActive(c, pathname) ? "page" : undefined}>
                      {c.label}
                      {c.badge === "pending" && pending > 0 && <span className="count" aria-label={`${pending} pending`}>{pending}</span>}
                      {c.badge === "inbox" && newInbox > 0 && <span className="count" aria-label={`${newInbox} waiting`}>{newInbox}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="adm-me">
        <span className="adm-avatar" aria-hidden="true">{initials(staff.name)}</span>
        <span><b>{staff.name}</b><small>{ROLE_LABELS[staff.role]}</small></span>
        <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })} aria-label="Sign out" title="Sign out"><Icon name="logout" size={17} /></button>
      </div>
    </aside>
  );
}

export default function AdminShell({ staff, children }) {
  const can = useMemo(() => (perm) => canRole(staff.role, perm), [staff.role]);
  return (
    <ToastProvider>
      <DashProvider staff={staff} can={can}>
        <Frame staff={staff} can={can}>{children}</Frame>
      </DashProvider>
    </ToastProvider>
  );
}

function Frame({ staff, can, children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <div className={`adm-shell${open ? " open" : ""}`}>
      <Sidebar staff={staff} can={can} onNavigate={() => setOpen(false)} />
      <div className="adm-scrim" onClick={() => setOpen(false)} />
      <main className="adm-main">
        <button type="button" className="btn btn-icon adm-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu" style={{ marginBottom: 14 }}>
          <Icon name="menu" />
        </button>
        {children}
      </main>
    </div>
  );
}
