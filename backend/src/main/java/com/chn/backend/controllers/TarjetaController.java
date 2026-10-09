package com.chn.backend.controllers;

import com.chn.backend.models.Consumo;
import com.chn.backend.models.Pago;
import com.chn.backend.models.Tarjeta;
import com.chn.backend.services.TarjetaService;
import com.chn.backend.repositories.TarjetaRepository;
import com.chn.backend.repositories.ConsumoRepository;
import com.chn.backend.repositories.PagoRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tarjetas")
public class TarjetaController {

    private final TarjetaService tarjetaService;
    private final TarjetaRepository tarjetaRepository;
    private final ConsumoRepository consumoRepository;
    private final PagoRepository pagoRepository;

    public TarjetaController(TarjetaService tarjetaService, TarjetaRepository tarjetaRepository, 
                             ConsumoRepository consumoRepository, PagoRepository pagoRepository) {
        this.tarjetaService = tarjetaService;
        this.tarjetaRepository = tarjetaRepository;
        this.consumoRepository = consumoRepository;
        this.pagoRepository = pagoRepository;
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Tarjeta>> listarTarjetasPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(tarjetaRepository.findByClienteId(clienteId));
    }

    @PostMapping("/{id}/consumos")
    public ResponseEntity<Consumo> cargarConsumo(@PathVariable Long id, @Valid @RequestBody Consumo consumo) {
        return ResponseEntity.ok(tarjetaService.registrarConsumo(id, consumo));
    }

    @PostMapping("/{id}/pagos")
    public ResponseEntity<Pago> cargarPago(@PathVariable Long id, @Valid @RequestBody Pago p) {
        return ResponseEntity.ok(tarjetaService.registrarPago(id, p));
    }

    @GetMapping("/{id}/movimientos/consumos")
    public ResponseEntity<List<Consumo>> verConsumos(@PathVariable Long id) {
        return ResponseEntity.ok(consumoRepository.findByTarjetaId(id));
    }

    @GetMapping("/{id}/movimientos/pagos")
    public ResponseEntity<List<Pago>> verPagos(@PathVariable Long id) {
        return ResponseEntity.ok(pagoRepository.findByTarjetaId(id));
    }
}
