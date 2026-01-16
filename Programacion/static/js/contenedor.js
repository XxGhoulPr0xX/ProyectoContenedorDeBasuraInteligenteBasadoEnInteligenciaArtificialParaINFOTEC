let ultimaDeteccionId = null
let ultimoTimestamp = 0
let ultimoTiempoConteo = 0
let contadoresLocales = {
    biodegradable: 0,
    noBiodegradable: 0,
}

const noBiodegradables = ["No biodegradable", "plastico", "metal", "vidrio", "inorganico"]

function mapearClaseAContenedor(clase) {
    const claseLower = clase.toLowerCase()
    if (noBiodegradables.some((nb) => claseLower.includes(nb.toLowerCase()))) {
        return "noBiodegradable"
    }
    return "biodegradable"
}

// INICIALIZAR
function inicializar() {
    inicializarContenedores()
    actualizarInterfaz()
    buscarActualizacionesFlask()
}

function inicializarContenedores() {
    const grid = document.getElementById("contenedores-grid")
    grid.innerHTML = ""

    const tipos = [
        { id: "biodegradable", nombre: "Biodegradable", clase: "organico" },
        { id: "noBiodegradable", nombre: "No biodegradable", clase: "inorganico" },
    ]

    tipos.forEach((tipo) => {
        const card = document.createElement("div")
        card.className = "contenedor-card"
        card.id = `card-${tipo.id}`
        card.innerHTML = `
                    <div class="barra">
                        <div class="relleno ${tipo.clase}" id="barra-${tipo.id}" style="height: 0%"></div>
                    </div>
                    <div class="tipo-nombre">${tipo.nombre}</div>
                    <div class="contador" id="contador-${tipo.id}">0/20</div>
                    <div id="alerta-${tipo.id}"></div>
                `
        grid.appendChild(card)
    })
}

function buscarActualizacionesFlask() {
    $.ajax({
        url: `/verificar_actualizacion`,
        type: "GET",
        data: { timestamp: ultimoTimestamp },
        success: (response) => {
            if (response.actualizado && response.datos) {
                const deteccionId = response.timestamp
                if (deteccionId !== ultimaDeteccionId) {
                    ultimoTimestamp = response.timestamp
                    actualizarClasificacion(response.datos)
                    if (response.datos.clase !== "Objeto no identificado. Reintentar") {
                        const ahora = new Date().getTime()
                        const tiempoEspera = 5000
                        if (ahora - ultimoTiempoConteo > tiempoEspera) {
                            const contenedor = mapearClaseAContenedor(response.datos.clase)
                            contadoresLocales[contenedor]++
                            ultimoTiempoConteo = ahora
                            actualizarInterfaz()
                        }
                    }
                    ultimaDeteccionId = deteccionId
                }
            }
            setTimeout(buscarActualizacionesFlask, 2000)
        },
        error: (error) => {
            console.error("Error conectando con Flask:", error)
            setTimeout(buscarActualizacionesFlask, 5000)
        },
    })
}

function actualizarClasificacion(datos) {
    if (datos.imagen_path) {
        const img = $("#imagen-clasificada")
        img.css("opacity", "0.5")
        img.attr("src", "/static/" + datos.imagen_path + "?t=" + new Date().getTime())
        img.show()
        setTimeout(() => {
            img.css("opacity", "1")
        }, 300)
    }

    const claseModelo = $("#clase-modelo")
    claseModelo.text(datos.clase || "Esperando...")

    const prob = datos.probabilidad ? (datos.probabilidad * 100).toFixed(1) : "0.0"
    $("#probabilidad").text(prob + "%")

    claseModelo.removeClass("biodegradable organico no-biodegradable inorganico reintentar")

    if (datos.clase === "Objeto no identificado. Reintentar") {
        claseModelo.addClass("reintentar")
    } else if (noBiodegradables.some((nb) => datos.clase.toLowerCase().includes(nb.toLowerCase()))) {
        claseModelo.addClass("inorganico no-biodegradable")
    } else {
        claseModelo.addClass("organico biodegradable")
    }

    actualizarHora()
}

