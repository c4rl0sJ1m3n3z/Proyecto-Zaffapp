(() => {
  const demoReports = [
    { id: 1, title: 'Luminaria sin funcionar en la esquina', category: 'Alumbrado', date: '2026-10-09', location: 'Calle 12 con Carrera 8, Centro', status: 'En revisión', description: 'La luminaria de la esquina lleva varios días apagada y la zona queda muy oscura durante la noche.', x: 39, y: 39 },
    { id: 2, title: 'Vehículo sospechoso estacionado por varias horas', category: 'Seguridad', date: '2026-10-08', location: 'Parque del barrio San José', status: 'Recibido', description: 'Un vehículo permanece estacionado en el mismo lugar desde la mañana. Comparto la ubicación para que pueda ser verificado.', x: 23, y: 34 },
    { id: 3, title: 'Hueco en la vía frente al colegio', category: 'Vía pública', date: '2026-10-07', location: 'Carrera 15, frente al colegio', status: 'Resuelto', description: 'Se reportó un daño en la calzada que dificultaba el paso de vehículos y peatones.', x: 79, y: 54 },
    { id: 4, title: 'Robo de bicicleta en zona residencial', category: 'Seguridad', date: '2026-10-06', location: 'Conjunto Los Pinos, entrada principal', status: 'En revisión', description: 'Se presentó el hurto de una bicicleta cerca de la entrada principal del conjunto.', x: 58, y: 28 },
    { id: 5, title: 'Señal de tránsito caída', category: 'Vía pública', date: '2026-10-05', location: 'Calle 20 con Carrera 11', status: 'Recibido', description: 'Una señal de tránsito está caída sobre el andén y puede representar un riesgo para quienes pasan por allí.', x: 31, y: 69 },
    { id: 6, title: 'Luminaria intermitente en el parque', category: 'Alumbrado', date: '2026-10-04', location: 'Parque La Esperanza', status: 'Resuelto', description: 'La luminaria principal del parque prendía y apagaba de forma intermitente durante la noche.', x: 78, y: 76 },
    { id: 7, title: 'Acumulación de residuos en el andén', category: 'Otro', date: '2026-10-03', location: 'Avenida 6, frente al mercado', status: 'Recibido', description: 'Se acumularon residuos en el andén y el paso peatonal quedó parcialmente obstruido.', x: 51, y: 58 },
    { id: 8, title: 'Daño en la tapa de una alcantarilla', category: 'Vía pública', date: '2026-10-02', location: 'Calle 9 con Carrera 4', status: 'En revisión', description: 'La tapa de una alcantarilla está desnivelada y presenta un borde roto.', x: 17, y: 61 },
    { id: 9, title: 'Alumbrado apagado en el sendero', category: 'Alumbrado', date: '2026-10-01', location: 'Sendero peatonal del barrio La Floresta', status: 'Resuelto', description: 'Varios postes de luz del sendero peatonal dejaron de funcionar.', x: 67, y: 19 },
    { id: 10, title: 'Daño en el mobiliario del parque', category: 'Otro', date: '2026-09-28', location: 'Parque del barrio San José', status: 'En revisión', description: 'Una banca del parque se encuentra rota y tiene piezas sueltas.', x: 27, y: 81 }
  ];
  const validCategories = new Set(['Seguridad', 'Vía pública', 'Alumbrado', 'Otro']);
  const validStatuses = new Set(['Recibido', 'En revisión', 'En proceso', 'Resuelto']);
  const $ = (selector, root = document) => root.querySelector(selector);
  const markerLayer = $('#markerLayer');
  const reportList = $('#reportList');
  const reportDetail = $('#reportDetail');
  const mapToast = $('#mapToast');
  const mapScene = $('#mapScene');
  let reports = [...demoReports];
  let selectedReportId = null;
  let zoom = 1;
  let toastTimer;

  function showToast(message) {
    mapToast.textContent = message;
    mapToast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => mapToast.classList.remove('show'), 2600);
  }

  function hashPosition(report) {
    const seed = [...String(report.id)].reduce((total, char) => total + char.charCodeAt(0), 0);
    return {
      x: 12 + (seed * 37) % 76,
      y: 14 + (seed * 53) % 72
    };
  }

  function loadReports() {
    try {
      const saved = JSON.parse(localStorage.getItem('zaffapp-reports') || '{}');
      if (!Array.isArray(saved.created)) return;

      const createdReports = saved.created
        .filter((report) =>
          report &&
          Number.isSafeInteger(report.id) &&
          validCategories.has(report.category) &&
          typeof report.title === 'string' &&
          typeof report.location === 'string' &&
          typeof report.description === 'string' &&
          /^\d{4}-\d{2}-\d{2}$/.test(report.date) &&
          !Number.isNaN(Date.parse(`${report.date}T12:00:00`))
        )
        .map((report) => ({
          ...report,
          status: validStatuses.has(report.status) ? report.status : 'Recibido',
          ...hashPosition(report)
        }));
      reports = [...createdReports, ...demoReports];
    } catch (error) {
      showToast('No se pudieron cargar los reportes guardados en este navegador.');
    }
  }

  function loadUsername() {
    try {
      const settings = JSON.parse(localStorage.getItem('zaffapp-settings') || '{}');
      if (typeof settings.username !== 'string' || !settings.username.trim()) return;
      $('#sidebarUsername').textContent = settings.username.trim();
      $('#topbarUsername').textContent = settings.username.trim();
    } catch (error) {
      showToast('No se pudo cargar el perfil guardado.');
    }
  }

  function filteredReports() {
    const query = $('#mapSearch').value.trim().toLocaleLowerCase('es');
    const category = $('#categoryFilter').value;
    const status = $('#statusFilter').value;
    return reports.filter((report) => {
      const matchesCategory = category === 'all' || report.category === category;
      const matchesStatus = status === 'all' || report.status === status;
      const searchable = `${report.title} ${report.category} ${report.location} ${report.description}`.toLocaleLowerCase('es');
      return matchesCategory && matchesStatus && (!query || searchable.includes(query));
    });
  }

  function statusClass(status) {
    if (status === 'En revisión') return 'review';
    if (status === 'En proceso') return 'process';
    if (status === 'Resuelto') return 'resolved';
    return 'received';
  }

  function formatDate(value) {
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  }

  function createMarker(report) {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = `report-marker marker-${statusClass(report.status)}`;
    marker.style.left = `${report.x}%`;
    marker.style.top = `${report.y}%`;
    marker.dataset.reportId = String(report.id);
    marker.setAttribute('aria-label', `${report.title}, ${report.status}. Seleccionar reporte`);
    marker.setAttribute('aria-pressed', String(String(report.id) === String(selectedReportId)));
    marker.title = `${report.title} · ${report.status}`;
    if (String(report.id) === String(selectedReportId)) marker.classList.add('selected');
    marker.addEventListener('click', () => selectReport(report.id));
    return marker;
  }

  function createListItem(report) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'map-report-item';
    item.dataset.reportId = String(report.id);
    item.setAttribute('aria-pressed', String(String(report.id) === String(selectedReportId)));
    if (String(report.id) === String(selectedReportId)) item.classList.add('selected');

    const title = document.createElement('strong');
    title.textContent = report.title;
    const meta = document.createElement('span');
    meta.className = 'map-report-meta';
    const location = document.createElement('span');
    location.className = 'map-report-location';
    location.textContent = report.location;
    location.title = report.location;
    const state = document.createElement('span');
    state.className = `report-state state-${statusClass(report.status)}`;
    state.textContent = report.status;
    meta.append(location, state);
    item.append(title, meta);
    item.addEventListener('click', () => selectReport(report.id));
    return item;
  }

  function renderDetail(report) {
    reportDetail.replaceChildren();
    const category = document.createElement('span');
    category.className = 'detail-category';
    category.textContent = report.category;
    const title = document.createElement('h3');
    title.textContent = report.title;
    const description = document.createElement('p');
    description.textContent = report.description;
    const info = document.createElement('div');
    info.className = 'detail-info';
    const date = document.createElement('p');
    date.innerHTML = '<strong>Fecha:</strong> ';
    date.append(document.createTextNode(formatDate(report.date)));
    const location = document.createElement('p');
    location.innerHTML = '<strong>Ubicación:</strong> ';
    location.append(document.createTextNode(report.location));
    const status = document.createElement('p');
    status.innerHTML = '<strong>Estado:</strong> ';
    const stateBadge = document.createElement('span');
    stateBadge.className = `report-state state-${statusClass(report.status)}`;
    stateBadge.textContent = report.status;
    status.append(stateBadge);
    info.append(date, location, status);
    const link = document.createElement('a');
    link.className = 'detail-report-link';
    link.href = '../../../../front_estadisticas_reportes/reportes/reportes.html';
    link.textContent = 'Consultar todos los reportes →';
    reportDetail.append(category, title, description, info, link);
  }

  function selectReport(reportId) {
    selectedReportId = reportId;
    const report = reports.find((item) => String(item.id) === String(reportId));
    if (!report) {
      selectedReportId = null;
      render();
      return;
    }
    render();
    renderDetail(report);
  }

  function render() {
    const visibleReports = filteredReports();
    const totalPending = visibleReports.filter((report) => report.status !== 'Resuelto').length;
    const totalResolved = visibleReports.filter((report) => report.status === 'Resuelto').length;
    const categoryCount = new Set(visibleReports.map((report) => report.category)).size;

    $('#visibleCount').textContent = String(visibleReports.length);
    $('#pendingCount').textContent = String(totalPending);
    $('#resolvedCount').textContent = String(totalResolved);
    $('#categoryCount').textContent = String(categoryCount);
    $('#mapResultLabel').textContent = `${visibleReports.length} ${visibleReports.length === 1 ? 'reporte' : 'reportes'} en el área`;
    $('#listResultLabel').textContent = `${visibleReports.length} ${visibleReports.length === 1 ? 'resultado' : 'resultados'}`;
    $('#mapEmpty').hidden = visibleReports.length !== 0;

    markerLayer.replaceChildren(...visibleReports.map(createMarker));
    reportList.replaceChildren(...visibleReports.map(createListItem));
    if (visibleReports.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'map-list-empty';
      empty.textContent = 'Prueba con otra búsqueda o limpia los filtros para ver los reportes.';
      reportList.append(empty);
    }

    const selectedVisible = visibleReports.find((report) => String(report.id) === String(selectedReportId));
    if (selectedVisible) {
      renderDetail(selectedVisible);
    } else {
      selectedReportId = null;
      reportDetail.innerHTML = '<div class="detail-placeholder-icon" aria-hidden="true">⌖</div><h3>Selecciona un marcador</h3><p>Elige un punto del mapa o un reporte de la lista para consultar sus detalles.</p>';
    }
  }

  function toggleSidebar() {
    document.body.classList.toggle(
      window.matchMedia('(max-width: 640px)').matches ? 'mobile-menu-open' : 'sidebar-collapsed'
    );
  }

  $('#sidebarToggle').addEventListener('click', toggleSidebar);
  $('#topbarMenuToggle').addEventListener('click', toggleSidebar);
  $('#sidebarBackdrop').addEventListener('click', () => document.body.classList.remove('mobile-menu-open'));
  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 640px)').matches) {
      document.body.classList.remove('mobile-menu-open');
    }
  });

  $('#mapSearch').addEventListener('input', render);
  $('#categoryFilter').addEventListener('change', render);
  $('#statusFilter').addEventListener('change', render);
  $('#clearFilters').addEventListener('click', () => {
    $('#mapSearch').value = '';
    $('#categoryFilter').value = 'all';
    $('#statusFilter').value = 'all';
    selectedReportId = null;
    render();
    showToast('Se limpiaron los filtros del mapa.');
  });

  $('#zoomIn').addEventListener('click', () => {
    zoom = Math.min(zoom + 0.15, 1.75);
    mapScene.style.transform = `scale(${zoom})`;
  });
  $('#zoomOut').addEventListener('click', () => {
    zoom = Math.max(zoom - 0.15, 0.85);
    mapScene.style.transform = `scale(${zoom})`;
  });
  $('#resetMap').addEventListener('click', () => {
    zoom = 1;
    mapScene.style.transform = 'scale(1)';
    selectedReportId = null;
    render();
    showToast('Vista del mapa restablecida.');
  });

  loadReports();
  loadUsername();
  render();
})();
