import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from '@mui/material';

export default function ModalTransaccion({ open, type, form, onChange, onClose, onConfirm }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 'bold', color: '#0a2540' }}>
                Registrar {type === 'CONSUMO' ? 'Nuevo Consumo / Cargo' : 'Manual de Pago / Abono'}
            </DialogTitle>
            <DialogContent sx={{ mt: 1 }}>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <TextField
                        label="Monto de la Operación (Q)"
                        name="monto"
                        value={form.monto}
                        onChange={onChange}
                        fullWidth
                        size="small"
                        type="number"
                        required
                    />
                    <TextField
                        label="Descripción o Concepto"
                        name="descripcion"
                        value={form.descripcion}
                        onChange={onChange}
                        fullWidth
                        size="small"
                        required
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={type === 'CONSUMO' ? 'warning' : 'success'}
                >
                    Procesar Transacción
                </Button>
            </DialogActions>
        </Dialog>
    );
}
