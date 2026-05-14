// MENÚ
const menu = {
    platosPrincipales: [
        { id: 'pp1', nombre: 'Mariscada', precio: 18.50 },
        { id: 'pp2', nombre: 'Carne á Retina', precio: 16.00 },
        { id: 'pp3', nombre: 'Pulpo á Gallega', precio: 15.50 },
        { id: 'pp4', nombre: 'Merluza á Sal', precio: 17.00 },
        { id: 'pp5', nombre: 'Escalope Milanesa', precio: 12.50 }
    ],
    sopas: [
        { id: 's1', nombre: 'Sopa de Pedra', precio: 6.50 },
        { id: 's2', nombre: 'Caldo Gallego', precio: 5.50 },
        { id: 's3', nombre: 'Sopa de Pescado', precio: 7.00 }
    ],
    bebidas: [
        { id: 'b1', nombre: 'Agua (50cl)', precio: 1.50 },
        { id: 'b2', nombre: 'Viño (copa)', precio: 3.50 },
        { id: 'b3', nombre: 'Cervexa (25cl)', precio: 2.50 },
        { id: 'b4', nombre: 'Refresco', precio: 2.00 }
    ]
};

// ESTADO
let carrito = {};
let ordenes = [];
let historialCompletadas = [];
let rolActual = 'cliente';
let numeroOrden = 1;
let mesaSeleccionada = null;

// INICIALIZAR
function init() {
    renderMesas();
    renderMenu();
    setInterval(sincronizar, 500);
}

// MESAS
function renderMesas() {
    const container = document.getElementById('mesasGrid');
    const mesas = Array.from({length: 12}, (_, i) => i + 1);
    container.innerHTML = mesas.map(mesa => `
        <button class="mesa-btn" id="mesa-${mesa}" onclick="seleccionarMesa(${mesa})">
            Mesa ${mesa}
        </button>
    `).join('');
}

function seleccionarMesa(numero) {
    mesaSeleccionada = numero;
    document.querySelectorAll('.mesa-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById(`mesa-${numero}`).classList.add('selected');
    document.getElementById('mesaInfo').classList.remove('hidden');
    document.getElementById('mesaNumero').textContent = numero;
    renderCarrito(); // Actualizar estado do botón
}

// MENÚ
function renderMenu() {
    renderSeccion('platosPrincipales', menu.platosPrincipales);
    renderSeccion('sopas', menu.sopas);
    renderSeccion('bebidas', menu.bebidas);
}

function renderSeccion(elementId, items) {
    const container = document.getElementById(elementId);
    container.innerHTML = items.map(item => `
        <div class="menu-item">
            <div class="item-info">
                <h3>${item.nombre}</h3>
                <p>${item.precio}€</p>
            </div>
            <div class="item-price">${item.precio}€</div>
            <div class="item-controls">
                <button class="qty-btn" onclick="cambiarCantidad('${item.id}', -1)">−</button>
                <input type="number" class="qty-input" id="qty-${item.id}" value="0" 
                    onchange="actualizarCantidad('${item.id}', this.value)" min="0" max="99">
                <button class="qty-btn" onclick="cambiarCantidad('${item.id}', 1)">+</button>
            </div>
        </div>
    `).join('');
}

// CARRITO
function cambiarCantidad(itemId, delta) {
    const input = document.getElementById(`qty-${itemId}`);
    const cantidadActual = parseInt(input.value) || 0;
    const nueva = Math.max(0, cantidadActual + delta);
    input.value = nueva;
    actualizarCantidad(itemId, nueva);
}

function actualizarCantidad(itemId, cantidad) {
    cantidad = Math.max(0, parseInt(cantidad) || 0);
    
    if (cantidad === 0) {
        delete carrito[itemId];
    } else {
        const item = buscarItem(itemId);
        carrito[itemId] = { ...item, cantidad };
    }
    
    document.getElementById(`qty-${itemId}`).value = cantidad;
    renderCarrito();
}

function buscarItem(itemId) {
    for (let seccion of Object.values(menu)) {
        const item = seccion.find(i => i.id === itemId);
        if (item) return item;
    }
    return null;
}

function renderCarrito() {
    const items = Object.values(carrito);
    const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const container = document.getElementById('carritoItems');
    const totalContainer = document.getElementById('carritoTotal');
    
    if (items.length === 0) {
        container.innerHTML = '<div class="carrito-vacío">Ningunha selección</div>';
        totalContainer.classList.add('hidden');
        document.getElementById('btnPedir').disabled = true;
    } else {
        container.innerHTML = items.map(item => `
            <div class="carrito-item">
                <span>
                    <span class="carrito-item-qty">${item.cantidad}x</span>
                    ${item.nombre}
                </span>
                <span>
                    <strong>${(item.precio * item.cantidad).toFixed(2)}€</strong>
                    <span class="carrito-item-remove" onclick="actualizarCantidad('${item.id}', 0)">✕</span>
                </span>
            </div>
        `).join('');
        
        document.getElementById('totalPrice').textContent = total.toFixed(2) + '€';
        totalContainer.classList.remove('hidden');
        document.getElementById('btnPedir').disabled = !mesaSeleccionada;
    }
}

// ENVIAR COMANDA
function enviarComanda() {
    if (Object.keys(carrito).length === 0 || !mesaSeleccionada) return;
    
    const orden = {
        numero: numeroOrden++,
        mesa: mesaSeleccionada,
        items: Object.values(carrito),
        timestamp: Date.now(),
        status: 'pendiente',
        total: Object.values(carrito).reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    };
    
    ordenes.push(orden);
    
    // IMPRIMIR
    imprimirComanda(orden);
    
    // SOM
    reproducirSom();
    
    // LIMPIAR
    carrito = {};
    mesaSeleccionada = null;
    document.querySelectorAll('.mesa-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('mesaInfo').classList.add('hidden');
    document.querySelectorAll('.qty-input').forEach(input => input.value = 0);
    renderCarrito();
    
    alert('✅ Comanda ' + orden.numero + ' enviada a mesa ' + orden.mesa + '!');
}

// SOM
function reproducirSom() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscilador = audioContext.createOscillator();
        const ganancia = audioContext.createGain();
        
        oscilador.connect(ganancia);
        ganancia.connect(audioContext.destination);
        
        oscilador.frequency.value = 800;
        ganancia.gain.setValueAtTime(0.3, audioContext.currentTime);
        ganancia.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscilador.start(audioContext.currentTime);
        oscilador.stop(audioContext.currentTime + 0.2);
    } catch(e) {
        console.log('Som non dispoñible en este navegador');
    }
}

