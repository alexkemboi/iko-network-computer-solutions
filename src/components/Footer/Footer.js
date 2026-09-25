import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowUp,
  FaChevronRight,
} from "react-icons/fa";

import logo from "../../images/logo.png";

const LinkList = ({ links }) => (
  <ul className="footer-links">
    {links.map((label) => (
      <li key={label}>
        <a href="/">
          <FaChevronRight aria-hidden="true" />
          <span>{label}</span>
        </a>
      </li>
    ))}
  </ul>
);

const Footer = () => {
  const scrollToTop = () => {
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <>
      <footer className="footer-section" id="footer">
        <div className="footer-top-border"></div>
        <div className="footer-glow" aria-hidden="true"></div>

        <div className="footer-container">
          <div className="footer-grid">
            {/* Company Info */}
            <div className="footer-brand">
              <div className="footer-brand__head">
                <img src={logo} alt="" className="footer-logo" />
                <h3>IKONEX SYSTEMS</h3>
              </div>

              <p>
                Delivering innovative software solutions, cyber services,
                networking, branding, web development, and technology
                consulting services that empower businesses to thrive in the
                digital era.
              </p>

              <div className="contact-info">
                <div>
                  <span className="contact-info__icon">
                    <FaMapMarkerAlt aria-hidden="true" />
                  </span>
                  <span>Nairobi, Kenya</span>
                </div>

                <a href="tel:+254787088567">
                  <span className="contact-info__icon">
                    <FaPhoneAlt aria-hidden="true" />
                  </span>
                  <span>+254 787 088 567</span>
                </a>

                <a href="mailto:info@ikonexsystems.com">
                  <span className="contact-info__icon">
                    <FaEnvelope aria-hidden="true" />
                  </span>
                  <span>info@ikonexsystems.com</span>
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h5 className="footer-heading">Services</h5>
              <LinkList
                links={[
                  "Cyber Services",
                  "Software Development",
                  "Online Services",
                  "Computer Solutions",
                ]}
              />
            </div>

            {/* Resources */}
            <div>
              <h5 className="footer-heading">Resources</h5>
              <LinkList
                links={[
                  "Support Center",
                  "Developers",
                  "Documentation",
                  "System Status",
                ]}
              />
            </div>

            {/* Company */}
            <div>
              <h5 className="footer-heading">Company</h5>
              <LinkList links={["About Us", "Portfolio", "Contact", "Careers"]} />
            </div>

            {/* Social */}
            <div>
              <h5 className="footer-heading">Connect</h5>
              <div className="social-links">
                <a href="/" aria-label="Facebook">
                  <FaFacebookF />
                </a>
                <a href="/" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a href="/" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a href="/" aria-label="LinkedIn">
                  <FaLinkedinIn />
                </a>
                <a href="/" aria-label="GitHub">
                  <FaGithub />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} IKONEX Systems. All rights reserved.
            </p>

            <div className="footer-bottom-links">
              <a href="/">Privacy Policy</a>
              <a href="/">Terms of Service</a>
              <a href="/">SLA</a>
            </div>

            <button
              type="button"
              className="back-to-top"
              onClick={scrollToTop}
              aria-label="Back to top"
            >
              <FaArrowUp />
            </button>
          </div>
        </div>

        <style>{`
          .footer-section {
            --footer-bg: #070b16;
            position: relative;
            background: var(--footer-bg);
            color: var(--text);
            padding: 88px 24px 28px;
            overflow: hidden;
            isolation: isolate;
          }

          [data-theme="light"] .footer-section {
            --footer-bg: #eef5f1;
          }

          .footer-top-border {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--brand), var(--brand-2), transparent);
          }

          .footer-glow {
            position: absolute;
            z-index: -1;
            width: 600px;
            height: 300px;
            top: -180px;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 50%;
            background: var(--brand);
            filter: blur(140px);
            opacity: var(--glow-opacity);
            pointer-events: none;
          }

          .footer-container {
            max-width: 1280px;
            margin: 0 auto;
          }

          .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1.1fr;
            gap: 40px;
          }

          .footer-brand__head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 18px;
          }

          .footer-logo {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: #fff;
            padding: 4px;
            object-fit: contain;
          }

          .footer-brand h3 {
            margin: 0;
            font-size: 1.35rem;
            font-weight: 800;
            background: var(--gradient-text);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .footer-brand p {
            color: var(--text-muted);
            line-height: 1.85;
            margin-bottom: 24px;
            max-width: 420px;
          }

          .contact-info {
            display: grid;
            gap: 10px;
          }

          .contact-info > div,
          .contact-info > a {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            color: var(--text);
            text-decoration: none;
            width: fit-content;
            transition: color .25s var(--ease);
          }

          .contact-info > a:hover {
            color: var(--brand-text);
          }

          .contact-info__icon {
            display: grid;
            place-items: center;
            width: 34px;
            height: 34px;
            border-radius: 10px;
            background: var(--brand-soft);
            color: var(--brand-text);
            font-size: .85rem;
            flex-shrink: 0;
            transition: transform .3s var(--ease);
          }

          .contact-info > a:hover .contact-info__icon {
            transform: scale(1.08) rotate(-6deg);
          }

          .footer-heading {
            color: var(--heading);
            font-size: .82rem;
            font-weight: 700;
            letter-spacing: .12em;
            text-transform: uppercase;
            margin: 6px 0 20px;
          }

          .footer-links {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .footer-links li {
            margin-bottom: 12px;
          }

          .footer-links a {
            position: relative;
            display: inline-flex;
            align-items: center;
            color: var(--text-muted);
            text-decoration: none;
            font-size: .95rem;
            transition: color .25s var(--ease);
          }

          .footer-links a span {
            transition: transform .3s var(--ease);
          }

          .footer-links a svg {
            position: absolute;
            left: -4px;
            font-size: .6rem;
            color: var(--brand-text);
            opacity: 0;
            transition: opacity .25s var(--ease), transform .3s var(--ease);
          }

          .footer-links a:hover {
            color: var(--heading);
          }

          .footer-links a:hover svg {
            opacity: 1;
            transform: translateX(4px);
          }

          .footer-links a:hover span {
            transform: translateX(16px);
          }

          .social-links {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .social-links a {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--surface-strong);
            border: 1px solid var(--border);
            color: var(--heading);
            transition: transform .3s var(--ease), background-color .3s var(--ease), color .3s var(--ease), border-color .3s var(--ease);
          }

          .social-links a:hover {
            background: var(--gradient-brand);
            border-color: transparent;
            color: var(--on-brand);
            transform: translateY(-4px);
          }

          .footer-bottom {
            border-top: 1px solid var(--border);
            margin-top: 56px;
            padding-top: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
          }

          .footer-bottom p {
            margin: 0;
            color: var(--text-subtle);
            font-size: .9rem;
          }

          .footer-bottom-links {
            display: flex;
            gap: 22px;
            flex-wrap: wrap;
            margin-left: auto;
          }

          .footer-bottom-links a {
            color: var(--text-subtle);
            font-size: .9rem;
            text-decoration: none;
            transition: color .25s var(--ease);
          }

          .footer-bottom-links a:hover {
            color: var(--brand-text);
          }

          .back-to-top {
            display: grid;
            place-items: center;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 1px solid var(--brand-border);
            background: var(--brand-soft);
            color: var(--brand-text);
            cursor: pointer;
            transition: transform .3s var(--ease), background-color .3s var(--ease), color .3s var(--ease);
          }

          .back-to-top:hover {
            background: var(--gradient-brand);
            color: var(--on-brand);
            transform: translateY(-4px);
          }

          @media (max-width: 991px) {
            .footer-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .footer-brand {
              grid-column: 1 / -1;
            }
          }

          @media (max-width: 576px) {
            .footer-section {
              padding: 64px 16px 24px;
            }

            .footer-grid {
              gap: 32px 20px;
            }

            .footer-bottom {
              flex-direction: column;
              text-align: center;
            }

            .footer-bottom-links {
              margin-left: 0;
              justify-content: center;
            }
          }
        `}</style>
      </footer>
    </>
  );
};

export default Footer;
