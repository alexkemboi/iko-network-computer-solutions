import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaPaintBrush,
  FaGlobe,
  FaVideo,
  FaNetworkWired,
  FaIdBadge,
  FaLaptopMedical,
  FaArrowRight,
} from "react-icons/fa";

const ServiceListComponent = () => {
  const shouldReduceMotion = useReducedMotion();

  const services = [
    {
      name: "Graphic Design",
      description:
        "Create visually compelling designs for digital and print media. From logos and branding to marketing materials that elevate your business identity.",
      icon: FaPaintBrush,
    },
    {
      name: "Online Services",
      description:
        "Professional web solutions, e-commerce platforms, online support services, SEO optimization, and digital transformation solutions.",
      icon: FaGlobe,
    },
    {
      name: "CCTV Installation",
      description:
        "Protect your premises with modern surveillance systems, professional installation, monitoring solutions, and security consultation.",
      icon: FaVideo,
    },
    {
      name: "Network Installation",
      description:
        "Enterprise networking solutions including routers, switches, structured cabling, wireless infrastructure, and connectivity optimization.",
      icon: FaNetworkWired,
    },
    {
      name: "Branding",
      description:
        "Build a memorable identity through logo design, brand strategy, visual consistency, and professional marketing collateral.",
      icon: FaIdBadge,
    },
    {
      name: "Computer Maintenance",
      description:
        "Comprehensive diagnostics, repairs, upgrades, software optimization, preventive maintenance, and technical support.",
      icon: FaLaptopMedical,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 25,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
      },
    },
  };

  return (
    <>
      <section className="services-section">
        <div className="bg-orb orb-left"></div>
        <div className="bg-orb orb-right"></div>

        <div className="section-top-border"></div>

        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">
              PROFESSIONAL BUSINESS SOLUTIONS
            </span>

            <h2 className="section-title">
              Our <span>Services</span>
            </h2>

            <p className="section-description">
              We provide innovative technology, branding, networking, cyber,
              and digital solutions that help businesses improve efficiency,
              strengthen their brand presence, and accelerate growth.
            </p>
          </motion.div>

          <motion.div
            className="services-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.article
                  key={service.name}
                  variants={cardVariants}
                  className="service-card"
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: -10,
                        }
                  }
                >
                  <div className="card-glow"></div>

                  <motion.div
                    className="icon-wrapper"
                    whileHover={
                      shouldReduceMotion
                        ? {}
                        : {
                            scale: 1.08,
                          }
                    }
                  >
                    <Icon size={34} />
                  </motion.div>

                  <h3>{service.name}</h3>

                  <p>{service.description}</p>

                  <a href="/" className="service-link">
                    Learn More
                    <FaArrowRight />
                  </a>

                  <span className="card-number">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        <div className="section-bottom-border"></div>
      </section>

      <style>{`
       .services-section {
  position: relative;
  padding: 110px 20px;
  overflow: hidden;

  background: linear-gradient(
    135deg,
    #004d2a 0%,
    #006b3b 35%,
    #009b55 100%
  );
}

.container {
  max-width: 1320px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.section-top-border,
.section-bottom-border {
  position: absolute;
  left: 0;
  width: 100%;
  height: 4px;

  background: linear-gradient(
    90deg,
    transparent,
    #34d399,
    #ffffff,
    #34d399,
    transparent
  );
}

.section-top-border {
  top: 0;
}

.section-bottom-border {
  bottom: 0;
}

.section-header {
  text-align: center;
  max-width: 900px;
  margin: 0 auto 80px;
}

.section-badge {
  display: inline-block;
  padding: 12px 22px;

  border-radius: 999px;

  background: rgba(255,255,255,0.12);

  border: 1px solid rgba(255,255,255,0.15);

  color: #d1fae5;

  font-size: .85rem;

  font-weight: 800;

  letter-spacing: .15em;

  margin-bottom: 22px;
}

.section-title {
  font-size: clamp(2.8rem,5vw,4.5rem);

  font-weight: 900;

  color: #ffffff;

  margin-bottom: 20px;

  line-height: 1.1;
}

.section-title span {
  color: #bbf7d0;
}

.section-description {
  color: #d1fae5;

  font-size: 1.15rem;

  line-height: 1.9;

  font-weight: 500;
}

.services-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit,minmax(320px,1fr));

  gap: 30px;
}

.service-card {
  position: relative;

  background: rgba(255,255,255,0.08);

  backdrop-filter: blur(12px);

  border: 1px solid rgba(255,255,255,0.12);

  border-radius: 28px;

  padding: 35px;

  overflow: hidden;

  transition: all .35s ease;

  height: 100%;
}

.service-card:hover {
  transform: translateY(-8px);

  border-color: rgba(255,255,255,.25);

  box-shadow:
    0 20px 50px rgba(0,0,0,.20);
}

.card-glow {
  position: absolute;
  inset: 0;

  background: linear-gradient(
    135deg,
    rgba(255,255,255,.08),
    transparent
  );

  opacity: 0;

  transition: .35s ease;
}

.service-card:hover .card-glow {
  opacity: 1;
}

.icon-wrapper {
  width: 85px;
  height: 85px;

  border-radius: 22px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 25px;

  background: #ffffff;

  color: #009b55;

  box-shadow:
    0 12px 30px rgba(0,0,0,.18);
}

.service-card h3 {
  color: #ffffff;

  font-size: 1.45rem;

  font-weight: 800;

  margin-bottom: 16px;

  line-height: 1.3;
}

.service-card p {
  color: #d1fae5;

  font-size: 1rem;

  line-height: 1.85;

  margin-bottom: 24px;
}

.service-link {
  display: inline-flex;

  align-items: center;

  gap: 10px;

  color: #ffffff;

  text-decoration: none;

  font-weight: 700;

  transition: .3s ease;
}

.service-link:hover {
  color: #bbf7d0;

  transform: translateX(5px);
}

.card-number {
  position: absolute;

  top: 15px;
  right: 20px;

  font-size: 2.5rem;

  font-weight: 900;

  color: rgba(255,255,255,0.08);
}

.bg-orb {
  position: absolute;

  border-radius: 50%;

  filter: blur(120px);

  opacity: .18;
}

.orb-left {
  width: 350px;
  height: 350px;

  background: #34d399;

  left: -120px;
  top: 120px;
}

.orb-right {
  width: 400px;
  height: 400px;

  background: #bbf7d0;

  right: -150px;
  bottom: 40px;
}

@media (max-width: 768px) {

  .services-section {
    padding: 80px 15px;
  }

  .section-title {
    font-size: 2.5rem;
  }

  .section-description {
    font-size: 1rem;
  }

  .service-card {
    padding: 25px;
  }

  .icon-wrapper {
    width: 75px;
    height: 75px;
  }
}
      `}</style>
    </>
  );
};

export default ServiceListComponent;