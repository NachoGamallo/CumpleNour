/* ==========================================
   CONFIGURACIÓN DE REGALOS (Modifica aquí tus textos)
   ========================================== */
   const REGALOS_ESTATICOS = [
    { 
        id: 1, 
        pista: "Algo para cubrir tus pies de las mordidas de los caminantes...", 
        solucion: "zapatillas", 
        revelado: "¡Tus nuevas Zapatillas de Superviviente!" 
    },
    { 
        id: 2, 
        pista: "Suministro dulce altamente energético para largos viajes...", 
        solucion: "chocolate", 
        revelado: "¡Tu caja de bombones favorita!" 
    },
    { 
        id: 3, 
        pista: "Para ver en la oscuridad de las alcantarillas de Georgia...", 
        solucion: "linterna", 
        revelado: "¡Una Linterna Táctica de alta potencia!" 
    }
];

let regalos = [];
let indexActivo = null;
let clicsLogo = 0;

/* ==========================================
   LÓGICA DE CARGA Y PERSISTENCIA
   ========================================== */
function cargarDatos() {
    const guardado = localStorage.getItem('juegoNour');
    
    if (guardado) {
        regalos = JSON.parse(guardado);
    } else {
        // Inicialización por primera vez
        regalos = REGALOS_ESTATICOS.map(r => ({
            ...r,
            intentos: 3,
            estado: 'pending' // Estados: pending, success, failed
        }));
        guardar();
    }
    
    // Si la página tiene el grid de regalos, lo dibuja
    if (document.getElementById('grid')) {
        dibujarBoxes();
    }
}

function guardar() {
    localStorage.setItem('juegoNour', JSON.stringify(regalos));
}

/* ==========================================
   GESTIÓN DE LA INTERFAZ (REGALOS)
   ========================================== */
function dibujarBoxes() {
    const grid = document.getElementById('grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    regalos.forEach((r, i) => {
        const div = document.createElement('div');
        // Asignamos la clase de color según el estado
        div.className = `box ${r.estado}`;
        div.innerHTML = `
            <div class="box-icon" style="font-size: 2rem; margin-bottom: 10px;">
                ${r.estado === 'success' ? '✅' : (r.estado === 'failed' ? '💀' : '📦')}
            </div>
            <span>SUMINISTRO #${r.id}</span>
        `;
        div.onclick = () => abrirBox(i);
        grid.appendChild(div);
    });
}

function abrirBox(i) {
    indexActivo = i;
    const r = regalos[i];
    const overlay = document.getElementById('overlay');
    
    overlay.style.display = 'flex';
    document.getElementById('msg').innerText = "";
    document.getElementById('user-input').value = "";

    // Si el box aún está pendiente de adivinar
    if (r.estado === 'pending') {
        document.getElementById('modal-title').innerText = "ENCRIPTADO";
        document.getElementById('modal-title').style.color = "#8a0b0b"; // Rojo sangre
        document.getElementById('pista-texto').innerText = r.pista;
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('result-area').style.display = 'none';
        document.getElementById('btn-volver-modal').innerText = "VOLVER";
    } else {
        // Si ya se resolvió (acierto o fallo), mostramos el resultado directamente
        const titulo = r.estado === 'success' ? "SUMINISTRO ASEGURADO" : "SUMINISTRO PERDIDO";
        const color = r.estado === 'success' ? "#4a5d23" : "#b58900"; // Verde o Amarillo
        mostrarResultado(titulo, r.revelado, color);
    }
}

function validar() {
    const r = regalos[indexActivo];
    const input = document.getElementById('user-input').value.toLowerCase().trim();
    
    if (input.includes(r.solucion.toLowerCase())) {
        r.estado = 'success';
        guardar();
        mostrarResultado("¡ACCESO CONCEDIDO!", r.revelado, "#4a5d23");
    } else {
        r.intentos--;
        if (r.intentos <= 0) {
            r.estado = 'failed';
            guardar();
            mostrarResultado("SISTEMA BLOQUEADO", "El objeto era: " + r.revelado, "#b58900");
        } else {
            const msgElement = document.getElementById('msg');
            msgElement.innerText = `¡ERROR! Te quedan ${r.intentos} intentos.`;
            msgElement.style.color = "#ff4444";
            guardar();
        }
    }
    dibujarBoxes(); // Actualiza los colores en el fondo
}

function mostrarResultado(titulo, texto, color) {
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('result-area').style.display = 'block';
    
    const titleElem = document.getElementById('modal-title');
    titleElem.innerText = titulo;
    titleElem.style.color = color;
    
    document.getElementById('result-text').innerText = texto;
    document.getElementById('btn-volver-modal').innerText = "VOLVER AL MAPA";
}

function cerrarModal() {
    document.getElementById('overlay').style.display = 'none';
}

/* ==========================================
   PANEL DE CONTROL SECRETO (ADMIN)
   ========================================== */
function inicializarAdmin() {
    const logo = document.querySelector('.logo-text');
    if (logo) {
        logo.style.cursor = "pointer"; // Para saber que se puede clicar
        logo.addEventListener('click', () => {
            clicsLogo++;
            if (clicsLogo === 5) {
                const pass = prompt("MODO ADMIN: Introduce clave (escribe 'rick'):");
                if (pass === 'rick') {
                    const accion = prompt("1: Resetear todo (Limpiar)\n2: Forzar todo a VERDE (Éxito)\n3: Forzar todo a AMARILLO (Fallo)");
                    
                    if (accion === '1') {
                        localStorage.removeItem('juegoNour');
                        regalos = REGALOS_ESTATICOS.map(r => ({ ...r, intentos: 3, estado: 'pending' }));
                        guardar();
                        alert("Sistema reiniciado. Volviendo al Día 1...");
                    } 
                    else if (accion === '2') {
                        regalos.forEach(r => { r.estado = 'success'; r.intentos = 3; });
                        guardar();
                    } 
                    else if (accion === '3') {
                        regalos.forEach(r => { r.estado = 'failed'; r.intentos = 0; });
                        guardar();
                    }
                    location.reload();
                }
                clicsLogo = 0;
            }
        });
    }
}

/* ==========================================
   INICIO AL CARGAR LA PÁGINA
   ========================================== */
window.onload = () => {
    cargarDatos();
    inicializarAdmin();
};