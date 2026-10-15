import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaArrowRight,
  FaInfoCircle,
  FaBriefcase,
  FaEnvelope,
  FaSignInAlt,
  FaLaptopCode,
  FaGraduationCap,
  FaFlask,
  FaBrain,
  FaChartLine,
  FaShieldAlt,
  FaPaintBrush,
  FaDesktop,
  FaCubes,
  FaLightbulb,
} from "react-icons/fa";

import logo from "../../images/logo.png";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

/*
 * "What We Do" menu: one flat list of service categories, shown as a 4 x 2 grid
 * on desktop and a single list in the mobile sidebar. Links point at the
 * existing pages/sections (AI and Data Analytics live on the Research page;
 * there is no Computers page yet, so it opens the enquiry form).
 */
const WHAT_WE_DO = [
  { label: "Software Development", href: "/what-we-do#software", icon: FaLaptopCode, blurb: "Web, mobile & business systems" },
  { label: "Software Development Training", href: "/training", icon: FaGraduationCap, blurb: "Practical, industry-led courses" },
  { label: "Research & Innovation", href: "/research", icon: FaFlask, blurb: "Applied technology research" },
  { label: "Artificial Intelligence", href: "/research", icon: FaBrain, blurb: "Automation & intelligent systems" },
  { label: "Data Analytics", href: "/research", icon: FaChartLine, blurb: "Dashboards, reports & insight" },
  { label: "Cyber Services", href: "/cyber-digital-services#cyber", icon: FaShieldAlt, blurb: "Documents, applications & support" },
  { label: "Creative Design", href: "/cyber-digital-services#graphics-design", icon: FaPaintBrush, blurb: "Graphics, branding & print" },
  { label: "Computers", href: "#contact", icon: FaDesktop, blurb: "Hardware, networking & IT support" },
];

// Standalone pages linked directly from the top-level nav.
const PAGE_LINKS = [
  { label: "Training", href: "/training", icon: FaGraduationCap },
  { label: "Research", href: "/research", icon: FaLightbulb },
];

const currentPath = () => window.location.pathname.replace(/\/$/, "") || "/";

