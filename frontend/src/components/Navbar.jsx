import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';

export default function Navbar({ currentView, setCurrentView }) {
    return (
        <AppBar position="static" sx={{ backgroundColor: '#0a2540', mb: 4 }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <CreditCardIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: '#ffc107' }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ mr: 4, display: { xs: 'none', md: 'flex' }, fontWeight: 700, letterSpacing: '.1rem', color: 'inherit' }}
                    >
                        CHN Tarjetas
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                        <Button
                            onClick={() => setCurrentView('clientes')}
                            sx={{ my: 2, color: 'white', display: 'block', borderBottom: currentView === 'clientes' ? '2px solid #ffc107' : 'none' }}
                        >
                            Gestión de Clientes
                        </Button>
                        <Button
                            onClick={() => setCurrentView('solicitudes')}
                            sx={{ my: 2, color: 'white', display: 'block', borderBottom: currentView === 'solicitudes' ? '2px solid #ffc107' : 'none' }}
                        >
                            Solicitudes de Crédito
                        </Button>
                        <Button
                            onClick={() => setCurrentView('tarjetas')}
                            sx={{ my: 2, color: 'white', display: 'block', borderBottom: currentView === 'tarjetas' ? '2px solid #ffc107' : 'none' }}
                        >
                            Tarjetas & Movimientos
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