// IMPRIMIR
function imprimirComanda(orden) {
    const ventana = window.open('', 'PRINT', 'height=600,width=800');
    ventana.document.write(`
        <style>
            body { font-family: monospace; padding: 20px; text-align: center; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            .mesa { font-size: 18px; margin: 10px 0; }
            .items { margin: 20px 0; text-align: left; }
            .item { margin: 8px 0; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; border-top: 2px solid; padding-top: 10px; }
            .time { font-size: 12px; color: #666; margin-top: 20px; }
        </style>
        <h1>🍽️ COMANDA</h1>
        <div class="mesa">Mesa: <strong>${orden.mesa}</strong></div>
        <div class="mesa">Comanda #${orden.numero}</div>
        <div class="items">
            ${orden.items.map(item => `<div class="item">${item.cantidad}x ${item.nombre} - ${(item.precio * item.cantidad).toFixed(2)}€</div>`).join('')}
        </div>
        <div class="total">TOTAL: ${orden.total.toFixed(2)}€</div>
        <div class="time">${new Date(orden.timestamp).toLocaleString()}</div>
    `);
    ventana.document.close();
    ventana.print();
    ventana.close();
}

// ÓRDENES BARRA
function cambiarStatus(numeroOrden) {
    const orden = ordenes.find(o => o.numero === numeroOrden);
    if (!orden) return;
    
    const estados = ['pendiente', 'en-preparacion', 'lista'];
    const indiceActual = estados.indexOf(orden.status);
    orden.status = estados[(indiceActual + 1) % estados.length];
    
    if (orden.status === 'lista') {
        reproducirSom();
    }
}

function cancelarOrden(numeroOrden) {
    ordenes = ordenes.filter(o => o.numero !== numeroOrden);
}

