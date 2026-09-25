import React from "react";
import { motion } from "framer-motion";
import {
  FaLightbulb,
  FaFlask,
  FaBrain,
  FaChartLine,
  FaRocket,
  FaCheckCircle,
  FaAtom,
  FaMicrochip,
  FaSearch,
  FaDraftingCompass,
  FaCubes,
  FaRobot,
  FaProjectDiagram,
  FaDatabase,
  FaChartPie,
  FaMapSigns,
  FaUsers,
  FaSatellite,
} from "react-icons/fa";
import SectionHeader, { useRevealVariants } from "../shared/SectionHeader";
import Carousel from "../shared/Carousel";
import CardVisual from "../shared/CardVisual";
import Parallax from "../shared/Parallax";
import { CardActions, SectionCta } from "../shared/CardActions";
import { useOrder } from "../../commerce/OrderContext";

export const researchAreas = [
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

const CHIPS = {
  "Technology Research": [FaMicrochip, FaSearch, FaSatellite],
  "Innovation & Product Design": [FaDraftingCompass, FaCubes, FaUsers],
  "AI & Intelligent Systems": [FaRobot, FaProjectDiagram, FaMicrochip],
  "Business Intelligence": [FaDatabase, FaChartPie, FaSearch],
  "Startup & Innovation Support": [FaMapSigns, FaUsers, FaCubes],
};

const ResearchInnovationComponent = () => {
  const { cardVariants } = useRevealVariants(0.1);
  const { openDetails } = useOrder();

  return (
    <section className="ix-section tone-night research-section" id="research">
      <Parallax distance={70}>
        <svg className="research-orbits" viewBox="0 0 800 800" focusable="false">
          <circle cx="400" cy="400" r="140" />
          <circle cx="400" cy="400" r="240" />
          <circle cx="400" cy="400" r="340" />
          <circle className="research-orbits__dot" cx="540" cy="400" r="5" />
          <circle className="research-orbits__dot" cx="400" cy="160" r="4" />
          <circle className="research-orbits__dot" cx="100" cy="520" r="4" />
        </svg>
      </Parallax>

      <div className="ix-container">
        <SectionHeader
          eyebrow="RESEARCH & DIGITAL INNOVATION"
          icon={FaAtom}
          title={
            <>
              Research &
              <span> Innovations</span>
            </>
          }
        >
          We help companies conduct extensive research and innovations to build
          scalable, future-ready digital solutions that drive growth, efficiency
          and competitive advantage.
        </SectionHeader>

        <ul className="research-themes" aria-label="Research themes">
          {researchAreas.map((area) => {
            const Icon = area.icon;
            return (
              <li key={area.title}>
                <button
                  type="button"
                  onClick={() =>
                    openDetails({
                      name: area.title,
                      icon: area.icon,
                      section: "Research & Innovation",
                      description: area.description,
                      features: area.features,
                      featuresLabel: "Focus areas",
                    })
                  }
                >
                  <Icon aria-hidden="true" />
                  {area.title}
                </button>
              </li>
            );
          })}
        </ul>

        <Carousel label="Research and innovation areas">
          {researchAreas.map((area, index) => {
            const item = {
              price: area.price,
              name: area.title,
              icon: area.icon,
              section: "Research & Innovation",
              description: area.description,
              features: area.features,
              featuresLabel: "Focus areas",
            };

            return (
              <motion.article
                key={area.title}
                className="ix-card research-card"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
              >
                <CardVisual
                  icon={area.icon}
                  chips={CHIPS[area.title]}
                  pattern="orbits"
                  index={index}
                />

                <h3 className="ix-card__title">{area.title}</h3>

                <div className="ix-rule"></div>

                <p className="ix-card__text">{area.description}</p>

                <ul className="ix-list">
                  {area.features.slice(0, 3).map((feature) => (
                    <li key={feature}>
                      <FaCheckCircle aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="ix-card__footer">
                  <CardActions item={item} primaryLabel="Explore More" orderLabel="Order" />
                </div>
              </motion.article>
            );
          })}
        </Carousel>

        <SectionCta text="Exploring an idea or an emerging technology?" label="Start a conversation" />
      </div>

      <style>{`
        .research-section {
          background:
            radial-gradient(900px 480px at 50% 0%, var(--brand-soft), transparent 70%),
            var(--bg);
        }

        .research-orbits {
          position: absolute;
          width: min(900px, 120vw);
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          fill: none;
          stroke: var(--media-ink);
          stroke-width: 1;
          -webkit-mask-image: radial-gradient(circle, #000 30%, transparent 70%);
          mask-image: radial-gradient(circle, #000 30%, transparent 70%);
        }

        .research-orbits__dot {
          fill: var(--brand);
          stroke: none;
          opacity: .6;
        }

        .research-themes {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          list-style: none;
          padding: 0;
          margin: -24px auto 36px;
          max-width: 900px;
        }

        .research-themes button {
          font-family: inherit;
          cursor: pointer;
          transition: border-color .25s var(--ease), color .25s var(--ease), transform .25s var(--ease), background-color .25s var(--ease);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          font-size: .84rem;
          font-weight: 600;
        }

        .research-themes svg {
          color: var(--brand-text);
          transition: transform .4s var(--ease);
        }

        .research-themes button:hover {
          border-color: var(--brand-border);
          background: var(--brand-soft);
          color: var(--heading);
          transform: translateY(-2px);
        }

        .research-themes button:hover svg {
          transform: rotate(-12deg) scale(1.15);
        }

        .research-card .ix-card__title {
          font-size: 1.2rem;
        }

        .research-card .ix-list li {
          font-size: .9rem;
        }

        @media (max-width: 680px) {
          .research-themes {
            margin-top: -16px;
          }
        }
      `}</style>
    </section>
  );
};

export default ResearchInnovationComponent;
