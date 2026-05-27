import React from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  FaLightbulb,
  FaFlask,
  FaBrain,
  FaChartLine,
  FaRocket,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

const ResearchInnovationComponent = () => {
  const shouldReduceMotion = useReducedMotion();

  const researchAreas = [
    {
      title: "Technology Research",
      icon: FaFlask,
      description:
        "We conduct advanced technology research to help organizations discover modern digital opportunities and solutions.",
      features: [
        "Emerging Technology Analysis",
        "Digital Transformation Research",
        "Software Feasibility Studies",
        "Technology Evaluation",
        "Innovation Strategy",
      ],
    },

    {
      title: "Innovation & Product Design",
      icon: FaLightbulb,
      description:
        "Transform ideas into scalable digital products through innovation-driven design and strategic planning.",
      features: [
        "Product Ideation",
        "Prototype Development",
        "User Experience Research",
        "Solution Architecture",
        "Innovation Consulting",
      ],
    },

    {
      title: "AI & Intelligent Systems",
      icon: FaBrain,
      description:
        "Research and development of intelligent systems, automation solutions and AI-powered digital platforms.",
      features: [
        "AI-Powered Applications",
        "Automation Solutions",
        "Predictive Analytics",
        "Smart System Integration",
        "Machine Learning Research",
      ],
    },

    {
      title: "Business Intelligence",
      icon: FaChartLine,
      description:
        "Data-driven research and analytics solutions to support business growth and strategic decision making.",
      features: [
        "Data Analysis & Insights",
        "Performance Reporting",
        "Business Forecasting",
        "Research Documentation",
        "Strategic Recommendations",
      ],
    },

    {
      title: "Startup & Innovation Support",
      icon: FaRocket,
      description:
        "Helping startups and enterprises build innovative digital solutions from concept to scalable deployment.",
      features: [
        "Startup Technology Guidance",
        "MVP Development",
        "Innovation Roadmaps",
        "Technical Mentorship",
        "Scalable Product Planning",
      ],
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 40,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <section className="research-section">
        {/* BACKGROUND GLOW */}
        <div className="bg-glow glow-left"></div>
        <div className="bg-glow glow-right"></div>

        <div className="research-container">
          {/* HEADER */}
          <motion.div
            className="section-header"
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-badge">
              RESEARCH & DIGITAL INNOVATION
            </span>

            <h2 className="section-title">
              Research &
              <span> Innovations</span>
            </h2>

            <div className="title-divider">
              <span></span>
              <div className="divider-dot"></div>
              <span></span>
            </div>

            <p className="section-description">
              We help companies conduct extensive research and
              innovations to build scalable, future-ready digital
              solutions that drive growth, efficiency and
              competitive advantage.
            </p>
          </motion.div>

          {/* CARDS */}
          <motion.div
            className="research-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {researchAreas.map((area, index) => {
              const Icon = area.icon;

              return (
                <motion.article
                  key={area.title}
                  className="research-card"
                  variants={cardVariants}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: -10,
                          scale: 1.02,
                        }
                  }
                >
                  {/* NUMBER */}
                  <span className="card-number">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>

                  {/* ICON */}
                  <motion.div
                    className="icon-wrapper"
                    whileHover={
                      shouldReduceMotion
                        ? {}
                        : {
                            rotate: 5,
                            scale: 1.08,
                          }
                    }
                  >
                    <Icon size={32} />
                  </motion.div>

                  {/* TITLE */}
                  <h3>{area.title}</h3>

                  <div className="mini-line"></div>

                  {/* DESCRIPTION */}
                  <p>{area.description}</p>

                  {/* FEATURES */}
                  <ul className="feature-list">
                    {area.features.map((feature, idx) => (
                      <li key={idx}>
                        <FaCheckCircle />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a href="/" className="learn-more">
                    Explore More
                    <FaArrowRight />
                  </a>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <style>{`
        .research-section {
          position: relative;
          overflow: hidden;
          padding: 110px 24px;
          background: linear-gradient(
            180deg,
            #020617 0%,
            #0f172a 50%,
            #020617 100%
          );
        }

        .research-container {
          max-width: 1350px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .section-header {
          text-align: center;
          max-width: 900px;
          margin: 0 auto 80px;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 22px;
          border-radius: 999px;
          border: 1px solid rgba(34, 197, 94, 0.4);
          background: rgba(34, 197, 94, 0.08);
          color: #d1fae5;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          margin-bottom: 24px;
        }

        .section-badge::before {
          content: "";
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 12px #22c55e;
        }

        .section-title {
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 900;
          line-height: 1.1;
          color: #ffffff;
          margin-bottom: 28px;
        }

        .section-title span {
          background: linear-gradient(
            135deg,
            #22c55e,
            #4ade80
          );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .title-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 30px;
        }

        .title-divider span {
          width: 120px;
          height: 1px;
          background: rgba(255,255,255,0.2);
        }

        .divider-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 15px #22c55e;
        }

        .section-description {
          color: #d1d5db;
          font-size: 1.15rem;
          line-height: 1.9;
          max-width: 850px;
          margin: auto;
        }

        .research-grid {
          display: grid;

          grid-template-columns: repeat(
            auto-fit,
            minmax(360px, 1fr)
          );

          gap: 32px;
        }

        .research-card {
          position: relative;
          overflow: hidden;
          padding: 42px;
          border-radius: 30px;
          background: rgba(2, 6, 23, 0.88);
          border: 1px solid rgba(34,197,94,0.18);
          backdrop-filter: blur(12px);
          transition: all 0.35s ease;

          box-shadow:
            0 10px 35px rgba(0,0,0,0.35),
            0 0 35px rgba(34,197,94,0.05);
        }

        .research-card:hover {
          border-color: rgba(34,197,94,0.4);

          box-shadow:
            0 25px 60px rgba(0,0,0,0.45),
            0 0 45px rgba(34,197,94,0.12);
        }

        .icon-wrapper {
          width: 88px;
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 24px;

          background: linear-gradient(
            135deg,
            #16a34a,
            #22c55e
          );

          color: white;

          margin-bottom: 30px;

          box-shadow:
            0 15px 35px rgba(34,197,94,0.35);
        }

        .research-card h3 {
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .mini-line {
          width: 60px;
          height: 4px;
          border-radius: 999px;

          background: linear-gradient(
            90deg,
            #22c55e,
            #4ade80
          );

          margin-bottom: 24px;
        }

        .research-card p {
          color: #cbd5e1;
          line-height: 1.9;
          margin-bottom: 28px;
          font-size: 1rem;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0 0 30px;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #f8fafc;
          font-size: 1rem;
        }

        .feature-list svg {
          color: #4ade80;
          min-width: 16px;
        }

        .learn-more {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 15px 26px;
          border-radius: 16px;

          border: 1px solid rgba(34,197,94,0.45);

          background: rgba(34,197,94,0.08);

          color: #ffffff;

          text-decoration: none;

          font-weight: 700;

          transition: all 0.3s ease;
        }

        .learn-more:hover {
          background: linear-gradient(
            135deg,
            #16a34a,
            #22c55e
          );

          transform: translateX(5px);

          color: white;
        }

        .card-number {
          position: absolute;
          top: 20px;
          right: 26px;
          font-size: 4.5rem;
          font-weight: 900;
          color: rgba(34,197,94,0.12);
          user-select: none;
        }

        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.22;
          pointer-events: none;
        }

        .glow-left {
          width: 420px;
          height: 420px;
          background: #22c55e;
          top: 160px;
          left: -220px;
        }

        .glow-right {
          width: 520px;
          height: 520px;
          background: #16a34a;
          bottom: -220px;
          right: -220px;
        }

        @media (max-width: 992px) {
          .research-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {

          .research-section {
            padding: 90px 16px;
          }

          .research-card {
            padding: 30px;
          }

          .section-title {
            font-size: 2.8rem;
          }

          .section-description {
            font-size: 1rem;
          }

          .research-card h3 {
            font-size: 1.6rem;
          }

          .card-number {
            font-size: 3.5rem;
          }

          .title-divider span {
            width: 70px;
          }
        }
      `}</style>
    </>
  );
};

export default ResearchInnovationComponent;