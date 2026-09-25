import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import {
  FaLaptopCode,
  FaShieldAlt,
  FaGraduationCap,
  FaLightbulb,
  FaPaintBrush,
  FaArrowRight,
  FaPhoneAlt,
} from "react-icons/fa";

import slide1 from "../../images/banner.png";
import slide2 from "../../images/header.png";
import slide3 from "../../images/banner.png";
import slide4 from "../../images/header.png";
import slide5 from "../../images/banner.png";

const SLIDE_DURATION = 5000;

function Home() {
  const shouldReduceMotion = useReducedMotion();

  const slides = [
    {
      image: slide1,
      icon: <FaLaptopCode />,
      title: "Website & Software Development",
      description:
        "Modern websites, enterprise applications, mobile apps and scalable digital solutions tailored for businesses.",
    },

    {
      image: slide2,
      icon: <FaShieldAlt />,
      title: "Cyber Services",
      description:
        "Professional cyber services including networking, printing, online applications and digital support solutions.",
    },

    {
      image: slide3,
      icon: <FaGraduationCap />,
      title: "Software Development Training",
      description:
        "Practical training in web development, programming, UI/UX, modern software technologies and digital skills.",
    },

    {
      image: slide4,
      icon: <FaLightbulb />,
      title: "Research & Innovation",
      description:
        "Technology-driven research, innovative solutions and business transformation strategies for growth.",
    },

    {
      image: slide5,
      icon: <FaPaintBrush />,
      title: "Graphics Design, Print & Branding",
      description:
        "Creative branding, graphic design, printing, visual identity and marketing materials for businesses.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  // With motion enabled, the active dot's progress animation drives the
  // autoplay (so pausing on hover/focus freezes both in sync). With reduced
  // motion, fall back to a plain timer.
  useEffect(() => {
    if (!shouldReduceMotion || isPaused) return undefined;

    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [slides.length, isPaused, shouldReduceMotion]);

  const slide = slides[currentSlide];

  return (
    <>
      <section
        className="hero-section"
        id="home"
        aria-roledescription="carousel"
        aria-label="Highlights"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        <div className="hero-overlay"></div>

        {/* Decorative Glow */}
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>

        <div className="hero-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : -20,
              }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="hero-card"
              aria-live={isPaused ? "polite" : "off"}
            >
              {/* LEFT CONTENT */}
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="badge-icon">{slide.icon}</span>

                  <span>{slide.title}</span>
                </div>

                <h1 className="hero-title">{slide.title}</h1>

                <p className="hero-description">{slide.description}</p>

                <div className="hero-buttons">
                  <a href="#services" className="ix-btn ix-btn--primary hero-btn">
                    Explore Services
                    <FaArrowRight aria-hidden="true" />
                  </a>

                  <a href="#contact" className="ix-btn ix-btn--ghost hero-btn">
                    <FaPhoneAlt aria-hidden="true" className="hero-btn__lead" />
                    Contact Us
                  </a>
                </div>

                {/* Dots */}
                <div className="slider-dots" role="group" aria-label="Choose slide">
                  {slides.map((s, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`dot ${currentSlide === index ? "active-dot" : ""} ${
                        isPaused ? "is-paused" : ""
                      }`}
                      aria-label={`Slide ${index + 1}: ${s.title}`}
                      aria-current={currentSlide === index ? "true" : undefined}
                      onClick={() => setCurrentSlide(index)}
                      onAnimationEnd={
                        !shouldReduceMotion && currentSlide === index
                          ? nextSlide
                          : undefined
                      }
                      style={{ "--slide-duration": `${SLIDE_DURATION}ms` }}
                    />
                  ))}

                  <span className="slide-count" aria-hidden="true">
                    {String(currentSlide + 1).padStart(2, "0")}
                    <span> / {String(slides.length).padStart(2, "0")}</span>
                  </span>
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="hero-image-wrapper">
                <div className="hero-image-frame">
                  <motion.img
                    src={slide.image}
                    alt="IKONEX"
                    className="hero-image"
                    initial={{
                      scale: shouldReduceMotion ? 1 : 1.05,
                    }}
                    animate={{
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.7,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <style>{`
          .hero-section {
            position: relative;
            min-height: 88vh;
            display: flex;
            align-items: center;
            overflow: hidden;
            isolation: isolate;
            background: var(--bg);
            padding: 128px 24px 72px;
          }

          .hero-overlay {
            position: absolute;
            inset: 0;
            z-index: -1;
            background:
              radial-gradient(1000px 500px at 15% 0%, var(--brand-soft-2), transparent 60%),
              radial-gradient(900px 500px at 100% 100%, var(--brand-soft), transparent 60%);
          }

          .hero-overlay::after {
            content: "";
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(var(--grid-line) 1px, transparent 1px),
              linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
            background-size: 56px 56px;
            -webkit-mask-image: radial-gradient(ellipse at 50% 40%, #000 25%, transparent 75%);
            mask-image: radial-gradient(ellipse at 50% 40%, #000 25%, transparent 75%);
          }

          .hero-container {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 1280px;
            margin: 0 auto;
          }

          .hero-card {
            display: grid;
            grid-template-columns: 1.05fr 1fr;
            align-items: center;
            gap: clamp(28px, 4vw, 56px);
            background: var(--surface);
            border: 1px solid var(--border);
            -webkit-backdrop-filter: blur(14px);
            backdrop-filter: blur(14px);
            border-radius: var(--radius-xl);
            padding: clamp(28px, 4vw, 52px);
            overflow: hidden;
            box-shadow: var(--shadow-lg);
          }

          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            max-width: 100%;
            padding: 6px 16px 6px 6px;
            border-radius: 999px;
            background: var(--brand-soft);
            border: 1px solid var(--brand-border);
            margin-bottom: 22px;
            color: var(--brand-text);
            font-size: .8rem;
            font-weight: 700;
            letter-spacing: .04em;
          }

          .badge-icon {
            width: 30px;
            height: 30px;
            flex-shrink: 0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gradient-brand);
            color: var(--on-brand);
            font-size: .85rem;
          }

          .hero-title {
            color: var(--heading);
            font-size: clamp(2.3rem, 4.8vw, 4rem);
            font-weight: 800;
            line-height: 1.06;
            letter-spacing: -0.04em;
            margin-bottom: 20px;
          }

          .hero-description {
            color: var(--text-muted);
            font-size: clamp(1rem, 1.3vw, 1.1rem);
            line-height: 1.85;
            margin-bottom: 32px;
            max-width: 560px;
          }

          .hero-buttons {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .hero-btn {
            min-height: 52px;
            padding: 14px 26px;
          }

          .hero-btn:hover .hero-btn__lead {
            transform: rotate(-12deg);
          }

          .hero-image-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .hero-image-frame {
            position: relative;
            width: 100%;
            max-width: 600px;
            border-radius: 26px;
            padding: 8px;
            background: linear-gradient(145deg, var(--brand-soft-2), transparent 60%);
          }

          .hero-image {
            display: block;
            width: 100%;
            border-radius: 20px;
            object-fit: cover;
            box-shadow: var(--shadow-lg);
          }

          .slider-dots {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 40px;
          }

          .dot {
            position: relative;
            width: 10px;
            height: 10px;
            padding: 0;
            border-radius: 999px;
            border: none;
            overflow: hidden;
            background: var(--border-strong);
            cursor: pointer;
            transition: width .4s var(--ease), background-color .3s var(--ease);
          }

          .dot:hover {
            background: var(--brand-border);
          }

          .active-dot {
            width: 42px;
            background: var(--brand-soft-2);
          }

          .active-dot::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: var(--gradient-brand);
            transform-origin: left;
            animation: dot-progress var(--slide-duration, 5s) linear forwards;
          }

          .active-dot.is-paused::after {
            animation-play-state: paused;
          }

          @keyframes dot-progress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }

          .slide-count {
            margin-left: 10px;
            font-size: .85rem;
            font-weight: 700;
            color: var(--heading);
            font-variant-numeric: tabular-nums;
          }

          .slide-count span {
            color: var(--text-subtle);
            font-weight: 600;
          }

          .glow {
            position: absolute;
            z-index: -1;
            border-radius: 50%;
            filter: blur(120px);
            opacity: var(--glow-opacity);
            pointer-events: none;
          }

          .glow-1 {
            width: 380px;
            height: 380px;
            background: var(--brand);
            top: 10%;
            left: -120px;
          }

          .glow-2 {
            width: 420px;
            height: 420px;
            background: var(--brand-2);
            bottom: -140px;
            right: -120px;
          }

          @media (max-width: 991px) {
            .hero-card {
              grid-template-columns: 1fr;
              text-align: center;
            }

            .hero-description {
              margin-left: auto;
              margin-right: auto;
            }

            .hero-buttons,
            .slider-dots {
              justify-content: center;
            }

            .hero-image-wrapper {
              margin-top: 4px;
            }
          }

          @media (max-width: 768px) {
            .hero-section {
              min-height: auto;
              padding: 108px 14px 48px;
            }

            .hero-card {
              border-radius: 24px;
            }

            .hero-badge {
              font-size: .74rem;
            }

            .hero-image-frame {
              border-radius: 20px;
              padding: 6px;
            }

            .hero-image {
              border-radius: 16px;
            }
          }

          @media (max-width: 420px) {
            .hero-buttons .ix-btn {
              width: 100%;
            }
          }
        `}</style>
      </section>
    </>
  );
}

export default Home;