function actualizarInterfaz() {
    Object.keys(contadoresLocales).forEach((tipo) => {
        const count = contadoresLocales[tipo]
        const limit = 20
        const porcentaje = (count / limit) * 100

        const barra = document.getElementById(`barra-${tipo}`)
        const contador = document.getElementById(`contador-${tipo}`)
        const card = document.getElementById(`card-${tipo}`)
        const alertaDiv = document.getElementById(`alerta-${tipo}`)

        if (!barra) return

        barra.style.height = `${porcentaje}%`
        contador.textContent = `${count}/${limit}`

        card.classList.remove("alerta-mitad", "alerta-lleno")
        contador.classList.remove("mitad", "lleno")
        alertaDiv.innerHTML = ""

        if (count >= limit) {
            card.classList.add("alerta-lleno")
            contador.classList.add("lleno")
            alertaDiv.innerHTML = '<span class="alerta-badge lleno">LLENO</span>'
        } else if (count >= limit / 2) {
            card.classList.add("alerta-mitad")
            contador.classList.add("mitad")
            alertaDiv.innerHTML = '<span class="alerta-badge mitad">MITAD</span>'
        }
    })
}

function actualizarAlertas() {
    const criticasDiv = document.getElementById("alertas-criticas")
    const advertenciasDiv = document.getElementById("alertas-advertencias")

    const criticas = []
    const advertencias = []
    let totalItems = 0

    Object.keys(contadoresLocales).forEach((key) => {
        const count = contadoresLocales[key]
        const nombreMostrar = key === "noBiodegradable" ? "No biodegradable" : "Biodegradable"
        totalItems += count

        if (count >= 20) {
            criticas.push({
                nombre: nombreMostrar,
                mensaje: `Contenedor ${nombreMostrar} está LLENO (${count}/20)`,
                tiempo: "Ahora",
            })
        } else if (count >= 10) {
            advertencias.push({
                nombre: nombreMostrar,
                mensaje: `Contenedor ${nombreMostrar} está a la mitad (${count}/20)`,
                tiempo: "Ahora",
            })
        }
    })

    if (criticas.length > 0) {
        criticasDiv.innerHTML = criticas
            .map(
                (alerta) => `
                    <div class="alert-item critico">
                        <div>
                            <strong>${alerta.mensaje}</strong>
                            <div class="alert-time">${alerta.tiempo}</div>
                        </div>
                    </div>
                `,
            )
            .join("")
    } else {
        criticasDiv.innerHTML =
            '<div class="empty-state"><div class="empty-state-icon">✓</div><p>No hay alertas críticas</p></div>'
    }

    if (advertencias.length > 0) {
        advertenciasDiv.innerHTML = advertencias
            .map(
                (alerta) => `
                    <div class="alert-item advertencia">
                        <div>
                            <strong>${alerta.mensaje}</strong>
                            <div class="alert-time">${alerta.tiempo}</div>
                        </div>
                    </div>
                `,
            )
            .join("")
    } else {
        advertenciasDiv.innerHTML =
            '<div class="empty-state"><div class="empty-state-icon">✓</div><p>No hay advertencias</p></div>'
    }

    document.getElementById("stat-criticas").textContent = criticas.length
    document.getElementById("stat-advertencias").textContent = advertencias.length
    document.getElementById("stat-total").textContent = totalItems
}

function cargarImagenes() {
    const container = document.getElementById("galeria-container")
    container.innerHTML = '<div class="loading">Cargando galería...</div>'

    $.ajax({
        url: `/listarImagenes`,
        type: "GET",
        success: (nombresArchivos) => {
            if (nombresArchivos.length === 0) {
                container.innerHTML = "<p>No hay imágenes capturadas aún.</p>"
                return
            }

            container.innerHTML = '<div class="galeria-grid" id="galeria-grid"></div>'
            const galeriaGrid = document.getElementById("galeria-grid")

            nombresArchivos.forEach((nombre) => {
                const card = document.createElement("div")
                card.className = "imagen-card"

                const rutaImagen = `/static/imagenes/${nombre}`

                card.innerHTML = `
                    <img src="${rutaImagen}" alt="Residuo" onclick="window.open('${rutaImagen}', '_blank')">
                    <div class="imagen-info">
                        <p class="imagen-fecha">${nombre.split("_")[1] || "Reciente"}</p>
                        <p class="imagen-tipo">Captura de Sistema</p>
                    </div>
                `
                galeriaGrid.appendChild(card)
            })
        },
        error: () => {
            container.innerHTML = "<p>Error al cargar la galería. Verifique la conexión.</p>"
        },
    })
}

