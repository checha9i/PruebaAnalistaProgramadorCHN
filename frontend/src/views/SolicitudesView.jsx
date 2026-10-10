import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, Card, CardContent,
    MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { chnApi } from '../api/chnApi';

export default function SolicitudesView({ initialClienteId }) {
    const [clienteId, setClienteId] = useState(initialClienteId || '');
    const [solicitudes, setSolicitudes] = useState([]);
    const [form, setForm] = useState({ tipoTarjeta: 'CLASICA', ingresoMensual: '' });
    const [openModal, setOpenModal] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [decisionForm, setDecisionForm] = useState({ estado: 'APROBADA', motivo: '', montoAprobado: '' });
    const [error, setError] = useState('');

    const cargarSolicitudes = () => {
        if (!clienteId) return;
        chnApi.getSolicitudes(clienteId)
            .then(data => setSolicitudes(data || []))
            .catch(err => console.error("Error cargando solicitudes", err));
    };

    useEffect(() => {
        if (initialClienteId) cargarSolicitudes();
    }, [initialClienteId]);

    const handleCrearSolicitud = (e) => {
        e.preventDefault();
        if (!clienteId) {
            alert("Por favor, ingrese un ID de cliente válido primero.");
            return;
        }

        const nuevaSolicitud = {
            cliente: { id: parseInt(clienteId) },
            tipoTarjeta: form.tipoTarjeta,
            ingresoMensual: parseFloat(form.ingresoMensual),
            estado: 'PENDIENTE'
        };

        fetch('http://localhost:8080/api/solicitudes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaSolicitud)
        })
            .then(res => {
                if (!res.ok) throw res;
                return res.json();
            })
            .then(() => {
                cargarSolicitudes();
                setForm({ tipoTarjeta: 'CLASICA', ingresoMensual: '' });
            })
            .catch(() => alert("Error al registrar la solicitud. Verifique el ID del cliente."));
    };

    const handleAbrirDecision = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setDecisionForm({ estado: 'APROBADA', motivo: '', montoAprobado: solicitud.ingresoMensual });
        setOpenModal(true);
    };

    const handleGuardarDecision = () => {
        if (!decisionForm.motivo.trim()) {
            alert("El motivo o comentario es obligatorio.");
            return;
        }

        const payload = {
            estado: decisionForm.estado,
            motivo: decisionForm.motivo,
            montoAprobado: decisionForm.estado === 'APROBADA' ? parseFloat(decisionForm.montoAprobado) : 0
        };

        chnApi.procesarDecision(selectedSolicitud.id, payload)
            .then(() => {
                setOpenModal(false);
                cargarSolicitudes();
            })
            .catch(() => alert("Error al procesar la decisión. La solicitud ya no está PENDIENTE."));
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0a2540' }}>
                Solicitudes de Tarjetas de Crédito
            </Typography>

            <Card sx={{ mb: 4, p: 1, boxShadow: 2 }}>
                <CardContent component={Stack} direction="row" spacing={2} alignItems="center">
                    <TextField
                        label="ID del Cliente Bancario"
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        size="small"
                        type="number"
                    />
                    <Button variant="contained" onClick={cargarSolicitudes} sx={{ backgroundColor: '#0a2540' }}>
                        Consultar Solicitudes
                    </Button>
                </CardContent>
            </Card>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                <Card sx={{ flex: 1, p: 2, boxShadow: 3, height: 'fit-content' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Nueva Solicitud</Typography>
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
                                required
                                fullWidth
                                size="small"
                                type="number"
                            />
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#0a2540' }} fullWidth>
                                Enviar Solicitud
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                <TableContainer component={Paper} sx={{ flex: 2, boxShadow: 3 }}>
                    <Table>
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
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.tipoTarjeta}</TableCell>
                                    <TableCell>Q {row.ingresoMensual.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{
                                            fontWeight: 'bold',
                                            color: row.estado === 'PENDIENTE' ? '#ffc107' : row.estado === 'APROBADA' ? '#2e7d32' : '#d32f2f'
                                        }}>
                                            {row.estado}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {row.estado === 'PENDIENTE' ? (
                                            <Button variant="outlined" size="small" onClick={() => handleAbrirDecision(row)}>
                                                Evaluar
                                            </Button>
                                        ) : (
                                            <Box>
                                                <Typography variant="caption" display="block">Monto: Q{(row.montoAprobado || 0).toFixed(2)}</Typography>
                                                <Typography variant="caption" color="textSecondary" display="block">Obs: {row.motivoComentario}</Typography>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {solicitudes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        Ingrese un ID de cliente para visualizar o registrar solicitudes.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs">
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
                            fullWidth
                            size="small"
                            type="number"
                        />
                    )}

                    <TextField
                        label="Motivo / Comentarios"
                        value={decisionForm.motivo}
                        onChange={(e) => setDecisionForm({ ...decisionForm, motivo: e.target.value })}
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                        required
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
                    <Button onClick={handleGuardarDecision} variant="contained" sx={{ backgroundColor: '#0a2540' }}>
                        Confirmar Dictamen
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
