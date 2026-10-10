(() => {
      const initialReports = [
        { id: 1, title: 'Luminaria sin funcionar en la esquina', category: 'Alumbrado', date: '2026-10-09', location: 'Calle 12 con Carrera 8, Centro', status: 'En revisión', description: 'La luminaria de la esquina lleva varios días apagada y la zona queda muy oscura durante la noche.' },
        { id: 2, title: 'Vehículo sospechoso estacionado por varias horas', category: 'Seguridad', date: '2026-10-08', location: 'Parque del barrio San José', status: 'Recibido', description: 'Un vehículo permanece estacionado en el mismo lugar desde la mañana. Comparto la ubicación para que pueda ser verificado.' },
        { id: 3, title: 'Hueco en la vía frente al colegio', category: 'Vía pública', date: '2026-10-07', location: 'Carrera 15, frente al colegio', status: 'Resuelto', description: 'Se reportó un daño en la calzada que dificultaba el paso de vehículos y peatones.' },
        { id: 4, title: 'Robo de bicicleta en zona residencial', category: 'Seguridad', date: '2026-10-06', location: 'Conjunto Los Pinos, entrada principal', status: 'En revisión', description: 'Se presentó el hurto de una bicicleta cerca de la entrada principal del conjunto.' },
        { id: 5, title: 'Señal de tránsito caída', category: 'Vía pública', date: '2026-10-05', location: 'Calle 20 con Carrera 11', status: 'Recibido', description: 'Una señal de tránsito está caída sobre el andén y puede representar un riesgo para quienes pasan por allí.' },
        { id: 6, title: 'Luminaria intermitente en el parque', category: 'Alumbrado', date: '2026-10-04', location: 'Parque La Esperanza', status: 'Resuelto', description: 'La luminaria principal del parque prendía y apagaba de forma intermitente durante la noche.' },
        { id: 7, title: 'Acumulación de residuos en el andén', category: 'Otro', date: '2026-10-03', location: 'Avenida 6, frente al mercado', status: 'Recibido', description: 'Se acumularon residuos en el andén y el paso peatonal quedó parcialmente obstruido.' },
        { id: 8, title: 'Daño en la tapa de una alcantarilla', category: 'Vía pública', date: '2026-10-02', location: 'Calle 9 con Carrera 4', status: 'En revisión', description: 'La tapa de una alcantarilla está desnivelada y presenta un borde roto.' },
        { id: 9, title: 'Alumbrado apagado en el sendero', category: 'Alumbrado', date: '2026-10-01', location: 'Sendero peatonal del barrio La Floresta', status: 'Resuelto', description: 'Varios postes de luz del sendero peatonal dejaron de funcionar.' },
        { id: 10, title: 'Daño en el mobiliario del parque', category: 'Otro', date: '2026-09-28', location: 'Parque del barrio San José', status: 'En revisión', description: 'Una banca del parque se encuentra rota y tiene piezas sueltas.' }
      ];
      const STORAGE_KEY = 'zaffapp-reports';
      const PAGE_SIZE = 7;
      const $ = (selector) => document.querySelector(selector);
      const rowsContainer = $('#reportRows');
      const pagination = $('#pagination');
      const toast = $('#toast');
      let reports = initialReports;
      let currentView = 'all';
      let currentPage = 1;
      let toastTimer;
      let lastFocusedElement;

      function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2800);
      }

      function loadReports() {
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          if (!Array.isArray(saved.created)) return;
          const created = saved.created.filter((report) =>
            report && Number.isSafeInteger(report.id) &&
            ['Seguridad', 'Vía pública', 'Alumbrado', 'Otro'].includes(report.category) &&
            typeof report.title === 'string' && typeof report.location === 'string' &&
            typeof report.description === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(report.date)
          ).map((report) => ({ ...report, status: 'Recibido' }));
          reports = [...created, ...initialReports];
        } catch (error) {
          showToast('No se pudieron cargar los reportes guardados en este navegador.');
        }
      }

      function saveCreatedReport(report) {
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          const created = Array.isArray(saved.created) ? saved.created : [];
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ created: [report, ...created] }));
          $('#reportStatus').textContent = 'Información actualizada';
          $('#reportStatus').classList.remove('is-dirty');
          return true;
        } catch (error) {
          $('#reportStatus').textContent = 'No se pudo guardar el reporte';
          $('#reportStatus').classList.add('is-dirty');
          showToast('El reporte está visible, pero no se pudo guardar en este navegador.');
          return false;
        }
      }

      function filteredReports() {
        const query = $('#reportSearch').value.trim().toLocaleLowerCase('es');
        const category = $('#categoryFilter').value;
        const from = $('#dateFrom').value;
        const to = $('#dateTo').value;
        return reports.filter((report) => {
          const matchesView = currentView === 'all' ||
            (currentView === 'received' && report.status === 'Recibido') ||
            (currentView === 'review' && report.status === 'En revisión') ||
            (currentView === 'resolved' && report.status === 'Resuelto');
          const matchesCategory = category === 'all' || report.category === category;
          const matchesFrom = !from || report.date >= from;
          const matchesTo = !to || report.date <= to;
          const matchesQuery = !query || `${report.title} ${report.category} ${report.location} ${report.description}`.toLocaleLowerCase('es').includes(query);
          return matchesView && matchesCategory && matchesFrom && matchesTo && matchesQuery;
        });
      }

      function renderCounts() {
        const received = reports.filter((report) => report.status === 'Recibido').length;
        const review = reports.filter((report) => report.status === 'En revisión').length;
        const resolved = reports.filter((report) => report.status === 'Resuelto').length;
        $('#totalReports').textContent = reports.length;
        $('#receivedReports').textContent = received;
        $('#reviewReports').textContent = review;
        $('#resolvedReports').textContent = resolved;
        $('#count-all').textContent = reports.length;
        $('#count-received').textContent = received;
        $('#count-review').textContent = review;
        $('#count-resolved').textContent = resolved;
      }

      function statusClass(status) {
        return status === 'Resuelto' ? 'status-resolved' : status === 'En revisión' ? 'status-review' : 'status-received';
      }

      function renderPagination(totalPages) {
        pagination.replaceChildren();
        if (totalPages <= 1) return;
        const items = [{ label: '‹', page: currentPage - 1, title: 'Página anterior', disabled: currentPage === 1 }];
        for (let page = 1; page <= totalPages; page++) {
          items.push({ label: String(page), page, title: `Página ${page}`, active: page === currentPage });
        }
        items.push({ label: '›', page: currentPage + 1, title: 'Página siguiente', disabled: currentPage === totalPages });
        items.forEach((item) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = `page-button${item.active ? ' active' : ''}`;
          button.textContent = item.label;
          button.title = item.title;
          button.setAttribute('aria-label', item.title);
          if (item.active) button.setAttribute('aria-current', 'page');
          button.disabled = Boolean(item.disabled);
          button.addEventListener('click', () => {
            currentPage = item.page;
            renderReports();
          });
          pagination.appendChild(button);
        });
      }

      function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[character]);
      }

      function renderReports() {
        const filtered = filteredReports();
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        currentPage = Math.min(currentPage, totalPages);
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const items = filtered.slice(startIndex, startIndex + PAGE_SIZE);
        rowsContainer.replaceChildren();
        items.forEach((report) => {
          const row = document.createElement('tr');
          row.className = 'report-row';
          row.innerHTML = `
            <td class="report-title-cell">
              <button class="report-title" type="button" data-detail-id="${report.id}">${escapeHTML(report.title)}</button>
              <span class="report-location">${escapeHTML(report.location)}</span>
            </td>
            <td>${escapeHTML(report.category)}</td>
            <td class="date-cell"><time datetime="${report.date}">${formatDate(report.date)}</time></td>
            <td><span class="report-status ${statusClass(report.status)}">${escapeHTML(report.status)}</span></td>
            <td class="report-actions"><button class="view-report" type="button" data-detail-id="${report.id}" aria-label="Ver reporte: ${escapeHTML(report.title)}">Ver</button></td>
          `;
          rowsContainer.appendChild(row);
        });
        const hasResults = filtered.length > 0;
        $('#emptyState').hidden = hasResults;
        $('.reports-table').hidden = !hasResults;
        $('#resultsCount').textContent = hasResults
          ? `Mostrando ${startIndex + 1} a ${Math.min(startIndex + PAGE_SIZE, filtered.length)} de ${filtered.length} reportes`
          : 'Mostrando 0 reportes';
        renderPagination(totalPages);
        renderCounts();
      }

      function formatDate(date) {
        return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
          .format(new Date(`${date}T12:00:00`));
      }

      function selectView(view) {
        currentView = view;
        document.querySelectorAll('.tab-button').forEach((tab) => {
          const selected = tab.dataset.view === view;
          tab.classList.toggle('active', selected);
          tab.setAttribute('aria-selected', String(selected));
        });
      }

      function openModal(modal, focusTarget) {
        lastFocusedElement = document.activeElement;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        focusTarget.focus();
      }

      function closeModal(modal) {
        modal.hidden = true;
        if ($('#reportModal').hidden && $('#detailModal').hidden) document.body.classList.remove('modal-open');
        lastFocusedElement?.focus();
      }

      function openDetail(reportId) {
        const report = reports.find((item) => item.id === Number(reportId));
        if (!report) return;
        $('#detailCategory').textContent = report.category;
        $('#detailTitle').textContent = report.title;
        $('#detailStatus').innerHTML = `<span class="report-status ${statusClass(report.status)}">${escapeHTML(report.status)}</span>`;
        $('#detailDescription').textContent = report.description;
        $('#detailLocation').textContent = report.location;
        $('#detailDate').textContent = formatDate(report.date);
        openModal($('#detailModal'), $('#closeDetailModal'));
      }

      function toggleSidebar() {
        if (window.matchMedia('(max-width: 640px)').matches) {
          document.body.classList.toggle('mobile-menu-open');
        } else {
          document.body.classList.toggle('sidebar-collapsed');
        }
      }

      loadReports();
      try {
        const settings = JSON.parse(localStorage.getItem('zaffapp-settings') || '{}');
        if (typeof settings.username === 'string' && settings.username.trim()) {
          $('#sidebarUsername').textContent = settings.username.trim();
          $('#topbarUsername').textContent = settings.username.trim();
        }
      } catch (error) {
        showToast('No se pudo cargar el perfil guardado.');
      }

      $('#sidebarToggle').addEventListener('click', toggleSidebar);
      $('#topbarMenuToggle').addEventListener('click', toggleSidebar);
      $('#sidebarBackdrop').addEventListener('click', () => document.body.classList.remove('mobile-menu-open'));
      window.addEventListener('resize', () => {
        if (!window.matchMedia('(max-width: 640px)').matches) document.body.classList.remove('mobile-menu-open');
      });
      document.querySelectorAll('[data-unavailable-view]').forEach((link) => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          showToast(`La vista de ${link.dataset.unavailableView} aún no está disponible.`);
        });
      });

      document.querySelectorAll('.tab-button').forEach((button) => {
        button.addEventListener('click', () => {
          selectView(button.dataset.view);
          currentPage = 1;
          renderReports();
        });
      });
      $('#reportSearch').addEventListener('input', () => { currentPage = 1; renderReports(); });
      $('#categoryFilter').addEventListener('change', () => { currentPage = 1; renderReports(); });
      [$('#dateFrom'), $('#dateTo')].forEach((control) => control.addEventListener('change', () => {
        currentPage = 1;
        renderReports();
      }));
      $('#clearFilters').addEventListener('click', () => {
        $('#reportSearch').value = '';
        $('#categoryFilter').value = 'all';
        $('#dateFrom').value = '';
        $('#dateTo').value = '';
        selectView('all');
        currentPage = 1;
        renderReports();
      });

      $('#newReportButton').addEventListener('click', () => {
        $('#reportError').textContent = '';
        openModal($('#reportModal'), $('#reportTitle'));
      });
      $('#cancelReport').addEventListener('click', () => closeModal($('#reportModal')));
      $('#closeReportModal').addEventListener('click', () => closeModal($('#reportModal')));
      $('#closeDetailModal').addEventListener('click', () => closeModal($('#detailModal')));
      $('#closeDetailButton').addEventListener('click', () => closeModal($('#detailModal')));
      [$('#reportModal'), $('#detailModal')].forEach((modal) => {
        modal.addEventListener('click', (event) => {
          if (event.target === modal) closeModal(modal);
        });
      });
      $('#reportDescription').addEventListener('input', () => {
        $('#descriptionCount').textContent = `${$('#reportDescription').value.length} / 600`;
      });
      $('#reportForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const today = new Date();
        const localDate = [
          today.getFullYear(),
          String(today.getMonth() + 1).padStart(2, '0'),
          String(today.getDate()).padStart(2, '0')
        ].join('-');
        const report = {
          id: Date.now(),
          title: $('#reportTitle').value.trim(),
          category: $('#reportCategory').value,
          location: $('#reportLocation').value.trim(),
          description: $('#reportDescription').value.trim(),
          date: localDate,
          status: 'Recibido'
        };
        if (!report.title || !report.location || !report.description) {
          $('#reportError').textContent = 'Completa todos los campos antes de enviar.';
          return;
        }
        reports.unshift(report);
        const saved = saveCreatedReport(report);
        form.reset();
        $('#descriptionCount').textContent = '0 / 600';
        $('#reportError').textContent = '';
        closeModal($('#reportModal'));
        $('#reportSearch').value = '';
        $('#categoryFilter').value = 'all';
        $('#dateFrom').value = '';
        $('#dateTo').value = '';
        selectView('all');
        currentPage = 1;
        renderReports();
        showToast(saved ? 'Reporte creado y guardado en este navegador.' : 'Reporte creado para esta sesión; no se pudo guardar permanentemente.');
      });
      rowsContainer.addEventListener('click', (event) => {
        const detailButton = event.target.closest('[data-detail-id]');
        if (detailButton) openDetail(detailButton.dataset.detailId);
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          if (!$('#detailModal').hidden) closeModal($('#detailModal'));
          else if (!$('#reportModal').hidden) closeModal($('#reportModal'));
          document.body.classList.remove('mobile-menu-open');
        }
        const modal = !$('#reportModal').hidden ? $('#reportModal') : !$('#detailModal').hidden ? $('#detailModal') : null;
        if (event.key === 'Tab' && modal) {
          const focusable = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')];
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

      renderReports();
    })();