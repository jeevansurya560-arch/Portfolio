

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navItems = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section[id]");
const header = document.querySelector(".header");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(open));
    });

    navItems.forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", event => {
        if (navLinks.classList.contains("open") &&
            !navLinks.contains(event.target) &&
            !menuToggle.contains(event.target)) {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 700) {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
}

const cursorSystem = document.querySelector(".cursor-system");
const cursorTrail = document.querySelector(".cursor-trail");
const pointerFineQuery = window.matchMedia("(pointer: fine)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileWidthQuery = window.matchMedia("(max-width: 700px)");

const canUseCustomCursor = () =>
    pointerFineQuery.matches && !reducedMotionQuery.matches && !mobileWidthQuery.matches;

let cursorEngine = null;

function startCursorEngine() {
    if (cursorEngine || !cursorSystem) return;

    const core = document.querySelector(".cursor-core");
    const ring = document.querySelector(".cursor-ring");
    const label = document.querySelector(".cursor-label");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let coreX = mouseX, coreY = mouseY;
    let ringX = mouseX, ringY = mouseY;
    let lastParticleX = mouseX;
    let lastParticleY = mouseY;
    let particleTimer = 0;
    let hasPositioned = false;
    let rafId = null;

    const setTransformPosition = (el, x, y) => {
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0)`;
    };

    const setLabelPosition = (x, y) => {
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
    };

    const placeAll = (x, y) => {
        setTransformPosition(core, x, y);
        setTransformPosition(ring, x, y);
        setLabelPosition(x, y);
    };

    const handleMouseMove = event => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        if (!hasPositioned) {
            hasPositioned = true;
            coreX = ringX = mouseX;
            coreY = ringY = mouseY;
            placeAll(mouseX, mouseY);
            cursorSystem.style.opacity = "1";
            document.body.classList.add("cursor-ready");
        }

        const distance = Math.hypot(mouseX - lastParticleX, mouseY - lastParticleY);
        particleTimer++;

        if (distance > 18 && particleTimer % 2 === 0 && cursorTrail) {
            const particle = document.createElement("span");
            particle.className = "cursor-particle";
            particle.style.left = `${mouseX}px`;
            particle.style.top = `${mouseY}px`;
            particle.style.opacity = `${Math.random() * .45 + .35}`;
            cursorTrail.appendChild(particle);
            setTimeout(() => particle.remove(), 700);
            lastParticleX = mouseX;
            lastParticleY = mouseY;
        }
    };

    const handleMouseDown = () => cursorSystem.classList.add("click");
    const handleMouseUp = () => cursorSystem.classList.remove("click");

    const handleDocMouseLeave = () => {
        cursorSystem.style.opacity = "0";
        if (cursorTrail) cursorTrail.style.opacity = "0";
    };

    const handleDocMouseEnter = () => {
        if (hasPositioned) cursorSystem.style.opacity = "1";
        if (cursorTrail) cursorTrail.style.opacity = "1";
    };

    function animateCursor() {
        coreX += (mouseX - coreX) * .3;
        coreY += (mouseY - coreY) * .3;
        ringX += (mouseX - ringX) * .16;
        ringY += (mouseY - ringY) * .16;

        setTransformPosition(core, coreX, coreY);
        setTransformPosition(ring, ringX, ringY);
        setLabelPosition(ringX, ringY);

        rafId = requestAnimationFrame(animateCursor);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleDocMouseLeave);
    document.addEventListener("mouseenter", handleDocMouseEnter);

    const interactiveElements = document.querySelectorAll("a, button, [data-cursor], .magnetic");
    const hoverHandlers = [];

    interactiveElements.forEach(element => {
        const onEnter = () => {
            cursorSystem.classList.add("hover");
            label.textContent = element.dataset.cursor || "OPEN";
            label.classList.add("visible");
        };

        const onLeave = () => {
            cursorSystem.classList.remove("hover");
            label.classList.remove("visible");
        };

        element.addEventListener("mouseenter", onEnter);
        element.addEventListener("mouseleave", onLeave);
        hoverHandlers.push({ element, onEnter, onLeave });
    });

    rafId = requestAnimationFrame(animateCursor);

    cursorEngine = {
        stop() {
            cancelAnimationFrame(rafId);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mouseleave", handleDocMouseLeave);
            document.removeEventListener("mouseenter", handleDocMouseEnter);
            hoverHandlers.forEach(({ element, onEnter, onLeave }) => {
                element.removeEventListener("mouseenter", onEnter);
                element.removeEventListener("mouseleave", onLeave);
            });
            cursorSystem.classList.remove("hover", "click");
            cursorSystem.style.opacity = "0";
            document.body.classList.remove("cursor-ready");
        }
    };
}

function stopCursorEngine() {
    if (!cursorEngine) return;
    cursorEngine.stop();
    cursorEngine = null;
}

function syncCursorEngine() {
    if (canUseCustomCursor()) {
        startCursorEngine();
    } else {
        stopCursorEngine();
    }
}

syncCursorEngine();

const handleCursorCapabilityChange = () => syncCursorEngine();

if (typeof pointerFineQuery.addEventListener === "function") {
    pointerFineQuery.addEventListener("change", handleCursorCapabilityChange);
    mobileWidthQuery.addEventListener("change", handleCursorCapabilityChange);
    reducedMotionQuery.addEventListener("change", handleCursorCapabilityChange);
} else {
    pointerFineQuery.addListener(handleCursorCapabilityChange);
    mobileWidthQuery.addListener(handleCursorCapabilityChange);
    reducedMotionQuery.addListener(handleCursorCapabilityChange);
}

const magneticElements = document.querySelectorAll(".magnetic");

if (finePointer && !prefersReducedMotion) {
    magneticElements.forEach(element => {
        element.addEventListener("mousemove", event => {
            const rect = element.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            element.style.setProperty("--spot-x", `${x}px`);
            element.style.setProperty("--spot-y", `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const pullX = (x - centerX) * 0.055;
            const pullY = (y - centerY) * 0.055;
            element.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
        });

        element.addEventListener("mouseleave", () => {
            element.style.transform = "";
        });
    });
}

