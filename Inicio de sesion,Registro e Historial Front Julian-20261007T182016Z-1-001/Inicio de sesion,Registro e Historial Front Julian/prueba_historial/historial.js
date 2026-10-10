 (() => {
      const demoReports = [
        { id: 'h1', title: 'Vía en mal estado', category: 'Infraestructura', date: '2026-05-22', location: 'Calle 26 con Carrera 9, Soacha', priority: 'Alta', status: 'En revisión', description: 'Se reportó un tramo de vía en mal estado que dificulta el tránsito y puede causar daños a los vehículos.' },
        { id: 'h2', title: 'Manifestaciones', category: 'Orden público', date: '2026-05-21', location: 'Carrera 7 con Calle 15, Parque Central', priority: 'Media', status: 'En proceso', description: 'Se reportó una manifestación en el sector para mantener informada a la comunidad.' },
        { id: 'h3', title: 'Alumbrado dañado', category: 'Servicios públicos', date: '2026-05-20', location: 'Calle 13 con Carrera 8, Centro de Soacha', priority: 'Media', status: 'Resuelto', description: 'Una luminaria del sector dejó de funcionar. El caso fue atendido.' },
        { id: 'h4', title: 'Actividad sospechosa', category: 'Seguridad ciudadana', date: '2026-05-19', location: 'Avenida Indumil, Soacha', priority: 'Alta', status: 'En revisión', description: 'Se reportó actividad sospechosa en el sector para que las autoridades puedan revisarla.' },
        { id: 'h5', title: 'Accidente de tránsito', category: 'Movilidad', date: '2026-05-18', location: 'Autopista Sur, Soacha', priority: 'Alta', status: 'En proceso', description: 'Se reportó un accidente de tránsito en la Autopista Sur.' }
      ];
      const validCategories = new Set(['Seguridad', 'Vía pública', 'Alumbrado', 'Otro']);
      const PAGE_SIZE = 7;
      const $ = (selector) => document.querySelector(selector);
      let reports = [...demoReports];
      let currentView = 'all';
      let currentPage = 1;
      let lastFocusedElement;

      function showToast(message) {
        const toast = $('#toast');
        toast.textContent = message;
        toast.classList.add('show');
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2800);
      }

      function loadSavedReports() {
        try {
          const saved = JSON.parse(localStorage.getItem('zaffapp-reports') || '{}');
          if (!Array.isArray(saved.created)) return;
          const created = saved.created.filter((report) =>
            report && Number.isSafeInteger(report.id) &&
            validCategories.has(report.category) &&
            typeof report.title === 'string' &&
            typeof report.location === 'string' &&
            typeof report.description === 'string' &&
            /^\d{4}-\d{2}-\d{2}$/.test(report.date) &&
            !Number.isNaN(Date.parse(`${report.date}T12:00:00`))
          ).map((report) => ({
            ...report,
            priority: report.priority || 'Media',
            status: report.status === 'En revisión' || report.status === 'En proceso' || report.status === 'Resuelto'
              ? report.status
              : 'Recibido'
          }));
          reports = [...created, ...demoReports].sort((a, b) => b.date.localeCompare(a.date));
        } catch (error) {
          showToast('No se pudieron cargar los reportes guardados en este navegador.');
        }
      }

      function statusKey(status) {
        if (status === 'Recibido') return 'received';
        if (status === 'En revisión') return 'review';
        if (status === 'En proceso') return 'process';
        return 'resolved';
      }

      function filteredReports() {
        const query = $('#historySearch').value.trim().toLocaleLowerCase('es');
        const category = $('#categoryFilter').value;
        const from = $('#dateFrom').value;
        const to = $('#dateTo').value;
        return reports.filter((report) => {
          const matchesView = currentView === 'all' || statusKey(report.status) === currentView;
          const matchesCategory = category === 'all' || report.category === category;
          const matchesFrom = !from || report.date >= from;
          const matchesTo = !to || report.date <= to;
          const matchesQuery = !query ||
            `${report.title} ${report.category} ${report.location} ${report.status}`.toLocaleLowerCase('es').includes(query);
          return matchesView && matchesCategory && matchesFrom && matchesTo && matchesQuery;
        });
      }

      function renderCounts() {
        const counts = {
          all: reports.length,
          received: reports.filter((report) => report.status === 'Recibido').length,
          review: reports.filter((report) => report.status === 'En revisión').length,
          process: reports.filter((report) => report.status === 'En proceso').length,
          resolved: reports.filter((report) => report.status === 'Resuelto').length
        };
        $('#totalReports').textContent = counts.all;
        $('#receivedReports').textContent = counts.received;
        $('#activeReports').textContent = counts.review + counts.process;
        $('#resolvedReports').textContent = counts.resolved;
        Object.entries(counts).forEach(([key, value]) => {
          const count = $(`#count-${key}`);
          if (count) count.textContent = value;
        });
      }

      function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[character]);
      }

      function formatDate(date) {
        return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
          .format(new Date(`${date}T12:00:00`));
      }

      function statusClass(status) {
        if (status === 'Resuelto') return 'status-resolved';
        if (status === 'En proceso') return 'status-process';
        if (status === 'Recibido') return 'status-received';
        return 'status-review';
      }

      function priorityClass(priority) {
        return priority === 'Alta' ? 'priority-high' : priority === 'Baja' ? 'priority-low' : 'priority-medium';
      }

      function renderPagination(totalPages) {
        const pagination = $('#pagination');
        pagination.replaceChildren();
        if (totalPages <= 1) return;
        const buttons = [{ label: '‹', page: currentPage - 1, title: 'Página anterior', disabled: currentPage === 1 }];
        for (let page = 1; page <= totalPages; page++) {
          buttons.push({ label: String(page), page, title: `Página ${page}`, active: currentPage === page });
        }
        buttons.push({ label: '›', page: currentPage + 1, title: 'Página siguiente', disabled: currentPage === totalPages });
        buttons.forEach((item) => {
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

      function renderReports() {
        const filtered = filteredReports();
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        currentPage = Math.min(currentPage, totalPages);
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageReports = filtered.slice(start, start + PAGE_SIZE);
        const rows = $('#historyRows');
        rows.replaceChildren();
        pageReports.forEach((report) => {
          const row = document.createElement('tr');
          row.className = 'history-row';
          row.innerHTML = `
            <td class="report-cell">
              <div class="report-info">
                <span class="report-img" aria-hidden="true">${iconFor(report.category)}</span>
                <span class="report-text"><strong>${escapeHTML(report.title)}</strong><span>${escapeHTML(report.category)}</span></span>
              </div>
            </td>
            <td><span class="location-text">${escapeHTML(report.location)}</span></td>
            <td class="date-cell"><time datetime="${report.date}">${formatDate(report.date)}</time></td>
            <td class="priority-cell"><span class="priority-dot ${priorityClass(report.priority)}" aria-hidden="true"></span>${escapeHTML(report.priority)}</td>
            <td><span class="report-status ${statusClass(report.status)}">${escapeHTML(report.status)}</span></td>
            <td class="action-cell"><button class="view-report" type="button" data-detail-id="${escapeHTML(report.id)}" aria-label="Ver reporte: ${escapeHTML(report.title)}">Ver</button></td>
          `;
          rows.appendChild(row);
        });
        const hasResults = filtered.length > 0;
        $('#emptyState').hidden = hasResults;
        $('.history-table').hidden = !hasResults;
        $('#resultsCount').textContent = hasResults
          ? `Mostrando ${start + 1} a ${Math.min(start + PAGE_SIZE, filtered.length)} de ${filtered.length} reportes`
          : 'Mostrando 0 reportes';
        renderPagination(totalPages);
        renderCounts();
      }

      function iconFor(category) {
        if (category.toLocaleLowerCase('es').includes('vía') || category === 'Infraestructura') return '🛣️';
        if (category.includes('Alumbrado') || category.includes('Servicios')) return '💡';
        if (category.includes('Movilidad')) return '🚗';
        if (category.includes('Seguridad') || category.includes('Orden')) return '🛡️';
        return '📋';
      }

      function selectView(view) {
        currentView = view;
        document.querySelectorAll('.tab-button').forEach((tab) => {
          const active = tab.dataset.view === view;
          tab.classList.toggle('active', active);
          tab.setAttribute('aria-selected', String(active));
        });
      }

      function openDetail(reportId, trigger) {
        const report = reports.find((item) => String(item.id) === String(reportId));
        if (!report) return;
        lastFocusedElement = trigger;
        $('#detailCategory').textContent = report.category;
        $('#detailTitle').textContent = report.title;
        $('#detailStatus').innerHTML = `<span class="report-status ${statusClass(report.status)}">${escapeHTML(report.status)}</span>`;
        $('#detailDescription').textContent = report.description || 'No se agregó una descripción para este reporte.';
        $('#detailLocation').textContent = report.location;
        $('#detailDate').textContent = formatDate(report.date);
        $('#detailPriority').textContent = report.priority || 'Media';
        $('#detailModal').hidden = false;
        document.body.classList.add('modal-open');
        $('#closeDetail').focus();
      }

      function closeDetail() {
        $('#detailModal').hidden = true;
        document.body.classList.remove('modal-open');
        lastFocusedElement?.focus();
      }

      function toggleSidebar() {
        if (window.matchMedia('(max-width: 640px)').matches) {
          document.body.classList.toggle('mobile-menu-open');
        } else {
          document.body.classList.toggle('sidebar-collapsed');
        }
      }

      try {
        const settings = JSON.parse(localStorage.getItem('zaffapp-settings') || '{}');
        if (typeof settings.username === 'string' && settings.username.trim()) {
          $('#sidebarUsername').textContent = settings.username.trim();
          $('#topbarUsername').textContent = settings.username.trim();
        }
      } catch (error) {
        showToast('No se pudo cargar el perfil guardado.');
      }
      loadSavedReports();
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
      document.querySelectorAll('.tab-button').forEach((tab) => tab.addEventListener('click', () => {
        selectView(tab.dataset.view);
        currentPage = 1;
        renderReports();
      }));
      $('#historySearch').addEventListener('input', () => { currentPage = 1; renderReports(); });
      $('#categoryFilter').addEventListener('change', () => { currentPage = 1; renderReports(); });
      [$('#dateFrom'), $('#dateTo')].forEach((input) => input.addEventListener('change', () => {
        currentPage = 1;
        renderReports();
      }));
      $('#clearFilters').addEventListener('click', () => {
        $('#historySearch').value = '';
        $('#categoryFilter').value = 'all';
        $('#dateFrom').value = '';
        $('#dateTo').value = '';
        selectView('all');
        currentPage = 1;
        renderReports();
      });
      $('#historyRows').addEventListener('click', (event) => {
        const button = event.target.closest('[data-detail-id]');
        if (button) openDetail(button.dataset.detailId, button);
      });
      $('#closeDetail').addEventListener('click', closeDetail);
      $('#closeDetailButton').addEventListener('click', closeDetail);
      $('#detailModal').addEventListener('click', (event) => {
        if (event.target === $('#detailModal')) closeDetail();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          if (!$('#detailModal').hidden) closeDetail();
          document.body.classList.remove('mobile-menu-open');
        }
        if (event.key === 'Tab' && !$('#detailModal').hidden) {
          const focusable = [...$('#detailModal').querySelectorAll('button:not([disabled])')];
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