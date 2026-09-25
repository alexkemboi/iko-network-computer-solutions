import React from "react";
import { motion } from "framer-motion";

import {
  FaLaptopCode,
  FaCode,
  FaReact,
  FaDatabase,
  FaServer,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaGraduationCap,
  FaLayerGroup,
  FaHtml5,
  FaGitAlt,
  FaNodeJs,
  FaLock,
  FaShieldAlt,
  FaPlug,
  FaSitemap,
  FaDocker,
  FaGlobe,
  FaClipboardCheck,
  FaBug,
  FaSyncAlt,
  FaBookReader,
} from "react-icons/fa";
import SectionHeader, { useRevealVariants } from "../shared/SectionHeader";
import Carousel from "../shared/Carousel";
import CardVisual from "../shared/CardVisual";
import { CardActions, SectionCta } from "../shared/CardActions";

export const trainings = [
  {
    title: "Website Development Training",
    icon: FaReact,
    description:
      "Learn modern frontend and full stack web development using industry-standard technologies and real-world projects.",
    features: [
      "HTML, CSS & JavaScript",
      "Responsive UI Design",
      "React Frontend Development",
      "REST APIs & Fetch",
      "Git & GitHub Workflow",
    ],
  },

  {
    title: "Full Stack Software Development",
    icon: FaLaptopCode,
    description:
      "Master full stack application development from frontend interfaces to backend APIs and databases.",
    features: [
      "React & Component Architecture",
      "Node.js & Express APIs",
      "Authentication & JWT",
      "MySQL Database Design",
      "Full Stack Integration",
    ],
  },

  {
    title: "Backend & API Engineering",
    icon: FaServer,
    description:
      "Build scalable backend systems, APIs and enterprise-grade server applications using modern development practices.",
    features: [
      "REST API Development",
      "CRUD Operations",
      "Middleware & Validation",
      "Error Handling",
      "API Security Best Practices",
    ],
  },

  {
    title: "Database & System Design",
    icon: FaDatabase,
    description:
      "Understand database architecture, system scalability and clean software engineering principles.",
    features: [
      "SQL & Relational Databases",
      "Schema Relationships",
      "System Design Fundamentals",
      "Query Optimization",
      "Software Architecture",
    ],
  },

  {
    title: "Deployment & DevOps Training",
    icon: FaCloudUploadAlt,
    description:
      "Learn how to deploy, manage and maintain modern web applications in production environments.",
    features: [
      "Frontend & Backend Hosting",
      "CI/CD Fundamentals",
      "Environment Variables",
      "Docker & VPS Basics",
      "Domain & DNS Configuration",
    ],
  },

  {
    title: "Software Development Lifecycle",
    icon: FaCode,
    description:
      "Understand the complete software development lifecycle from planning and design to deployment and maintenance.",
    features: [
      "Planning & Analysis",
      "System Design",
      "Testing & QA",
      "Deployment Strategies",
      "Maintenance & Monitoring",
    ],
  },
];

/* Illustration chips — technologies already named in each programme */
const CHIPS = {
  "Website Development Training": [FaHtml5, FaGitAlt, FaGlobe],
  "Full Stack Software Development": [FaReact, FaNodeJs, FaLock],
  "Backend & API Engineering": [FaPlug, FaShieldAlt, FaBug],
  "Database & System Design": [FaSitemap, FaLayerGroup, FaDatabase],
  "Deployment & DevOps Training": [FaDocker, FaSyncAlt, FaGlobe],
  "Software Development Lifecycle": [FaClipboardCheck, FaBug, FaSyncAlt],
};

const TrainingComponent = () => {
  const { cardVariants } = useRevealVariants(0.1);

  return (
    <section className="ix-section ix-section--alt tone-cream training-section" id="training">
      <div className="ix-glow ix-glow--tl"></div>
      <div className="ix-glow ix-glow--br"></div>

      <div className="ix-container">
        <SectionHeader
          eyebrow="PROFESSIONAL TRAINING PROGRAMS"
          icon={FaGraduationCap}
          title={
            <>
              Website & Software
              <span> Development Training</span>
            </>
          }
        >
          Practical, industry-focused training programs designed to equip
          students and professionals with modern software engineering and full
          stack development skills.
        </SectionHeader>

        <Carousel label="Training programs">
          {trainings.map((training, index) => {
            const item = {
              price: training.price,
              name: training.title,
              icon: training.icon,
              section: "Training",
              description: training.description,
              features: training.features,
              featuresLabel: "What you'll learn",
            };

            return (
              <motion.article
                key={training.title}
                className="ix-card course-card"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
              >
                <CardVisual
                  icon={training.icon}
                  chips={CHIPS[training.title]}
                  pattern="waves"
                  badge={`Program ${String(index + 1).padStart(2, "0")}`}
                  badgeIcon={FaGraduationCap}
                />

                <h3 className="ix-card__title">{training.title}</h3>

                <ul className="ix-meta" aria-label="Program details">
                  <li>
                    <FaBookReader aria-hidden="true" />
                    {training.features.length} core topics
                  </li>
                  <li>
                    <FaLaptopCode aria-hidden="true" />
                    Practical
                  </li>
                </ul>

                <p className="ix-card__text">{training.description}</p>

                <ul className="ix-list course-card__topics">
                  {training.features.slice(0, 3).map((feature) => (
                    <li key={feature}>
                      <FaCheckCircle aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="ix-card__footer">
                  <CardActions item={item} primaryLabel="View Program" orderLabel="Enroll Now" />
                </div>
              </motion.article>
            );
          })}
        </Carousel>

        <SectionCta text="Training a team or planning a class intake?" label="Talk to us" />
      </div>

      <style>{`
        .course-card .ix-card__title {
          font-size: 1.2rem;
          min-height: 2.6em;
          margin-bottom: 12px;
        }

        .course-card .ix-card__text {
          font-size: .93rem;
          margin-bottom: 16px;
        }

        .course-card__topics li {
          font-size: .9rem;
        }
      `}</style>
    </section>
  );
};

export default TrainingComponent;
