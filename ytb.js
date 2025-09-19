// Variables globales
let videos = [];
let videoTitles = [];
let currentIndex = 0;
let youtubePlayer = null;
let youtubeAPILoaded = false;

// Elementos DOM
const startContainer = document.getElementById("start-container");
const startBtn = document.getElementById("start-btn");
const backgroundElement = document.getElementById("background");
const videoContainer = document.getElementById("video-container");
const videoPlayer = document.getElementById("video-player");
const youtubeContainer = document.getElementById("youtube-container");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const videoTitleElement = document.getElementById("video-title");
const currentTitleElement = document.getElementById("current-title");
const errorMessage = document.getElementById("error-message");
const playlistControls = document.querySelector(".playlist-controls");

// Cargar API de YouTube
function loadYouTubeAPI() {
    // Verificar si la API ya está cargada
    if (typeof YT !== 'undefined' && typeof YT.Player !== 'undefined') {
        youtubeAPILoaded = true;
        return;
    }
    
    // Definir función de callback global
    window.onYouTubeIframeAPIReady = function() {
        youtubeAPILoaded = true;
        //console.log("API de YouTube cargada correctamente");
        
        // Si ya estamos reproduciendo un video de YouTube, inicializar el player
        if (videos.length > 0 && isYouTubeUrl(videos[currentIndex])) {
            playCurrentVideo();
        }
    };
    
    // Cargar la API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    //console.log("Cargando API de YouTube...");
}

// Validar URL
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

// Verificar si es una URL de YouTube
function isYouTubeUrl(url) {
    return url.includes("youtube.com/watch") || url.includes("youtu.be/");
}

// Extraer ID de YouTube
function getYouTubeID(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// Extraer nombre del video desde la URL
function getVideoNameFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split('/');
        const filename = pathSegments[pathSegments.length - 1];
        // Si es YouTube, usar "Video de YouTube"
        if (isYouTubeUrl(url)) {
            return "Video de YouTube";
        }
        // Si tiene nombre de archivo, usarlo
        if (filename && filename.includes('.')) {
            return filename.split('.')[0].replace(/-|_/g, ' ');
        }
        return "Video " + (currentIndex + 1);
    } catch (e) {
        return "Video " + (currentIndex + 1);
    }
}

// Mostrar mensaje de error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 5000);
}

// Inicializar reproductor
startBtn.addEventListener("click", function() {
    // Obtener URL de la imagen de fondo
    const imageUrl = document.getElementById("background-url").value.trim();
    if (!imageUrl) {
        showError("Por favor, ingrese una URL de imagen válida.");
        return;
    }
    
    if (!isValidUrl(imageUrl)) {
        showError("La URL de la imagen no es válida.");
        return;
    }
    
    // Obtener URLs de videos
    const videoUrls = document.getElementById("video-urls").value.trim();
    if (!videoUrls) {
        showError("Por favor, ingrese al menos una URL de video.");
        return;
    }
    
    // Procesar URLs de videos
    const urlsArray = videoUrls.split(',').map(url => url.trim());
    if (urlsArray.length === 0) {
        showError("No se encontraron URLs válidas.");
        return;
    }
    
    // Validar URLs
    const validUrls = [];
    const validTitles = [];
    
    for (let url of urlsArray) {
        if (isValidUrl(url)) {
            validUrls.push(url);
            validTitles.push(getVideoNameFromUrl(url));
        } else {
            console.warn("URL inválida ignorada:", url);
        }
    }
    
    if (validUrls.length === 0) {
        showError("Ninguna de las URLs proporcionadas es válida.");
        return;
    }
    
    // Guardar lista de videos y titulos
    videos = validUrls;
    videoTitles = validTitles;
    
    // Configurar imagen de fondo
    backgroundElement.style.backgroundImage = `url('${imageUrl}')`;
    backgroundElement.style.position = "relative";
    
    // Cargar API de YouTube si hay videos de YouTube
    if (videos.some(url => isYouTubeUrl(url))) {
        loadYouTubeAPI();
    }
    
    // Mostrar el reproductor
    startContainer.style.display = "none";
    videoContainer.style.display = "flex";
    videoTitleElement.style.display = "block";
    playlistControls.style.display = "flex";
    
    // Iniciar reproducción
    currentIndex = 0;
    playCurrentVideo();
});

// Reproducir video actual
function playCurrentVideo() {
    if (videos.length === 0) return;
    
    const currentVideo = videos[currentIndex];
    updateVideoTitle();
    
    // Detener cualquier reproducción actual
    stopCurrentPlayback();
    
    // Determinar tipo de video y reproducir
    if (isYouTubeUrl(currentVideo)) {
        playYouTubeVideo(currentVideo);
    } else {
        playLocalVideo(currentVideo);
    }
    
    //console.log("Reproduciendo:", currentVideo);
}

