package com.chn.backend.controllers;

import com.chn.backend.models.Solicitud;
import com.chn.backend.models.Cliente;
import com.chn.backend.services.SolicitudService;
import com.chn.backend.repositories.SolicitudRepository;
import com.chn.backend.repositories.ClienteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "http://localhost:5173")
public class SolicitudController {

    private final SolicitudService solicitudService;
    private final SolicitudRepository solicitudRepository;
    private final ClienteRepository clienteRepository; // Declaración agregada

    // Constructor con todas las dependencias inyectadas correctamente
    public SolicitudController(SolicitudService solicitudService, 
                               SolicitudRepository solicitudRepository, 
                               ClienteRepository clienteRepository) {
        this.solicitudService = solicitudService;
        this.solicitudRepository = solicitudRepository;
        this.clienteRepository = clienteRepository;
    }

    @PostMapping
    public ResponseEntity<Solicitud> crearSolicitud(@RequestBody Solicitud solicitud) {
        if (solicitud.getCliente() != null && solicitud.getCliente().getId() != null) {
            Cliente clienteExistente = clienteRepository.findById(solicitud.getCliente().getId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
            solicitud.setCliente(clienteExistente);
        }
        return ResponseEntity.ok(solicitudRepository.save(solicitud));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Solicitud>> listarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(solicitudRepository.findByClienteId(clienteId));
    }

    @PostMapping("/{id}/decision")
    public ResponseEntity<Solicitud> decidirSolicitud(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> payload) {
        
        String estado = (String) payload.get("estado");
        String motivo = (String) payload.get("motivo");
        
        BigDecimal monto = BigDecimal.ZERO;
        if (payload.get("montoAprobado") != null) {
            monto = new BigDecimal(payload.get("montoAprobado").toString());
        }

        Solicitud solicitudProcesada = solicitudService.procesarDecision(id, estado, motivo, monto);
        return ResponseEntity.ok(solicitudProcesada);
    }
}
