const BASE_URL = 'http://localhost:8080/api';

export const chnApi = {
    // Endpoints de Control de Clientes
    getClientes: () => fetch(`${BASE_URL}/clientes`).then(res => {
        if (!res.ok) throw res;
        return res.json();
    }),
    getCliente: (id) => fetch(`${BASE_URL}/clientes/${id}`).then(res => {
        if (!res.ok) throw res;
        return res.json();
    }),
    crearCliente: (cliente) => fetch(`${BASE_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    }).then(res => {
        if (!res.ok) throw res;
        return res.json();
    }),
    eliminarCliente: (id) => fetch(`${BASE_URL}/clientes/${id}`, {
        method: 'DELETE'
    }).then(res => {
        if (!res.ok) throw res;
        return res;
    }),

    // Endpoints de Gestión de Solicitudes
    getSolicitudes: (clienteId) => fetch(`${BASE_URL}/solicitudes/cliente/${clienteId}`).then(res => {
        if (!res.ok) throw res;
        return res.json();
    }),
    procesarDecision: (solicitudId, decision) => fetch(`${BASE_URL}/solicitudes/${solicitudId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision)
    }).then(res => {
        if (!res.ok) throw res;
        return res.json();
    }),

    // Endpoints de Tarjetas, Consumos y Pagos
    getTarjetas: (clienteId) => fetch(`${BASE_URL}/tarjetas/cliente/${clienteId}`).then(res => {
        if (!res.ok) throw res;
        return res.json();
    }),
    registrarConsumo: (tarjetaId, consumo) => fetch(`${BASE_URL}/tarjetas/${tarjetaId}/consumos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consumo)
    }).then(res => {
        if (!res.ok) throw res;
        return res.json();
    }),
    registrarPago: (tarjetaId, pago) => fetch(`${BASE_URL}/tarjetas/${tarjetaId}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pago)
    }).then(res => {
        if (!res.ok) throw res;
        return res.json();
    }),
    verConsumos: (tarjetaId) => fetch(`${BASE_URL}/tarjetas/${tarjetaId}/movimientos/consumos`).then(res => {
        if (!res.ok) throw res;
        return res.json();
    }),
    verPagos: (tarjetaId) => fetch(`${BASE_URL}/tarjetas/${tarjetaId}/movimientos/pagos`).then(res => {
        if (!res.ok) throw res;
        return res.json();
    }),
    crearSolicitud: (solicitud) => fetch(`${BASE_URL}/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(solicitud)
    }).then(res => {
        if (!res.ok) throw res;
        return res.json();
    }),

};
