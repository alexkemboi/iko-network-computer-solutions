import React from "react";
import { motion } from "framer-motion";
import OnlineServices from "../OnlineServices/OnlineServices"
import {
  FaPrint,
  FaCopy,
  FaFileAlt,
  FaBook,
  FaShieldAlt,
  FaLock,
  FaFileSignature,
  FaFilePdf,
  FaPalette,
  FaLayerGroup,
  FaHdd,
  FaImage,
  FaFolderOpen,
  FaBookOpen,
  FaFileContract,
  FaClone,
} from "react-icons/fa";
import SectionHeader, { useRevealVariants } from "../shared/SectionHeader";
import CardVisual from "../shared/CardVisual";
import Parallax from "../shared/Parallax";
import { CardActions, SectionCta } from "../shared/CardActions";

export const cyberServices = [
  {
    name: "Printing",
    description:
      "Professional high-quality printing services for documents, brochures, business cards, flyers, reports, and promotional materials.",
    icon: FaPrint,
  },
  {
    name: "Photocopy",
    description:
      "Fast and reliable photocopy services with crystal-clear black & white and full-color reproduction for all document types.",
    icon: FaCopy,
  },
  {
    name: "Scanning",
    description:
      "Convert physical documents into secure digital formats with high-resolution scanning and document archiving services.",
    icon: FaFileAlt,
  },
  {
    name: "Lamination & Binding",
    description:
      "Protect important documents with premium lamination and create professional presentations using various binding options.",
    icon: FaBook,
  },
];

const CHIPS = {
  Printing: [FaFileSignature, FaPalette, FaFilePdf],
  Photocopy: [FaClone, FaLayerGroup, FaPalette],
  Scanning: [FaHdd, FaImage, FaFolderOpen],
  "Lamination & Binding": [FaLock, FaBookOpen, FaFileContract],
};

const Cyber = () => {
  const { containerVariants, cardVariants, hover } = useRevealVariants(0.1);

  return (
    <>
      <section className="ix-section tone-slate cyber-section" id="cyber">
        <div className="cyber-border" aria-hidden="true"></div>

        <Parallax distance={40}>
          <span className="cyber-grid-bg"></span>
        </Parallax>

        <div className="ix-container">
          <SectionHeader
            eyebrow="DIGITAL DOCUMENT SOLUTIONS"
            icon={FaShieldAlt}
            title={<span>Cyber Services</span>}
          >
            Fast, reliable, and professional cyber services designed to meet
            your personal, academic, and business document processing needs.
          </SectionHeader>

          <motion.div
            className="ix-grid ix-grid--sm cyber-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {cyberServices.map((service, index) => {
              const Icon = service.icon;
              const item = {
                price: service.price,
                name: service.name,
                icon: service.icon,
                section: "Cyber Services",
                description: service.description,
              };

              return (
                <motion.article
                  key={service.name}
                  className="ix-card cyber-card"
                  variants={cardVariants}
                  whileHover={hover}
                >
                  <CardVisual
                    icon={Icon}
                    chips={CHIPS[service.name]}
                    pattern="circuit"
                    index={index}
                    short
                  />

                  <div className="cyber-card__head">
                    <span className="cyber-card__shield" aria-hidden="true">
                      <FaShieldAlt />
                    </span>
                    <h3 className="ix-card__title">{service.name}</h3>
                  </div>

                  <p className="ix-card__text">{service.description}</p>

                  <div className="ix-card__footer">
                    <CardActions item={item} primaryLabel="Learn More" orderLabel="Order" />
                  </div>
                </motion.article>
              );
            })}
          </motion.div>

          <SectionCta text="Bulk printing or a large scanning job?" label="Get a quote" />
        </div>
      </section>

      <OnlineServices/>

      <style>{`
        .cyber-section {
          background: var(--bg-alt);
        }

        .cyber-border {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--brand), transparent);
          opacity: .6;
        }

        .cyber-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px;
          -webkit-mask-image: radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%);
          mask-image: radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%);
        }

        .cyber-grid {
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
        }

        .cyber-card {
          border-top: 0;
        }

        .cyber-card__head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .cyber-card__head .ix-card__title {
          margin: 0;
        }

        .cyber-card__shield {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 8px;
          background: var(--brand-soft);
          color: var(--brand-text);
          font-size: .78rem;
          transition: transform .4s var(--ease), background-color .3s var(--ease), color .3s var(--ease);
        }

        .cyber-card:hover .cyber-card__shield {
          background: var(--gradient-brand);
          color: var(--on-brand);
          transform: rotate(-10deg) scale(1.08);
        }

        .cyber-card .ix-media__tile {
          border-radius: 20px;
          width: 64px;
          height: 64px;
          font-size: 1.6rem;
        }

      `}</style>
    </>
  );
};

export default Cyber;
