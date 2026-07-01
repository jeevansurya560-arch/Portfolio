document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // --- Custom Cursor ---
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    const glow = document.querySelector('.cursor-glow');

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let glowX = 0;
    let glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Dot follows mouse instantly
        if (dot) {
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
        }
    });

    function animate() {
        // Smooth lerp for ring and glow
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        
        glowX += (mouseX - glowX) * 0.05;
        glowY += (mouseY - glowY) * 0.05;

        if (ring) {
            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;
        }
        
        if (glow) {
            glow.style.left = `${glowX}px`;
            glow.style.top = `${glowY}px`;
        }

        requestAnimationFrame(animate);
    }
    animate();

    // --- Magnetic & Hover Effects ---
    const interactives = document.querySelectorAll('.magnetic, a, button, .skill-item, .project-card');

    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (ring) {
                ring.style.width = '80px';
                ring.style.height = '80px';
                ring.style.borderColor = 'rgba(14, 165, 233, 0.4)';
                ring.style.backgroundColor = 'rgba(14, 165, 233, 0.05)';
            }
            if (dot) {
                dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
            }
        });

        el.addEventListener('mouseleave', () => {
            if (ring) {
                ring.style.width = '40px';
                ring.style.height = '40px';
                ring.style.borderColor = '#0ea5e9';
                ring.style.backgroundColor = 'transparent';
            }
            if (dot) {
                dot.style.transform = 'translate(-50%, -50%) scale(1)';
            }
            el.style.transform = 'translate(0, 0)';
        });

        // Magnetic effect for elements with .magnetic class
        if (el.classList.contains('magnetic')) {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
        }
    });

    // --- Reveal on Scroll ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.about-card, .skill-item, .project-card, .edu-card, .section-title');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        observer.observe(el);
    });

    // CSS class for reveala
    const style = document.createElement('style');
    style.innerHTML = `
        .reveal {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // --- Scroll Progress Nav ---
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.style.padding = '15px 8%';
            nav.style.background = 'rgba(255, 255, 255, 0.7)';
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.05)';
        } else {
            nav.style.padding = '20px 8%';
            nav.style.background = 'rgba(255, 255, 255, 0.1)';
            nav.style.boxShadow = 'none';
        }
    });
});
