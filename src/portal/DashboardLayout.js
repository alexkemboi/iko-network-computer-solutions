import React, { useEffect, useRef, useState } from "react";
import {
  FaThLarge,
  FaShoppingBag,
  FaReceipt,
  FaInbox,
  FaSms,
  FaMoneyCheckAlt,
  FaCubes,
  FaConciergeBell,
  FaUsers,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaGlobe,
  FaChevronDown,
} from "react-icons/fa";
import logo from "../images/logo.png";
import ThemeToggle from "../components/Navbar/ThemeToggle";
import { useAuth, ROLE_LABEL } from "./AuthContext";

export const NAV = [
  { group: "Main", items: [
    { path: "/app", label: "Overview", icon: FaThLarge, roles: ["admin", "staff", "customer"] },
    { path: "/app/orders", label: "Orders", icon: FaShoppingBag, roles: ["admin", "staff", "customer"] },
    { path: "/app/payments", label: "Payments", icon: FaReceipt, roles: ["admin", "staff", "customer"] },
    { path: "/app/enquiries", label: "Enquiries", icon: FaInbox, roles: ["admin", "staff"] },
  ] },
  { group: "Engage & pay", items: [
    { path: "/app/sms", label: "Bulk SMS", icon: FaSms, roles: ["admin", "staff"] },
    { path: "/app/payouts", label: "Bulk Payments", icon: FaMoneyCheckAlt, roles: ["admin"] },
  ] },
  { group: "Catalogue", items: [
    { path: "/app/products", label: "Products", icon: FaCubes, roles: ["admin", "staff"] },
    { path: "/app/services", label: "Services", icon: FaConciergeBell, roles: ["admin", "staff"] },
  ] },
  { group: "Administration", items: [
    { path: "/app/users", label: "Users", icon: FaUsers, roles: ["admin"] },
    { path: "/app/settings", label: "Settings", icon: FaCog, roles: ["admin"] },
  ] },
];

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

const DashboardLayout = ({ path, navigate, children }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!menu) return undefined;
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    const esc = (e) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [menu]);

  const go = (to) => (e) => {
    e.preventDefault();
    navigate(to);
  };

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`px-shell ${open ? "is-nav-open" : ""}`}>
      <aside className="px-side" aria-label="Dashboard navigation">
        <div className="px-side__brand">
          <img src={logo} alt="" />
          <div>
            <strong>IKONEX</strong>
            <span>Business Portal</span>
          </div>
          <button type="button" className="px-iconbtn px-side__close" onClick={() => setOpen(false)} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <nav className="px-side__nav">
          {NAV.map((g) => {
            const items = g.items.filter((i) => i.roles.includes(user.role));
            if (!items.length) return null;
            return (
              <div key={g.group} className="px-side__group">
                <span className="px-side__label">{g.group}</span>
                {items.map((i) => {
                  const active = i.path === "/app" ? path === "/app" : path.startsWith(i.path);
                  const Icon = i.icon;
                  return (
                    <a key={i.path} href={`#${i.path}`} onClick={go(i.path)} className={`px-side__link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined}>
                      <Icon aria-hidden="true" />
                      <span>{i.label}</span>
                    </a>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <a href="/" className="px-side__site">
          <FaGlobe aria-hidden="true" /> Back to website
        </a>
      </aside>
      <div className="px-side__scrim" onClick={() => setOpen(false)} aria-hidden="true" />

      <div className="px-main">
        <header className="px-top">
          <button type="button" className="px-iconbtn px-top__menu" onClick={() => setOpen(true)} aria-label="Open menu">
            <FaBars />
          </button>
          <div className="px-top__spacer" />
          <ThemeToggle />
          <div className="px-user" ref={menuRef}>
            <button type="button" className="px-user__btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu">
              <span className="px-avatar" aria-hidden="true">{initials(user.fullName)}</span>
              <span className="px-user__text">
                <strong>{user.fullName}</strong>
                <span>{ROLE_LABEL[user.role]}</span>
              </span>
              <FaChevronDown aria-hidden="true" className="px-user__chev" />
            </button>
            {menu && (
              <div className="px-user__menu" role="menu">
                <div className="px-user__who">
                  <strong>{user.fullName}</strong>
                  <span>{user.email}</span>
                </div>
                <a role="menuitem" href="#/app/profile" onClick={go("/app/profile")}>
                  <FaUserCircle aria-hidden="true" /> My profile
                </a>
                <button role="menuitem" type="button" onClick={signOut}>
                  <FaSignOutAlt aria-hidden="true" /> Log out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="px-content" id="portal-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
