 (() => {
      const initialNotifications = [
        { id: 1, title: 'Tu reporte está en revisión', dateLabel: 'Hace 20 min', date: '2026-10-09', read: false, action: 'Ver reporte', icon: '🔔' },
        { id: 2, title: 'Actualización de reporte', dateLabel: 'Hace 2 horas', date: '2026-10-09', read: false, action: 'Ver reporte', icon: '•' },
        { id: 3, title: 'Reporte resuelto', dateLabel: 'Ayer, 11:30 am', date: '2026-10-08', read: false, action: 'Ver reporte', icon: '✓' },
        { id: 4, title: 'Gracias por tu reporte', dateLabel: 'Ayer, 9:15 am', date: '2026-10-08', read: true, action: 'Ver reporte', icon: '' },
        { id: 5, title: 'Nuevas estadísticas disponibles', dateLabel: '2 May, 6:00 am', date: '2026-05-02', read: true, action: 'Ver estadísticas', icon: '' },
        { id: 6, title: 'Tu reporte fue asignado', dateLabel: '1 May, 4:10 pm', date: '2026-05-01', read: true, action: 'Ver reporte', icon: '' },
        { id: 7, title: 'Reporte recibido', dateLabel: '30 Abr, 8:45 am', date: '2026-04-30', read: true, action: 'Ver reporte', icon: '✓' },
        { id: 8, title: 'Actividad nueva en tu zona', dateLabel: '28 Abr, 2:20 pm', date: '2026-04-28', read: true, action: 'Ver mapa', icon: '' },
        { id: 9, title: 'Recordatorio de seguimiento', dateLabel: '27 Abr, 10:00 am', date: '2026-04-27', read: true, action: 'Ver reporte', icon: '' },
        { id: 10, title: 'Actualización de seguridad', dateLabel: '25 Abr, 8:30 am', date: '2026-04-25', read: true, action: 'Ver detalles', icon: '' },
        { id: 11, title: 'Incidente cercano registrado', dateLabel: '23 Abr, 6:15 pm', date: '2026-04-23', read: true, action: 'Ver mapa', icon: '✓' },
        { id: 12, title: 'Tu perfil fue actualizado', dateLabel: '21 Abr, 1:40 pm', date: '2026-04-21', read: true, action: 'Ver perfil', icon: '' }
      ];
      const PAGE_SIZE = 7;
      const STORAGE_KEY = 'zaffapp-notifications';
      const $ = (selector) => document.querySelector(selector);
      const rowsContainer = $('#notificationRows');
      const emptyState = $('#emptyState');
      const resultsCount = $('#resultsCount');
      const pagination = $('#pagination');
      const statusFilter = $('#statusFilter');
      const dateFrom = $('#dateFrom');
      const dateTo = $('#dateTo');
      const searchInput = $('#notificationSearch');
      const notifications = initialNotifications;
      let currentView = 'all';
      let currentPage = 1;
      let toastTimer;

      function showToast(message) {
        const toast = $('#toast');
        toast.textContent = message;
        toast.classList.add('show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2800);
      }

      function loadReadState() {
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          if (Array.isArray(saved.readIds)) {
            notifications.forEach((item) => {
              if (saved.readIds.includes(item.id)) item.read = true;
              else if (saved.unreadIds?.includes(item.id)) item.read = false;
            });
          }
        } catch (error) {
          showToast('No se pudo cargar el estado de lectura guardado.');
        }
      }

      function persistReadState() {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            readIds: notifications.filter((item) => item.read).map((item) => item.id),
            unreadIds: notifications.filter((item) => !item.read).map((item) => item.id)
          }));
          $('#notificationStatus').textContent = 'Notificaciones actualizadas';
          $('#notificationStatus').classList.remove('is-dirty');
        } catch (error) {
          $('#notificationStatus').textContent = 'No se pudieron guardar los cambios';
          $('#notificationStatus').classList.add('is-dirty');
          showToast('El navegador no permitió guardar los cambios de lectura.');
        }
      }

      function getFilteredNotifications() {
        const state = statusFilter.value;
        const search = searchInput.value.trim().toLocaleLowerCase('es');
        return notifications.filter((item) => {
          const matchesView = currentView === 'all' ||
            (currentView === 'unread' && !item.read) ||
            (currentView === 'read' && item.read);
          const matchesState = state === 'all' ||
            (state === 'unread' && !item.read) ||
            (state === 'read' && item.read);
          const matchesFrom = !dateFrom.value || item.date >= dateFrom.value;
          const matchesTo = !dateTo.value || item.date <= dateTo.value;
          const matchesSearch = !search ||
            `${item.title} ${item.action}`.toLocaleLowerCase('es').includes(search);
          return matchesView && matchesState && matchesFrom && matchesTo && matchesSearch;
        });
      }

      function renderCounts() {
        const unread = notifications.filter((item) => !item.read).length;
        const read = notifications.length - unread;
        $('#count-all').textContent = notifications.length;
        $('#count-unread').textContent = unread;
        $('#count-read').textContent = read;
        $('#totalNotifications').textContent = notifications.length;
        $('#unreadNotifications').textContent = unread;
        $('#readNotifications').textContent = read;
        $('#readRate').textContent = `${notifications.length ? Math.round(read / notifications.length * 100) : 0}%`;
        $('#markAllRead').disabled = unread === 0;
      }

      function renderPagination(totalPages) {
        pagination.replaceChildren();
        if (totalPages <= 1) return;
        const items = [
          { label: '‹', page: currentPage - 1, title: 'Página anterior', disabled: currentPage === 1 }
        ];
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
            renderNotifications();
          });
          pagination.appendChild(button);
        });
      }

      function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[character]);
      }

      function renderNotifications() {
        const filtered = getFilteredNotifications();
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        currentPage = Math.min(currentPage, totalPages);
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);
        rowsContainer.replaceChildren();

        pageItems.forEach((item) => {
          const row = document.createElement('tr');
          row.className = `notification-row ${item.read ? 'is-read' : 'is-unread'}`;
          row.innerHTML = `
            <td class="notification-cell">
              <span class="row-icon${item.icon ? '' : ' icon-hidden'}" aria-hidden="true">${escapeHTML(item.icon || '•')}</span>
              <div class="notification-copy">
                <button class="notification-title" type="button" data-id="${item.id}" aria-label="${item.read ? 'Leída' : 'Marcar como leída'}: ${escapeHTML(item.title)}">${escapeHTML(item.title)}</button>
                <button class="notification-action" type="button" data-action="${escapeHTML(item.action)}" data-id="${item.id}">${escapeHTML(item.action)}</button>
              </div>
            </td>
            <td class="date-cell"><time datetime="${item.date}">${escapeHTML(item.dateLabel)}</time></td>
            <td class="state-cell"><span class="status-dot${item.read ? ' read-dot' : ''}" aria-hidden="true"></span><span>${item.read ? 'Leída' : 'No leída'}</span></td>
          `;
          rowsContainer.appendChild(row);
        });

        const hasResults = filtered.length > 0;
        emptyState.hidden = hasResults;
        $('.notifications-table').hidden = !hasResults;
        resultsCount.textContent = hasResults
          ? `Mostrando ${startIndex + 1} a ${Math.min(startIndex + PAGE_SIZE, filtered.length)} de ${filtered.length} notificaciones`
          : 'Mostrando 0 notificaciones';
        renderPagination(totalPages);
        renderCounts();
      }

      function selectView(view) {
        currentView = view;
        document.querySelectorAll('.tab-button').forEach((tab) => {
          const selected = tab.dataset.view === view;
          tab.classList.toggle('active', selected);
          tab.setAttribute('aria-selected', String(selected));
        });
      }

      function markRead(id) {
        const item = notifications.find((notification) => notification.id === Number(id));
        if (!item || item.read) return false;
        item.read = true;
        persistReadState();
        renderNotifications();
        return true;
      }

      function toggleSidebar() {
        if (window.matchMedia('(max-width: 640px)').matches) {
          document.body.classList.toggle('mobile-menu-open');
        } else {
          document.body.classList.toggle('sidebar-collapsed');
        }
      }

      loadReadState();
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
          statusFilter.value = 'all';
          currentPage = 1;
          renderNotifications();
        });
      });
      $('#markAllRead').addEventListener('click', () => {
        notifications.forEach((item) => { item.read = true; });
        persistReadState();
        renderNotifications();
        showToast('Todas las notificaciones están marcadas como leídas.');
      });
      searchInput.addEventListener('input', () => {
        currentPage = 1;
        renderNotifications();
      });
      statusFilter.addEventListener('change', () => {
        selectView(statusFilter.value);
        currentPage = 1;
        renderNotifications();
      });
      [dateFrom, dateTo].forEach((control) => control.addEventListener('change', () => {
        currentPage = 1;
        renderNotifications();
      }));
      $('#clearFilters').addEventListener('click', () => {
        statusFilter.value = 'all';
        dateFrom.value = '';
        dateTo.value = '';
        searchInput.value = '';
        selectView('all');
        currentPage = 1;
        renderNotifications();
      });
      rowsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-id]');
        if (!button) return;
        const changed = markRead(button.dataset.id);
        if (button.classList.contains('notification-action')) {
          const action = button.dataset.action;
          if (action === 'Ver estadísticas') {
            window.location.href = '../../front_estadisticas_reportes/estadisticas/estadisticas.html';
          } else if (action === 'Ver perfil') {
            window.location.href = '../Configuracion/Configuracion_ZaffApp/configuracion.html';
          } else {
            showToast(`${action}: esta vista aún no está disponible.`);
          }
        } else if (changed) {
          showToast('Notificación marcada como leída.');
        }
      });

      renderNotifications();
    })();