const revealElements = document.querySelectorAll(
    ".section-heading, .project, .about-main, .stat, .skill, .education-card, .contact-glass"
);

if (prefersReducedMotion) {
    revealElements.forEach(element => element.classList.add("reveal"));
} else {
    revealElements.forEach((element, index) => {
        element.style.opacity = "0";
        element.style.transform = "translateY(35px)";
        element.style.transition =
            `opacity .8s ease ${index % 3 * 80}ms, transform .8s cubic-bezier(.2,.8,.2,1) ${index % 3 * 80}ms`;
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: .12 });

    revealElements.forEach(element => observer.observe(element));
}

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navItems.forEach(link => link.classList.remove("active"));
        const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add("active");
    });
}, {
    rootMargin: "-40% 0px -50% 0px"
});

sections.forEach(section => sectionObserver.observe(section));

const updateHeader = () => {
    if (header) {
        header.classList.toggle("scrolled", window.scrollY > 40);
        header.style.paddingTop = window.scrollY > 40 ? "12px" : "";
    }
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", event => {
        const selector = anchor.getAttribute("href");
        const target = document.querySelector(selector);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start"
        });
    });
});

const pacman = document.getElementById("pacman");
const pacTrack = document.getElementById("pacmanTrack");
const pacDotsWrap = document.getElementById("pacmanDots");
const pacScoreEl = document.getElementById("pacmanScore");

if (pacman && pacTrack && pacDotsWrap && pacScoreEl) {
    const DOT_COUNT = 14;
    let score = 0;
    const dots = [];

    const updateScore = () => {
        pacScoreEl.textContent = `SCORE ${String(score).padStart(3, "0")}`;
    };

    const eatDot = dot => {
        if (dot.eaten) return;
        dot.eaten = true;
        dot.el.classList.add("eaten");
        score += 10;
        updateScore();
    };

    const respawnDots = () => {
        dots.forEach(dot => {
            dot.eaten = false;
            dot.el.classList.remove("eaten");
        });
    };

    for (let i = 0; i < DOT_COUNT; i++) {
        const dotEl = document.createElement("span");
        dotEl.className = "pacman-dot";
        pacDotsWrap.appendChild(dotEl);
        const dot = { el: dotEl, eaten: false };
        dots.push(dot);
        dotEl.addEventListener("click", () => eatDot(dot));
    }

    updateScore();

    let boosted = false;
    let boostTimeout = null;

    pacman.addEventListener("click", () => {
        boosted = true;
        pacman.classList.add("boosted");
        clearTimeout(boostTimeout);
        boostTimeout = setTimeout(() => {
            boosted = false;
            pacman.classList.remove("boosted");
        }, 4000);
    });

    if (prefersReducedMotion) {
        pacman.style.left = "calc(50% - 9px)";
    } else {
        let posX = 0;
        let direction = 1;
        let lastTime = performance.now();

        const step = now => {
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;

            const trackWidth = pacTrack.clientWidth;
            const pacSize = pacman.offsetWidth;
            const maxX = Math.max(trackWidth - pacSize, 0);

            const speed = boosted ? 90 : 40;
            posX += direction * speed * dt;

            if (posX >= maxX) {
                posX = maxX;
                direction = -1;
                pacman.classList.add("facing-left");
                respawnDots();
            } else if (posX <= 0) {
                posX = 0;
                direction = 1;
                pacman.classList.remove("facing-left");
                respawnDots();
            }

            pacman.style.left = `${posX}px`;

            const pacCenter = posX + pacSize / 2;
            dots.forEach(dot => {
                if (dot.eaten) return;
                const dotCenter = dot.el.offsetLeft + dot.el.offsetWidth / 2;
                if (Math.abs(dotCenter - pacCenter) < 8) {
                    eatDot(dot);
                }
            });

            requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }
}