const NavbarComponent = () => {
  const path = currentPath();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isMobileWhatOpen, setIsMobileWhatOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const megaRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  // Close menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991) {
        setIsMobileMenuOpen(false);
      } else {
        setIsMegaOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Elevate navbar once the page scrolls
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mega menu on outside click / Escape
  useEffect(() => {
    if (!isMegaOpen && !isMobileMenuOpen) return undefined;

    const onPointerDown = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) {
        setIsMegaOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isMegaOpen) {
          setIsMegaOpen(false);
          if (triggerRef.current) triggerRef.current.focus();
        }
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMegaOpen, isMobileMenuOpen]);

  const megaTiles = () =>
    panelRef.current ? Array.from(panelRef.current.querySelectorAll(".mega-tile")) : [];

  // Open with the keyboard and move straight into the grid
  const focusFirstTile = useRef(false);
  const onTriggerKeyDown = useCallback((e) => {
    if (e.key !== "ArrowDown") return;
    e.preventDefault();
    focusFirstTile.current = true;
    setIsMegaOpen(true);
  }, []);

  useEffect(() => {
    if (!isMegaOpen || !focusFirstTile.current) return;
    focusFirstTile.current = false;
    const first = panelRef.current && panelRef.current.querySelector(".mega-tile");
    if (first) first.focus();
  }, [isMegaOpen]);

  // Arrow keys move between tiles in reading order; Home/End jump to the ends
  const onPanelKeyDown = (e) => {
    const tiles = megaTiles();
    const index = tiles.indexOf(document.activeElement);
    if (index === -1) return;
    const columns = window.matchMedia("(max-width: 1100px)").matches ? 2 : 4;
    const moves = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      ArrowDown: index + columns,
      ArrowUp: index - columns,
      Home: 0,
      End: tiles.length - 1,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    if (e.key === "ArrowUp" && index < columns) {
      if (triggerRef.current) triggerRef.current.focus();
      return;
    }
    const next = Math.min(Math.max(moves[e.key], 0), tiles.length - 1);
    tiles[next].focus();
  };

  const handleMegaBlur = (e) => {
    if (megaRef.current && !megaRef.current.contains(e.relatedTarget)) {
      setIsMegaOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const closeMega = () => setIsMegaOpen(false);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <nav
        className={`navbar-wrapper ${isScrolled ? "is-scrolled" : ""}`}
        aria-label="Main navigation"
      >
        <div className="navbar-container">
          {/* Logo */}
          <a href="/" className="navbar-brand-custom">
            <img src={logo} alt="IKONEX Logo" className="logo-img" />

            <div className="brand-text">
              <span className="brand-primary">IKONEX SYSTEMS</span>

              <span className="brand-secondary">
                SOFTWARE • CYBER • TRAINING
              </span>
            </div>
          </a>

          {/* Desktop Menu */}
          <div className="desktop-menu">
            <ul className="custom-nav">
              <li>
                <a href="/" className={`nav-link-custom ${path === "/" ? "active" : ""}`}>
                  About
                </a>
              </li>

              <li
                className={`nav-mega ${isMegaOpen ? "is-open" : ""}`}
                ref={megaRef}
                onBlur={handleMegaBlur}
              >
                <button
                  type="button"
                  ref={triggerRef}
                  className={`nav-link-custom nav-mega__trigger ${["/what-we-do", "/cyber-digital-services"].includes(path) ? "active" : ""}`}
                  aria-expanded={isMegaOpen}
                  aria-controls="what-we-do-menu"
                  onClick={() => setIsMegaOpen((v) => !v)}
                  onKeyDown={onTriggerKeyDown}
                >
                  What We Do
                  <FaChevronDown className="nav-mega__chevron" aria-hidden="true" />
                </button>

                <div
                  id="what-we-do-menu"
                  className="mega-panel"
                  role="region"
                  aria-label="What We Do"
                  ref={panelRef}
                  onKeyDown={onPanelKeyDown}
                >
                  <div className="mega-panel__inner">
                    <div className="mega-head">
                      <span className="mega-head__title">Explore Our Services</span>
                      <a href="/what-we-do" className="mega-head__all" onClick={closeMega}>
                        View all
                        <FaArrowRight aria-hidden="true" />
                      </a>
                    </div>

                    <ul className="mega-grid">
                      {WHAT_WE_DO.map((service) => {
                        const Icon = service.icon;
                        return (
                          <li key={service.label}>
                            <a href={service.href} className="mega-tile" onClick={closeMega}>
                              <span className="mega-tile__icon">
                                <Icon aria-hidden="true" />
                              </span>
                              <span className="mega-tile__copy">
                                <span className="mega-tile__title">{service.label}</span>
                                <span className="mega-tile__blurb">{service.blurb}</span>
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </li>

              {PAGE_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={`nav-link-custom ${path === link.href ? "active" : ""}`}>
                    {link.label}
                  </a>
                </li>
              ))}

              <li>
                <a href="/portfolio" className={`nav-link-custom ${path === "/portfolio" ? "active" : ""}`}>
                  Portfolio
                </a>
              </li>

              <li>
                <a href="#contact" className="nav-link-custom">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="nav-actions">
            <ThemeToggle />

            <a href="#/login" className="login-btn">
              <FaSignInAlt aria-hidden="true" />
              Login
            </a>

            {/* Mobile Toggle */}
            <button
              className="mobile-toggle"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-sidebar"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div
        className={`mobile-overlay ${isMobileMenuOpen ? "show-overlay" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      ></div>

      {/* Mobile Sidebar */}
      <aside
        id="mobile-sidebar"
        className={`mobile-sidebar ${isMobileMenuOpen ? "sidebar-open" : ""}`}
        aria-hidden={!isMobileMenuOpen}
        aria-label="Mobile navigation"
        {...(!isMobileMenuOpen ? { inert: "" } : {})}
      >
        <div className="mobile-sidebar-header">
          <div className="mobile-brand">
            <img src={logo} alt="IKONEX Logo" />

            <span>IKONEX</span>
          </div>

          <button
            className="close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <ul className="mobile-nav">
          <li>
            <a href="/" onClick={closeMenu}>
              <FaInfoCircle className="mobile-nav__icon" aria-hidden="true" />
              About Us
            </a>
          </li>

          <li className={`mobile-acc ${isMobileWhatOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="mobile-acc__trigger"
              aria-expanded={isMobileWhatOpen}
              aria-controls="mobile-what-we-do"
              onClick={() => setIsMobileWhatOpen((v) => !v)}
            >
              <FaCubes className="mobile-nav__icon" aria-hidden="true" />
              What We Do
              <FaChevronDown className="mobile-acc__chevron" aria-hidden="true" />
            </button>

            <div id="mobile-what-we-do" className="mobile-acc__panel">
              <div className="mobile-acc__inner">
                <ul className="mobile-services">
                  {WHAT_WE_DO.map((service) => {
                    const Icon = service.icon;
                    return (
                      <li key={service.label}>
                        <a href={service.href} onClick={closeMenu}>
                          <span className="mobile-services__icon">
                            <Icon aria-hidden="true" />
                          </span>
                          {service.label}
                        </a>
                      </li>
                    );
                  })}
                  <li>
                    <a href="/what-we-do" className="mobile-services__all" onClick={closeMenu}>
                      View all services
                      <FaArrowRight aria-hidden="true" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {PAGE_LINKS.map((link) => {
            const LinkIcon = link.icon;
            return (
              <li key={link.href}>
                <a href={link.href} onClick={closeMenu}>
                  <LinkIcon className="mobile-nav__icon" aria-hidden="true" />
                  {link.label}
                </a>
              </li>
            );
          })}

          <li>
            <a href="/portfolio" onClick={closeMenu}>
              <FaBriefcase className="mobile-nav__icon" aria-hidden="true" />
              Portfolio
            </a>
          </li>

          <li>
            <a href="#contact" onClick={closeMenu}>
              <FaEnvelope className="mobile-nav__icon" aria-hidden="true" />
              Contact Us
            </a>
          </li>
        </ul>

        <a href="#/login" className="mobile-login-btn" onClick={closeMenu}>
          <FaSignInAlt aria-hidden="true" />
          Login
        </a>
      </aside>
    </>
  );
};

export default NavbarComponent;
