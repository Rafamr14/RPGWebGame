// modal.js - Gestión de modales para la interfaz de usuario

// Función para inicializar modales
function initModals() {
    console.log("Inicializando modales...");

    // Añadir event listeners a todos los botones de cierre de modal
    document.querySelectorAll('.modal-close, .modal-footer button').forEach(button => {
        button.removeEventListener('click', closeAllModals); // Evitar duplicados
        button.addEventListener('click', closeAllModals);
    });

    // También cerrar modales al hacer clic fuera de ellos
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });

    console.log("Modales inicializados correctamente");
}

// Función para mostrar un modal
function showModal(modalId) {
    console.log("Mostrando modal:", modalId);

    // Ocultar todos los modales primero
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.add('hidden');
    });

    // Mostrar el modal solicitado
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');

        // Asegurarse de que los botones de cierre funcionen
        modal.querySelectorAll('.modal-close, .modal-footer button').forEach(button => {
            // Remover event listeners anteriores para evitar duplicados
            button.removeEventListener('click', closeAllModals);
            // Añadir nuevo event listener
            button.addEventListener('click', closeAllModals);
        });

        // También cerrar al hacer clic fuera del modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    }
}

// Función para cerrar todos los modales
function closeAllModals() {
    console.log("Cerrando todos los modales");
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.add('hidden');
    });
}

// Función para mostrar un mensaje de error
function showErrorMessage(message) {
    if (document.getElementById('error-message')) {
        document.getElementById('error-message').textContent = message;
        showModal('error-modal');
    } else {
        alert(message);
    }
}

// Función para mostrar un mensaje de éxito
function showSuccessMessage(message) {
    if (document.getElementById('success-message')) {
        document.getElementById('success-message').textContent = message;
        showModal('success-modal');
    } else {
        alert(message);
    }
}

// Inicializar modales cuando se cargue el documento
document.addEventListener('DOMContentLoaded', function() {
    initModals();
});