import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaGlobe,
  FaMobileAlt,
  FaNetworkWired,
  FaArrowRight,
} from "react-icons/fa";

const Portfolio = () => {
  const shouldReduceMotion = useReducedMotion();

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
      y: shouldReduceMotion ? 0 : 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <>
      <section className="portfolio-section">
        <div className="portfolio-glow glow-left"></div>
        <div className="portfolio-glow glow-right"></div>

        <div className="container">
          <motion.div
            className="portfolio-header"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="portfolio-badge">OUR SUCCESS STORIES</span>

            <h2 className="portfolio-title">
              Featured <span>Portfolio</span>
            </h2>

            <p className="portfolio-description">
              Explore some of our recent projects showcasing innovation,
              creativity, and technical excellence across multiple industries.
            </p>
          </motion.div>

          <motion.div
            className="portfolio-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {portfolioItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={index}
                  className="portfolio-card"
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
                  <div className="image-wrapper">
                    <img src={item.image} alt={item.title} />

                    <div className="image-overlay">
                      <div className="icon-container">
                        <Icon size={26} />
                      </div>
                    </div>
                  </div>

                  <div className="portfolio-content">
                    <span className="portfolio-category">
                      {item.category}
                    </span>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>

                    <a href="/" className="view-project">
                      View Project
                      <FaArrowRight />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <style>{`
        .portfolio-section {
          position: relative;
          overflow: hidden;
          padding: 100px 20px;
          background: linear-gradient(
            180deg,
            #ffffff 0%,
            #f8fffb 50%,
            #ffffff 100%
          );
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .portfolio-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 70px;
        }

        .portfolio-badge {
          display: inline-block;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(0, 155, 85, 0.12);
          color: #009b55;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          margin-bottom: 20px;
        }

        .portfolio-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 20px;
        }

        .portfolio-title span {
          background: linear-gradient(135deg, #009b55, #19c37d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .portfolio-description {
          font-size: 1.1rem;
          color: #64748b;
          line-height: 1.8;
        }

        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }

        .portfolio-card {
          background: rgba(255, 255, 255, 0.85);
          border-radius: 28px;
          overflow: hidden;
          backdrop-filter: blur(12px);
          box-shadow:
            0 15px 35px rgba(15, 23, 42, 0.08),
            0 10px 30px rgba(0, 155, 85, 0.08);
          transition: all 0.35s ease;
        }

        .image-wrapper {
          position: relative;
          overflow: hidden;
          height: 250px;
        }

        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .portfolio-card:hover img {
          transform: scale(1.08);
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.45)
          );
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-container {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .portfolio-content {
          padding: 30px;
        }

        .portfolio-category {
          display: inline-block;
          color: #009b55;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .portfolio-content h3 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 15px;
        }

        .portfolio-content p {
          color: #64748b;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        .view-project {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #009b55;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .view-project:hover {
          transform: translateX(5px);
          color: #007c45;
        }

        .portfolio-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.25;
        }

        .glow-left {
          width: 350px;
          height: 350px;
          background: #19c37d;
          top: -120px;
          left: -120px;
        }

        .glow-right {
          width: 450px;
          height: 450px;
          background: #009b55;
          bottom: -180px;
          right: -180px;
        }

        @media (max-width: 768px) {
          .portfolio-section {
            padding: 80px 15px;
          }

          .portfolio-grid {
            grid-template-columns: 1fr;
          }

          .portfolio-content {
            padding: 24px;
          }
        }
      `}</style>
    </>
  );
};

export default Portfolio;