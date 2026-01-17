// Función para formatear la hora
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

// Función principal para actualizar la tabla y la card
function actualizarCard() {
    loadJSONP('https://script.google.com/macros/s/AKfycbxqazpdGrS9TuIHt1gdVpavLy_QWMNpIye0ORg6eoTdJ2A-4kiAzPTTSSHt0Ls7gWzV/exec', function(data) {
        const hoy = new Date();

        // 🔹 Filtramos solo eventos de HOY
        const eventosDeHoy = data.filter(item => {
            const fechaEvento = new Date(item.Fecha);
            return (
                fechaEvento.getFullYear() === hoy.getFullYear() &&
                fechaEvento.getMonth() === hoy.getMonth() &&
                fechaEvento.getDate() === hoy.getDate()
            );
        });

        // 🔹 Convertimos cada evento en un objeto con su hora completa (fecha + hora)
        const eventosConFechaHora = eventosDeHoy.map(item => {
            const horaEvento = new Date(item.Hora);
            const fechaCompleta = new Date(item.Fecha);
            fechaCompleta.setHours(horaEvento.getHours());
            fechaCompleta.setMinutes(horaEvento.getMinutes());
            fechaCompleta.setSeconds(0);
            return { ...item, fechaHoraCompleta: fechaCompleta };
        });

        // 🔹 Filtrar los eventos que aún no han pasado
        const horaActual = new Date();
        const eventosFuturos = eventosConFechaHora.filter(e => e.fechaHoraCompleta > horaActual);

        // 🔹 Ordenar los eventos futuros por hora (los más próximos primero)
        eventosFuturos.sort((a, b) => a.fechaHoraCompleta - b.fechaHoraCompleta);

        // 🔹 Tomar solo los 10 más cercanos
        const proximosEventos = eventosFuturos.slice(0, 5);

        // === Actualizar la card con el evento más cercano ===
        const card = document.querySelector('.card');
        const nextAppoiment = document.getElementById('next_appointment');
        const parentDiv = document.getElementById('parentDiv');
        const tbody = document.querySelector('.card_list table tbody');

        if (proximosEventos.length > 0) {
            const proximoEvento = proximosEventos[0];

            // Mostrar información principal
            const fechaFormateada = proximoEvento.fechaHoraCompleta.toLocaleDateString('es-MX');
            const horaFormateada = proximoEvento.fechaHoraCompleta.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Verifica si es entrega y faltan 1 minuto
            const horaMenosUnMinuto = new Date(proximoEvento.fechaHoraCompleta);
            horaMenosUnMinuto.setMinutes(horaMenosUnMinuto.getMinutes() - 1);

            if (
                proximoEvento.Actividad === "ENTREGA" &&
                Math.abs(horaMenosUnMinuto - horaActual) < 1000 // ~1s de diferencia
            ) {
                console.log('Se detectó una entrega');
                const nuevaVentana = window.open(`tk.html?cliente=${encodeURIComponent(proximoEvento.Cliente)}`, "_blank");
                nuevaVentana.focus();
                nuevaVentana.moveTo(0, 0);
                nuevaVentana.resizeTo(screen.width, screen.height);
                return;
            }

            // Render de la card
            card.innerHTML = `
                <span>${proximoEvento.Cliente}</span> <br>
                <div style="font-size: 23pt; margin-top: .5rem;">
                    <span>${fechaFormateada}</span> <br>  
                    <span>${horaFormateada}</span> <br>
                    <span>${proximoEvento.Actividad}</span> <br>
                    <span>Asesor: ${proximoEvento.Asesor}</span>
                </div>
            `;
            nextAppoiment.style.display = 'block';
            card.style.display = 'block';
            parentDiv.style.display = 'grid';
        } else {
            nextAppoiment.style.display = 'none';
            card.style.display = 'none';
            parentDiv.style.display = 'block';
        }

        // === Actualizar tabla ===
        tbody.innerHTML = '';
    
        const card_list = document.getElementById('card_list');
        const div_date_clock = document.getElementById('div_date_clock');
        const fecha_hora = document.getElementById('fecha-hora');

        if (proximosEventos.length > 0) {
            
            card_list.style.display = 'block';
            div_date_clock.style.height = '10%';
            fecha_hora.style.fontSize = '13pt';
            console.log('nuevos eventos se deberia apliar los cambios.');

            proximosEventos.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatearHora(item.Hora)}</td>
                    <td>${item.Actividad}</td>
                    <td>${item.Asesor}</td>
                    <td>${item.Cliente}</td>
                    <td>${item.Marca}</td>
                    <td>${item.Modelo}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            //const row = document.createElement('tr');
            //row.innerHTML = `<td colspan="6">No hay eventos próximos</td>`;
            //tbody.appendChild(row);
            card_list.style.display = 'none';
            div_date_clock.style.height = '90%';
            fecha_hora.style.fontSize = '24pt';

            console.log('No hay eventos pendientes')
        }
    });
}

// Ejecutar al cargar la página
actualizarCard();

// Actualizar cada minuto
setInterval(actualizarCard, 60 * 1000);
