document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio de Sistemas cargado exitosamente. Ejecutando scripts de UX...");

    function clearUrlHash() {
        if (window.location.hash) {
            history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }
    
    clearUrlHash();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth' 
            });
            
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
