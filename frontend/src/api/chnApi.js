const BASE_URL = 'http://localhost:8080/api';

// Intercepta las respuestas para evitar crasheos si el backend responde con HTML o texto vacío
const manejarRespuestaSegura = (res) => {
    if (!res.ok) throw res;
    return res.text().then(text => {
        try {
            return text ? JSON.parse(text.trim()) : [];
        } catch (e) {
            console.warn("Mensaje interceptado (No es JSON válido):", text);
            return []; // Retorna un array vacío seguro en lugar de crashear la UI
        }
    });
};

export const chnApi = {
    // Endpoints de Control de Clientes
    getClientes: () => fetch(`${BASE_URL}/clientes`).then(manejarRespuestaSegura),

    getCliente: (id) => fetch(`${BASE_URL}/clientes/${id}`).then(manejarRespuestaSegura),

    crearCliente: (cliente) => fetch(`${BASE_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    }).then(manejarRespuestaSegura),

    eliminarCliente: (id) => fetch(`${BASE_URL}/clientes/${id}`, {
        method: 'DELETE'
    }).then(res => {
        if (!res.ok) throw res;
        return res;
    }),

    getSolicitudes: (clienteId) => fetch(`${BASE_URL}/solicitudes/cliente/${clienteId}`).then(manejarRespuestaSegura),

    procesarDecision: (solicitudId, decision) => fetch(`${BASE_URL}/solicitudes/${solicitudId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision)
    }).then(manejarRespuestaSegura),

    // Endpoints de Tarjetas, Consumos y Pagos
    getTarjetas: (clienteId) => fetch(`${BASE_URL}/tarjetas/cliente/${clienteId}`).then(manejarRespuestaSegura),

    registrarConsumo: (tarjetaId, consumo) => fetch(`${BASE_URL}/tarjetas/${tarjetaId}/consumos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consumo)
    }).then(manejarRespuestaSegura),

    registrarPago: (tarjetaId, pago) => fetch(`${BASE_URL}/tarjetas/${tarjetaId}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pago)
    }).then(manejarRespuestaSegura),

    verConsumos: (tarjetaId) => fetch(`${BASE_URL}/tarjetas/${tarjetaId}/movimientos/consumos`).then(manejarRespuestaSegura),

    verPagos: (tarjetaId) => fetch(`${BASE_URL}/tarjetas/${tarjetaId}/movimientos/pagos`).then(manejarRespuestaSegura),

    crearSolicitud: (solicitud) => fetch(`${BASE_URL}/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(solicitud)
    }).then(manejarRespuestaSegura)
};
