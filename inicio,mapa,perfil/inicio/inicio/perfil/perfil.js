(() => {
  const $ = (selector) => document.querySelector(selector);
  const form = $('#profileForm');
  const toast = $('#profileToast');
  const status = $('#saveStatus');
  const storageKey = 'zaffapp-settings';
  const defaultProfile = {
    username: 'Nombre_de_usuario',
    email: 'usuario@gmail.com',
    phone: '+57 0000000000'
  };
  let savedSettings = {};
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function updateIdentity(username, email) {
    const name = username.trim() || defaultProfile.username;
    const initials = name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('es') || 'U';
    $('#profileDisplayName').textContent = name;
    $('#profileDisplayEmail').textContent = email.trim() || 'Sin correo registrado';
    $('#profileInitials').textContent = initials;
    $('#sidebarUsername').textContent = name;
    $('#topbarUsername').textContent = name;
    $('#sidebarAvatar').textContent = initials[0];
    $('#topbarAvatar').textContent = initials[0];
  }

  function readSettings() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError('El perfil guardado tiene un formato no válido.');
      }
      savedSettings = value;
    } catch (error) {
      showToast('No se pudo cargar el perfil guardado; se muestran los datos iniciales.');
      savedSettings = {};
    }
    for (const field of Object.keys(defaultProfile)) {
      const value = savedSettings[field];
      $('#' + field).value = typeof value === 'string' && value.trim() ? value : defaultProfile[field];
    }
    updateIdentity($('#username').value, $('#email').value);
  }

  function renderReportCounts() {
    try {
      const storedReports = JSON.parse(localStorage.getItem('zaffapp-reports') || '{}');
      const reports = Array.isArray(storedReports.created) ? storedReports.created : [];
      $('#createdReportsCount').textContent = String(reports.length);
      $('#receivedReportsCount').textContent = String(reports.filter((report) => report.status === 'Recibido' || !report.status).length);
      $('#reviewReportsCount').textContent = String(reports.filter((report) => report.status === 'En revisión' || report.status === 'En proceso').length);
      $('#resolvedReportsCount').textContent = String(reports.filter((report) => report.status === 'Resuelto').length);
    } catch (error) {
      showToast('No se pudo leer el resumen de reportes guardados.');
    }
  }

  function toggleSidebar() {
    document.body.classList.toggle(
      window.matchMedia('(max-width: 640px)').matches ? 'mobile-menu-open' : 'sidebar-collapsed'
    );
  }

  form.addEventListener('input', () => {
    status.textContent = 'Tienes cambios sin guardar';
    status.classList.add('is-dirty');
    updateIdentity($('#username').value, $('#email').value);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = {
      ...savedSettings,
      username: $('#username').value.trim(),
      email: $('#email').value.trim(),
      phone: $('#phone').value.trim()
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      savedSettings = data;
      status.textContent = 'Todos los cambios están guardados';
      status.classList.remove('is-dirty');
      updateIdentity(data.username, data.email);
      showToast('Perfil actualizado en este navegador.');
    } catch (error) {
      status.textContent = 'No se pudieron guardar los cambios';
      status.classList.add('is-dirty');
      showToast('El perfil se muestra actualizado, pero no se pudo guardar en este navegador.');
    }
  });

  $('#sidebarToggle').addEventListener('click', toggleSidebar);
  $('#topbarMenuToggle').addEventListener('click', toggleSidebar);
  $('#sidebarBackdrop').addEventListener('click', () => document.body.classList.remove('mobile-menu-open'));
  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 640px)').matches) {
      document.body.classList.remove('mobile-menu-open');
    }
  });

  readSettings();
  renderReportCounts();
})();
