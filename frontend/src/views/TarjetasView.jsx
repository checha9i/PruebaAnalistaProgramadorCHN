import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Stack, Card, CardContent,
  Grid, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { chnApi } from '../api/chnApi';

export default function TarjetasView({ initialClienteId }) {
  const [clienteId, setClienteId] = useState(initialClienteId || '');
  const [tarjetas, setTarjetas] = useState([]);
  const [selectedTarjeta, setSelectedTarjeta] = useState(null);
  const [movimientos, setMovimientos] = useState({ consumos: [], pagos: [] });
  
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState('CONSUMO'); // CONSUMO o PAGO
  const [txForm, setTxForm] = useState({ monto: '', descripcion: '' });

  const cargarTarjetas = () => {
    if (!clienteId) return;
    chnApi.getTarjetas(clienteId)
      .then(data => {
        setTarjetas(data);
        if (data && data.length > 0) {
          handleSeleccionarTarjeta(data[0]);
        } else {
          setSelectedTarjeta(null);
          setMovimientos({ consumos: [], pagos: [] });
        }
      })
      .catch(err => console.error("Error cargando tarjetas", err));
  };

  const handleSeleccionarTarjeta = (tarjeta) => {
    setSelectedTarjeta(tarjeta);
    Promise.all([
      chnApi.verConsumos(tarjeta.id),
      chnApi.verPagos(tarjeta.id)
    ]).then(([consumos, pagos]) => {
      setMovimientos({ consumos: consumos || [], pagos: pagos || [] });
    }).catch(err => console.error("Error cargando movimientos", err));
  };

  useEffect(() => {
    if (initialClienteId) cargarTarjetas();
  }, [initialClienteId]);

  const handleAbrirModal = (type) => {
    setModalType(type);
    setTxForm({ monto: '', descripcion: '' });
    setOpenModal(true);
  };

  const handleEjecutarTransaccion = () => {
    if (!txForm.monto || !txForm.descripcion.trim()) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    const payload = {
      monto: parseFloat(txForm.monto),
      descripcion: txForm.descripcion
    };

    const peticion = modalType === 'CONSUMO' 
      ? chnApi.registrarConsumo(selectedTarjeta.id, payload)
      : chnApi.registrarPago(selectedTarjeta.id, payload);

    peticion
      .then(() => {
        setOpenModal(false);
        chnApi.getTarjetas(clienteId).then(data => {
          setTarjetas(data);
          const actualizada = data.find(t => t.id === selectedTarjeta.id);
          if (actualizada) {
            handleSeleccionarTarjeta(actualizada);
          }
        });
      })
      .catch(() => {
        alert("Transacción declinada: El consumo supera el límite de crédito disponible otorgado o el monto es inválido.");
      });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0a2540' }}>
        Estados de Cuenta & Transacciones
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
          <Button variant="contained" onClick={cargarTarjetas} sx={{ backgroundColor: '#0a2540' }}>
            Consultar Tarjetas
          </Button>
        </CardContent>
      </Card>

      {tarjetas.length > 0 && selectedTarjeta ? (
        <Grid container spacing={4}>
          {/* PANEL DE SELECCIÓN DE PLÁSTICOS */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Tarjetas Emitidas</Typography>
            <Stack spacing={2}>
              {tarjetas.map((t) => (
                <Card 
                  key={t.id} 
                  onClick={() => handleSeleccionarTarjeta(t)}
                  sx={{ 
                    p: 1, cursor: 'pointer', boxShadow: 2,
                    borderLeft: selectedTarjeta.id === t.id ? '6px solid #ffc107' : 'none',
                    backgroundColor: selectedTarjeta.id === t.id ? '#fafafa' : '#fff'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                      **** **** **** {t.numeroTarjeta.slice(-4)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">TIPO: {t.tipoTarjeta}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Deuda Actual: <b>Q {t.saldoActual.toFixed(2)}</b></Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>

          {/* MONITOR DE MOVIMIENTOS Y ACCIONES */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2, mb: 4, backgroundColor: '#0a2540', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" sx={{ opacity: 0.8 }}>Balance de Tarjeta Seleccionada</Typography>
                <Grid container sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>LÍMITE CONCEDIDO</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Q {selectedTarjeta.limiteCredito.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>SALDO DEUDOR ACTUAL</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffc107' }}>Q {selectedTarjeta.saldoActual.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button variant="contained" color="warning" startIcon={<ArrowUpwardIcon />} onClick={() => handleAbrirModal('CONSUMO')}>
                    Registrar Consumo
                  </Button>
                  <Button variant="contained" color="success" startIcon={<ArrowDownwardIcon />} onClick={() => handleAbrirModal('PAGO')}>
                    Registrar Pago
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* TABLA COMPUESTA DE MOVIMIENTOS */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Historial de Operaciones</Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: '#f4f6f8', fontWeight: 'bold' }}>Tipo</TableCell>
                    <TableCell sx={{ backgroundColor: '#f4f6f8', fontWeight: 'bold' }}>Descripción</TableCell>
                    <TableCell sx={{ backgroundColor: '#f4f6f8', fontWeight: 'bold' }}>Monto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movimientos.consumos.map((c) => (
                    <TableRow key={`c-${c.id}`}>
                      <TableCell><Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>CONSUMO</Typography></TableCell>
                      <TableCell>{c.descripcion}</TableCell>
                      <TableCell sx={{ color: '#d32f2f' }}>+ Q {c.monto.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {movimientos.pagos.map((p) => (
                    <TableRow key={`p-${p.id}`}>
                      <TableCell><Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>PAGO</Typography></TableCell>
                      <TableCell>{p.descripcion}</TableCell>
                      <TableCell sx={{ color: '#2e7d32' }}>- Q {p.monto.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {movimientos.consumos.length === 0 && movimientos.pagos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 2 }}>No se registran movimientos contables para este plástico.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      ) : (
        clienteId && (
          <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#fff', borderRadius: 2, boxShadow: 1, mt: 2 }}>
            No se registran cuentas de crédito activas para el ID proporcionado o presione consultar.
          </Box>
        )
      )}

      {/* MODAL TRANSACCIONAL GENERAL */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: '#0a2540' }}>
          Registrar {modalType === 'CONSUMO' ? 'Nuevo Consumo / Cargo' : 'Manual de Pago / Abono'}
        </DialogTitle>
        <DialogContent component={Stack} spacing={3} sx={{ mt: 1 }}>
          <TextField 
            label="Monto de la Operación (Q)" 
            value={txForm.monto} 
            onChange={(e) => setTxForm({ ...txForm, monto: e.target.value })}
            fullWidth 
            size="small" 
            type="number"
            required
          />
          <TextField 
            label="Descripción o Concepto" 
            value={txForm.descripcion} 
            onChange={(e) => setTxForm({ ...txForm, descripcion: e.target.value })}
            fullWidth
            size="small"
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
          <Button
            onClick={handleEjecutarTransaccion}
            variant="contained"
            color={modalType === 'CONSUMO' ? 'warning' : 'success'}
          >
            Procesar Transacción
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
