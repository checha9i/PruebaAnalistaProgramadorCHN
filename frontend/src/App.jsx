import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Container, Box, Typography } from '@mui/material';
import Navbar from './components/Navbar';
import ClientesView from './views/ClientesView';
import SolicitudesView from './views/SolicitudesView';
import TarjetasView from './views/TarjetasView';

// Creamos un tema limpio con tipografía moderna
const theme = createTheme({
  palette: {
    background: {
      default: '#f4f6f8'
    }
  }
});

export default function App() {
  const [currentView, setCurrentView] = useState('clientes');
  const [selectedClienteId, setSelectedClienteId] = useState(null);

  // Renderizado dinámico de la vista activa
  const renderView = () => {
    switch (currentView) {
      case 'clientes':
        return (
          <ClientesView
            onNavigateToSolicitudes={(id) => { setSelectedClienteId(id); setCurrentView('solicitudes'); }}
            onNavigateToTarjetas={(id) => { setSelectedClienteId(id); setCurrentView('tarjetas'); }}
          />
        );
      case 'solicitudes':
        return <SolicitudesView initialClienteId={selectedClienteId} />;
      case 'tarjetas':
        return <TarjetasView initialClienteId={selectedClienteId} />;
      default:
        return <ClientesView />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normaliza los estilos CSS entre navegadores */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      <Container maxWidth="xl">
        <Box sx={{ mt: 2, pb: 4 }}>
          {renderView()}
        </Box>
      </Container>
    </ThemeProvider>
  );
}
