(() => {
  const body = document.body;

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");

  if (menuToggle && menu) {
    const closeMenu = () => {
      menu.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (window.innerWidth > 900) {
        return;
      }

      if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-year]").forEach((item) => {
    item.textContent = String(new Date().getFullYear());
  });

  const enableCursorGlow =
    window.matchMedia &&
    window.matchMedia("(pointer:fine)").matches &&
    !(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  if (enableCursorGlow) {
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.append(dot, ring);

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let rafId = 0;

    const drawCursor = () => {
      ringX += (pointerX - ringX) * 0.18;
      ringY += (pointerY - ringY) * 0.18;

      dot.style.transform = `translate3d(${pointerX - 6}px, ${pointerY - 6}px, 0)`;
      ring.style.transform = `translate3d(${ringX - 21}px, ${ringY - 21}px, 0)`;

      const stillMoving =
        Math.abs(pointerX - ringX) > 0.1 || Math.abs(pointerY - ringY) > 0.1;

      if (stillMoving) {
        rafId = window.requestAnimationFrame(drawCursor);
      } else {
        rafId = 0;
      }
    };

    const kickCursor = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(drawCursor);
      }
    };

    document.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      document.body.classList.add("cursor-glow-active");
      kickCursor();
    });

    document.addEventListener("pointerdown", () => {
      document.body.classList.add("cursor-hovering");
    });

    document.addEventListener("pointerup", () => {
      document.body.classList.remove("cursor-hovering");
    });

    document.addEventListener("mouseleave", () => {
      document.body.classList.remove("cursor-glow-active", "cursor-hovering");
    });

    document.addEventListener("mouseover", (event) => {
      const interactive = event.target.closest("a, button, .panel");
      document.body.classList.toggle("cursor-hovering", Boolean(interactive));
    });
  }

  document.querySelectorAll("[data-go-back]").forEach((button) => {
    button.addEventListener("click", () => {
      const referrer = document.referrer;
      const hasHistory = window.history.length > 1;
      const sameOriginReferrer = referrer && new URL(referrer).origin === window.location.origin;

      if (hasHistory && sameOriginReferrer) {
        window.history.back();
        return;
      }

      window.location.href = "index.html";
    });
  });

  const openModal = (modal) => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
  };

  const closeModal = (modal) => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal.is-open")) {
      body.classList.remove("modal-open");
    }
  };

  const resumeModal = document.getElementById("resume-modal");
  if (resumeModal) {
    document.querySelectorAll("[data-open-resume]").forEach((button) => {
      button.addEventListener("click", () => openModal(resumeModal));
    });

    resumeModal.querySelectorAll("[data-close-resume]").forEach((target) => {
      target.addEventListener("click", () => closeModal(resumeModal));
    });
  }

  const certificateCards = Array.from(document.querySelectorAll("[data-certificate-card]"));
  const certificateModal = document.getElementById("certificate-modal");
  const lightboxModal = document.getElementById("certificate-lightbox");

  if (certificateCards.length && certificateModal) {
    const modalImage = certificateModal.querySelector("[data-certificate-image]");
    const modalTitle = certificateModal.querySelector("[data-certificate-title]");
    const modalIssuer = certificateModal.querySelector("[data-certificate-issuer]");
    const modalDate = certificateModal.querySelector("[data-certificate-date]");
    const modalDescription = certificateModal.querySelector("[data-certificate-description]");
    const modalTags = certificateModal.querySelector("[data-certificate-tags]");
    const modalCount = certificateModal.querySelector("[data-certificate-count]");
    const modalOpenImage = certificateModal.querySelector("[data-certificate-open-image]");
    const thumbnailStrip = certificateModal.querySelector("[data-certificate-thumbnails]");
    const prevButton = certificateModal.querySelector("[data-certificate-prev]");
    const nextButton = certificateModal.querySelector("[data-certificate-next]");
    const zoomArea = certificateModal.querySelector("[data-certificate-zoom]");
    const zoomBtn = certificateModal.querySelector("[data-certificate-zoom-btn]");
    let currentIndex = 0;

    // Create thumbnail elements once
    if (thumbnailStrip) {
      thumbnailStrip.innerHTML = "";
      certificateCards.forEach((card, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "thumb-item";
        btn.title = card.dataset.title || `Certificate ${idx + 1}`;
        const img = document.createElement("img");
        img.src = card.dataset.image || "";
        img.alt = card.dataset.title || "";
        btn.appendChild(img);
        btn.addEventListener("click", () => {
          currentIndex = idx;
          renderCertificate();
        });
        thumbnailStrip.appendChild(btn);
      });
    }

    const openLightbox = () => {
      if (!lightboxModal) return;
      const card = certificateCards[currentIndex];
      const lightboxImg = lightboxModal.querySelector("[data-lightbox-image]");
      const lightboxCaption = lightboxModal.querySelector("[data-lightbox-caption]");
      if (lightboxImg) {
        lightboxImg.src = card.dataset.image || "";
        lightboxImg.alt = card.dataset.title || "";
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = `${card.dataset.title || ""} (${card.dataset.issuer || ""})`;
      }
      openModal(lightboxModal);
    };

    if (zoomArea) zoomArea.addEventListener("click", openLightbox);
    if (zoomBtn) zoomBtn.addEventListener("click", openLightbox);

    if (lightboxModal) {
      lightboxModal
        .querySelectorAll("[data-close-lightbox]")
        .forEach((target) => target.addEventListener("click", () => closeModal(lightboxModal)));
    }

    const renderCertificate = () => {
      const card = certificateCards[currentIndex];
      const tags = (card.dataset.tags || "")
        .split("|")
        .map((tag) => tag.trim())
        .filter(Boolean);

      // Smooth fade transition
      if (modalImage) {
        modalImage.style.opacity = "0.3";
        setTimeout(() => {
          modalImage.src = card.dataset.image || "";
          modalImage.alt = card.dataset.title || "Certificate preview";
          modalImage.style.opacity = "1";
        }, 150);
      }

      modalTitle.textContent = card.dataset.title || "Certificate";
      modalIssuer.innerHTML = `<i class="fa-solid fa-award"></i> ${card.dataset.issuer || ""}`;
      modalDate.innerHTML = `<i class="fa-regular fa-calendar-check"></i> ${card.dataset.date || ""}`;
      modalDescription.textContent = card.dataset.description || "";
      if (modalOpenImage) {
        modalOpenImage.href = card.dataset.image || "#";
      }
      modalCount.textContent = `${currentIndex + 1} / ${certificateCards.length}`;
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === certificateCards.length - 1;
      modalTags.innerHTML = "";

      tags.forEach((tag) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag;
        modalTags.appendChild(span);
      });

      // Update thumbnail active states
      if (thumbnailStrip) {
        const thumbs = thumbnailStrip.querySelectorAll(".thumb-item");
        thumbs.forEach((thumb, idx) => {
          if (idx === currentIndex) {
            thumb.classList.add("is-active");
            thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          } else {
            thumb.classList.remove("is-active");
          }
        });
      }
    };

    certificateCards.forEach((card, index) => {
      card.addEventListener("click", () => {
        currentIndex = index;
        renderCertificate();
        openModal(certificateModal);
      });
    });

    prevButton.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        renderCertificate();
      }
    });

    nextButton.addEventListener("click", () => {
      if (currentIndex < certificateCards.length - 1) {
        currentIndex += 1;
        renderCertificate();
      }
    });

    certificateModal
      .querySelectorAll("[data-close-certificate]")
      .forEach((target) => target.addEventListener("click", () => closeModal(certificateModal)));

    document.addEventListener("keydown", (event) => {
      if (resumeModal && resumeModal.classList.contains("is-open") && event.key === "Escape") {
        closeModal(resumeModal);
      }

      if (lightboxModal && lightboxModal.classList.contains("is-open") && event.key === "Escape") {
        closeModal(lightboxModal);
        return;
      }

      if (!certificateModal.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape") {
        closeModal(certificateModal);
      }

      if (event.key === "ArrowLeft" && currentIndex > 0) {
        currentIndex -= 1;
        renderCertificate();
      }

      if (event.key === "ArrowRight" && currentIndex < certificateCards.length - 1) {
        currentIndex += 1;
        renderCertificate();
      }
    });
  } else {
    document.addEventListener("keydown", (event) => {
      if (resumeModal && resumeModal.classList.contains("is-open") && event.key === "Escape") {
        closeModal(resumeModal);
      }
    });
  }

  // --- 1. 3D Mouse Tilt Motion for Cards (Subtle & Smooth) ---
  const tiltCards = document.querySelectorAll(".tilt-card, .project-feature, .skill-card, .credential-card");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -2.5;
      const rotateY = ((x - centerX) / centerX) * 2.5;

      card.style.transform = `perspective(1400px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px) scale3d(1.005, 1.005, 1.005)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // --- 2. Dynamic Project Category Filter Tabs ---
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-feature");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.dataset.filter;

      projectCards.forEach((card) => {
        const cat = card.dataset.category || "";
        if (filter === "all" || cat.includes(filter)) {
          card.style.display = "";
          card.style.opacity = "1";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // --- 3. Copy to Clipboard Toast Notification ---
  const toast = document.getElementById("copy-toast");
  const toastMsg = document.getElementById("toast-message");

  const showToast = (message) => {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add("is-visible");
    setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  };

  document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach((link) => {
    link.addEventListener("click", () => {
      const spanEl = link.querySelector("span");
      const text = spanEl ? spanEl.textContent : link.textContent;
      if (navigator.clipboard && text) {
        navigator.clipboard.writeText(text.trim()).then(() => {
          showToast(`Copied "${text.trim()}" to clipboard! ✨`);
        });
      }
    });
  });
})();
