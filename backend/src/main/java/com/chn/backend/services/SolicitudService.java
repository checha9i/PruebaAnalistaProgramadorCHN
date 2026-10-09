package com.chn.backend.services;

import com.chn.backend.models.Solicitud;
import com.chn.backend.models.Tarjeta;
import com.chn.backend.repositories.SolicitudRepository;
import com.chn.backend.repositories.TarjetaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Random;

@Service
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final TarjetaRepository tarjetaRepository;

    public SolicitudService(SolicitudRepository solicitudRepository, TarjetaRepository tarjetaRepository) {
        this.solicitudRepository = solicitudRepository;
        this.tarjetaRepository = tarjetaRepository;
    }

    @Transactional
    public Solicitud procesarDecision(Long solicitudId, String nuevoEstado, String motivo, BigDecimal montoAprobado) {
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        // Solo es posible procesar si está PENDIENTE
        if (!"PENDIENTE".equals(solicitud.getEstado())) {
            throw new IllegalStateException("Solo se pueden procesar solicitudes en estado PENDIENTE");
        }

        solicitud.setEstado(nuevoEstado); // APROBADA o RECHAZADA
        solicitud.setFechaDecision(LocalDate.now());
        solicitud.setMotivoComentario(motivo);

        if ("APROBADA".equals(nuevoEstado)) {
            solicitud.setMontoAprobado(montoAprobado);

            // Requerimiento: Al aprobarla se crea automáticamente una tarjeta de crédito
            Tarjeta tarjeta = new Tarjeta();
            tarjeta.setNumeroTarjeta(generarNumeroUnicoTarjeta());
            tarjeta.setCliente(solicitud.getCliente());
            tarjeta.setTipoTarjeta(solicitud.getTipoTarjeta());
            tarjeta.setLimiteCredito(montoAprobado);
            tarjeta.setSaldoActual(BigDecimal.ZERO); // Requerimiento: Valor inicial 0

            tarjetaRepository.save(tarjeta);
        }

        return solicitudRepository.save(solicitud);
    }

    private String generarNumeroUnicoTarjeta() {
        Random random = new Random();
        String numero;
        do {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 16; i++) {
                sb.append(random.nextInt(10));
            }
            numero = sb.toString();
        } while (tarjetaRepository.existsByNumeroTarjeta(numero)); // Garantiza unicidad exacta
        return numero;
    }
}
