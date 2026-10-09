package com.chn.backend.services;

import com.chn.backend.models.Consumo;
import com.chn.backend.models.Pago;
import com.chn.backend.models.Tarjeta;
import com.chn.backend.repositories.ConsumoRepository;
import com.chn.backend.repositories.PagoRepository;
import com.chn.backend.repositories.TarjetaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class TarjetaService {

    private final TarjetaRepository tarjetaRepository;
    private final ConsumoRepository consumoRepository;
    private final PagoRepository pagoRepository;

    public TarjetaService(TarjetaRepository tarjetaRepository, ConsumoRepository consumoRepository, PagoRepository pagoRepository) {
        this.tarjetaRepository = tarjetaRepository;
        this.consumoRepository = consumoRepository;
        this.pagoRepository = pagoRepository;
    }

    // Requerimiento: Registrar manualmente los consumos realizados a una tarjeta
    @Transactional
    public Consumo registrarConsumo(Long tarjetaId, Consumo consumo) {
        Tarjeta tarjeta = tarjetaRepository.findById(tarjetaId)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));

        // Lógica de validación: Disponible = Límite - Saldo Actual
        BigDecimal disponible = tarjeta.getLimiteCredito().subtract(tarjeta.getSaldoActual());
        
        // Requerimiento: Los consumos no podrán superar el monto total otorgado a la tarjeta
        if (consumo.getMonto().compareTo(disponible) > 0) {
            throw new IllegalArgumentException("El consumo supera el límite de crédito disponible.");
        }

        // Modifica el saldo: Los consumos se sumarán al saldo
        tarjeta.setSaldoActual(tarjeta.getSaldoActual().add(consumo.getMonto()));
        tarjetaRepository.save(tarjeta);

        consumo.setTarjeta(tarjeta);
        return consumoRepository.save(consumo);
    }

    // Requerimiento: Registrar manualmente los pagos realizados a una tarjeta
    @Transactional
    public Pago registrarPago(Long tarjetaId, Pago pago) {
        Tarjeta tarjeta = tarjetaRepository.findById(tarjetaId)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));

        // Modifica el saldo: Los pagos se restarán al saldo
        tarjeta.setSaldoActual(tarjeta.getSaldoActual().subtract(pago.getMonto()));
        tarjetaRepository.save(tarjeta);

        pago.setTarjeta(tarjeta);
        return pagoRepository.save(pago);
    }
}
