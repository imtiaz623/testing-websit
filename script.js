/* ==========================================================================
   FreshDrop \u2014 Interactivity (clean redesign)
   ========================================================================== */

/* ==========================================================================
   FreshDrop \u2014 Interactivity (clean redesign)
   ========================================================================== */

/* Global toast utility -- intentionally outside DOMContentLoaded so other
   shared scripts (cart.js, wishlist.js, marketplace-ui.js) can call
   showToast() on any page, in any load order, as long as the page has a
   #toastContainer element. */
function showToast(message, type) {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast" + (type === "error" ? " error" : "");
  toast.textContent = message;
  toastContainer.appendChild(toast);
  requestAnimationFrame(function () { toast.classList.add("show"); });
  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () { toast.remove(); }, 300);
  }, 3200);
}

document.addEventListener("DOMContentLoaded", function () {

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function openModal(overlay) { overlay.classList.add("visible"); document.body.style.overflow = "hidden"; }
  function closeModal(overlay) { overlay.classList.remove("visible"); document.body.style.overflow = ""; }

  /* Shared demo order store (used by both the order workflow and tracking,
     which may not always load on the same page) */
  const orderStore = {};
  orderStore["FD-1001"] = { status: "out-for-delivery" };
  orderStore["FD-2045"] = { status: "delivered" };

  function generateOrderId() {
    let id;
    do { id = "FD-" + Math.floor(1000 + Math.random() * 9000); } while (orderStore[id]);
    return id;
  }

  /* ---------- Mobile hamburger menu ---------- */
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  const navCta = document.querySelector(".nav-cta");

  function closeMobileMenu() {
    hamburger.classList.remove("active");
    navLinks.classList.remove("open");
    if (navCta) navCta.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  }

  function toggleMobileMenu() {
    const isOpen = navLinks.classList.toggle("open");
    hamburger.classList.toggle("active", isOpen);
    if (navCta) navCta.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", toggleMobileMenu);
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (!link.closest(".dropdown")) closeMobileMenu();
      });
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) closeMobileMenu();
    });
  }

  /* ---------- "More" dropdown ---------- */
  const moreToggle = document.getElementById("moreToggle");
  const morePanel = document.getElementById("morePanel");

  function closeMoreDropdown() {
    morePanel.classList.remove("open");
    moreToggle.setAttribute("aria-expanded", "false");
  }

  if (moreToggle && morePanel) {
    moreToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = morePanel.classList.toggle("open");
      moreToggle.setAttribute("aria-expanded", String(isOpen));
    });

    morePanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMoreDropdown();
        closeMobileMenu();
      });
    });

    document.addEventListener("click", function (e) {
      if (!moreToggle.parentElement.contains(e.target)) closeMoreDropdown();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMoreDropdown();
    });
  }

  /* ---------- Dark mode toggle ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const THEME_KEY = "freshdrop-theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeToggle) themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  }

  (function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (err) { saved = null; }
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  })();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* storage unavailable */ }
    });
  }

  /* ---------- Hero slider (merged hero + auto-scrolling banner) ---------- */
  const heroTrack = document.getElementById("heroTrack");
  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroDots = document.querySelectorAll(".slider-dot");
  const heroPrev = document.getElementById("heroPrev");
  const heroNext = document.getElementById("heroNext");
  const heroSlider = document.querySelector(".hero-slider");

  if (heroTrack && heroSlides.length) {
    let currentSlide = 0;
    let sliderTimer = null;
    const SLIDE_INTERVAL = 5500;

    function goToSlide(index) {
      currentSlide = (index + heroSlides.length) % heroSlides.length;
      heroTrack.style.transform = "translateX(-" + (currentSlide * 100) + "%)";
      heroDots.forEach(function (dot, i) { dot.classList.toggle("active", i === currentSlide); });
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }
    function startAutoSlide() { stopAutoSlide(); sliderTimer = setInterval(nextSlide, SLIDE_INTERVAL); }
    function stopAutoSlide() { if (sliderTimer) clearInterval(sliderTimer); }

    heroNext.addEventListener("click", function () { nextSlide(); startAutoSlide(); });
    heroPrev.addEventListener("click", function () { prevSlide(); startAutoSlide(); });
    heroDots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goToSlide(parseInt(dot.getAttribute("data-slide"), 10));
        startAutoSlide();
      });
    });

    heroSlider.addEventListener("mouseenter", stopAutoSlide);
    heroSlider.addEventListener("mouseleave", startAutoSlide);
    heroSlider.addEventListener("focusin", stopAutoSlide);
    heroSlider.addEventListener("focusout", startAutoSlide);

    goToSlide(0);
    startAutoSlide();
  }

  /* ---------- WhatsApp direct order buttons ---------- */
  const WHATSAPP_NUMBER = "911234567890"; // TODO: replace with your real WhatsApp business number

  const categoryLabels = {
    produce: "Fruits & Vegetables", bakery: "Bakery", dairy: "Dairy & Eggs",
    meat: "Meat & Seafood", pantry: "Pantry Staples", beverages: "Beverages"
  };

  document.querySelectorAll(".whatsapp-btn[data-whatsapp-category]").forEach(function (btn) {
    const category = btn.getAttribute("data-whatsapp-category");
    const label = categoryLabels[category] || category;
    const message = "Hi FreshDrop! I'd like to place an order from " + label + ".";
    btn.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  });

  /* ---------- Shop by Category: render + search ---------- */
  const categoryGrid = document.getElementById("categoryGrid");
  const categorySearch = document.getElementById("categorySearch");
  const noResults = document.getElementById("noResults");

  if (categoryGrid && typeof PRODUCT_CATEGORIES !== "undefined") {
    categoryGrid.innerHTML = PRODUCT_CATEGORIES.map(function (cat) {
      return (
        '<a href="store.html?category=' + cat.id + '" class="category-card" data-category="' + cat.id + '" style="align-items:center;text-align:center;">' +
          '<div class="category-icon" style="background:var(--lime-soft); font-size:1.7rem; margin:0 auto 14px;">' + cat.icon + '</div>' +
          '<h3>' + cat.label + '</h3>' +
        '</a>'
      );
    }).join("");
  }

  const allCategoryCards = document.querySelectorAll(".category-card");

  function applyCategoryFilters() {
    const query = (categorySearch.value || "").trim().toLowerCase();
    let visibleCount = 0;

    allCategoryCards.forEach(function (card) {
      const title = card.querySelector("h3").textContent.toLowerCase();
      const show = !query || title.includes(query);
      card.classList.toggle("filtered-out", !show);
      if (show) visibleCount++;
    });

    noResults.hidden = visibleCount !== 0;
  }

  if (categorySearch) categorySearch.addEventListener("input", applyCategoryFilters);

  /* ---------- Reviews: render + "Write a review" modal ---------- */
  const reviewGrid = document.getElementById("reviewGrid");

  if (reviewGrid) {
    const reviews = [
      { name: "Amara Okafor", initials: "AO", rating: 5, text: "Groceries arrived cold and perfectly packed, well within the promised window. My produce has never looked fresher.", meta: "Verified customer" },
      { name: "Daniel Cho", initials: "DC", rating: 5, text: "The delivery tracker made it easy to plan my evening \u2014 I knew exactly when to expect the driver.", meta: "Verified customer" },
      { name: "Priya Nair", initials: "PN", rating: 4, text: "Great selection of pantry staples and the bakery items are always fresh. Wish there were more delivery windows on weekends.", meta: "Verified customer" }
    ];

    var renderStars = function (rating) {
      let stars = "";
      for (let i = 1; i <= 5; i++) stars += i <= rating ? "\u2605" : "\u2606";
      return stars;
    };

    var renderReviews = function (highlightFirst) {
      reviewGrid.innerHTML = "";
      reviews.forEach(function (r, index) {
        const card = document.createElement("article");
        card.className = "review-card" + (highlightFirst && index === 0 ? " new-review" : "");
        card.innerHTML =
          '<div class="review-stars">' + renderStars(r.rating) + '</div>' +
          '<p class="review-text">' + escapeHtml(r.text) + '</p>' +
          '<div class="review-author">' +
            '<span class="review-avatar">' + escapeHtml(r.initials) + '</span>' +
            '<div><div class="review-author-name">' + escapeHtml(r.name) + '</div>' +
            '<div class="review-author-meta">' + escapeHtml(r.meta) + '</div></div>' +
          '</div>';
        reviewGrid.appendChild(card);
      });
    };

    renderReviews(false);

    const reviewModalOverlay = document.getElementById("reviewModalOverlay");
    const writeReviewBtn = document.getElementById("writeReviewBtn");
    const reviewModalClose = document.getElementById("reviewModalClose");
    const reviewForm = document.getElementById("reviewForm");
    const starRating = document.getElementById("starRating");
    const starButtons = starRating.querySelectorAll(".star");

    writeReviewBtn.addEventListener("click", function () { openModal(reviewModalOverlay); });
    reviewModalClose.addEventListener("click", function () { closeModal(reviewModalOverlay); });
    reviewModalOverlay.addEventListener("click", function (e) { if (e.target === reviewModalOverlay) closeModal(reviewModalOverlay); });

    starButtons.forEach(function (star) {
      star.addEventListener("click", function () {
        const value = parseInt(star.getAttribute("data-value"), 10);
        starRating.setAttribute("data-value", String(value));
        starButtons.forEach(function (s) {
          s.classList.toggle("filled", parseInt(s.getAttribute("data-value"), 10) <= value);
        });
      });
    });

    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("reviewName").value.trim();
      const text = document.getElementById("reviewText").value.trim();
      const rating = parseInt(starRating.getAttribute("data-value"), 10);

      if (!name || !text || !rating) {
        showToast("Please add your name, a rating, and a short review.", "error");
        return;
      }

      const initials = name.split(" ").map(function (n) { return n[0]; }).join("").slice(0, 2).toUpperCase();
      reviews.unshift({ name: name, initials: initials || "FD", rating: rating, text: text, meta: "Just now" });
      renderReviews(true);
      reviewForm.reset();
      starButtons.forEach(function (s) { s.classList.remove("filled"); });
      starRating.setAttribute("data-value", "0");
      closeModal(reviewModalOverlay);
      showToast("Thanks! Your review has been posted.", "success");
    });
  }

  /* ---------- Multi-step order workflow ---------- */
  const orderForm = document.getElementById("orderForm");

  if (orderForm) {
    const stepperItems = document.querySelectorAll(".stepper-item");
    const formSteps = document.querySelectorAll(".form-step");
    const prevStepBtn = document.getElementById("prevStepBtn");
    const nextStepBtn = document.getElementById("nextStepBtn");
    const submitOrderBtn = document.getElementById("submitOrderBtn");
    const reviewSummary = document.getElementById("reviewSummary");

    let currentStep = 1;
    const totalSteps = formSteps.length;
    const stepFieldIds = {
      1: ["category", "notes", "quantity"],
      2: ["name", "email", "phone", "address", "deliveryTime"],
      3: ["confirmAccuracy"]
    };

    var validateStep = function (step) {
      const ids = stepFieldIds[step] || [];
      for (let i = 0; i < ids.length; i++) {
        const field = document.getElementById(ids[i]);
        if (field && !field.checkValidity()) { field.reportValidity(); return false; }
      }
      return true;
    };

    var renderReviewSummary = function () {
      const categorySelect = document.getElementById("category");
      const categoryLabel = categorySelect.options[categorySelect.selectedIndex] ? categorySelect.options[categorySelect.selectedIndex].text : "-";
      const quantitySelect = document.getElementById("quantity");
      const quantityLabel = quantitySelect.options[quantitySelect.selectedIndex] ? quantitySelect.options[quantitySelect.selectedIndex].text : "-";
      const timeSelect = document.getElementById("deliveryTime");
      const timeLabel = timeSelect.options[timeSelect.selectedIndex] ? timeSelect.options[timeSelect.selectedIndex].text : "-";

      const rows = [
        ["Category", categoryLabel],
        ["Basket size", quantityLabel],
        ["Name", document.getElementById("name").value || "-"],
        ["Address", document.getElementById("address").value || "-"],
        ["Delivery window", timeLabel]
      ];

      reviewSummary.innerHTML = rows.map(function (r) {
        return '<div class="review-summary-row"><dt>' + escapeHtml(r[0]) + '</dt><dd>' + escapeHtml(r[1]) + '</dd></div>';
      }).join("");
    };

    var goToStep = function (step) {
      currentStep = step;
      formSteps.forEach(function (el) { el.classList.toggle("active", parseInt(el.getAttribute("data-step"), 10) === step); });
      stepperItems.forEach(function (el) {
        const s = parseInt(el.getAttribute("data-step"), 10);
        el.classList.toggle("active", s === step);
        el.classList.toggle("completed", s < step);
      });
      prevStepBtn.disabled = step === 1;
      nextStepBtn.hidden = step === totalSteps;
      submitOrderBtn.hidden = step !== totalSteps;
      if (step === totalSteps) renderReviewSummary();
    };

    nextStepBtn.addEventListener("click", function () {
      if (!validateStep(currentStep)) return;
      if (currentStep < totalSteps) goToStep(currentStep + 1);
    });
    prevStepBtn.addEventListener("click", function () {
      if (currentStep > 1) goToStep(currentStep - 1);
    });

    const orderModalOverlay = document.getElementById("orderModalOverlay");
    const orderIdDisplay = document.getElementById("orderIdDisplay");
    const orderModalClose = document.getElementById("orderModalClose");

    orderForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateStep(3)) return;

      const orderId = generateOrderId();
      orderStore[orderId] = { status: "placed" };
      orderIdDisplay.textContent = orderId;
      openModal(orderModalOverlay);
      orderForm.reset();
      goToStep(1);
    });

    orderModalClose.addEventListener("click", function () {
      closeModal(orderModalOverlay);
      const trackingIdField = document.getElementById("trackingId");
      if (trackingIdField) trackingIdField.value = orderIdDisplay.textContent;
      const trackSection = document.getElementById("track");
      if (trackSection) trackSection.scrollIntoView({ behavior: "smooth" });
    });

    orderModalOverlay.addEventListener("click", function (e) { if (e.target === orderModalOverlay) closeModal(orderModalOverlay); });

    goToStep(1);
  }

  /* ---------- Order tracking ---------- */
  const trackingForm = document.getElementById("trackingForm");

  if (trackingForm) {
    const trackingIdInput = document.getElementById("trackingId");
    const trackingMobileInput = document.getElementById("trackingMobile");
    const trackingResult = document.getElementById("trackingResult");
    const trackingOrderId = document.getElementById("trackingOrderId");
    const trackingStatusText = document.getElementById("trackingStatusText");
    const timelineSteps = document.querySelectorAll(".timeline-step");
    const sampleIdBtn = document.getElementById("sampleIdBtn");

    const statusOrder = ["placed", "preparing", "out-for-delivery", "delivered"];
    const statusMessages = {
      placed: "Order received \u2014 preparing to pick your items.",
      preparing: "Your basket is being hand-picked and packed cold.",
      "out-for-delivery": "Your driver is on the way!",
      delivered: "Delivered \u2014 enjoy your fresh groceries!"
    };

    var deterministicStatusFromId = function (id) {
      let sum = 0;
      for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
      return statusOrder[sum % statusOrder.length];
    };

    var renderTimeline = function (status) {
      const statusIndex = statusOrder.indexOf(status);
      timelineSteps.forEach(function (step) {
        const stepIndex = statusOrder.indexOf(step.getAttribute("data-status"));
        step.classList.remove("done", "current");
        if (stepIndex < statusIndex) step.classList.add("done");
        if (stepIndex === statusIndex) step.classList.add("current");
      });
      trackingStatusText.textContent = statusMessages[status];
    };

    var trackOrder = function (rawId, mobile) {
      const id = rawId.trim().toUpperCase();
      if (!id) { showToast("Enter an order ID to track your delivery.", "error"); return; }
      if (!mobile || !mobile.trim()) { showToast("Enter the mobile number used for this order.", "error"); return; }

      /* Check the persistent order store first (real orders placed at checkout),
         then fall back to the seeded in-memory demo orders, then a deterministic
         demo status for any other well-formed ID so the feature is explorable. */
      let order = (typeof ordersGet === "function" ? ordersGet(id) : null) || orderStore[id];
      if (!order) {
        if (!/^FD-\d{3,5}$/.test(id)) {
          showToast("We couldn't find an order with that ID.", "error");
          trackingResult.hidden = true;
          return;
        }
        order = { status: deterministicStatusFromId(id) };
      }

      trackingOrderId.textContent = id;
      renderTimeline(order.status);
      trackingResult.hidden = false;
      trackingResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    trackingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      trackOrder(trackingIdInput.value, trackingMobileInput.value);
    });
    if (sampleIdBtn) {
      sampleIdBtn.addEventListener("click", function () {
        trackingIdInput.value = "FD-1001";
        trackingMobileInput.value = "03001234567";
        trackOrder("FD-1001", "03001234567");
      });
    }
  }

  /* ---------- Rider registration form ---------- */
  const riderForm = document.getElementById("riderForm");
  const riderSuccess = document.getElementById("riderSuccess");
  const riderApplyAgain = document.getElementById("riderApplyAgain");
  const riderFile = document.getElementById("riderFile");
  const fileUploadLabel = document.getElementById("fileUploadLabel");
  const fileUploadText = document.getElementById("fileUploadText");
  const riderSuccessText = document.getElementById("riderSuccessText");

  if (riderFile) {
    riderFile.addEventListener("change", function () {
      if (riderFile.files && riderFile.files.length > 0) {
        fileUploadText.textContent = riderFile.files[0].name;
        fileUploadLabel.classList.add("has-file");
      } else {
        fileUploadText.textContent = "Choose a file (PDF, DOC, or image)";
        fileUploadLabel.classList.remove("has-file");
      }
    });
  }

  if (riderForm) {
    riderForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!riderForm.checkValidity()) { riderForm.reportValidity(); return; }

      const name = document.getElementById("riderName").value.trim();
      riderSuccessText.textContent = "Thanks, " + name + "! We've received your application and our team will reach out within 2 business days.";
      riderForm.hidden = true;
      riderSuccess.hidden = false;
      showToast("Rider application submitted successfully!", "success");
    });
  }

  if (riderApplyAgain) {
    riderApplyAgain.addEventListener("click", function () {
      riderForm.reset();
      fileUploadText.textContent = "Choose a file (PDF, DOC, or image)";
      fileUploadLabel.classList.remove("has-file");
      riderSuccess.hidden = true;
      riderForm.hidden = false;
    });
  }

  /* ---------- Delivery area checker ---------- */
  const checkerForm = document.getElementById("checkerForm");
  const checkerInput = document.getElementById("checkerInput");
  const checkerResult = document.getElementById("checkerResult");

  const serviceableAreas = [
    "downtown", "north side", "south side", "east end", "west end",
    "lakeview", "springfield", "riverside", "maple street",
    "400001", "400002", "400003", "10001", "10002", "90001"
  ];

  if (checkerForm) {
    checkerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const query = checkerInput.value.trim().toLowerCase();
      if (!query) { showToast("Enter an area name or pincode to check.", "error"); return; }

      const isServiceable = serviceableAreas.some(function (area) {
        return query.includes(area) || area.includes(query);
      });

      checkerResult.hidden = false;
      checkerResult.classList.remove("success", "error");

      if (isServiceable) {
        checkerResult.classList.add("success");
        checkerResult.textContent = "Great news! FreshDrop delivers to \"" + checkerInput.value.trim() + "\".";
      } else {
        checkerResult.classList.add("error");
        checkerResult.textContent = "We don't deliver to \"" + checkerInput.value.trim() + "\" just yet. Subscribe below to know when we expand!";
      }
    });
  }

  /* ---------- Newsletter signup ---------- */
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailField = document.getElementById("newsletterEmail");
      if (!emailField.checkValidity()) { emailField.reportValidity(); return; }
      showToast("You're subscribed! Watch your inbox for weekly picks.", "success");
      newsletterForm.reset();
    });
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      backToTop.classList.toggle("visible", window.scrollY > 480);
    });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Sticky navbar shadow on scroll ---------- */
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", function () {
    navbar.style.boxShadow = window.scrollY > 8 ? "0 2px 12px rgba(27, 67, 50, 0.08)" : "none";
  });

  /* ---------- Login / Register modal ---------- */
  const authModalOverlay = document.getElementById("authModalOverlay");
  const authToggle = document.getElementById("authToggle");
  const authModalClose = document.getElementById("authModalClose");
  const loginTabBtn = document.getElementById("loginTabBtn");
  const registerTabBtn = document.getElementById("registerTabBtn");
  const loginPanel = document.getElementById("loginPanel");
  const registerPanel = document.getElementById("registerPanel");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (authToggle) {
    authToggle.addEventListener("click", function () { openModal(authModalOverlay); });
  }
  if (authModalClose) {
    authModalClose.addEventListener("click", function () { closeModal(authModalOverlay); });
  }
  if (authModalOverlay) {
    authModalOverlay.addEventListener("click", function (e) {
      if (e.target === authModalOverlay) closeModal(authModalOverlay);
    });
  }

  function switchAuthTab(tab) {
    const showLogin = tab === "login";
    loginTabBtn.classList.toggle("active", showLogin);
    registerTabBtn.classList.toggle("active", !showLogin);
    loginTabBtn.setAttribute("aria-selected", String(showLogin));
    registerTabBtn.setAttribute("aria-selected", String(!showLogin));
    loginPanel.hidden = !showLogin;
    registerPanel.hidden = showLogin;
  }

  if (loginTabBtn && registerTabBtn) {
    loginTabBtn.addEventListener("click", function () { switchAuthTab("login"); });
    registerTabBtn.addEventListener("click", function () { switchAuthTab("register"); });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!loginForm.checkValidity()) { loginForm.reportValidity(); return; }
      showToast("Logged in successfully! Redirecting to your account...", "success");
      closeModal(authModalOverlay);
      setTimeout(function () { window.location.href = "account.html"; }, 900);
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!registerForm.checkValidity()) { registerForm.reportValidity(); return; }
      showToast("Account created! Redirecting to your account...", "success");
      closeModal(authModalOverlay);
      setTimeout(function () { window.location.href = "account.html"; }, 900);
    });
  }

  /* ---------- Contact form ---------- */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
      showToast("Message sent! We'll get back to you soon.", "success");
      contactForm.reset();
    });
  }

  /* ---------- Scroll-reveal animations ---------- */
  const revealTargets = document.querySelectorAll(
    ".category-card, .why-card, .step-card, .review-card, .value-item, .contact-channel, .accordion-item"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Header search (desktop + mobile) ---------- */
  const navSearchInput = document.getElementById("navSearchInput");
  if (navSearchInput) {
    navSearchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && navSearchInput.value.trim()) {
        window.location.href = "store.html?q=" + encodeURIComponent(navSearchInput.value.trim());
      }
    });
  }

  const mobileSearchToggle = document.getElementById("mobileSearchToggle");
  const mobileSearchBar = document.getElementById("mobileSearchBar");
  const mobileSearchForm = document.getElementById("mobileSearchForm");
  const mobileSearchInput = document.getElementById("mobileSearchInput");

  if (mobileSearchToggle && mobileSearchBar) {
    mobileSearchToggle.addEventListener("click", function () {
      mobileSearchBar.hidden = !mobileSearchBar.hidden;
      if (!mobileSearchBar.hidden) mobileSearchInput.focus();
    });
  }

  if (mobileSearchForm) {
    mobileSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (mobileSearchInput.value.trim()) {
        window.location.href = "store.html?q=" + encodeURIComponent(mobileSearchInput.value.trim());
      }
    });
  }

  /* ---------- Highlight active bottom-nav item by current page ---------- */
  const currentPage = (window.location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".bottom-nav-item").forEach(function (link) {
    const linkPage = link.getAttribute("href").split("?")[0].split("#")[0];
    link.classList.toggle("active", linkPage === currentPage || (currentPage === "" && linkPage === "index.html"));
  });

  /* ---------- Homepage product showcases (Flash Deals, Trending, Best Sellers, New Arrivals) ---------- */
  if (typeof PRODUCTS !== "undefined" && typeof renderProductGrid === "function") {
    const byBadge = function (badge, limit) {
      return PRODUCTS.filter(function (p) { return p.badges.indexOf(badge) !== -1; }).slice(0, limit || 4);
    };
    const renderShowcases = function () {
      renderProductGrid(document.getElementById("flashDealsGrid"), byBadge("flashDeal", 4));
      renderProductGrid(document.getElementById("trendingGrid"), byBadge("trending", 4));
      renderProductGrid(document.getElementById("bestSellersGrid"), byBadge("bestseller", 4));
      renderProductGrid(document.getElementById("newArrivalsGrid"), byBadge("newArrival", 4));
    };
    renderShowcases();
    if (typeof syncProductsFromFirestore === "function") {
      syncProductsFromFirestore(renderShowcases);
    }
  }
});
