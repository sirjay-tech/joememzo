const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

function handleScroll() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${Math.min(value, 100)}%`;
}

handleScroll();
window.addEventListener("scroll", handleScroll, { passive: true });

function closeNavigation() {
  menuToggle?.setAttribute("aria-expanded", "false");
  siteNav?.classList.remove("is-open");
  document.body.classList.remove("nav-open");
}

menuToggle?.addEventListener("click", () => {
  const opening = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(opening));
  siteNav?.classList.toggle("is-open", opening);
  document.body.classList.toggle("nav-open", opening);
});

siteNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
window.addEventListener("resize", () => {
  if (window.innerWidth > 820) closeNavigation();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNavigation();
});

const revealItems = document.querySelectorAll(".reveal");
revealItems.forEach((item) => {
  const delay = Number(item.dataset.delay || 0);
  item.style.setProperty("--reveal-delay", `${delay}ms`);
});

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -35px" },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const filterButtons = document.querySelectorAll("[data-filter]");
const foodCards = document.querySelectorAll("[data-category]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    foodCards.forEach((card, index) => {
      const visible = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !visible);
      card.classList.remove("is-entering");
      if (visible) {
        window.setTimeout(() => card.classList.add("is-entering"), reducedMotion ? 0 : index * 35);
      }
    });
  });
});

const eventContent = {
  wedding: {
    kicker: "Planning a wedding?",
    text: "Let Joememzo help you welcome your guests with delicious, quality food made for your celebration.",
  },
  birthday: {
    kicker: "Planning a birthday?",
    text: "Bring everyone together around good food and let Joememzo cater for the celebration.",
  },
  workshop: {
    kicker: "Hosting a workshop?",
    text: "Keep your participants refreshed and focused with food prepared for your gathering.",
  },
  other: {
    kicker: "Planning something else?",
    text: "Tell Joememzo about the occasion and start planning food that fits your gathering.",
  },
};

const eventButtons = document.querySelectorAll("[data-event]");
const responseKicker = document.querySelector(".response-kicker");
const responseText = document.querySelector(".response-text");

eventButtons.forEach((button) => {
  button.addEventListener("click", () => {
    eventButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    const content = eventContent[button.dataset.event];
    if (content && responseKicker && responseText) {
      responseKicker.textContent = content.kicker;
      responseText.textContent = content.text;
    }
  });
});

const orderForm = document.querySelector("[data-order-form]");
const categorySelect = document.querySelector("[data-order-category]");
const destinationSelect = document.querySelector("[data-order-destination]");
const noteInput = document.querySelector("[data-order-note]");
const previewCategory = document.querySelector("[data-preview-category]");
const previewDestination = document.querySelector("[data-preview-destination]");
const previewNote = document.querySelector("[data-preview-note]");
const copyLabel = document.querySelector("[data-copy-label]");
const toast = document.querySelector("[data-toast]");

function updateOrderPreview() {
  const category = categorySelect?.value || "Breakfast";
  const destination = destinationSelect?.value || "Home";
  const note = noteInput?.value.trim() || "I’d like to know what is available.";
  if (previewCategory) previewCategory.textContent = category;
  if (previewDestination) previewDestination.textContent = destination.toLowerCase();
  if (previewNote) previewNote.textContent = note;
}

[categorySelect, destinationSelect, noteInput].forEach((field) => {
  field?.addEventListener("input", updateOrderPreview);
});

function makeEnquiry() {
  const category = categorySelect?.value || "Breakfast";
  const destination = destinationSelect?.value || "Home";
  const note = noteInput?.value.trim();
  return [
    "Hello Joememzo,",
    "",
    `I’m interested in ${category} for delivery to my ${destination.toLowerCase()}.`,
    note ? `Note: ${note}` : "I’d like to know what is available.",
    "",
    "Please let me know the next steps. Thank you!",
  ].join("\n");
}

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const fallback = document.createElement("textarea");
  fallback.value = value;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.appendChild(fallback);
  fallback.select();
  const copied = document.execCommand("copy");
  fallback.remove();
  if (!copied) throw new Error("Copy was not available");
}

let toastTimer;
orderForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await copyText(makeEnquiry());
    if (copyLabel) copyLabel.textContent = "Copied!";
    if (toast) {
      toast.textContent = "Enquiry copied to your clipboard.";
      toast.classList.add("is-visible");
    }
  } catch {
    if (copyLabel) copyLabel.textContent = "Select and copy the preview";
    if (toast) {
      toast.textContent = "Copy unavailable — please copy the preview text manually.";
      toast.classList.add("is-visible");
    }
  }
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast?.classList.remove("is-visible");
    if (copyLabel) copyLabel.textContent = "Copy enquiry";
  }, 3000);
});

document.querySelector("[data-year]").textContent = String(new Date().getFullYear());

if (!reducedMotion) {
  const heroFrame = document.querySelector(".hero-frame");
  window.addEventListener(
    "pointermove",
    (event) => {
      if (!heroFrame || window.innerWidth < 821) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 5;
      const y = (event.clientY / window.innerHeight - 0.5) * 5;
      heroFrame.style.transform = `rotate(${2 + x * 0.08}deg) translate(${x}px, ${y}px)`;
    },
    { passive: true },
  );
}
