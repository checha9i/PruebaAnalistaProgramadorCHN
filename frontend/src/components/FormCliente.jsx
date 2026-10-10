import React from 'react';
import { Box, Typography, Button, TextField, Stack, Card, CardContent } from '@mui/material';

export default function FormCliente({ form, error, onChange, onSubmit }) {
    return (
        <Card sx={{ flex: 1, p: 2, boxShadow: 3, height: 'fit-content' }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#0a2540' }}>
                    Registrar Nuevo Cliente
                </Typography>
                {error && (
                    <Typography color="error" sx={{ mb: 2, variant: 'body2' }}>
                        {error}
                    </Typography>
                )}
                <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="CUI / Identificación (Único)"
                        name="cuiIdentificacion"
                        value={form.cuiIdentificacion}
                        onChange={onChange}
                        required
                        fullWidth
                        size="small"
                    />
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Nombres"
                            name="nombre"
                            value={form.nombre}
                            onChange={onChange}
                            required
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Apellidos"
                            name="apellido"
                            value={form.apellido}
                            onChange={onChange}
                            required
                            fullWidth
                            size="small"
                        />
                    </Stack>
                    <TextField
                        label="Fecha de Nacimiento"
                        type="date"
                        name="fechaNacimiento"
                        value={form.fechaNacimiento}
                        onChange={onChange}
                        required
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Dirección de Residencia"
                        name="direccion"
                        value={form.direccion}
                        onChange={onChange}
                        required
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Correo Electrónico"
                        type="email"
                        name="correoElectronico"
                        value={form.correoElectronico}
                        onChange={onChange}
                        required
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Teléfono de Contacto"
                        name="telefono"
                        value={form.telefono}
                        onChange={onChange}
                        required
                        fullWidth
                        size="small"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ backgroundColor: '#0a2540', '&:hover': { backgroundColor: '#061729' }, mt: 1 }}
                        fullWidth
                    >
                        Guardar Cliente
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
