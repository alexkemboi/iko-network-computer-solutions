import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/*
 * Lightweight, dependency-free carousel built on native CSS scroll-snap.
 * Desktop: arrow buttons + pagination dots. Touch: native swipe with snapping.
 * Keyboard: arrows are real buttons; the track is focusable and scrolls with
 * the arrow keys. Pages are derived from how many slides fit the viewport.
 */
const Carousel = ({ children, label, className = "", resetKey }) => {
  const viewportRef = useRef(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pages = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    const current = max <= 0 ? 0 : Math.round((el.scrollLeft / max) * (pages - 1));
    setPageCount(pages);
    setPage(current);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;

    let frame = null;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    };

    measure();
    el.addEventListener("scroll", onScroll, { passive: true });

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } else {
      window.addEventListener("resize", measure);
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", measure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [measure]);

  // When the slide set changes (e.g. a filter), jump back to the start.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: "auto" });
    measure();
  }, [resetKey, measure]);

  const scrollByPage = (dir) => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.95, behavior: "smooth" });
  };

  const goTo = (i) => {
    const el = viewportRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({
      left: pageCount <= 1 ? 0 : (max * i) / (pageCount - 1),
      behavior: "smooth",
    });
  };

  const slides = React.Children.toArray(children);

  return (
    <div
      className={`ix-carousel ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="ix-carousel__viewport" ref={viewportRef} tabIndex={0}>
        {slides.map((child, i) => (
          <div
            key={child.key ?? i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
          >
            {child}
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="ix-carousel__controls">
          <div className="ix-carousel__dots" role="group" aria-label={`${label} pages`}>
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                className="ix-carousel__dot"
                aria-label={`Go to page ${i + 1}`}
                aria-current={page === i ? "true" : undefined}
                onClick={() => goTo(i)}
              />
            ))}
            <span className="ix-carousel__progress" aria-hidden="true">
              {String(page + 1).padStart(2, "0")}
              <span> / {String(pageCount).padStart(2, "0")}</span>
            </span>
          </div>

          <div className="ix-carousel__arrows">
            <button
              type="button"
              className="ix-arrow"
              onClick={() => scrollByPage(-1)}
              disabled={!canPrev}
              aria-label="Previous"
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              className="ix-arrow"
              onClick={() => scrollByPage(1)}
              disabled={!canNext}
              aria-label="Next"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;
