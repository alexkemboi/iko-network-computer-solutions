import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaLaptopCode,
  FaShieldAlt,
  FaGraduationCap,
  FaLightbulb,
  FaPaintBrush,
  FaArrowRight,
} from "react-icons/fa";

import backgroundImage from "../../images/header.jpg";

import slide1 from "../../images/banner.png";
import slide2 from "../../images/header.jpg";
import slide3 from "../../images/banner.png";
import slide4 from "../../images/header.jpg";
import slide5 from "../../images/banner.png";

function Home() {
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

  const [currentSlide, setCurrentSlide] =
    useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === slides.length - 1
          ? 0
          : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <>
      <section
        className="hero-section"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="hero-overlay"></div>

        {/* Decorative Glow */}
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>

        <div className="container hero-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              transition={{
                duration: 0.6,
              }}
              className="hero-card"
            >
              {/* LEFT CONTENT */}
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="badge-icon">
                    {slides[currentSlide].icon}
                  </span>

                  <span>
                    IKONEX SYSTEMS
                  </span>
                </div>

                <h1 className="hero-title">
                  {
                    slides[currentSlide]
                      .title
                  }
                </h1>

                <p className="hero-description">
                  {
                    slides[currentSlide]
                      .description
                  }
                </p>

                <div className="hero-buttons">
                  <a
                    href="#services"
                    className="primary-btn"
                  >
                    Explore Services
                    <FaArrowRight />
                  </a>

                  <a
                    href="#contact"
                    className="secondary-btn"
                  >
                    Contact Us
                  </a>
                </div>

                {/* Dots */}
                <div className="slider-dots">
                  {slides.map(
                    (_, index) => (
                      <button
                        key={index}
                        className={`dot ${
                          currentSlide ===
                          index
                            ? "active-dot"
                            : ""
                        }`}
                        onClick={() =>
                          setCurrentSlide(
                            index
                          )
                        }
                      />
                    )
                  )}
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="hero-image-wrapper">
                <motion.img
                  src={
                    slides[currentSlide]
                      .image
                  }
                  alt="IKONEX"
                  className="hero-image"
                  initial={{
                    scale: 1.05,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.7,
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <style>{`
          .hero-section {
            position: relative;

            min-height: 82vh;

            display: flex;
            align-items: center;

            overflow: hidden;

            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;

            padding:
              130px 20px
              60px;
          }

          .hero-overlay {
            position: absolute;
            inset: 0;

            background:
              linear-gradient(
                135deg,
                rgba(0,0,0,.88),
                rgba(0,0,0,.72)
              );
          }

          .hero-container {
            position: relative;
            z-index: 2;

            max-width: 1400px;
          }

          .hero-card {
            display: grid;

            grid-template-columns:
              1.1fr 1fr;

            align-items: center;

            gap: 40px;

            background:
              rgba(255,255,255,.06);

            border:
              1px solid
              rgba(255,255,255,.08);

            backdrop-filter:
              blur(14px);

            border-radius: 30px;

            padding: 45px;

            overflow: hidden;

            box-shadow:
              0 25px 60px
              rgba(0,0,0,.25);
          }

          .hero-badge {
            display: inline-flex;

            align-items: center;

            gap: 12px;

            padding:
              10px 18px;

            border-radius: 999px;

            background:
              rgba(255,255,255,.08);

            border:
              1px solid
              rgba(255,255,255,.12);

            margin-bottom: 25px;

            color: white;

            font-size: .9rem;

            font-weight: 700;

            letter-spacing: .05em;
          }

          .badge-icon {
            width: 38px;
            height: 38px;

            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            background:
              linear-gradient(
                135deg,
                #22c55e,
                #16a34a
              );

            color: white;

            font-size: 1rem;
          }

          .hero-title {
            color: white;

            font-size:
              clamp(
                2.6rem,
                5vw,
                4.5rem
              );

            font-weight: 900;

            line-height: 1.08;

            margin-bottom: 20px;
          }

          .hero-description {
            color:
              rgba(255,255,255,.82);

            font-size: 1.05rem;

            line-height: 1.9;

            margin-bottom: 35px;

            max-width: 580px;
          }

          .hero-buttons {
            display: flex;

            align-items: center;

            gap: 16px;

            flex-wrap: wrap;
          }

          .primary-btn {
            display: inline-flex;

            align-items: center;

            gap: 10px;

            padding:
              15px 28px;

            border-radius: 14px;

            background:
              linear-gradient(
                135deg,
                #22c55e,
                #16a34a
              );

            color: white;

            text-decoration: none;

            font-weight: 700;

            transition: .3s ease;
          }

          .primary-btn:hover {
            transform:
              translateY(-3px);

            color: white;

            box-shadow:
              0 12px 24px
              rgba(
                34,
                197,
                94,
                .25
              );
          }

          .secondary-btn {
            display: inline-flex;

            align-items: center;

            justify-content: center;

            padding:
              15px 28px;

            border-radius: 14px;

            background:
              rgba(255,255,255,.08);

            border:
              1px solid
              rgba(255,255,255,.12);

            color: white;

            text-decoration: none;

            font-weight: 700;

            transition: .3s ease;
          }

          .secondary-btn:hover {
            background:
              rgba(255,255,255,.15);

            color: white;

            transform:
              translateY(-3px);
          }

          .hero-image-wrapper {
            display: flex;

            justify-content: center;

            align-items: center;
          }

          .hero-image {
            width: 100%;

            max-width: 620px;

            border-radius: 26px;

            object-fit: cover;

            box-shadow:
              0 25px 60px
              rgba(0,0,0,.35);
          }

          .slider-dots {
            display: flex;

            gap: 12px;

            margin-top: 40px;
          }

          .dot {
            width: 12px;
            height: 12px;

            border-radius: 50%;

            border: none;

            background:
              rgba(255,255,255,.25);

            transition: .3s ease;
          }

          .active-dot {
            background: #22c55e;

            transform: scale(1.2);
          }

          .glow {
            position: absolute;

            border-radius: 50%;

            filter: blur(120px);

            opacity: .2;
          }

          .glow-1 {
            width: 350px;
            height: 350px;

            background: #22c55e;

            top: 10%;
            left: -100px;
          }

          .glow-2 {
            width: 400px;
            height: 400px;

            background: #16a34a;

            bottom: -120px;
            right: -100px;
          }

          @media (max-width: 991px) {

            .hero-card {
              grid-template-columns: 1fr;

              text-align: center;

              padding: 35px 25px;
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
              margin-top: 10px;
            }

            .hero-title {
              font-size: 2.8rem;
            }
          }

          @media (max-width: 768px) {

            .hero-section {
              min-height: auto;

              padding:
                120px 12px
                50px;
            }

            .hero-card {
              padding: 28px 20px;

              border-radius: 24px;
            }

            .hero-title {
              font-size: 2.2rem;
            }

            .hero-description {
              font-size: .98rem;
            }

            .hero-image {
              border-radius: 20px;
            }
          }
        `}</style>
      </section>
    </>
  );
}

export default Home;