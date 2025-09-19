// Función para formatear la fecha y hora
function formatearHora(fechaString) {
    const fecha = new Date(fechaString);
    return fecha.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

// Función para cargar JSONP
function loadJSONP(url, callback) {
    const script = document.createElement('script');
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback(data);
    };
    
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
}

// Función para actualizar la card con el evento más cercano
function actualizarCard() {
    loadJSONP('https://script.google.com/macros/s/AKfycbxqazpdGrS9TuIHt1gdVpavLy_QWMNpIye0ORg6eoTdJ2A-4kiAzPTTSSHt0Ls7gWzV/exec', function(data) {
        //console.log("Datos recibidos:", data);
        
        // Obtener la fecha actual en formato yyyy-mm-dd
        const hoy = new Date();
        const fechaHoy = hoy.toLocaleDateString('es-MX').split('/').reverse().join('-');
        
        // Filtrar eventos para hoy
        const eventosDehoy = data.filter(item => {
            const fechaEvento = new Date(item.Fecha).toLocaleDateString('es-MX').split('/').reverse().join('-');;
            return fechaEvento === fechaHoy;
        });
        
        //console.log("Eventos de hoy:", eventosDehoy);
        
        // Hora actual
        const horaActual = new Date();
        
        // Encontrar el próximo evento que aún no ha pasado
        const proximoEvento = eventosDehoy.find(item => {
            const horaEvento = new Date(item.Hora);
            // Combinar fecha de hoy con la hora del evento para comparación correcta
            const fechaHoraEvento = new Date(hoy);
            fechaHoraEvento.setHours(horaEvento.getHours());
            fechaHoraEvento.setMinutes(horaEvento.getMinutes());
            //console.log("Próximo evento hora:", fechaHoraEvento);
            return fechaHoraEvento > horaActual;
           
        });
        
        // Obtener referencia a la card
        const tbody = document.querySelector('.card_list table tbody');
        const card = document.querySelector('.card');
        const nextAppoiment = document.getElementById('next_appointment');
        const parentDiv = document.getElementById('parentDiv')

        // Si hay un próximo evento, mostrar sus datos, sino ocultar la card
        if (proximoEvento) {
            
            //console.log("Actividad detectada:", `"${proximoEvento.Actividad}"`);

            // Formatear fecha para mostrar
            const fechaFormateada = new Date(proximoEvento.Fecha).toLocaleDateString('es-MX');
            // Formatear hora para mostrar
            const horaFormateada = new Date(proximoEvento.Hora).toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
                
            });
            const proximoEventoHora = new Date(proximoEvento.Hora);
            // Suma un minuto
            proximoEventoHora.setMinutes(proximoEventoHora.getMinutes() - 1);
            
            const horaActualFormateada = new Date().toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const horaFormateadaConUnMinutoMas = proximoEventoHora.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'   
            });

            //console.log('***********Hora antes del IF****************')
            //console.log(horaFormateadaConUnMinutoMas)
            //console.log(horaActualFormateada)

            if (proximoEvento.Actividad === "ENTREGA" && horaActualFormateada === horaFormateadaConUnMinutoMas) {
                
                //console.log('***********Hora despues del IF****************')
                //console.log(horaFormateadaConUnMinutoMas)
                //console.log(horaActualFormateada)
                // Redirigir a tk.html con el nombre del cliente
                console.log('Se detecto una entrega')
                const nuevaVentana = window.open(`tk.html?cliente=${encodeURIComponent(proximoEvento.Cliente)}`, "_blank");
                nuevaVentana.focus();
                nuevaVentana.moveTo(0, 0);
                nuevaVentana.resizeTo(screen.width, screen.height);
                return; // Salimos para no seguir renderizando la card
            }
            
            // Actualizar contenido de la card
            card.innerHTML = `
                <span>${proximoEvento.Cliente}</span> <br>
                <div style="font-size: 23pt; margin-top: .5rem;">
                    <span>${fechaFormateada}</span> <br>  
                    <span>${horaFormateada}</span> <br>
                    <span>${proximoEvento.Actividad}</span> <br>
                    <span>Asesor: ${proximoEvento.Asesor}</span>
                </div>
            `;
            
            // Mostrar la card
            nextAppoiment.style.display = 'block';
            card.style.display = 'block';
            parentDiv.style.display = 'grid';

        } else {
            // Ocultar la card si no hay eventos próximos para hoy
            nextAppoiment.style.display = 'none';
            card.style.display = 'none';
            parentDiv.style.display = 'block';
            
        }
        if (eventosDehoy){
            // Limpiar la tabla actual
            tbody.innerHTML = '';
            
            // Insertar los nuevos datos
            eventosDehoy.forEach(item => {
                    // Crear una nueva fila
                    const row = document.createElement('tr');
                    
                    // Crear y añadir las celdas
                    row.innerHTML = `
                        <td>${formatearHora(item.Hora)}</td>
                        <td>${item.Actividad}</td>
                        <td>${item.Asesor}</td>
                        <td>${item.Cliente}</td>
                        <td>${item.Marca}</td>
                        <td>${item.Modelo}</td>
                    `;

                    
                    // Añadir la fila a la tabla
                    tbody.appendChild(row);
                });
        } else{
            console.log('No hay eventos hoy')
            tbody.style.display = 'none';
        }
    });
}

// Ejecutar la función al cargar la página
actualizarCard();

// Actualizar cada cierto tiempo (Cada minuto)
setInterval(actualizarCard, 1000);