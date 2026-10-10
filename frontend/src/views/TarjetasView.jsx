import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Stack, Card, CardContent,
  Grid, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress, Divider
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { chnApi } from '../api/chnApi';

export default function TarjetasView({ initialClienteId }) {
  const [clienteId, setClienteId] = useState(initialClienteId || '');
  const [clienteInfo, setClienteInfo] = useState(null); // Estado para los datos del cliente
  const [tarjetas, setTarjetas] = useState([]);
  const [selectedTarjeta, setSelectedTarjeta] = useState(null);
  const [movimientos, setMovimientos] = useState({ consumos: [], pagos: [] });

  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState('CONSUMO');
  const [txForm, setTxForm] = useState({ monto: '', descripcion: '' });

  const [buscando, setBuscando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const mostrarAlerta = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const cargarTarjetas = () => {
    if (!clienteId) {
      mostrarAlerta("Por favor, ingrese un ID de cliente válido.", "warning");
      return;
    }
    setBuscando(true);

    setClienteInfo(null);
    setTarjetas([]);
    setSelectedTarjeta(null);
    setMovimientos({ consumos: [], pagos: [] });

    chnApi.getCliente(clienteId)
      .then(cliente => {
        if (!cliente) {
          mostrarAlerta("El cuentahabiente no existe o fue eliminado del sistema.", "error");
          return null;
        }
        setClienteInfo(cliente);
        return chnApi.getTarjetas(clienteId);
      })
      .then(data => {
        if (!data) return;
        const listaTarjetas = data || [];
        setTarjetas(listaTarjetas);
        if (listaTarjetas.length > 0) {
          handleSeleccionarTarjeta(listaTarjetas[0]);
        }
      })
      .catch(err => {
        console.warn("Consulta de cuenta mitigada: Cliente inexistente.");
        setClienteInfo(null);
        setTarjetas([]);
        mostrarAlerta("El ID de cliente ingresado no existe en el sistema.", "error");
      })
      .finally(() => setBuscando(false));
  };


  const handleSeleccionarTarjeta = (tarjeta) => {
    setSelectedTarjeta(tarjeta);
    Promise.all([
      chnApi.verConsumos(tarjeta.id),
      chnApi.verPagos(tarjeta.id)
    ]).then(([consumos, pagos]) => {
      setMovimientos({ consumos: consumos || [], pagos: pagos || [] });
    }).catch(() => mostrarAlerta("Error al cargar extracto de movimientos.", "error"));
  };

  useEffect(() => {
    if (initialClienteId) {
      cargarTarjetas();
    }
  }, [initialClienteId]);

  const handleAbrirModal = (type) => {
    setModalType(type);
    setTxForm({ monto: '', descripcion: '' });
    setOpenModal(true);
  };

  const handleEjecutarTransaccion = () => {
    if (!txForm.monto || !txForm.descripcion.trim()) {
      mostrarAlerta("Todos los campos son requeridos.", "warning");
      return;
    }
    setProcesando(true);

    const payload = {
      monto: parseFloat(txForm.monto),
      descripcion: txForm.descripcion
    };

    const peticion = modalType === 'CONSUMO'
      ? chnApi.registrarConsumo(selectedTarjeta.id, payload)
      : chnApi.registrarPago(selectedTarjeta.id, payload);

    peticion
      .then(() => {
        mostrarAlerta(`¡Transacción de ${modalType.toLowerCase()} procesada con éxito!`, "success");
        setOpenModal(false);
        chnApi.getTarjetas(clienteId).then(data => {
          const listaActualizada = data || [];
          setTarjetas(listaActualizada);
          const actualizada = listaActualizada.find(t => t.id === selectedTarjeta.id);
          if (actualizada) handleSeleccionarTarjeta(actualizada);
        });
      })
      .catch(() => {
        mostrarAlerta("ERROR: Transacción Declinada. ¡Monto excede el límite de crédito disponible!", "error");
      })
      .finally(() => setProcesando(false));
  };
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0a2540' }}>
        Estados de Cuenta & Transacciones
      </Typography>

      {/* BARRA DE FILTRO DE BUSQUEDA */}
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
            onClick={cargarTarjetas}
            disabled={buscando}
            sx={{ backgroundColor: '#0a2540', minWidth: '140px' }}
          >
            {buscando ? <CircularProgress size={20} sx={{ color: 'white' }} /> : "Consultar Cuentas"}
          </Button>
        </CardContent>
      </Card>

      {/* NUEVO MONITOR SUPERIOR: TARJETA INFORMATIVA DEL CLIENTE */}
      {clienteInfo && (
        <Card sx={{ mb: 4, borderLeft: '6px solid #0a2540', backgroundColor: '#f8fafc', boxShadow: 2 }}>
          <CardContent component={Stack} direction="row" spacing={3} alignItems="center">
            <AccountCircleIcon sx={{ fontSize: 45, color: '#0a2540' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="textSecondary" display="block">CUENTAHABIENTE VINCULADO</Typography>
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
              <Typography variant="caption" color="textSecondary" display="block">TELÉFONO DE CONTACTO</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {clienteInfo.telefono}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* SECCIÓN PRINCIPAL DE TARJETAS Y OPERACIONES */}
      {tarjetas.length > 0 && selectedTarjeta ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#0a2540' }}>Tarjetas Emitidas</Typography>
            <Stack spacing={2}>
              {tarjetas.map((t) => {
                // Definición del color de fondo y texto institucional según el nivel de tarjeta
                let bgCardColor = '#f4f6f8'; // Fondo por defecto
                let textCardColor = '#000000';

                if (t.tipoTarjeta === 'CLASICA') {
                  bgCardColor = '#1976d2'; // Azul Institucional
                  textCardColor = '#ffffff';
                } else if (t.tipoTarjeta === 'ORO') {
                  bgCardColor = '#ffd700'; // Oro / Amarillo Dorado
                  textCardColor = '#000000';
                } else if (t.tipoTarjeta === 'PLATINO') {
                  bgCardColor = '#e0e0e0'; // Gris / Platino Elegante
                  textCardColor = '#000000';
                }

                const isSelected = selectedTarjeta.id === t.id;

                return (
                  <Card
                    key={t.id}
                    onClick={() => handleSeleccionarTarjeta(t)}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      boxShadow: isSelected ? 6 : 2,
                      backgroundColor: bgCardColor,
                      color: textCardColor,
                      transition: 'all 0.3s ease',
                      transform: isSelected ? 'scale(1.02)' : 'none',
                      borderLeft: isSelected ? '8px solid #0a2540' : 'none'
                    }}
                  >
                    <CardContent>
                      {/* Número de tarjeta institucional */}
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                        **** **** **** {t.numeroTarjeta.slice(-4)}
                      </Typography>

                      {/* Nombre del Tarjetahabiente */}
                      <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', mt: 0.5, letterSpacing: '0.5px', opacity: 0.9 }}>
                        {clienteInfo?.nombre} {clienteInfo?.apellido}
                      </Typography>

                      <Typography variant="caption" display="block" sx={{ mt: 0.5, fontWeight: 'bold', opacity: 0.8 }}>
                        CATEGORÍA: {t.tipoTarjeta}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Deuda Actual: <b>Q {t.saldoActual.toFixed(2)}</b>
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>

          </Grid>

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
                  <Button variant="contained" color="warning" startIcon={<ArrowUpwardIcon />} onClick={() => handleAbrirModal('CONSUMO')}>Registrar Consumo</Button>
                  <Button variant="contained" color="success" startIcon={<ArrowDownwardIcon />} onClick={() => handleAbrirModal('PAGO')}>Registrar Pago</Button>
                </Stack>
              </CardContent>
            </Card>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#0a2540' }}>Historial de Operaciones</Typography>
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
                    <TableRow key={`c-${c.id}`} hover>
                      <TableCell><Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>CONSUMO</Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2">{c.descripcion}</Typography>
                        {c.fechaConsumo && (
                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                            Fecha: {new Date(c.fechaConsumo).toLocaleDateString()} {new Date(c.fechaConsumo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: '#d32f2f', fontWeight: 'medium' }}>+ Q {c.monto.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}

                  {movimientos.pagos.map((p) => (
                    <TableRow key={`p-${p.id}`} hover>
                      <TableCell><Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>PAGO</Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2">{p.descripcion}</Typography>
                        {p.fechaPago && (
                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                            Fecha: {new Date(p.fechaPago).toLocaleDateString()} {new Date(p.fechaPago).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: '#2e7d32', fontWeight: 'medium' }}>- Q {p.monto.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}

                  {movimientos.consumos.length === 0 && movimientos.pagos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No se registran movimientos contables para este plástico.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      ) : (
        clienteId && !buscando && (
          <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#fff', borderRadius: 2, mt: 2, boxShadow: 1 }}>
            {clienteInfo
              ? `El cliente ${clienteInfo.nombre} no posee ninguna tarjeta de crédito activa emitida.`
              : "Consulte un ID de cliente bancario en la barra superior para monitorear sus estados de cuenta."}
          </Box>
        )
      )}

      {/* DIALOG DE ACCIÓN TRANSACCIONAL */}
      <Dialog open={openModal} onClose={() => !procesando && setOpenModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: '#0a2540' }}>Registrar {modalType === 'CONSUMO' ? 'Nuevo Consumo' : 'Manual de Pago'}</DialogTitle>
        <DialogContent component={Stack} spacing={3} sx={{ mt: 1 }}>
          <TextField label="Monto de la Operación (Q)" value={txForm.monto} onChange={(e) => setTxForm({ ...txForm, monto: e.target.value })} fullWidth size="small" type="number" required />
          <TextField label="Descripción o Concepto" value={txForm.descripcion} onChange={(e) => setTxForm({ ...txForm, descripcion: e.target.value })} fullWidth size="small" required />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} disabled={procesando} color="inherit">Cancelar</Button>
          <Button onClick={handleEjecutarTransaccion} variant="contained" disabled={procesando} color={modalType === 'CONSUMO' ? 'warning' : 'success'}>
            {procesando ? <CircularProgress size={20} sx={{ color: 'white' }} /> : "Procesar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
