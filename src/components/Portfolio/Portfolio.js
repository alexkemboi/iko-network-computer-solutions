import React from "react";
import { motion } from "framer-motion";
import {
  FaGlobe,
  FaMobileAlt,
  FaNetworkWired,
  FaArrowRight,
  FaTrophy,
} from "react-icons/fa";
import SectionHeader, { useRevealVariants } from "../shared/SectionHeader";

const Portfolio = () => {
  const { containerVariants, cardVariants, hover } = useRevealVariants(0.12);

  const portfolioItems = [
    {
      title: "Corporate Website",
      description:
        "Modern responsive company website with SEO optimization, CMS integration, and high-performance architecture.",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200",
      icon: FaGlobe,
      category: "Web Development",
    },
    {
      title: "Mobile Business App",
      description:
        "Cross-platform mobile application designed to streamline operations and enhance customer engagement.",
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200",
      icon: FaMobileAlt,
      category: "Mobile Development",
    },
    {
      title: "Enterprise Network Setup",
      description:
        "Complete network infrastructure implementation with secure connectivity and optimized performance.",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200",
      icon: FaNetworkWired,
      category: "Networking",
    },
  ];

  return (
    <section className="ix-section ix-section--alt" id="portfolio">
      <div className="ix-glow ix-glow--tl"></div>
      <div className="ix-glow ix-glow--br"></div>

      <div className="ix-container">
        <SectionHeader
          eyebrow="OUR SUCCESS STORIES"
          icon={FaTrophy}
          title={
            <>
              Featured <span>Portfolio</span>
            </>
          }
        >
          Explore some of our recent projects showcasing innovation,
          creativity, and technical excellence across multiple industries.
        </SectionHeader>

        <motion.div
          className="ix-grid ix-grid--lg"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {portfolioItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={index}
                className="ix-card portfolio-card"
                variants={cardVariants}
                whileHover={hover}
              >
                <div className="portfolio-image">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="portfolio-image__overlay">
                    <span className="portfolio-image__icon" aria-hidden="true">
                      <Icon size={24} />
                    </span>
                  </div>
                </div>

                <div className="portfolio-content">
                  <span className="ix-chip">{item.category}</span>

                  <h3 className="ix-card__title">{item.title}</h3>

                  <p className="ix-card__text">{item.description}</p>

                  <div className="ix-card__footer">
                    <a href="/" className="ix-link">
                      View Project
                      <FaArrowRight aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        .portfolio-card {
          padding: 0;
        }

        .portfolio-image {
          position: relative;
          height: 230px;
          overflow: hidden;
        }

        .portfolio-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .7s var(--ease);
        }

        .portfolio-card:hover .portfolio-image img {
          transform: scale(1.07);
        }

        .portfolio-image__overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          padding: 18px;
          background: linear-gradient(180deg, transparent 40%, rgba(2, 6, 23, .6));
        }

        .portfolio-image__icon {
          display: grid;
          place-items: center;
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: rgba(255, 255, 255, .18);
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
          color: #fff;
        }

        .portfolio-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 26px 28px 28px;
        }

        .portfolio-content .ix-chip {
          align-self: flex-start;
          margin-bottom: 14px;
        }
      `}</style>
    </section>
  );
};

export default Portfolio;
