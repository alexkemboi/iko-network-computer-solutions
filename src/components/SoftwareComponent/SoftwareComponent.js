import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaGlobe,
  FaMobileAlt,
  FaCode,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

const SoftwareComponent = () => {
  const shouldReduceMotion = useReducedMotion();

  const developmentServices = [
    {
      name: "Web Development",
      description:
        "Create modern, fast, and responsive websites tailored to your business needs. We develop scalable front-end and back-end solutions using industry-leading technologies.",
      icon: FaGlobe,
      features: [
        "Responsive & Mobile-First Design",
        "Custom Web Applications",
        "API Development & Integration",
        "Database Design & Management",
        "Performance Optimization",
      ],
    },

    {
      name: "Mobile Development",
      description:
        "Build intuitive and high-performance mobile applications for Android and iOS with seamless user experiences and scalable architecture.",
      icon: FaMobileAlt,
      features: [
        "Native Android Development",
        "Native iOS Development",
        "Cross-Platform Applications",
        "UI/UX Design & Prototyping",
        "App Testing & Deployment",
      ],
    },

    {
      name: "Software Development",
      description:
        "Transform business operations with enterprise-grade software systems, desktop applications, and automation platforms.",
      icon: FaCode,
      features: [
        "Custom Software Solutions",
        "Enterprise System Development",
        "Desktop Applications",
        "Process Automation Tools",
        "Maintenance & Support",
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
      <section className="software-section">
        {/* BACKGROUND GLOW */}
        <div className="bg-glow glow-left"></div>
        <div className="bg-glow glow-right"></div>

        <div className="software-container">
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
              DIGITAL TRANSFORMATION SOLUTIONS
            </span>

            <h2 className="section-title">
              Software <span>Development</span>
            </h2>

            <div className="title-divider">
              <span></span>
              <div className="divider-dot"></div>
              <span></span>
            </div>

            <p className="section-description">
              We build innovative digital products and enterprise-grade
              software solutions that help organizations streamline
              operations, improve efficiency and accelerate business
              growth.
            </p>
          </motion.div>

          {/* CARDS */}
          <motion.div
            className="software-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {developmentServices.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.article
                  key={service.name}
                  className="software-card"
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
                  {/* CARD NUMBER */}
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
                  <h3>{service.name}</h3>

                  <div className="mini-line"></div>

                  {/* DESCRIPTION */}
                  <p>{service.description}</p>

                  {/* FEATURES */}
                  <ul className="feature-list">
                    {service.features.map((feature, idx) => (
                      <li key={idx}>
                        <FaCheckCircle />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* BUTTON */}
                  <a href="/" className="learn-more">
                    Learn More
                    <FaArrowRight />
                  </a>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <style>{`
        .software-section {
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

        .software-container {
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

        .software-grid {
          display: grid;

          grid-template-columns: repeat(
            auto-fit,
            minmax(360px, 1fr)
          );

          gap: 32px;
        }

        .software-card {
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

        .software-card:hover {
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

        .software-card h3 {
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

        .software-card p {
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
          .software-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {

          .software-section {
            padding: 90px 16px;
          }

          .software-card {
            padding: 30px;
          }

          .section-title {
            font-size: 2.8rem;
          }

          .section-description {
            font-size: 1rem;
          }

          .software-card h3 {
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

export default SoftwareComponent;