function renderOrdenes() {
    const container = document.getElementById('ordenesContainer');
    
    const ordenesActivas = ordenes.filter(o => o.status !== 'lista' || Date.now() - o.timestamp < 5000);
    
    if (ordenesActivas.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px;"><h2 style="color: #667eea;">⏳ Esperando comandas...</h2></div>';
        return;
    }
    
    container.innerHTML = ordenesActivas.map(orden => {
        const tiempoTranscurrido = Math.floor((Date.now() - orden.timestamp) / 1000);
        const minutos = Math.floor(tiempoTranscurrido / 60);
        const segundos = tiempoTranscurrido % 60;
        
        return `
            <div class="orden-card ${orden.status === 'lista' ? 'completada' : ''}">
                <div class="tiempo-transcurrido">${minutos}:${segundos.toString().padStart(2, '0')}</div>
                
                <div class="orden-header">
                    <div>
                        <div class="orden-numero">Comanda #${orden.numero}</div>
                        <div class="orden-mesa">🪑 Mesa ${orden.mesa}</div>
                    </div>
                    <div class="orden-status ${orden.status}" onclick="cambiarStatus(${orden.numero})">
                        ${orden.status === 'pendiente' ? '⏳ Pendente' : orden.status === 'en-preparacion' ? '👨‍🍳 Preparando' : '✅ Lista'}
                    </div>
                </div>
                
                <div class="orden-items">
                    ${orden.items.map(item => `
                        <div class="orden-item">
                            <span><span class="item-cantidad">${item.cantidad}x</span> ${item.nombre}</span>
                            <span>${(item.precio * item.cantidad).toFixed(2)}€</span>
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: right; padding-top: 10px; border-top: 1px dashed #eee; font-weight: bold; color: #27ae60;">
                    Total: ${orden.total.toFixed(2)}€
                </div>
                
                <div class="orden-actions">
                    <button class="btn-action btn-completar" onclick="cambiarStatus(${orden.numero})">Cambiar Estado</button>
                    <button class="btn-action btn-print" onclick="imprimirComanda(${orden.numero})">🖨️ Imprimir</button>
                    <button class="btn-action btn-cancelar" onclick="cancelarOrden(${orden.numero})">Cancelar</button>
                </div>
            </div>
        `;
    }).join('');
}

// HISTORIAL
function renderHistorial() {
    const container = document.getElementById('historialItems');
    
    if (historialCompletadas.length === 0) {
        container.innerHTML = '<div class="historial-empty">Sen comandas completadas aínda</div>';
        return;
    }
    
    container.innerHTML = historialCompletadas.map(orden => `
        <div class="historial-item">
            <span class="historial-numero">Comanda #${orden.numero}</span>
            <span>Mesa ${orden.mesa}</span>
            <span>${new Date(orden.timestamp).toLocaleTimeString()}</span>
            <span class="historial-total">${orden.total.toFixed(2)}€</span>
        </div>
    `).join('');
}

function limpiarHistorial() {
    if (confirm('¿Eliminar todo o historial?')) {
        historialCompletadas = [];
        renderHistorial();
    }
}

// CAMBIAR ROL
function cambiarRol(rol) {
    rolActual = rol;
    
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('clienteView').classList.toggle('hidden', rol !== 'cliente');
    document.getElementById('kitchenView').classList.toggle('hidden', rol !== 'kitchen');
    document.getElementById('historialView').classList.toggle('hidden', rol !== 'historial');
    
    if (rol === 'kitchen') {
        renderOrdenes();
    } else if (rol === 'historial') {
        renderHistorial();
    }
}

// SINCRONIZAR
function sincronizar() {
    // Mover completadas a historial
    const indices = [];
    ordenes.forEach((orden, idx) => {
        if (orden.status === 'lista' && Date.now() - orden.timestamp > 5000) {
            historialCompletadas.unshift(orden);
            indices.push(idx);
        }
    });
    
    ordenes = ordenes.filter((_, idx) => !indices.includes(idx));
    
    // Actualizar stats
    const pendentes = ordenes.filter(o => o.status === 'pendiente').length;
    const enPrep = ordenes.filter(o => o.status === 'en-preparacion').length;
    const total = ordenes.reduce((sum, o) => sum + o.total, 0);
    
    document.getElementById('pendentes').textContent = pendentes;
    document.getElementById('enPreparacion').textContent = enPrep;
    document.getElementById('completadas').textContent = historialCompletadas.length;
    document.getElementById('ingresosTotais').textContent = total.toFixed(2) + '€';
    document.getElementById('activeOrders').textContent = ordenes.length;
    document.getElementById('completedOrders').textContent = historialCompletadas.length;
    
    if (rolActual === 'kitchen') {
        renderOrdenes();
    } else if (rolActual === 'historial') {
        renderHistorial();
    }
}

// INICIAR
init();
