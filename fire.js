document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('golden-fireworks-container');
    const sparkCount = 30; // Número máximo de chispas visibles a la vez
    const sparkDuration = 5000; // Duración de la animación en milisegundos

    function createSpark() {
        const spark = document.createElement('div');
        spark.classList.add('golden-spark');

        // Asigna una clase de color aleatoria
        const colorAlt = Math.floor(Math.random() * 3); // 0, 1, 2
        if (colorAlt === 1) spark.classList.add('alt1');
        if (colorAlt === 2) spark.classList.add('alt2');

        // Posición inicial aleatoria en cualquier parte de la pantalla
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        spark.style.left = `${startX}px`;
        spark.style.top = `${startY}px`;

        // Tamaño aleatorio para variedad
        const size = 10 + Math.random() * 20; // Entre 10px y 30px
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;

        // Pequeño desplazamiento aleatorio en la animación
        const delay = Math.random() * 2000;
        spark.style.animationDelay = `${delay}ms`;

        // Modifica la animación para que se mueva en una dirección aleatoria
        const endX = startX + (Math.random() - 0.5) * 200; // Se mueve horizontalmente
        const endY = startY + (Math.random() - 0.5) * 200; // Se mueve verticalmente
        spark.style.setProperty('--end-x', `${endX}px`);
        spark.style.setProperty('--end-y', `${endY}px`);

        container.appendChild(spark);

        // Eliminar la chispa después de que termine su animación
        spark.addEventListener('animationend', () => {
            spark.remove();
        });
    }

    // Generar chispas constantemente
    function manageSparks() {
        if (container.children.length < sparkCount) {
            createSpark();
        }
        setTimeout(manageSparks, 200 + Math.random() * 300); // Crea una nueva chispa cada 200-500ms
    }

    // Iniciar la creación de chispas
    manageSparks();
});