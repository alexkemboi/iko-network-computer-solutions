import React from "react";
import { motion } from "framer-motion";

import {
  FaPaintBrush,
  FaPrint,
  FaBullhorn,
  FaPalette,
  FaPenNib,
  FaVectorSquare,
  FaImage,
  FaIdCard,
  FaScroll,
  FaStamp,
  FaHashtag,
  FaPenFancy,
  FaChartLine,
} from "react-icons/fa";
import SectionHeader, { useRevealVariants } from "../shared/SectionHeader";
import CardVisual from "../shared/CardVisual";
import Parallax from "../shared/Parallax";
import { CardActions, SectionCta } from "../shared/CardActions";

export const creativeServices = [
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

const VISUALS = {
  "Graphics Design": { chips: [FaPenNib, FaVectorSquare, FaImage], pattern: "waves" },
  "Printing Services": { chips: [FaIdCard, FaScroll, FaStamp], pattern: "dots" },
  "Digital Branding": { chips: [FaHashtag, FaPenFancy, FaChartLine], pattern: "orbits" },
};

const GraphicsBrandingComponent = () => {
  const { containerVariants, cardVariants, hover } = useRevealVariants(0.12);

  return (
    <section className="ix-section tone-cream creative-section" id="branding">
      <Parallax className="creative-bg" distance={50}>
        <span className="creative-blob creative-blob--a"></span>
        <span className="creative-blob creative-blob--b"></span>
      </Parallax>

      <div className="ix-container">
        <SectionHeader
          eyebrow="CREATIVE SERVICES"
          icon={FaPalette}
          title={
            <>
              Graphics Design,
              <span> Print & Branding</span>
            </>
          }
        >
          Creative and modern branding solutions crafted to elevate your
          business identity through premium graphics design, professional
          printing and digital branding services.
        </SectionHeader>

        <motion.div
          className="creative-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {creativeServices.map((service, index) => {
            const visual = VISUALS[service.title] || {};
            const item = {
              price: service.price,
              name: service.title,
              icon: service.icon,
              section: "Creative Services",
              description: service.description,
              features: service.items,
              featuresLabel: "What's included",
            };

            return (
              <motion.article
                key={service.title}
                className={`ix-card creative-card ${index === 0 ? "creative-card--feature" : ""}`}
                variants={cardVariants}
                whileHover={hover}
              >
                <CardVisual
                  icon={service.icon}
                  chips={visual.chips}
                  pattern={visual.pattern}
                  index={index}
                />

                <div className="creative-card__body">
                  <h3 className="ix-card__title">{service.title}</h3>

                  <p className="ix-card__text">{service.description}</p>

                  <ul className="creative-tags" aria-label={`${service.title} includes`}>
                    {service.items.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>

                  <div className="ix-card__footer">
                    <CardActions item={item} primaryLabel="Learn More" orderLabel="Order" />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        <SectionCta text="Have a brief or a brand to refresh?" label="Start a creative project" />
      </div>

      <style>{`
        .creative-section {
          background: linear-gradient(180deg, var(--bg) 0%, var(--cream-soft) 50%, var(--bg) 100%);
        }

        .creative-blob {
          position: absolute;
          border-radius: 42% 58% 60% 40% / 45% 40% 60% 55%;
          filter: blur(2px);
          opacity: .55;
        }

        .creative-blob--a {
          width: 340px;
          height: 340px;
          top: 12%;
          right: -120px;
          background: radial-gradient(circle at 30% 30%, var(--cream-border), transparent 70%);
        }

        .creative-blob--b {
          width: 260px;
          height: 260px;
          bottom: 8%;
          left: -80px;
          background: radial-gradient(circle at 60% 40%, var(--brand-soft-2), transparent 70%);
        }

        .creative-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(18px, 2.2vw, 28px);
        }

        .creative-card__body {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        /* Feature story: full-width, image-led */
        .creative-card--feature {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          padding: 0;
        }

        .creative-card--feature .ix-media {
          margin: 0;
          aspect-ratio: auto;
          height: 100%;
          min-height: 340px;
        }

        .creative-card--feature .ix-media__tile {
          width: 96px;
          height: 96px;
          border-radius: 30px;
          font-size: 2.5rem;
        }

        .creative-card--feature .creative-card__body {
          justify-content: center;
          padding: clamp(26px, 3.4vw, 48px);
        }

        .creative-card--feature .ix-card__title {
          font-size: clamp(1.5rem, 2.2vw, 1.9rem);
        }

        .creative-card--feature .ix-card__text {
          font-size: 1.02rem;
        }

        .creative-card .ix-card__text {
          margin-bottom: 16px;
        }

        .creative-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          list-style: none;
          padding: 0;
          margin: 0 0 22px;
        }

        .creative-tags li {
          padding: 7px 12px;
          border-radius: 999px;
          background: var(--cream-soft);
          border: 1px solid var(--cream-border);
          color: var(--heading);
          font-size: .82rem;
          font-weight: 600;
          transition: background-color .25s var(--ease), border-color .25s var(--ease), transform .25s var(--ease);
        }

        .creative-card:hover .creative-tags li {
          border-color: var(--brand-border);
        }

        .creative-tags li:hover {
          background: var(--brand-soft);
          transform: translateY(-2px);
        }

        @media (max-width: 860px) {
          .creative-grid {
            grid-template-columns: 1fr;
          }

          .creative-card--feature {
            grid-template-columns: 1fr;
          }

          .creative-card--feature .ix-media {
            min-height: 0;
            aspect-ratio: 16 / 9;
          }
        }
      `}</style>
    </section>
  );
};

export default GraphicsBrandingComponent;
