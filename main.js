document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio de Sistemas cargado exitosamente. Ejecutando scripts de UX...");

    // 1. SCROLL SUAVE PARA NAVEGACIÓN INTERNA
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 2. ANIMACIÓN DE ENTRADA (FADE-IN) PARA SECCIONES
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
        // Excluir la sección de demostración y el hero para que carguen inmediatamente
        if (section.id !== 'demonstration' && section.id !== 'hero') {
            section.classList.add('hidden-section');
            observer.observe(section);
        }
    });
});
