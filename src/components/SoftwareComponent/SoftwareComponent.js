import React from "react";
import { motion } from "framer-motion";
import {
  FaGlobe,
  FaMobileAlt,
  FaCode,
  FaArrowRight,
  FaCheckCircle,
  FaRocket,
} from "react-icons/fa";
import SectionHeader, { useRevealVariants } from "../shared/SectionHeader";

export const developmentServices = [
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

const SoftwareComponent = () => {
  const { containerVariants, cardVariants, hover } = useRevealVariants(0.12);


  return (
    <section className="ix-section software-section" id="software">
      {/* anchor kept for the hero "Explore Services" button */}
      <span id="services" className="ix-anchor" aria-hidden="true"></span>

      <div className="ix-glow ix-glow--tl"></div>
      <div className="ix-glow ix-glow--br"></div>

      <div className="ix-container">
        <SectionHeader
          eyebrow="DIGITAL TRANSFORMATION SOLUTIONS"
          icon={FaRocket}
          title={
            <>
              Software <span>Development</span>
            </>
          }
        >
          We build innovative digital products and enterprise-grade software
          solutions that help organizations streamline operations, improve
          efficiency and accelerate business growth.
        </SectionHeader>

        <motion.div
          className="ix-grid ix-grid--lg"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {developmentServices.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.article
                key={service.name}
                className="ix-card"
                variants={cardVariants}
                whileHover={hover}
              >
                <span className="ix-card__number" aria-hidden="true">
                  {(index + 1).toString().padStart(2, "0")}
                </span>

                <div className="ix-icon" aria-hidden="true">
                  <Icon />
                </div>

                <h3 className="ix-card__title">{service.name}</h3>

                <div className="ix-rule"></div>

                <p className="ix-card__text">{service.description}</p>

                <ul className="ix-list">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>
                      <FaCheckCircle aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="ix-card__footer">
                  <a href="/" className="ix-btn ix-btn--outline">
                    Learn More
                    <FaArrowRight aria-hidden="true" />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default SoftwareComponent;
