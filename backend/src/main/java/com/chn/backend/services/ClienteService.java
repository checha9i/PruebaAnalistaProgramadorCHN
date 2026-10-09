package com.chn.backend.services;

import com.chn.backend.models.Cliente;
import com.chn.backend.repositories.ClienteRepository;
import com.chn.backend.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> obtenerTodos() {
        return clienteRepository.findAll();
    }

    public Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con el ID: " + id));
    }

    @Transactional
    public Cliente guardar(Cliente cliente) {
        //  Al registrar un nuevo cliente el número de identificación deberá ser único
        if (clienteRepository.existsByCuiIdentificacion(cliente.getCuiIdentificacion())) {
            throw new IllegalArgumentException("El número de identificación (CUI) ya está registrado en el sistema.");
        }
        return clienteRepository.save(cliente);
    }

    @Transactional
    public Cliente actualizar(Long id, Cliente datosActualizados) {
        Cliente clienteExistente = buscarPorId(id);
        
        // Si el CUI cambió, validar que el nuevo no exista
        if (!clienteExistente.getCuiIdentificacion().equals(datosActualizados.getCuiIdentificacion())) {
            if (clienteRepository.existsByCuiIdentificacion(datosActualizados.getCuiIdentificacion())) {
                throw new IllegalArgumentException("El nuevo número de identificación ya pertenece a otro cliente.");
            }
        }

        clienteExistente.setNombre(datosActualizados.getNombre());
        clienteExistente.setApellido(datosActualizados.getApellido());
        clienteExistente.setCuiIdentificacion(datosActualizados.getCuiIdentificacion());
        clienteExistente.setFechaNacimiento(datosActualizados.getFechaNacimiento());
        clienteExistente.setDireccion(datosActualizados.getDirection()); // Asegurando tu setter
        clienteExistente.setCorreoElectronico(datosActualizados.getCorreoElectronico());
        clienteExistente.setTelefono(datosActualizados.getTelefono());

        return clienteRepository.save(clienteExistente);
    }

    @Transactional
    public void eliminar(Long id) {
        Cliente cliente = buscarPorId(id);
        // CascadeType.ALL en el modelo se encarga de eliminar solicitudes y tarjetas automáticamente en SQL Server
        clienteRepository.delete(cliente);
    }
}
