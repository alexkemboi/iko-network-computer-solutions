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
  FaGlobe,
  FaMobileAlt,
  FaCode,
  FaCubes,
  FaShieldAlt,
  FaPrint,
  FaWifi,
  FaDesktop,
  FaNetworkWired,
  FaTools,
  FaConciergeBell,
  FaPaintBrush,
  FaGraduationCap,
  FaLightbulb,
  FaHeadset,
} from "react-icons/fa";

import logo from "../../images/logo.png";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

/*
 * "What We Do" combines the former Software, Cyber, Computers and Services
 * menu items. Each former item is now a column heading (still a link) with
 * its related offerings listed underneath.
 */
const WHAT_WE_DO = [
  {
    key: "software",
    label: "Software",
    href: "/what-we-do#software",
    icon: FaLaptopCode,
    blurb: "Websites, apps & systems",
    items: [
      { label: "Web Development", href: "/what-we-do#software", icon: FaGlobe },
      { label: "Mobile Development", href: "/what-we-do#software", icon: FaMobileAlt },
      { label: "Software Development", href: "/what-we-do#software", icon: FaCode },
      { label: "Enterprise Products", href: "/#products", icon: FaCubes },
    ],
  },
  {
    key: "cyber",
    label: "Cyber & Digital Services",
    href: "/cyber-digital-services",
    icon: FaShieldAlt,
    blurb: "Documents, applications & support",
    items: [
      { label: "Cyber Services", href: "/cyber-digital-services#cyber", icon: FaShieldAlt },
      { label: "Online Services", href: "/cyber-digital-services#online-services", icon: FaWifi },
      { label: "Graphics & Design", href: "/cyber-digital-services#graphics-design", icon: FaPaintBrush },
      { label: "Branding & Printing", href: "/cyber-digital-services#branding-printing", icon: FaPrint },
    ],
  },
  {
    key: "computers",
    label: "Computers",
    href: "/",
    icon: FaDesktop,
    blurb: "Hardware, networks & IT",
    items: [
      { label: "Computer Solutions", href: "/", icon: FaDesktop },
      { label: "Networking", href: "/", icon: FaNetworkWired },
      { label: "Technology Consulting", href: "/", icon: FaTools },
    ],
  },
  {
    key: "services",
    label: "Creative & Digital Services",
    href: "/what-we-do#branding",
    icon: FaConciergeBell,
    blurb: "Design, branding, training & research",
    items: [
      { label: "Graphics, Print & Branding", href: "/what-we-do#branding", icon: FaPaintBrush },
      { label: "Training Programs", href: "/training", icon: FaGraduationCap },
      { label: "Research & Innovation", href: "/research", icon: FaLightbulb },
    ],
  },
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
  const closeTimer = useRef(null);

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

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openMega = useCallback(() => {
    clearTimeout(closeTimer.current);
    setIsMegaOpen(true);
  }, []);

  const scheduleCloseMega = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setIsMegaOpen(false), 160);
  }, []);

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
                onMouseEnter={openMega}
                onMouseLeave={scheduleCloseMega}
                onBlur={handleMegaBlur}
              >
                <button
                  type="button"
                  ref={triggerRef}
                  className={`nav-link-custom nav-mega__trigger ${["/what-we-do", "/cyber-digital-services"].includes(path) ? "active" : ""}`}
                  aria-expanded={isMegaOpen}
                  aria-controls="what-we-do-menu"
                  onClick={() => setIsMegaOpen((v) => !v)}
                >
                  What We Do
                  <FaChevronDown className="nav-mega__chevron" aria-hidden="true" />
                </button>

                <div
                  id="what-we-do-menu"
                  className="mega-panel"
                  role="region"
                  aria-label="What We Do"
                >
                  <div className="mega-panel__inner">
                    <a href="/what-we-do" className="mega-overview" onClick={closeMega}>
                      Explore everything we do
                      <FaArrowRight aria-hidden="true" />
                    </a>
                    <div className="mega-grid">
                      {WHAT_WE_DO.map((group) => {
                        const GroupIcon = group.icon;
                        return (
                          <div className="mega-group" key={group.key}>
                            <a
                              href={group.href}
                              className="mega-group__head"
                              onClick={closeMega}
                            >
                              <span className="mega-group__icon">
                                <GroupIcon aria-hidden="true" />
                              </span>
                              <span>
                                <span className="mega-group__title">
                                  {group.label}
                                </span>
                                <span className="mega-group__blurb">
                                  {group.blurb}
                                </span>
                              </span>
                            </a>

                            <ul className="mega-list">
                              {group.items.map((item) => {
                                const ItemIcon = item.icon;
                                return (
                                  <li key={item.label}>
                                    <a
                                      href={item.href}
                                      className="mega-item"
                                      onClick={closeMega}
                                    >
                                      <ItemIcon
                                        className="mega-item__icon"
                                        aria-hidden="true"
                                      />
                                      <span>{item.label}</span>
                                      <FaArrowRight
                                        className="mega-item__arrow"
                                        aria-hidden="true"
                                      />
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>

                    <a href="#contact" className="mega-cta" onClick={closeMega}>
                      <span className="mega-cta__icon">
                        <FaHeadset aria-hidden="true" />
                      </span>
                      <span className="mega-cta__text">
                        <strong>Not sure where to start?</strong>
                        <span>Tell us what you need and we'll point you the right way.</span>
                      </span>
                      <FaArrowRight className="mega-cta__arrow" aria-hidden="true" />
                    </a>
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
                <a href="/what-we-do" className="mobile-group__head" onClick={closeMenu}>
                  <FaArrowRight aria-hidden="true" />
                  Explore everything we do
                </a>
                {WHAT_WE_DO.map((group) => {
                  const GroupIcon = group.icon;
                  return (
                    <div className="mobile-group" key={group.key}>
                      <a
                        href={group.href}
                        className="mobile-group__head"
                        onClick={closeMenu}
                      >
                        <GroupIcon aria-hidden="true" />
                        {group.label}
                      </a>
                      <ul>
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <li key={item.label}>
                              <a href={item.href} onClick={closeMenu}>
                                <ItemIcon aria-hidden="true" />
                                {item.label}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
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
