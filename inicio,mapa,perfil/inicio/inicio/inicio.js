(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const sidebarToggle = $('#sidebarToggle');
  const topbarMenuToggle = $('#topbarMenuToggle');
  const sidebarBackdrop = $('#sidebarBackdrop');
  const filterButton = $('#filterBtn');
  const filterMenu = $('#filterMenu');
  const reportsGrid = $('#reportsGrid');
  const modal = $('#reportModal');
  const toast = $('#homeToast');
  let lastFocusedElement = null;
  let toastTimer;

  try {
    const settings = JSON.parse(localStorage.getItem('zaffapp-settings') || '{}');
    if (typeof settings.username === 'string' && settings.username.trim()) {
      $('#sidebarUsername').textContent = settings.username.trim();
      $('#topbarUsername').textContent = settings.username.trim();
    }
  } catch (error) {
    showToast('No se pudo cargar el nombre de usuario guardado.');
  }

  function toggleSidebar() {
    document.body.classList.toggle(
      window.matchMedia('(max-width: 640px)').matches ? 'mobile-menu-open' : 'sidebar-collapsed'
    );
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function openReport(card) {
    lastFocusedElement = document.activeElement;
    $('#modalCategory').textContent = $('.report-category', card).textContent;
    $('#modalTitle').textContent = card.dataset.title;
    $('#modalDate').textContent = card.dataset.dateLabel;
    $('#modalLocation').textContent = card.dataset.location;

    const state = $('#modalState');
    state.textContent = card.dataset.state;
    state.className = 'report-state';
    if (card.dataset.state === 'En revisión') state.classList.add('state-review');
    else if (card.dataset.state === 'Resuelto') state.classList.add('state-resolved');
    else state.classList.add('state-received');

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    $('#closeModal').focus();
  }

  function closeReport() {
    if (!modal.classList.contains('active')) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  sidebarToggle.addEventListener('click', toggleSidebar);
  topbarMenuToggle.addEventListener('click', toggleSidebar);
  sidebarBackdrop.addEventListener('click', () => document.body.classList.remove('mobile-menu-open'));
  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 640px)').matches) {
      document.body.classList.remove('mobile-menu-open');
    }
  });

  filterButton.addEventListener('click', () => {
    const isExpanded = filterButton.getAttribute('aria-expanded') === 'true';
    filterButton.setAttribute('aria-expanded', String(!isExpanded));
    filterMenu.hidden = isExpanded;
  });
  $$('.filter-item', filterMenu).forEach((item) => {
    item.addEventListener('click', () => {
      const direction = item.dataset.sort;
      const cards = $$('.report-card', reportsGrid);
      cards.sort((a, b) => direction === 'recent'
        ? b.dataset.date.localeCompare(a.dataset.date)
        : a.dataset.date.localeCompare(b.dataset.date));
      cards.forEach((card) => reportsGrid.append(card));
      $('#filterLabel', filterButton).textContent = `Ordenar: ${direction === 'recent' ? 'más recientes' : 'más antiguos'}`;
      filterButton.setAttribute('aria-expanded', 'false');
      filterMenu.hidden = true;
      showToast(`Reportes ordenados por fecha: ${direction === 'recent' ? 'más recientes' : 'más antiguos'}.`);
    });
  });

  document.addEventListener('click', (event) => {
    if (!filterMenu.hidden && !event.target.closest('.filter-dropdown-container')) {
      filterMenu.hidden = true;
      filterButton.setAttribute('aria-expanded', 'false');
    }
  });
  $$('[data-unavailable-view]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showToast(`La vista de ${link.dataset.unavailableView} aún no está disponible.`);
    });
  });

  $$('.report-card', reportsGrid).forEach((card) => {
    card.addEventListener('click', () => openReport(card));
  });
  $('#closeModal').addEventListener('click', closeReport);
  $('#closeModalFooter').addEventListener('click', closeReport);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeReport();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeReport();
      filterMenu.hidden = true;
      filterButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-menu-open');
    }

    if (event.key === 'Tab' && modal.classList.contains('active')) {
      const focusable = $$('button, a[href]', modal).filter((element) => !element.hasAttribute('disabled'));
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
})();
