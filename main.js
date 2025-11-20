document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio de Sistemas cargado exitosamente. Ejecutando scripts de UX...");

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
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
