document.addEventListener('DOMContentLoaded', () => {
    
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('nav-open'); 
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('nav-open')) {
                    navLinks.classList.remove('nav-open');
                }
            });
        });
    }

    function clearUrlHash() {
        if (window.location.hash) {
            history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }
    
    clearUrlHash();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            history.pushState(null, null, targetId);
        });
    });

    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1 
    });

    sections.forEach(section => {
        if (section.id !== 'demonstration' && section.id !== 'hero') {
            section.classList.add('hidden-section');
            observer.observe(section);
        }
    });
});