function eliminarImagenes() {
    if (!confirm("¿Estás seguro de que deseas eliminar todas las imágenes? Esta acción no se puede deshacer.")) {
        return;
    }
    $.ajax({
        url: `/eliminarImagenes`,
        type: "DELETE",
        success: (response) => {
            alert(response.mensaje);
            cargarImagenes();
        },
        error: (err) => {
            console.error("Error al vaciar:", err);
            alert("No se pudieron eliminar las imágenes.");
        }
    });
}

function cambiarTab(tabName) {
    const target = event.target;
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

    target.classList.add("active")
    document.getElementById(`tab-${tabName}`).classList.add("active")

    if (tabName === "galeria") {
        cargarImagenes()
    } else if (tabName === "alertas") {
        actualizarAlertas()
    } else if (tabName === "estadisticas") {
        cargarEstadisticasEHistorial()
    }
}

function cargarEstadisticasEHistorial() {
    const listaHistorial = document.getElementById("lista-historial");
    $.ajax({
        url: '/estadisticas',
        type: 'GET',
        success: (data) => {
            const total = data.total_en_historial || 0;
            const conteoBio = data.Biodegradable || 0;
            const conteoNoBio = data.NoBiodegradable || 0;
            const confianza = data.promedio_confianza || 0;
            let claseMayoritaria = data.claseMayoritaria || "---";
            const porcBio = total > 0 ? ((conteoBio / total) * 100).toFixed(1) : 0;
            const porcNoBio = total > 0 ? ((conteoNoBio / total) * 100).toFixed(1) : 0;
            $("#historial-total").text(total);
            $("#clase-principal").text(claseMayoritaria);
            $("#historial-confianza").text((confianza * 100).toFixed(1) + "%");
            
            $("#conteo-bio").text(conteoBio);
            $("#promedio-bio").text(`Del total: ${porcBio}%`);
            
            $("#conteo-no-bio").text(conteoNoBio);
            $("#promedio-no-bio").text(`Del total: ${porcNoBio}%`);
        },
        error: (err) => {
            console.error("Error cargando estadísticas:", err);
        }
    });
    $.ajax({
        url: '/historial',
        type: 'GET',
        success: (data) => {
            if (!data || data.length === 0) {
                listaHistorial.innerHTML = '<div class="empty-state">No hay registros aún.</div>';
                return;
            }
            const historialReciente = data.slice().reverse().slice(0, 15);
            listaHistorial.innerHTML = historialReciente.map(item => {
                const esNoBio = noBiodegradables.some(nb => 
                    item.clase.toLowerCase().includes(nb.toLowerCase())
                );
                
                const claseBadge = esNoBio ? 'inorganico' : 'organico';
                const colorAlerta = esNoBio ? 'info' : 'advertencia';
                return `
                    <div class="alert-item ${colorAlerta}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 8px; border-left: 4px solid;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div class="clase-resultado ${claseBadge}" style="font-size: 0.8rem; padding: 4px 8px; border-radius: 4px;">
                                ${item.clase}
                            </div>
                            <div>
                                <div style="font-weight: bold; color: #333; font-size: 0.9rem;">Detección Exitosa</div>
                                <div class="alert-time" style="font-size: 0.8rem; color: #666;">${item.fecha_hora}</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.1rem; font-weight: bold; color: #333;">
                                ${(item.probabilidad * 100).toFixed(1)}%
                            </div>
                            <div class="stat-label" style="font-size: 0.7rem; color: #888;">Confianza</div>
                        </div>
                    </div>
                `;
            }).join("");
        },
        error: () => {
            listaHistorial.innerHTML = '<div class="empty-state">Error al conectar con el historial.</div>';
        }
    });
}

function resetearContadores() {
    if (confirm("¿Estás seguro de resetear todos los contadores?")) {
        contadoresLocales = {
            biodegradable: 0,
            noBiodegradable: 0,
        };
        ultimaDeteccionId = null;
        ultimoTiempoConteo = 0;
        ultimoTimestamp = 0;
        actualizarInterfaz();
    }
}

// INICIAR
window.jQuery(document).ready(() => {
    inicializar()
})