import React from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  FaPaintBrush,
  FaPrint,
  FaBullhorn,
} from "react-icons/fa";

const GraphicsBrandingComponent = () => {
  const shouldReduceMotion = useReducedMotion();

  const services = [
    {
      title: "Graphics Design",
      icon: FaPaintBrush,
      description:
        "Professional logo creation, social media graphics, UI/UX mockups, marketing materials and modern visual identity systems tailored for businesses.",
      items: [
        "Logo & Brand Identity",
        "Social Media Graphics",
        "UI/UX Mockups",
        "Marketing Materials",
      ],
    },

    {
      title: "Printing Services",
      icon: FaPrint,
      description:
        "High-quality printing solutions for business cards, banners, posters, brochures and branded merchandise with premium finishing.",
      items: [
        "Business Cards",
        "Banners & Posters",
        "Flyers & Brochures",
        "Large Format Printing",
      ],
    },

    {
      title: "Digital Branding",
      icon: FaBullhorn,
      description:
        "Modern branding and digital marketing solutions designed to increase visibility, strengthen brand presence and grow businesses.",
      items: [
        "Brand Strategy",
        "Digital Campaigns",
        "Content Creation",
        "Business Rebranding",
      ],
    },
  ];

  return (
    <>
      <section className="branding-section">
        {/* BACKGROUND GLOW */}
        <div className="bg-glow glow-left"></div>
        <div className="bg-glow glow-right"></div>

        <div className="branding-container">
          {/* HEADER */}
          <motion.div
            className="section-header"
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">
              CREATIVE SERVICES
            </span>

            <h2 className="section-title">
              Graphics Design,
              <span> Print & Branding</span>
            </h2>

            <p className="section-description">
              Creative and modern branding solutions crafted to
              elevate your business identity through premium
              graphics design, professional printing and digital
              branding services.
            </p>
          </motion.div>

          {/* CARDS */}
          <div className="cards-grid">
            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.div
                  key={index}
                  className="service-card"
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 45,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                  }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -12,
                    scale: 1.02,
                  }}
                >
                  {/* TOP */}
                  <div className="card-top">
                    <div className="icon-box">
                      <Icon />
                    </div>

                    <div className="top-line"></div>
                  </div>

                  {/* CONTENT */}
                  <div className="card-content">
                    <h3>{service.title}</h3>

                    <p>{service.description}</p>

                    <ul>
                      {service.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>

                    <button className="service-btn">
                      Learn More
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <style>{`
          .branding-section {
            position: relative;

            overflow: hidden;

            padding: 110px 24px;

            background: linear-gradient(
              180deg,
              #0f172a 0%,
              #111827 50%,
              #0f172a 100%
            );
          }

          .branding-container {
            max-width: 1280px;

            margin: 0 auto;

            position: relative;

            z-index: 2;
          }

          .bg-glow {
            position: absolute;

            border-radius: 50%;

            filter: blur(120px);

            opacity: 0.18;
          }

          .glow-left {
            width: 320px;
            height: 320px;

            background: #22c55e;

            top: 120px;
            left: -120px;
          }

          .glow-right {
            width: 420px;
            height: 420px;

            background: #16a34a;

            bottom: -140px;
            right: -160px;
          }

          .section-header {
            text-align: center;

            max-width: 820px;

            margin: 0 auto 70px;
          }

          .section-badge {
            display: inline-block;

            padding: 10px 18px;

            border-radius: 999px;

            background:
              rgba(34,197,94,0.12);

            border:
              1px solid
              rgba(34,197,94,0.2);

            color: #86efac;

            font-size: 0.82rem;

            font-weight: 700;

            letter-spacing: 0.12em;

            margin-bottom: 22px;
          }

          .section-title {
            font-size:
              clamp(2.5rem, 5vw, 4.2rem);

            font-weight: 900;

            line-height: 1.1;

            color: #ffffff;

            margin-bottom: 22px;
          }

          .section-title span {
            background:
              linear-gradient(
                135deg,
                #22c55e,
                #4ade80
              );

            -webkit-background-clip: text;

            -webkit-text-fill-color: transparent;
          }

          .section-description {
            color: #d1d5db;

            font-size: 1.08rem;

            line-height: 1.9;
          }

          .cards-grid {
            display: grid;

            grid-template-columns:
              repeat(
                auto-fit,
                minmax(320px, 1fr)
              );

            gap: 28px;
          }

          .service-card {
            position: relative;

            overflow: hidden;

            border-radius: 28px;

            background:
              rgba(17,24,39,0.88);

            border:
              1px solid
              rgba(255,255,255,0.08);

            backdrop-filter: blur(14px);

            transition: all 0.35s ease;

            box-shadow:
              0 15px 40px rgba(0,0,0,0.28);
          }

          .service-card:hover {
            border-color:
              rgba(34,197,94,0.28);

            box-shadow:
              0 25px 60px rgba(0,0,0,0.35),
              0 0 30px rgba(34,197,94,0.12);
          }

          .card-top {
            position: relative;

            padding: 32px 30px 20px;
          }

          .icon-box {
            width: 72px;

            height: 72px;

            border-radius: 22px;

            background:
              linear-gradient(
                135deg,
                #16a34a,
                #22c55e
              );

            display: flex;

            align-items: center;

            justify-content: center;

            color: white;

            font-size: 1.7rem;

            box-shadow:
              0 18px 35px
              rgba(34,197,94,0.28);

            transition: all 0.3s ease;
          }

          .service-card:hover .icon-box {
            transform:
              scale(1.08)
              rotate(5deg);
          }

          .top-line {
            width: 100%;

            height: 1px;

            background:
              linear-gradient(
                90deg,
                rgba(34,197,94,0.45),
                transparent
              );

            margin-top: 24px;
          }

          .card-content {
            padding: 0 30px 32px;
          }

          .card-content h3 {
            font-size: 1.8rem;

            font-weight: 800;

            line-height: 1.2;

            color: #ffffff;

            margin-bottom: 18px;
          }

          .card-content p {
            color: #cbd5e1;

            font-size: 1rem;

            line-height: 1.85;

            margin-bottom: 24px;
          }

          .card-content ul {
            list-style: none;

            padding: 0;

            margin: 0 0 30px 0;
          }

          .card-content li {
            position: relative;

            padding-left: 24px;

            margin-bottom: 14px;

            color: #e5e7eb;

            font-size: 0.96rem;

            line-height: 1.6;
          }

          .card-content li::before {
            content: "";

            position: absolute;

            left: 0;
            top: 9px;

            width: 9px;
            height: 9px;

            border-radius: 50%;

            background: #22c55e;

            box-shadow:
              0 0 10px rgba(34,197,94,0.6);
          }

          .service-btn {
            border: none;

            outline: none;

            padding: 14px 22px;

            border-radius: 14px;

            background:
              linear-gradient(
                135deg,
                #16a34a,
                #22c55e
              );

            color: white;

            font-weight: 700;

            transition: all 0.3s ease;
          }

          .service-btn:hover {
            transform:
              translateY(-3px);

            box-shadow:
              0 15px 35px
              rgba(34,197,94,0.28);
          }

          @media (max-width: 768px) {

            .branding-section {
              padding: 80px 14px;
            }

            .cards-grid {
              grid-template-columns: 1fr;
            }

            .section-title {
              font-size: 2.5rem;
            }

            .section-description {
              font-size: 1rem;
            }

            .card-content {
              padding:
                0 24px 28px;
            }

            .card-content h3 {
              font-size: 1.5rem;
            }
          }
        `}</style>
      </section>
    </>
  );
};

export default GraphicsBrandingComponent;