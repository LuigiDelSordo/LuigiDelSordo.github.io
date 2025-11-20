document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio de Sistemas cargado exitosamente. Ejecutando scripts de UX...");

    // 1. SCROLL SUAVE PARA NAVEGACIÓN INTERNA
    // Aplica a enlaces que empiezan con # (ej: #skills, #contact)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 2. ANIMACIÓN DE ENTRADA (FADE-IN) PARA SECCIONES
    // Utiliza el Observer API para detectar cuándo una sección entra en el viewport
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Si la sección es visible, le añadimos la clase 'visible'
                entry.target.classList.add('fade-in');
                // Dejamos de observarla
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1 // 10% de la sección debe ser visible para disparar
    });

    sections.forEach(section => {
        // Inicialmente, ocultamos las secciones con CSS
        section.classList.add('hidden-section');
        observer.observe(section);
    });
});
