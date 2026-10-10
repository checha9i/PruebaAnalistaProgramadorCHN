import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton, Stack, Card, CardContent,
    Snackbar, Alert, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { chnApi } from '../api/chnApi';

export default function ClientesView({ onNavigateToSolicitudes, onNavigateToTarjetas }) {
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState({
        nombre: '', apellido: '', cuiIdentificacion: '',
        fechaNacimiento: '', direccion: '', correoElectronico: '', telefono: ''
    });

    // Estados para el manejo de Feedback y Mensajes al Usuario
    const [guardando, setGuardando] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Función corregida para listar clientes automáticamente
    const cargarClientes = () => {
        chnApi.getClientes()
            .then(data => {
                setClientes(data || []);
            })
            .catch(err => {
                console.error("Error cargando clientes", err);
                mostrarAlerta("Error al cargar el listado de clientes bancarios", "error");
            });
    };

    // useEffect Corregido: Se ejecuta de forma segura al montar la pantalla
    useEffect(() => {
        cargarClientes();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const mostrarAlerta = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setGuardando(true); // Muestra el spinner de carga en el botón

        const clienteData = {
            ...form,
            direccion: form.direccion
        };

        chnApi.crearCliente(clienteData)
            .then(() => {
                mostrarAlerta("¡Cliente guardado exitosamente en el sistema CHN!", "success");
                cargarClientes();
                setForm({ nombre: '', apellido: '', cuiIdentificacion: '', fechaNacimiento: '', direccion: '', correoElectronico: '', telefono: '' }); // Limpiar campos
            })
            .catch(async (err) => {
                console.error("Error atrapado en inserción:", err);
                try {
                    const errData = await err.json();
                    mostrarAlerta(errData.message || "El número de identificación (CUI) ya existe.", "error");
                } catch (e) {
                    mostrarAlerta("Error de comunicación: El CUI ya existe o faltan campos obligatorios.", "error");
                }
            })
            .finally(() => {
                setGuardando(false); // Apaga el spinner de carga del botón
            });
    };

    const handleEliminar = (id) => {
        if (window.confirm("¿Está seguro de eliminar este cliente? Se borrarán sus solicitudes y tarjetas automáticamente (ON DELETE CASCADE).")) {
            chnApi.eliminarCliente(id)
                .then(() => {
                    mostrarAlerta("Cliente eliminado correctamente de la base de datos.", "info");
                    cargarClientes(); // Recargar la tabla tras el borrado
                })
                .catch(() => mostrarAlerta("No se pudo eliminar el cliente seleccionado.", "error"));
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0a2540' }}>
                Control de Clientes Bancarios
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {/* FORMULARIO DE REGISTRO */}
                <Card sx={{ flex: 1, p: 2, boxShadow: 3, height: 'fit-content' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#0a2540' }}>Registrar Nuevo Cliente</Typography>
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

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={guardando}
                                sx={{ backgroundColor: '#0a2540', '&:hover': { backgroundColor: '#061729' }, minHeight: '40px' }}
                                fullWidth
                            >
                                {guardando ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Guardar Cliente"}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* TABLA DE REGISTROS CON CARGA REACTIVA */}
                <TableContainer component={Paper} sx={{ flex: 2, boxShadow: 3, maxHeight: 530 }}>
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
                            {clientes.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{row.cuiIdentificacion}</TableCell>
                                    <TableCell>{`${row.nombre} ${row.apellido}`}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{row.correoElectronico}</Typography>
                                        <Typography variant="caption" color="textSecondary">{row.telefono}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5}>
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
                            {clientes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                        No se registran clientes en el sistema o la base de datos está vacía.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>

            {/* NOTIFICACIONES TOAST INSTITUCIONALES */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%', fontWeight: 'medium' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
