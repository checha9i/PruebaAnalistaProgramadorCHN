import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton, Stack, Card, CardContent,
    Snackbar, Alert, CircularProgress, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { chnApi } from '../api/chnApi';

export default function ClientesView({ onNavigateToSolicitudes, onNavigateToTarjetas }) {
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState({
        nombre: '', apellido: '', cuiIdentificacion: '',
        fechaNacimiento: '', direccion: '', correoElectronico: '', telefono: ''
    });

    // NUEVO ESTADO: Guarda el texto que el analista escribe para filtrar
    const [busqueda, setBusqueda] = useState('');
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const cargarClientes = () => {
        chnApi.getClientes()
            .then(data => setClientes(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error("Error cargando clientes", err);
                setClientes([]);
                mostrarAlerta("Error al cargar el listado de clientes bancarios", "error");
            });
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const mostrarAlerta = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleActivarEdicion = (cliente) => {
        setEditandoId(cliente.id);
        setForm({
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            cuiIdentificacion: cliente.cuiIdentificacion,
            fechaNacimiento: cliente.fechaNacimiento,
            direccion: cliente.direccion,
            correoElectronico: cliente.correoElectronico,
            telefono: cliente.telefono
        });
        mostrarAlerta(`Modo edición activado para el cliente ID: #${cliente.id}`, "info");
    };

    const handleCancelarEdicion = () => {
        setEditandoId(null);
        setForm({ nombre: '', apellido: '', cuiIdentificacion: '', fechaNacimiento: '', direccion: '', correoElectronico: '', telefono: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setGuardando(true);

        const clienteData = {
            nombre: form.nombre.trim(),
            apellido: form.apellido.trim(),
            cuiIdentificacion: form.cuiIdentificacion.trim(),
            fechaNacimiento: form.fechaNacimiento,
            direccion: form.direccion.trim(),
            correoElectronico: form.correoElectronico.trim(),
            telefono: form.telefono.trim()
        };

        const peticion = editandoId
            ? fetch(`http://localhost:8080/api/clientes/${editandoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            }).then(res => { if (!res.ok) throw res; return res.json(); })
            : chnApi.crearCliente(clienteData);

        peticion
            .then(() => {
                mostrarAlerta(editandoId ? "¡Cliente actualizado correctamente!" : "¡Cliente guardado exitosamente!", "success");
                handleCancelarEdicion();
                cargarClientes();
            })
            .catch(async (err) => {
                console.error("Error en operación:", err);
                mostrarAlerta("Error al procesar la solicitud. Verifique que los campos sean válidos o que el CUI no esté duplicado.", "error");
            })
            .finally(() => setGuardando(false));
    };

    const handleEliminar = (id) => {
        if (window.confirm("¿Está seguro de eliminar este cliente? Se borrarán sus solicitudes y tarjetas automáticamente (ON DELETE CASCADE).")) {
            chnApi.eliminarCliente(id)
                .then(() => {
                    mostrarAlerta("Cliente eliminado correctamente de la base de datos.", "info");
                    if (editandoId === id) handleCancelarEdicion();
                    cargarClientes();
                })
                .catch(() => mostrarAlerta("No se pudo eliminar el cliente seleccionado.", "error"));
        }
    };

    // 🔍 LÓGICA DE FILTRADO REACTIVO: Filtra en memoria en tiempo real por Nombres, Apellidos o CUI
    const clientesFiltrados = clientes.filter(cliente => {
        const termino = busqueda.toLowerCase().trim();
        return (
            cliente.cuiIdentificacion.toLowerCase().includes(termino) ||
            cliente.nombre.toLowerCase().includes(termino) ||
            cliente.apellido.toLowerCase().includes(termino)
        );
    });
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0a2540' }}>
                Control de Clientes Bancarios
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {/* FORMULARIO DE REGISTRO / EDICIÓN */}
                <Card sx={{ flex: 1, p: 2, boxShadow: 3, height: 'fit-content' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#0a2540' }}>
                            {editandoId ? `Modificar Cliente #${editandoId}` : "Registrar Nuevo Cliente"}
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField label="CUI / Identificación (Único)" name="cuiIdentificacion" value={form.cuiIdentificacion} onChange={handleChange} required fullWidth size="small" />
                            <Stack direction="row" spacing={2}>
                                <TextField label="Nombres" name="nombre" value={form.nombre} onChange={handleChange} required fullWidth size="small" />
                                <TextField label="Apellidos" name="apellido" value={form.apellido} onChange={handleChange} required fullWidth size="small" />
                            </Stack>
                            <TextField label="Fecha de Nacimiento" type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required fullWidth size="small" InputLabelProps={{ shrink: true }} />
                            <TextField label="Dirección de Residencia" name="direccion" value={form.direccion} onChange={handleChange} required fullWidth size="small" />
                            <TextField label="Correo Electrónico" type="email" name="correoElectronico" value={form.correoElectronico} onChange={handleChange} required fullWidth size="small" />
                            <TextField label="Teléfono de Contacto" name="telefono" value={form.telefono} onChange={handleChange} required fullWidth size="small" />

                            <Stack direction="row" spacing={2}>
                                {editandoId && (
                                    <Button variant="outlined" color="inherit" onClick={handleCancelarEdicion} fullWidth>
                                        Cancelar
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={guardando}
                                    sx={{ backgroundColor: editandoId ? '#ffc107' : '#0a2540', color: editandoId ? '#000' : '#fff', '&:hover': { backgroundColor: editandoId ? '#e0a800' : '#061729' }, minHeight: '40px' }}
                                    fullWidth
                                >
                                    {guardando ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : editandoId ? "Actualizar" : "Guardar Cliente"}
                                </Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>

                {/* CONTENEDOR DE LA TABLA Y EL NUEVO BUSCADOR */}
                <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

                    {/* 🔍 BARRA DE BÚSQUEDA DINÁMICA CON ÍCONO */}
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Buscar por CUI, nombres o apellidos del cliente..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ backgroundColor: '#ffffff', borderRadius: 1, boxShadow: 1 }}
                    />

                    <TableContainer component={Paper} sx={{ boxShadow: 3, maxHeight: 470 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold' }}>CUI</TableCell>
                                    <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                                    <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold' }}>Contacto</TableCell>
                                    <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold', align: 'center' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Iterar sobre la lista filtrada de forma reactiva */}
                                {clientesFiltrados.map((row) => (
                                    <TableRow key={row.id} hover selected={editandoId === row.id}>
                                        <TableCell sx={{ fontWeight: 'medium' }}>{row.cuiIdentificacion}</TableCell>
                                        <TableCell>{`${row.nombre} ${row.apellido}`}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{row.correoElectronico}</Typography>
                                            <Typography variant="caption" color="textSecondary">{row.telefono}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5}>
                                                <IconButton color="info" title="Editar Información" onClick={() => handleActivarEdicion(row)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="primary" title="Ver Solicitudes" onClick={() => onNavigateToSolicitudes(row.id)}>
                                                    <AssignmentIcon />
                                                </IconButton>
                                                <IconButton color="secondary" title="Ver Tarjetas" onClick={() => onNavigateToTarjetas(row.id)}>
                                                    <CreditCardIcon />
                                                </IconButton>
                                                <IconButton color="error" title="Eliminar Cliente" onClick={() => handleEliminar(row.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {clientesFiltrados.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                            {clientes.length === 0
                                                ? "No se registran clientes en el sistema."
                                                : "No se encontraron clientes que coincidan con la búsqueda."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Stack>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
