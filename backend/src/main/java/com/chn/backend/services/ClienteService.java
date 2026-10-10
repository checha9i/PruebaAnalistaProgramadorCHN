package com.chn.backend.services;

import com.chn.backend.models.Cliente;
import com.chn.backend.repositories.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    @Transactional
    public Cliente guardar(Cliente cliente) {
        if (clienteRepository.existsByCuiIdentificacion(cliente.getCuiIdentificacion())) {
            throw new RuntimeException("El número de identificación (CUI) ya se encuentra registrado.");
        }
        return clienteRepository.save(cliente);
    }

    @Transactional
    public Cliente actualizar(Long id, Cliente datosActualizados) {
        Cliente clienteExistente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente bancario no encontrado"));

        // Validar unicidad del CUI al modificar si se cambia el valor
        if (!clienteExistente.getCuiIdentificacion().equals(datosActualizados.getCuiIdentificacion()) &&
            clienteRepository.existsByCuiIdentificacion(datosActualizados.getCuiIdentificacion())) {
            throw new RuntimeException("El nuevo número de identificación (CUI) ya está en uso.");
        }

        clienteExistente.setCuiIdentificacion(datosActualizados.getCuiIdentificacion());
        clienteExistente.setNombre(datosActualizados.getNombre());
        clienteExistente.setApellido(datosActualizados.getApellido());
        clienteExistente.setFechaNacimiento(datosActualizados.getFechaNacimiento());
        clienteExistente.setDireccion(datosActualizados.getDireccion()); // Asegura consistencia en español
        clienteExistente.setCorreoElectronico(datosActualizados.getCorreoElectronico());
        clienteExistente.setTelefono(datosActualizados.getTelefono());

        return clienteRepository.save(clienteExistente);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("No se puede eliminar: Cliente no encontrado");
        }
        clienteRepository.deleteById(id);
    }
}
