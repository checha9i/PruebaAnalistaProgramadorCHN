import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton, Stack, Card, CardContent
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
    const [error, setError] = useState('');

    // Cargar clientes al montar la vista
    const cargarClientes = () => {
        chnApi.getClientes()
            .then(data => setClientes(data))
            .catch(err => console.error("Error cargando clientes", err));
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        chnApi.crearCliente(form)
            .then(() => {
                cargarClientes(); // Recargar tabla
                setForm({ nombre: '', apellido: '', cuiIdentificacion: '', fechaNacimiento: '', direccion: '', correoElectronico: '', telefono: '' }); // Limpiar campos
            })
            .catch(async (err) => {
                // Capturar los mensajes de validación de Spring Boot que configuramos en el Handler
                const errData = await err.json();
                setError(errData.message || "Error al registrar cliente. Verifique el CUI único.");
            });
    };

    const handleEliminar = (id) => {
        if (window.confirm("¿Está seguro de eliminar este cliente? Se borrarán sus solicitudes y tarjetas (En Cascada).")) {
            chnApi.eliminarCliente(id).then(() => cargarClientes());
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0a2540' }}>
                Control de Clientes Bancarios
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {/* FORMULARIO DE REGISTRO */}
                <Card sx={{ flex: 1, p: 2, boxShadow: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Registrar Nuevo Cliente</Typography>
                        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
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
                            <Button type="submit" variant="contained" sx={{ backgroundColor: '#0a2540', '&:hover': { backgroundColor: '#061729' } }} fullWidth>
                                Guardar Cliente
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* TABLA DE REGISTROS */}
                <TableContainer component={Paper} sx={{ flex: 2, boxShadow: 3, maxHeight: 500 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold' }}>CUI</TableCell>
                                <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                                <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold' }}>Contacto</TableCell>
                                <TableCell sx={{ backgroundColor: '#0a2540', color: 'white', fontWeight: 'bold', textCenter: 'center' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clientes.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{row.cuiIdentificacion}</TableCell>
                                    <TableCell>{`${row.nombre} ${row.apellido}`}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{row.correoElectronico}</Typography>
                                        <Typography variant="caption" color="textSecondary">{row.telefono}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
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
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        No hay clientes registrados en el sistema.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </Box>
    );
}
