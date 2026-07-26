(() => {
  const root = document.documentElement;
  const langToggle = document.getElementById("langToggle");
  const header = document.getElementById("siteHeader");

  const setLang = (lang) => {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    if (langToggle) langToggle.textContent = lang === "de" ? "EN" : "DE";
    try {
      localStorage.setItem("lakehouse-lang", lang);
    } catch (_) {
      /* ignore */
    }
  };

  const saved = (() => {
    try {
      return localStorage.getItem("lakehouse-lang");
    } catch (_) {
      return null;
    }
  })();

  setLang(saved === "en" ? "en" : "de");

  langToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-lang") === "de" ? "en" : "de";
    setLang(next);
  });

  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const amenities = document.querySelectorAll("#amenities li");
  if (amenities.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    amenities.forEach((el, i) => {
      el.style.transitionDelay = `${i * 70}ms`;
      io.observe(el);
    });
  } else {
    amenities.forEach((el) => el.classList.add("is-in"));
  }

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-copy");
      const box = document.getElementById(id);
      if (!box) return;
      const text = box.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add("copied");
        const prev = btn.textContent;
        btn.textContent = root.getAttribute("data-lang") === "en" ? "Copied" : "Kopiert";
        setTimeout(() => {
          btn.classList.remove("copied");
          btn.textContent = prev;
        }, 1600);
      } catch (_) {
        const range = document.createRange();
        range.selectNodeContents(box);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  });
})();
