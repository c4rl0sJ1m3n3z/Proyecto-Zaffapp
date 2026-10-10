(() => {
    const $ = (selector) => document.querySelector(selector);
    const toast = $('#toast');
    const saveStatus = $('#saveStatus');
    let toastTimer;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2800);
    }

    // Contraer el menú como en la vista de Reportes; en pantallas pequeñas abre/cierra el panel.
    function toggleSidebar() {
        if (window.matchMedia('(max-width: 640px)').matches) {
            document.body.classList.toggle('mobile-menu-open');
        } else {
            document.body.classList.toggle('sidebar-collapsed');
        }
    }
    $('#sidebarToggle').addEventListener('click', toggleSidebar);
    $('#topbarMenuToggle').addEventListener('click', toggleSidebar);
    document.querySelectorAll('[data-unavailable-view]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            showToast('La vista de ' + link.dataset.unavailableView + ' aún no está disponible.');
        });
    });
    $('#sidebarBackdrop').addEventListener('click', () => document.body.classList.remove('mobile-menu-open'));
    window.addEventListener('resize', () => {
        if (!window.matchMedia('(max-width: 640px)').matches) {
            document.body.classList.remove('mobile-menu-open');
        }
    });

    // Carga preferencias guardadas localmente, si existen.
    const textFields = ['username', 'email', 'phone'];
    const preferenceFields = ['publicProfile', 'showLocation', 'shareStats'];
    try {
        const saved = JSON.parse(localStorage.getItem('zaffapp-settings') || '{}');
        textFields.forEach((field) => {
            if (typeof saved[field] === 'string' && saved[field].trim()) {
                $('#' + field).value = saved[field];
            }
        });
        preferenceFields.forEach((field) => {
            if (typeof saved[field] === 'boolean') $('#' + field).checked = saved[field];
        });
    } catch (error) {
        showToast('No se pudieron cargar las preferencias guardadas en este navegador.');
    }
    textFields.forEach((field) => updateFieldDisplay(field));

    function markUnsaved() {
        saveStatus.textContent = 'Tienes cambios sin guardar';
        saveStatus.classList.add('is-dirty');
    }

    function markSaved() {
        saveStatus.textContent = 'Todos los cambios están guardados';
        saveStatus.classList.remove('is-dirty');
    }

    function updateFieldDisplay(field) {
        const value = $('#' + field).value.trim();
        $('#' + field + 'Text').textContent = value || 'Sin información';
        if (field === 'username') {
            $('#sidebarUsername').textContent = value || 'Nombre de usuario';
            $('#topbarUsername').textContent = value || 'Nombre de usuario';
        }
    }

    // Cada lápiz convierte solamente su campo en editable.
    document.querySelectorAll('[data-edit]').forEach((button) => {
        button.addEventListener('click', () => {
            const field = button.dataset.edit;
            const input = $('#' + field);
            const isEditing = !input.hidden;
            if (isEditing) {
                updateFieldDisplay(field);
                input.hidden = true;
                $('#' + field + 'Text').hidden = false;
                button.textContent = '✎';
                button.setAttribute('aria-label', 'Editar ' + field);
                button.title = 'Editar';
                markUnsaved();
                return;
            }
            input.hidden = false;
            $('#' + field + 'Text').hidden = true;
            input.focus();
            input.select?.();
            button.textContent = '✓';
            button.setAttribute('aria-label', 'Terminar edición de ' + field);
            button.title = 'Terminar edición';
        });
    });
    textFields.forEach((field) => {
        $('#' + field).addEventListener('input', () => {
            updateFieldDisplay(field);
            markUnsaved();
        });
    });
    preferenceFields.forEach((field) => {
        $('#' + field).addEventListener('change', markUnsaved);
    });

    // Guardar perfil y privacidad en localStorage para que se conserven en este navegador.
    $('#saveChanges').addEventListener('click', () => {
        for (const field of textFields) {
            const input = $('#' + field);
            if (!input.checkValidity()) {
                input.hidden = false;
                $('#' + field + 'Text').hidden = true;
                document.querySelector('[data-edit="' + field + '"]').textContent = '✓';
                input.focus();
                const editButton = document.querySelector('[data-edit="' + field + '"]');
                editButton.setAttribute('aria-label', 'Terminar edición de ' + field);
                editButton.title = 'Terminar edición';
                showToast(field === 'email' ? 'Introduce un correo electrónico válido.' : 'Completa los datos obligatorios del perfil.');
                return;
            }
        }
        const data = {};
        textFields.forEach((field) => {
            data[field] = $('#' + field).value.trim();
            $('#' + field).hidden = true;
            $('#' + field + 'Text').hidden = false;
            updateFieldDisplay(field);
            const editButton = document.querySelector('[data-edit="' + field + '"]');
            editButton.textContent = '✎';
            editButton.setAttribute('aria-label', 'Editar ' + field);
            editButton.title = 'Editar';
        });
        preferenceFields.forEach((field) => { data[field] = $('#' + field).checked; });
        try {
            localStorage.setItem('zaffapp-settings', JSON.stringify(data));
            markSaved();
            showToast('Cambios guardados correctamente.');
        } catch (error) {
            markUnsaved();
            showToast('Los cambios están aplicados, pero el navegador no permitió guardarlos permanentemente.');
        }
    });

    // Modal de cambio de contraseña.
    const modal = $('#passwordModal');
    let passwordTrigger;
    function openPasswordModal() {
        passwordTrigger = document.activeElement;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        $('#currentPassword').focus();
        $('#passwordError').textContent = '';
    }
    function closePasswordModal() {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
        $('#passwordForm').reset();
        $('#passwordError').textContent = '';
        passwordTrigger?.focus();
    }
    $('#openPassword').addEventListener('click', openPasswordModal);
    $('#closePassword').addEventListener('click', closePasswordModal);
    $('#cancelPassword').addEventListener('click', closePasswordModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closePasswordModal(); });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) closePasswordModal();
        if (event.key === 'Escape') document.body.classList.remove('mobile-menu-open');
        if (event.key === 'Tab' && !modal.hidden) {
            const focusable = modal.querySelectorAll('button:not([disabled]), input:not([disabled])');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
    $('#passwordForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const current = $('#currentPassword').value;
        const next = $('#newPassword').value;
        const confirm = $('#confirmPassword').value;
        const error = $('#passwordError');
        if (!current) {
            error.textContent = 'Introduce tu contraseña actual.';
        } else if (next.length < 8) {
            error.textContent = 'La nueva contraseña debe tener al menos 8 caracteres.';
        } else if (next !== confirm) {
            error.textContent = 'Las contraseñas nuevas no coinciden.';
        } else {
            // Interfaz demostrativa: sin conexión a un servidor no se modifica una contraseña real.
            closePasswordModal();
            showToast('Formulario validado. Conecta esta acción a tu backend para actualizar la contraseña.');
        }
    });})();