// Detener reproducción actual
function stopCurrentPlayback() {
    // Detener video HTML5
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    videoPlayer.style.display = "none";
    
    // Detener YouTube
    if (youtubePlayer && typeof youtubePlayer.stopVideo === 'function') {
        try {
            youtubePlayer.stopVideo();
        } catch(e) {
            console.warn("No se pudo detener el video de YouTube", e);
        }
    }
    youtubeContainer.style.display = "none";
}

// Actualizar título del video
function updateVideoTitle() {
    currentTitleElement.textContent = videoTitles[currentIndex] || `Video ${currentIndex + 1}`;
}

// Reproducir video de YouTube
function playYouTubeVideo(url) {
    const videoId = getYouTubeID(url);
    
    if (!videoId) {
        console.error("ID de YouTube inválido:", url);
        playNextVideo();
        return;
    }
    
    videoPlayer.style.display = "none";
    youtubeContainer.style.display = "block";
    
    // Verificar si la API ya está cargada
    if (!youtubeAPILoaded) {
        console.log("Esperando a que se cargue la API de YouTube...");
        setTimeout(() => playYouTubeVideo(url), 500);
        return;
    }
    
    //console.log("Inicializando reproductor de YouTube con ID:", videoId);
    
    // Inicializar o reutilizar el reproductor de YouTube
    if (youtubePlayer) {
        try {
            youtubePlayer.loadVideoById(videoId);
            //console.log("Video de YouTube cargado en reproductor existente");
        } catch(e) {
            console.error("Error al cargar video en reproductor existente:", e);
            // Reiniciar el reproductor
            youtubeContainer.innerHTML = '';
            createYouTubePlayer(videoId);
        }
    } else {
        createYouTubePlayer(videoId);
    }
}

// Crear un nuevo reproductor de YouTube
function createYouTubePlayer(videoId) {
    // Limpiar el contenedor
    youtubeContainer.innerHTML = '';
    
    // Crear un nuevo div para el reproductor
    const playerDiv = document.createElement('div');
    playerDiv.id = 'youtube-player';
    youtubeContainer.appendChild(playerDiv);
    
    //console.log("Creando nuevo reproductor de YouTube");
    
    // Crear el reproductor
    youtubePlayer = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'rel': 0,
            'fs': 1
        },
        events: {
            'onReady': function(event) {
                //console.log("Reproductor de YouTube listo");
                event.target.playVideo();
            },
            'onStateChange': function(event) {
                if (event.data === YT.PlayerState.ENDED) {
                    //console.log("Video de YouTube finalizado");
                    playNextVideo();
                }
            },
            'onError': function(event) {
                console.error("Error en reproductor de YouTube:", event.data);
                playNextVideo();
            }
        }
    });
}

// Reproducir video local/MP4
function playLocalVideo(url) {
    youtubeContainer.style.display = "none";
    videoPlayer.style.display = "block";
    
    //console.log("Cargando video local:", url);
    
    // Configurar eventos antes de establecer la fuente
    videoPlayer.oncanplay = function() {
        //console.log("Video listo para reproducir");
        videoPlayer.play().catch(error => {
            console.error("Error al reproducir el video:", error);
            playNextVideo();
        });
    };
    
    videoPlayer.onerror = function() {
        console.error("Error al cargar el video:", url, videoPlayer.error);
        showError(`Error al cargar el video: ${videoPlayer.error ? videoPlayer.error.message : 'Desconocido'}`);
        playNextVideo();
    };
    
    videoPlayer.onended = function() {
        //console.log("Video local finalizado");
        playNextVideo();
    };
    
    // Establecer la fuente
    videoPlayer.src = url;
    videoPlayer.load();
}

// Reproducir video anterior
function playPreviousVideo() {
    currentIndex = (currentIndex - 1 + videos.length) % videos.length;
    playCurrentVideo();
}

// Reproducir siguiente video
function playNextVideo() {
    currentIndex = (currentIndex + 1) % videos.length;
    playCurrentVideo();
}

// Eventos de los botones de control
prevBtn.addEventListener("click", playPreviousVideo);
nextBtn.addEventListener("click", playNextVideo);

// Manejar teclas para controlar la reproducción
document.addEventListener("keydown", function(event) {
    if (videoContainer.style.display === "flex") {
        if (event.code === "ArrowLeft") {
            playPreviousVideo();
        } else if (event.code === "ArrowRight") {
            playNextVideo();
        }
    }
});

function actualizarFechaHora() {
const ahora = new Date();

const opciones = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
};

const fechaHoraFormateada = ahora.toLocaleString('es-MX', opciones);

document.getElementById('fecha-hora').textContent = fechaHoraFormateada;
}

// Actualizar la fecha y hora cada segundo
setInterval(actualizarFechaHora, 1000);

// Mostrar la fecha y hora inmediatamente al cargar la página
actualizarFechaHora();