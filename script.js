const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
const mobileNavigationQuery = window.matchMedia("(max-width: 48rem)");
const projectCategoryFilter = document.querySelector("#project-category");
const projectFilterStatus = document.querySelector("#project-filter-status");
const projectCards = document.querySelectorAll(".project-card");
const projectCardList = document.querySelector(".project-cards");
const lightboxDialog = document.querySelector(".lightbox-dialog");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxCloseButton = document.querySelector(".lightbox-close");
const isFrenchPage = document.documentElement.lang.toLowerCase() === "fr-ca";
let lightboxTrigger = null;

function setNavigationForViewport() {
    const isMobile = mobileNavigationQuery.matches;
    menuToggle.hidden = !isMobile;
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNavigation.hidden = isMobile;
}

function toggleMenu() {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    primaryNavigation.hidden = isExpanded;
}

menuToggle.addEventListener("click", toggleMenu);

primaryNavigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement && mobileNavigationQuery.matches) {
        menuToggle.setAttribute("aria-expanded", "false");
        primaryNavigation.hidden = true;
    }
});

mobileNavigationQuery.addEventListener("change", setNavigationForViewport);
setNavigationForViewport();

function filterProjects() {
    const selectedCategory = projectCategoryFilter.value;
    let visibleProjectCount = 0;

    projectCards.forEach((card) => {
        const matchesCategory =
            selectedCategory === "all" || card.dataset.category === selectedCategory;
        card.hidden = !matchesCategory;
        visibleProjectCount += Number(matchesCategory);
    });

    projectFilterStatus.textContent =
        isFrenchPage
            ? `${visibleProjectCount} ${visibleProjectCount === 1 ? "projet affiché" : "projets affichés"}`
            : `${visibleProjectCount} ${visibleProjectCount === 1 ? "project" : "projects"} shown`;
}

projectCategoryFilter.addEventListener("change", filterProjects);
filterProjects();

projectCardList.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const trigger = event.target.closest(".lightbox-trigger");
    if (!(trigger instanceof HTMLButtonElement)) {
        return;
    }

    const sourceImage = trigger.querySelector("img");
    const card = trigger.closest(".project-card");
    const title = card.querySelector("h3").textContent;
    const description = card.querySelector("figcaption").textContent;

    lightboxTrigger = trigger;
    lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
    lightboxImage.alt = sourceImage.alt;
    lightboxCaption.textContent = `${title}: ${description}`;
    lightboxDialog.showModal();
});

lightboxCloseButton.addEventListener("click", () => {
    lightboxDialog.close();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightboxDialog.open) {
        lightboxDialog.close();
    }
});

lightboxDialog.addEventListener("click", (event) => {
    if (event.target === lightboxDialog) {
        lightboxDialog.close();
    }
});

lightboxDialog.addEventListener("close", () => {
    lightboxTrigger?.focus();
});

const contactForm = document.querySelector("#contact-form");
const contactFields = [
    {
        input: document.querySelector("#name"),
        feedback: document.querySelector("#name-feedback"),
        validate(value, input) {
            if (!value.trim()) {
                return isFrenchPage ? "Veuillez saisir votre nom." : "Please enter your name.";
            }
            return "";
        }
    },
    {
        input: document.querySelector("#email"),
        feedback: document.querySelector("#email-feedback"),
        validate(value, input) {
            if (!value.trim()) {
                return isFrenchPage
                    ? "Veuillez saisir votre adresse courriel."
                    : "Please enter your email address.";
            }
            const domain = value.trim().split("@").pop();
            if (
                input.validity.typeMismatch ||
                !domain.includes(".") ||
                domain.startsWith(".") ||
                domain.endsWith(".")
            ) {
                return isFrenchPage
                    ? "Saisissez une adresse courriel valide avec un point dans le domaine, par exemple nom@exemple.ca."
                    : "Enter a valid email address with a dotted domain, such as name@example.com.";
            }
            return "";
        }
    },
    {
        input: document.querySelector("#message"),
        feedback: document.querySelector("#message-feedback"),
        validate(value, input) {
            if (!value.trim()) {
                return isFrenchPage ? "Veuillez saisir un message." : "Please enter a message.";
            }
            if (value.trim().length < input.minLength) {
                return isFrenchPage
                    ? `Le message doit contenir au moins ${input.minLength} caractères.`
                    : `Message must be at least ${input.minLength} characters.`;
            }
            return "";
        }
    }
];

contactFields.forEach((field) => {
    const { input, feedback, validate } = field;
    field.hasInteracted = false;

    function updateFeedback() {
        if (!field.hasInteracted) {
            return;
        }

        const errorMessage = validate(input.value, input);
        input.setAttribute("aria-invalid", String(Boolean(errorMessage)));
        feedback.textContent = errorMessage;
    }

    input.addEventListener("input", () => {
        field.hasInteracted = true;
        updateFeedback();
    });

    input.addEventListener("focus", () => {
        field.hasInteracted = true;
        updateFeedback();
    });

    input.addEventListener("blur", () => {
        field.hasInteracted = true;
        updateFeedback();
    });
});

contactForm.noValidate = true;
contactForm.addEventListener("submit", (event) => {
    contactFields.forEach((field) => {
        field.hasInteracted = true;
        const errorMessage = field.validate(field.input.value, field.input);
        field.input.setAttribute("aria-invalid", String(Boolean(errorMessage)));
        field.feedback.textContent = errorMessage;
    });

    const invalidField = contactFields.find(
        ({ input, validate }) => validate(input.value, input)
    );

    if (invalidField) {
        event.preventDefault();
        invalidField.input.focus();
        return;
    }

    event.preventDefault();
    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const thankYouElement = document.querySelector("#thank-you-message");
    thankYouElement.textContent =
        isFrenchPage
            ? `Merci ${name}! Votre message est prêt. Je vous répondrai à ${email} bientôt.`
            : `Thank you ${name}! Your message has been sent. We will contact you at ${email} soon.`;
    thankYouElement.hidden = false;
});