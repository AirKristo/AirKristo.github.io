/* ==========================================================================
   Kristo — portfolio scripts
   1. Hero canvas: scatter plot + least-squares fit line that draws itself
   2. Scroll-reveal animations for sections
   3. Contact form submission (Formspree) with inline status messages
   ========================================================================== */

(function () {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. HERO CANVAS
     Generates a deterministic scatter of points around a true line
     y = mx + b, then draws the OLS fit through them. Deterministic
     (seeded) so the hero looks the same on every visit.
  ------------------------------------------------------------------ */
  const canvas = document.getElementById("hero-canvas");

  if (canvas) {
    const ctx = canvas.getContext("2d");

    // Simple seeded pseudo-random generator (mulberry32) so the
    // scatter is identical on every page load.
    function mulberry32(seed) {
      return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    const N_POINTS = 42;
    let points = [];       // {x, y} in unit space [0,1]
    let fit = { m: 0, b: 0 }; // OLS slope/intercept in unit space

    function generateData() {
      const rand = mulberry32(20260705); // seed: today's date, why not
      const trueM = 0.55;
      const trueB = 0.18;
      points = [];

      let sx = 0, sy = 0, sxy = 0, sxx = 0;
      for (let i = 0; i < N_POINTS; i++) {
        const x = rand();
        // Box-Muller-ish noise from two uniforms
        const noise =
          (rand() + rand() + rand() + rand() - 2) * 0.09; // ~N(0, 0.09)
        const y = trueB + trueM * x + noise;
        points.push({ x, y });
        sx += x; sy += y; sxy += x * y; sxx += x * x;
      }

      // Ordinary least squares — the fit line is actually computed,
      // not faked. A recruiter who checks the source deserves rigor.
      const n = N_POINTS;
      fit.m = (n * sxy - sx * sy) / (n * sxx - sx * sx);
      fit.b = (sy - fit.m * sx) / n;
    }

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    }

    // Map unit-space data into the right half of the hero, flipped
    // vertically (canvas y grows downward).
    function toScreen(p, rect) {
      const plotLeft = rect.width * 0.52;
      const plotWidth = rect.width * 0.44;
      const plotTop = rect.height * 0.12;
      const plotHeight = rect.height * 0.72;
      return {
        x: plotLeft + p.x * plotWidth,
        y: plotTop + (1 - p.y) * plotHeight,
      };
    }

    const ACCENT = "#2036D6";
    const POINT_COLOR = "rgba(15, 22, 38, 0.28)";

    function draw(progress) {
      // progress in [0, 1]: first ~60% reveals points, last ~40% draws line
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Points fade in one by one
      const pointProgress = Math.min(progress / 0.6, 1);
      const visibleCount = Math.floor(pointProgress * points.length);

      for (let i = 0; i < visibleCount; i++) {
        const s = toScreen(points[i], rect);
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = POINT_COLOR;
        ctx.fill();
      }

      // Fit line draws left-to-right
      if (progress > 0.6) {
        const lineProgress = (progress - 0.6) / 0.4;
        const x0 = 0.02, x1 = 0.02 + 0.96 * lineProgress;
        const p0 = toScreen({ x: x0, y: fit.b + fit.m * x0 }, rect);
        const p1 = toScreen({ x: x1, y: fit.b + fit.m * x1 }, rect);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    function animate() {
      const DURATION = 2400; // ms
      const start = performance.now();
      function frame(now) {
        const progress = Math.min((now - start) / DURATION, 1);
        draw(progress);
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    // The plot lives in the right half of the hero, so on narrow
    // screens (where text spans the full width) we skip it entirely.
    function isWideEnough() {
      return canvas.getBoundingClientRect().width >= 720;
    }

    function init() {
      generateData();
      resizeCanvas();
      if (!isWideEnough()) return; // mobile: no plot
      if (prefersReducedMotion) {
        draw(1); // static, fully drawn
      } else {
        animate();
      }
    }

    function handleResize() {
      const rect = resizeCanvas();
      if (isWideEnough()) {
        draw(1);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    }

    init();
    window.addEventListener("resize", handleResize);
  }

  /* ------------------------------------------------------------------
     2. SCROLL REVEALS
     Adds .reveal to each section's inner content, then reveals it
     when it enters the viewport.
  ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll(
    ".about-grid, .project-card, .contact-grid"
  );

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    revealTargets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     3. CONTACT FORM
     Posts to Formspree via fetch so the visitor never leaves the page.
     If the form action still contains the placeholder, show a helpful
     message instead of silently failing.
  ------------------------------------------------------------------ */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  if (form && status) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form-status mono";
      status.textContent = "";

      // Basic validation
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if (!name || !email || !message) {
        status.textContent = "Please fill in all three fields.";
        status.classList.add("error");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = "That email doesn't look right — mind checking it?";
        status.classList.add("error");
        return;
      }

      // Placeholder guard — reminds you to set up Formspree (see README)
      if (form.action.includes("YOUR_FORM_ID")) {
        status.textContent =
          "Form not wired up yet — replace YOUR_FORM_ID in index.html (see README).";
        status.classList.add("error");
        return;
      }

      status.textContent = "Sending…";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          form.reset();
          status.textContent = "Message sent. I'll get back to you soon.";
          status.classList.add("ok");
        } else {
          throw new Error("Non-OK response");
        }
      } catch (err) {
        status.textContent =
          "Something went wrong sending that. Email me directly instead.";
        status.classList.add("error");
      }
    });
  }
})();
