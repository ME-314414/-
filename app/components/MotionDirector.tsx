"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });

export default function MotionDirector() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    root.classList.add("motion-ready");

    if (reduceMotion) {
      gsap.set(".opening-screen", { display: "none" });
      return () => root.classList.remove("motion-ready");
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktopMotion = gsap.matchMedia();

    const context = gsap.context(() => {
      const replay = (trigger: string | Element, start = "top 84%", end = "bottom 16%") => ({
        trigger,
        start,
        end,
        toggleActions: "play reverse play reverse" as const,
        invalidateOnRefresh: true,
      });

      gsap.set([".hero-title-top", ".hero-title-bottom"], { yPercent: 125, scaleY: 0.62, transformOrigin: "50% 100%" });
      gsap.set([".hero-overline", ".hero-title-foot", ".hero-side-copy", ".hero-disciplines > div", ".round-link", ".studio-launch", ".nav"], { opacity: 0 });
      gsap.set(".hero-video", { scale: 1.08, force3D: true });

      const opening = gsap.timeline({
        defaults: { ease: "power4.inOut" },
        onComplete: () => {
          document.body.style.overflow = previousOverflow;
          gsap.set(".opening-screen", { display: "none" });
        },
      });

      opening
        .fromTo(".opening-kicker", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 0.15)
        .fromTo(".opening-name span", { yPercent: 115 }, { yPercent: 0, duration: 1.05, ease: "expo.out" }, 0.28)
        .fromTo(".opening-name small", { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.05, ease: "expo.out" }, 0.4)
        .fromTo(".opening-progress i", { scaleX: 0 }, { scaleX: 1, duration: 1.35, ease: "power2.inOut" }, 0.25)
        .to(".opening-copy", { y: -34, opacity: 0, duration: 0.62, ease: "power3.in" }, 1.48)
        .to(".opening-panel-top", { yPercent: -102, duration: 1.35 }, 1.72)
        .to(".opening-panel-bottom", { yPercent: 102, duration: 1.35 }, 1.72)
        .to(".hero-video", { scale: 1, duration: 2.05, ease: "power3.out" }, 1.75)
        .to(".nav", { opacity: 1, duration: 0.85, ease: "power3.out" }, 2.12)
        .to(".hero-title-top", { yPercent: 0, scaleY: 1, duration: 1.48, ease: "expo.out" }, 2.18)
        .to(".hero-title-bottom", { yPercent: 0, scaleY: 1, duration: 1.58, ease: "expo.out" }, 2.34)
        .to(".hero-overline", { opacity: 1, y: 0, duration: 0.95, ease: "power3.out" }, 2.6)
        .fromTo(".hero-title-foot", { y: 24 }, { opacity: 1, y: 0, duration: 1.05, ease: "power3.out" }, 2.75)
        .fromTo(".hero-side-copy", { x: 55 }, { opacity: 1, x: 0, duration: 1.25, ease: "power4.out" }, 2.68)
        .fromTo(".hero-disciplines > div", { y: 25 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.12, ease: "power3.out" }, 2.88)
        .fromTo([".round-link", ".studio-launch"], { scale: 0.82 }, { opacity: 1, scale: 1, duration: 1, stagger: 0.14, ease: "power3.out" }, 3.02);

      gsap.timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.35,
          invalidateOnRefresh: true,
        },
      })
        .to(".hero-title-group", { yPercent: -16, scale: 0.965, opacity: 0.08, ease: "none" }, 0)
        .to(".hero-side-copy", { yPercent: -10, opacity: 0, ease: "none" }, 0)
        .to(".hero-disciplines", { yPercent: -35, opacity: 0, ease: "none" }, 0);

      gsap.utils.toArray<HTMLElement>(".motion-section-title").forEach((title) => {
        const parts = title.querySelectorAll("span, i");
        gsap.fromTo(parts, { yPercent: 120, scaleX: 0.72, skewX: -7, transformOrigin: "0% 100%" }, {
          yPercent: 0,
          scaleX: 1,
          skewX: 0,
          duration: 1.65,
          stagger: 0.13,
          ease: "expo.out",
          scrollTrigger: replay(title, "top 86%", "bottom 14%"),
        });
      });

      gsap.fromTo(".about .section-label", { x: -45, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, ease: "power4.out", scrollTrigger: replay(".about", "top 82%", "bottom 18%") });
      gsap.fromTo(".portrait-border-glow", { clipPath: "inset(0 100% 0 0 round 24px)", x: -35 }, { clipPath: "inset(0 0% 0 0 round 24px)", x: 0, duration: 1.7, ease: "power4.inOut", scrollTrigger: replay(".about-grid", "top 78%", "bottom 20%") });
      gsap.fromTo(".portrait-wrap img", { "--portrait-scale": 1.13 }, { "--portrait-scale": 1, duration: 1.9, ease: "power3.out", scrollTrigger: replay(".about-grid", "top 78%", "bottom 20%") });
      gsap.fromTo(".about-copy > *", { y: 55, opacity: 0 }, { y: 0, opacity: 1, duration: 1.15, stagger: 0.11, ease: "power4.out", scrollTrigger: replay(".about-copy", "top 78%", "bottom 20%") });

      gsap.fromTo(".work .section-label", { x: -45, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, ease: "power4.out", scrollTrigger: replay(".work", "top 84%", "bottom 14%") });
      gsap.fromTo(".gallery-heading-row > *", { y: 65, opacity: 0 }, { y: 0, opacity: 1, duration: 1.25, stagger: 0.16, ease: "power4.out", scrollTrigger: replay(".gallery-heading-row", "top 82%", "bottom 18%") });
      gsap.fromTo(".archive-drawer", { y: 70, opacity: 0, scaleY: 0.9, transformOrigin: "50% 100%" }, { y: 0, opacity: 1, scaleY: 1, duration: 1.25, stagger: 0.16, ease: "power4.out", scrollTrigger: replay(".archive-stack", "top 82%", "bottom 18%") });
      gsap.fromTo(".showcase-item", { clipPath: "inset(0 0 100% 0)", y: 34 }, { clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.3, stagger: 0.1, ease: "power4.inOut", scrollTrigger: replay(".showcase-grid", "top 85%", "bottom 15%") });
      gsap.fromTo(".showcase-item img", { "--showcase-scale": 1.13 }, { "--showcase-scale": 1, duration: 1.8, stagger: 0.09, ease: "power3.out", scrollTrigger: replay(".showcase-grid", "top 85%", "bottom 15%") });

      gsap.fromTo(".work-marquee", { clipPath: "inset(0 50% 0 50%)" }, { clipPath: "inset(0 0% 0 0%)", duration: 1.65, ease: "power4.inOut", scrollTrigger: replay(".work-marquee", "top 88%", "bottom 12%") });

      gsap.fromTo(".ability .section-label", { x: -45, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, ease: "power4.out", scrollTrigger: replay(".ability", "top 84%", "bottom 14%") });
      gsap.fromTo(".ability-title > *", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.16, ease: "power4.out", scrollTrigger: replay(".ability-title", "top 82%", "bottom 18%") });
      gsap.fromTo(".strength-card", { y: 90, opacity: 0, clipPath: "inset(100% 0 0 0)" }, {
        y: 0,
        opacity: 1,
        clipPath: "inset(0% 0 0 0)",
        duration: 1.35,
        stagger: 0.14,
        ease: "power4.out",
        scrollTrigger: {
          ...replay(".strength-grid", "top 84%", "bottom 16%"),
          // Keep the complete four-card system visible after its reveal. Reversing
          // a staggered timeline hid card 01 first while the grid was still onscreen.
          toggleActions: "play none restart none",
        },
      });

      gsap.fromTo(".contact-inner > *", { y: 85, opacity: 0 }, { y: 0, opacity: 1, duration: 1.35, stagger: 0.15, ease: "power4.out", scrollTrigger: replay(".contact-section", "top 72%", "bottom 15%") });
      gsap.to(".contact-glow", { yPercent: -18, ease: "none", scrollTrigger: { trigger: ".contact-section", start: "top bottom", end: "bottom top", scrub: 1.4 } });

      desktopMotion.add("(min-width: 768px)", () => {
        gsap.fromTo(".portrait-wrap img", { "--parallax-y": "-1.5%" }, { "--parallax-y": "4%", ease: "none", scrollTrigger: { trigger: ".about-grid", start: "top bottom", end: "bottom top", scrub: 1.8 } });
      });
    });

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 900);
    return () => {
      window.clearTimeout(refreshTimer);
      document.body.style.overflow = previousOverflow;
      desktopMotion.revert();
      context.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
