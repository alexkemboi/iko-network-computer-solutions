import React from "react";
import { FaLaptopCode, FaGraduationCap, FaFlask, FaBrain, FaChartLine, FaArrowRight } from "react-icons/fa";

// Intro for the standalone /what-we-do page (formerly the landing page "What We Do" block).
function Capabilities() {
  return (
    <section className="ix-section home-capabilities" id="capabilities">
      <div className="ix-container">
        <header className="home-capabilities__header">
          <span className="ix-eyebrow">WHAT WE DO</span>
          <h1 className="ix-title">Technology. Innovation. Impact.</h1>
          <p className="ix-lead">At <strong>IKONEX SYSTEMS</strong>, we combine software engineering, artificial intelligence, data analytics, research, and training to help businesses and organizations solve problems, improve efficiency, and unlock new opportunities.</p>
        </header>
        <div className="home-capabilities__grid">
          {[
            { icon: FaLaptopCode, title: "Software Development", text: "Custom digital solutions built around unique business processes.", href: "#software" },
            { icon: FaBrain, title: "Artificial Intelligence", text: "Intelligent systems and automation designed to improve productivity and decision making.", href: "/research" },
            { icon: FaChartLine, title: "Data Analytics", text: "Transforming business data into actionable insights for better decisions.", href: "/research" },
            { icon: FaFlask, title: "Research & Innovation", text: "Exploring emerging technologies and developing solutions for real world challenges.", href: "/research" },
            { icon: FaGraduationCap, title: "Software Development Training", text: "Practical, industry-focused training that builds real technical skills.", href: "/training" },
          ].map(({ icon: Icon, title, text, href }) => <a className="ix-card home-capability" href={href} key={title}>
            <span className="ix-icon ix-icon--soft"><Icon /></span>
            <h3 className="ix-card__title">{title}</h3>
            <p className="ix-card__text">{text}</p>
            <span className="home-capability__link">Explore <FaArrowRight aria-hidden="true" /></span>
          </a>)}
        </div>
      </div>
      <style>{`
        .home-capabilities { padding-top:clamp(58px,8vw,96px); }
        .home-capabilities__header { max-width:850px;text-align:center;margin:0 auto 38px; }
        .home-capabilities__header .ix-lead strong { color:var(--heading);font-weight:700; }
        .home-capabilities__grid { display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:18px; }
        .home-capability { grid-column:span 2;text-decoration:none;padding:24px;transition:transform .25s var(--ease),border-color .25s var(--ease),box-shadow .25s var(--ease); }
        .home-capability:nth-child(4) { grid-column:2 / span 2; }
        .home-capability:hover { transform:translateY(-4px); }
        .home-capability .ix-icon { width:46px;height:46px;margin:0 0 18px;border-radius:14px; }
        .home-capability .ix-card__title { font-size:1.08rem;font-weight:700; }
        .home-capability .ix-card__text { font-size:.9rem;margin-bottom:16px; }
        .home-capability__link { display:inline-flex;align-items:center;gap:8px;color:var(--brand-text);font-size:.88rem;font-weight:700; }
        @media(max-width:760px) { .home-capabilities__grid{grid-template-columns:repeat(2,minmax(0,1fr));} .home-capability,.home-capability:nth-child(4){grid-column:auto;} }
        @media(max-width:520px) { .home-capabilities__grid{grid-template-columns:1fr;} }
      `}</style>
    </section>
  );
}

export default Capabilities;
