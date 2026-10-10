import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, Card, CardContent,
    MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
    Snackbar, Alert, CircularProgress, Divider
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { chnApi } from '../api/chnApi';

export default function SolicitudesView({ initialClienteId }) {
    const [clienteId, setClienteId] = useState(initialClienteId || '');
    const [clienteInfo, setClienteInfo] = useState(null);
    const [solicitudes, setSolicitudes] = useState([]);
    const [form, setForm] = useState({ tipoTarjeta: 'CLASICA', ingresoMensual: '' });

    const [openModal, setOpenModal] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [decisionForm, setDecisionForm] = useState({ estado: 'APROBADA', motivo: '', montoAprobado: '' });

    const [buscando, setBuscando] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [guardandoSolicitud, setGuardandoSolicitud] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const mostrarAlerta = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const ejecutarConsulta = () => {
        if (!clienteId) {
            mostrarAlerta("Por favor, ingrese un ID de cliente válido.", "warning");
            return;
        }
        setBuscando(true);

        setClienteInfo(null);
        setSolicitudes([]);

        chnApi.getCliente(clienteId)
            .then(cliente => {
                if (!cliente) {
                    setClienteInfo(null);
                    setSolicitudes([]);
                    mostrarAlerta("El cliente consultado no existe o fue eliminado del sistema.", "error");
                    return;
                }
                setClienteInfo(cliente);
                return chnApi.getSolicitudes(clienteId);
            })
            .then(data => {
                if (data) {
                    setSolicitudes(Array.isArray(data) ? data : []);
                }
            })
            .catch(err => {
                console.warn("Consulta mitigada: Cliente inexistente o eliminado.");
                setClienteInfo(null);
                setSolicitudes([]);
                mostrarAlerta("El ID de cliente ingresado no existe en el sistema.", "error");
            })
            .finally(() => setBuscando(false));
    };


    useEffect(() => {
        if (initialClienteId) {
            ejecutarConsulta();
        }
    }, [initialClienteId]);

    const handleCrearSolicitud = (e) => {
        e.preventDefault();
        if (!clienteInfo) {
            mostrarAlerta("Debe consultar un cliente existente antes de enviar.", "error");
            return;
        }
        setGuardandoSolicitud(true);

        const nuevaSolicitud = {
            cliente: { id: clienteInfo.id },
            tipoTarjeta: form.tipoTarjeta,
            ingresoMensual: parseFloat(form.ingresoMensual),
            estado: 'PENDIENTE'
        };

        chnApi.crearSolicitud(nuevaSolicitud)
            .then(() => {
                mostrarAlerta("¡Solicitud radicada exitosamente!", "success");
                // Refrescar el listado de inmediato usando el ID del cliente actual
                chnApi.getSolicitudes(clienteInfo.id).then(data => setSolicitudes(data || []));
                setForm({ tipoTarjeta: 'CLASICA', ingresoMensual: '' });
            })
            .catch((err) => {
                console.error("Error en la inserción de solicitud:", err);
                mostrarAlerta("Error al procesar la inserción de la solicitud en el servidor.", "error");
            })
            .finally(() => setGuardandoSolicitud(false));
    };


    const handleAbrirDecision = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setDecisionForm({ estado: 'APROBADA', motivo: '', montoAprobado: solicitud.ingresoMensual });
        setOpenModal(true);
    };

    const handleGuardarDecision = () => {
        if (!decisionForm.motivo.trim()) {
            mostrarAlerta("El motivo es obligatorio.", "warning");
            return;
        }
        setProcesando(true);

        const payload = {
            estado: decisionForm.estado,
            motivo: decisionForm.motivo,
            montoAprobado: decisionForm.estado === 'APROBADA' ? parseFloat(decisionForm.montoAprobado) : 0
        };

        chnApi.procesarDecision(selectedSolicitud.id, payload)
            .then(() => {
                mostrarAlerta("Dictamen procesado correctamente.", "success");
                setOpenModal(false);
                chnApi.getSolicitudes(clienteInfo.id).then(data => setSolicitudes(data || []));
            })
            .catch(() => mostrarAlerta("Error al procesar el cambio de estado.", "error"))
            .finally(() => setProcesando(false));
    };
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0a2540' }}>
                Solicitudes de Tarjetas de Crédito
            </Typography>

            {/* BARRA DE FILTRO SUPERIOR */}
            <Card sx={{ mb: 4, p: 1, boxShadow: 2 }}>
                <CardContent component={Stack} direction="row" spacing={2} alignItems="center">
                    <TextField
                        label="ID del Cliente Bancario"
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        size="small"
                        type="number"
                    />
                    <Button
                        variant="contained"
                        onClick={ejecutarConsulta}
                        disabled={buscando}
                        sx={{ backgroundColor: '#0a2540', minWidth: '140px' }}
                    >
                        {buscando ? <CircularProgress size={20} sx={{ color: 'white' }} /> : "Consultar Cliente"}
                    </Button>
                </CardContent>
            </Card>

            {/* PANEL INFORMATIVO DEL CLIENTE */}
            {clienteInfo && (
                <Card sx={{ mb: 4, borderLeft: '6px solid #0a2540', backgroundColor: '#f8fafc', boxShadow: 2 }}>
                    <CardContent component={Stack} direction="row" spacing={3} alignItems="center">
                        <AccountCircleIcon sx={{ fontSize: 45, color: '#0a2540' }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="caption" color="textSecondary" display="block">CLIENTE SELECCIONADO</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0a2540' }}>
                                {clienteInfo.nombre} {clienteInfo.apellido} (ID Interno: #{clienteInfo.id})
                            </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box>
                            <Typography variant="caption" color="textSecondary" display="block">DOCUMENTO (CUI)</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                                {clienteInfo.cuiIdentificacion}
                            </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box>
                            <Typography variant="caption" color="textSecondary" display="block">CORREO ELECTRÓNICO</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {clienteInfo.correoElectronico}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {/* FORMULARIO */}
                <Card sx={{ flex: 1, p: 2, boxShadow: 3, height: 'fit-content' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#0a2540' }}>Nueva Solicitud</Typography>
                        <Box component="form" onSubmit={handleCrearSolicitud} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tipo de Tarjeta</InputLabel>
                                <Select
                                    name="tipoTarjeta"
                                    value={form.tipoTarjeta}
                                    label="Tipo de Tarjeta"
                                    onChange={(e) => setForm({ ...form, tipoTarjeta: e.target.value })}
                                >
                                    <MenuItem value="CLASICA">Clásica</MenuItem>
                                    <MenuItem value="ORO">Oro</MenuItem>
                                    <MenuItem value="PLATINO">Platino</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Ingreso Mensual Declarado (Q)"
                                name="ingresoMensual"
                                value={form.ingresoMensual}
                                onChange={(e) => setForm({ ...form, ingresoMensual: e.target.value })}
                                required fullWidth size="small" type="number"
                            />
                            <Button type="submit" variant="contained" disabled={guardandoSolicitud || !clienteInfo} sx={{ backgroundColor: '#0a2540', minHeight: '40px' }} fullWidth>
                                {guardandoSolicitud ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Enviar Solicitud"}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* TABLA */}
                <TableContainer component={Paper} sx={{ flex: 2, boxShadow: 3, maxHeight: 500 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold' }}>Tarjeta</TableCell>
                                <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold' }}>Ingreso</TableCell>
                                <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                                <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold' }}>Resolución</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {solicitudes.map((row) => (
                                <TableRow key={row.id} hover>
                                    {/* 1. ID */}
                                    <TableCell>{row.id}</TableCell>

                                    {/* 2. Tarjeta (Con su fecha de ingreso abajo) */}
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0a2540' }}>
                                            {row.tipoTarjeta}
                                        </Typography>
                                        {row.fechaSolicitud && (
                                            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                                                Ingreso: {row.fechaSolicitud}
                                            </Typography>
                                        )}
                                    </TableCell>

                                    {/* 3. Ingreso Mensual Declarado */}
                                    <TableCell>Q {(row.ingresoMensual || 0).toFixed(2)}</TableCell>

                                    {/* 4. Estado Limpio */}
                                    <TableCell>
                                        <Typography variant="body2" sx={{
                                            fontWeight: 'bold',
                                            color: row.estado === 'PENDIENTE' ? '#ffc107' : row.estado === 'APROBADA' ? '#2e7d32' : '#d32f2f'
                                        }}>
                                            {row.estado}
                                        </Typography>
                                    </TableCell>

                                    {/* 5. Resolución */}
                                    <TableCell>
                                        {row.estado === 'PENDIENTE' ? (
                                            <Button variant="outlined" size="small" onClick={() => handleAbrirDecision(row)}>
                                                Evaluar
                                            </Button>
                                        ) : (
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    Monto: Q {(row.montoAprobado || 0).toFixed(2)}
                                                </Typography>
                                                {row.fechaDecision && (
                                                    <Typography variant="caption" color="primary" display="block" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                                                        Dictamen: {row.fechaDecision}
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                                    Obs: {row.motivoComentario}
                                                </Typography>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {solicitudes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        {clienteInfo
                                            ? `El cliente ${clienteInfo.nombre} no posee ninguna solicitud en este momento.`
                                            : "Consulte un ID de cliente bancario en la barra superior para ver sus registros."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>

            {/* MODAL DIALOG */}
            <Dialog open={openModal} onClose={() => !procesando && setOpenModal(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 'bold', color: '#0a2540' }}>Evaluación de Solicitud #{selectedSolicitud?.id}</DialogTitle>
                <DialogContent component={Stack} spacing={3} sx={{ mt: 1 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Dictamen</InputLabel>
                        <Select
                            value={decisionForm.estado}
                            label="Dictamen"
                            onChange={(e) => setDecisionForm({ ...decisionForm, estado: e.target.value })}
                        >
                            <MenuItem value="APROBADA">Aprobar Solicitud</MenuItem>
                            <MenuItem value="RECHAZADA">Rechazar Solicitud</MenuItem>
                        </Select>
                    </FormControl>

                    {decisionForm.estado === 'APROBADA' && (
                        <TextField
                            label="Límite de Crédito Otorgado (Q)"
                            value={decisionForm.montoAprobado}
                            onChange={(e) => setDecisionForm({ ...decisionForm, montoAprobado: e.target.value })}
                            fullWidth size="small" type="number"
                        />
                    )}

                    <TextField
                        label="Motivo / Comentarios"
                        value={decisionForm.motivo}
                        onChange={(e) => setDecisionForm({ ...decisionForm, motivo: e.target.value })}
                        fullWidth size="small" multiline rows={3} required
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenModal(false)} disabled={procesando} color="inherit">Cancelar</Button>
                    <Button onClick={handleGuardarDecision} variant="contained" disabled={procesando} sx={{ backgroundColor: '#0a2540', minWidth: '100px' }}>
                        {procesando ? <CircularProgress size={20} sx={{ color: 'white' }} /> : "Confirmar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* SNACKBAR NOTIFICACIONES */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
