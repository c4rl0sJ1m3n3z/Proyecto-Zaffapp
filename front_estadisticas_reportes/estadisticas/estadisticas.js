(() => {
      const demoReports = [
        { id: 1, title: 'Luminaria sin funcionar en la esquina', category: 'Alumbrado', date: '2026-10-09', location: 'Calle 12 con Carrera 8, Centro', zone: 'Centro', status: 'En revisión' },
        { id: 2, title: 'Vehículo sospechoso estacionado por varias horas', category: 'Seguridad', date: '2026-10-08', location: 'Parque del barrio San José', zone: 'Norte', status: 'Recibido' },
        { id: 3, title: 'Hueco en la vía frente al colegio', category: 'Vía pública', date: '2026-10-07', location: 'Carrera 15, frente al colegio', zone: 'Centro', status: 'Resuelto' },
        { id: 4, title: 'Robo de bicicleta en zona residencial', category: 'Seguridad', date: '2026-10-06', location: 'Conjunto Los Pinos, entrada principal', zone: 'Norte', status: 'En revisión' },
        { id: 5, title: 'Señal de tránsito caída', category: 'Vía pública', date: '2026-10-05', location: 'Calle 20 con Carrera 11', zone: 'Sur', status: 'Recibido' },
        { id: 6, title: 'Luminaria intermitente en el parque', category: 'Alumbrado', date: '2026-10-04', location: 'Parque La Esperanza', zone: 'Sur', status: 'Resuelto' },
        { id: 7, title: 'Acumulación de residuos en el andén', category: 'Otro', date: '2026-10-03', location: 'Avenida 6, frente al mercado', zone: 'Centro', status: 'Recibido' },
        { id: 8, title: 'Daño en la tapa de una alcantarilla', category: 'Vía pública', date: '2026-10-02', location: 'Calle 9 con Carrera 4', zone: 'Oriente', status: 'En revisión' },
        { id: 9, title: 'Alumbrado apagado en el sendero', category: 'Alumbrado', date: '2026-10-01', location: 'Sendero peatonal del barrio La Floresta', zone: 'Occidente', status: 'Resuelto' },
        { id: 10, title: 'Daño en el mobiliario del parque', category: 'Otro', date: '2026-09-28', location: 'Parque del barrio San José', zone: 'Norte', status: 'En revisión' }
      ];
      const categoryColors = ['#8e24aa', '#311b92', '#00bcd4', '#ff9800', '#b388ff'];
      const validCategories = new Set(['Seguridad', 'Vía pública', 'Alumbrado', 'Otro']);
      const $ = (selector) => document.querySelector(selector);
      let reports = demoReports;
      let activeRange = 'year';

      function loadReports() {
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
          ).map((report) => ({ ...report, zone: report.zone || inferZone(report.location) }));
          reports = [...created, ...demoReports];
          $('#statisticsStatus').textContent = created.length
            ? `Incluye ${created.length} reporte${created.length === 1 ? '' : 's'} creado${created.length === 1 ? '' : 's'} aquí`
            : 'Datos de demostración';
        } catch (error) {
          showToast('No se pudieron cargar los reportes guardados en este navegador.');
        }
      }

      function inferZone(location) {
        const normalized = location.toLocaleLowerCase('es');
        if (normalized.includes('centro') || normalized.includes('mercado') || normalized.includes('colegio')) return 'Centro';
        if (normalized.includes('norte') || normalized.includes('pinos') || normalized.includes('san josé')) return 'Norte';
        if (normalized.includes('sur') || normalized.includes('esperanza')) return 'Sur';
        if (normalized.includes('oriente') || normalized.includes('carrera 4')) return 'Oriente';
        if (normalized.includes('occidente') || normalized.includes('floresta')) return 'Occidente';
        return 'Otras ubicaciones';
      }

      function showToast(message) {
        const toast = $('#toast');
        toast.textContent = message;
        toast.classList.add('show');
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2800);
      }

      function getPeriodReports() {
        const fromInput = $('#dateFrom').value;
        const toInput = $('#dateTo').value;
        let fromDate = null;
        let toDate = toInput ? new Date(`${toInput}T23:59:59`) : null;
        if (fromInput) {
          fromDate = new Date(`${fromInput}T00:00:00`);
        } else if (activeRange === 'year') {
          fromDate = new Date(new Date().getFullYear(), 0, 1);
        } else if (activeRange !== 'all') {
          fromDate = new Date();
          fromDate.setHours(0, 0, 0, 0);
          fromDate.setDate(fromDate.getDate() - Number(activeRange) + 1);
        }
        return reports.filter((report) => {
          const date = new Date(`${report.date}T12:00:00`);
          return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
        });
      }

      function renderSummary(periodReports) {
        const counts = {
          received: periodReports.filter((report) => report.status === 'Recibido').length,
          review: periodReports.filter((report) => report.status === 'En revisión').length,
          resolved: periodReports.filter((report) => report.status === 'Resuelto').length
        };
        const total = periodReports.length;
        $('#totalReports').textContent = total;
        $('#receivedReports').textContent = counts.received;
        $('#reviewReports').textContent = counts.review;
        $('#resolvedReports').textContent = counts.resolved;
        $('#totalDescription').textContent = 'Reportes en el periodo';
        [['received', counts.received], ['review', counts.review], ['resolved', counts.resolved]].forEach(([key, count]) => {
          const percentage = total ? (count / total * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 }) : '0';
          $(`#${key}Description`).textContent = `${percentage}% del total`;
        });
      }

      function renderCategoryChart(periodReports) {
        const categories = ['Seguridad', 'Vía pública', 'Alumbrado', 'Otro'];
        const values = categories.map((name) => periodReports.filter((report) => report.category === name).length);
        const total = periodReports.length;
        let angle = 0;
        const stops = values.map((value, index) => {
          const start = angle;
          angle += total ? value / total * 360 : 0;
          return `${categoryColors[index]} ${start}deg ${angle}deg`;
        });
        $('#categoryDonut').style.background = total
          ? `conic-gradient(${stops.join(', ')})`
          : 'conic-gradient(#e7e5ed 0deg 360deg)';
        $('#categoryDonut').setAttribute('aria-label', `Distribución de ${total} reportes por categoría`);
        $('#categoryTotal').textContent = total;
        $('#categoryFooterTotal').textContent = total;
        const legend = $('#categoryLegend');
        legend.replaceChildren();
        categories.forEach((name, index) => {
          const count = values[index];
          const item = document.createElement('li');
          const dot = document.createElement('span');
          dot.className = 'dot';
          dot.style.backgroundColor = categoryColors[index];
          dot.setAttribute('aria-hidden', 'true');
          const label = document.createElement('span');
          label.className = 'legend-name';
          label.textContent = name;
          const value = document.createElement('strong');
          value.textContent = `${count} · ${total ? Math.round(count / total * 100) : 0}%`;
          item.append(dot, label, value);
          legend.appendChild(item);
        });
      }

      function renderZoneChart(periodReports) {
        const counts = new Map();
        periodReports.forEach((report) => {
          const zone = report.zone || inferZone(report.location);
          counts.set(zone, (counts.get(zone) || 0) + 1);
        });
        const zones = [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 5);
        const max = Math.max(1, ...zones.map(([, count]) => count));
        const container = $('#zoneChart');
        container.replaceChildren();
        zones.forEach(([zone, count], index) => {
          const row = document.createElement('div');
          row.className = 'bar-row';
          const name = document.createElement('span');
          name.className = 'zone-name';
          name.textContent = zone;
          const track = document.createElement('div');
          track.className = 'bar-track';
          track.setAttribute('role', 'img');
          track.setAttribute('aria-label', `${zone}: ${count} reportes`);
          const fill = document.createElement('div');
          fill.className = `bar-fill ${index < 2 ? 'purple-fill' : index === 2 ? 'cyan-fill' : 'light-purple-fill'}`;
          fill.style.width = `${count / max * 100}%`;
          track.appendChild(fill);
          const value = document.createElement('span');
          value.className = 'bar-value';
          value.textContent = `${count} (${periodReports.length ? Math.round(count / periodReports.length * 100) : 0}%)`;
          row.append(name, track, value);
          container.appendChild(row);
        });
        $('#zoneFooterTotal').textContent = zones.reduce((sum, [, count]) => sum + count, 0);
      }

      function monthDateOffset(offset) {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() - offset, 1);
      }

      function monthLabel(date, year = false) {
        return new Intl.DateTimeFormat('es-CO', year
          ? { month: 'short', year: '2-digit' }
          : { month: 'long', year: 'numeric' }).format(date);
      }

      function renderTrend(periodReports) {
        const months = Array.from({ length: 6 }, (_, index) => monthDateOffset(5 - index));
        const values = months.map((month) => periodReports.filter((report) => {
          const date = new Date(`${report.date}T12:00:00`);
          return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
        }).length);
        const maxValue = Math.max(1, ...values);
        const axisMax = Math.ceil(maxValue / 5) * 5;
        $('#trendYAxis').innerHTML = [axisMax, Math.ceil(axisMax * 2 / 3), Math.ceil(axisMax / 3), 0]
          .map((value) => `<span>${value}</span>`).join('');
        $('#trendXAxis').innerHTML = months.map((month) => `<span>${monthLabel(month, true)}</span>`).join('');
        const points = values.map((value, index) => {
          const x = index * 60;
          const y = 140 - value / axisMax * 125;
          return `${x},${y}`;
        });
        const pointString = points.join(' ');
        const chart = $('#trendChart');
        chart.innerHTML = `
          <defs><linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#5c3fbd" stop-opacity=".20"/>
            <stop offset="100%" stop-color="#5c3fbd" stop-opacity=".01"/>
          </linearGradient></defs>
          <polygon points="${pointString} 300,150 0,150" fill="url(#trendArea)"></polygon>
          <polyline points="${pointString}" fill="none" stroke="#5c3fbd" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
          ${values.map((value, index) => {
            const x = index * 60;
            const y = 140 - value / axisMax * 125;
            return `<circle cx="${x}" cy="${y}" r="4" fill="#5c3fbd"><title>${monthLabel(months[index])}: ${value} reportes</title></circle>`;
          }).join('')}`;
        chart.setAttribute('aria-label', `Tendencia mensual: ${values.join(', ')} reportes en los últimos seis meses`);
      }

      function renderComparison(periodReports) {
        const thisMonth = monthDateOffset(0);
        const lastMonth = monthDateOffset(1);
        const counts = [thisMonth, lastMonth].map((month) => periodReports.filter((report) => {
          const date = new Date(`${report.date}T12:00:00`);
          return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
        }).length);
        const max = Math.max(1, ...counts);
        $('#monthlyComparison').replaceChildren();
        [thisMonth, lastMonth].forEach((month, index) => {
          const column = document.createElement('div');
          column.className = 'monthly-column';
          const number = document.createElement('span');
          number.className = 'monthly-number';
          number.textContent = counts[index];
          const bar = document.createElement('div');
          bar.className = `comp-bar ${index === 0 ? 'primary' : 'secondary'}`;
          bar.style.height = `${Math.max(8, counts[index] / max * 100)}%`;
          bar.setAttribute('role', 'img');
          bar.setAttribute('aria-label', `${monthLabel(month)}: ${counts[index]} reportes`);
          const label = document.createElement('span');
          label.className = 'monthly-label';
          label.textContent = index === 0 ? 'Este mes' : 'Mes anterior';
          column.append(number, bar, label);
          $('#monthlyComparison').appendChild(column);
        });
        const difference = counts[1] ? Math.round((counts[0] - counts[1]) / counts[1] * 100) : counts[0] ? 100 : 0;
        const summary = $('#monthlySummary');
        summary.replaceChildren();
        const badge = document.createElement('span');
        badge.className = `comparison-badge${difference < 0 ? ' negative' : ''}`;
        badge.textContent = `${difference > 0 ? '↑' : difference < 0 ? '↓' : '•'} ${Math.abs(difference)}%`;
        const text = document.createElement('span');
        text.textContent = counts[0] === counts[1] ? 'Sin cambios frente al mes anterior' : 'Variación frente al mes anterior';
        summary.append(badge, text);
      }

      function renderStatistics() {
        const periodReports = getPeriodReports();
        renderSummary(periodReports);
        renderCategoryChart(periodReports);
        renderZoneChart(periodReports);
        renderTrend(periodReports);
        renderComparison(periodReports);
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
      loadReports();
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
      $('#periodFilter').addEventListener('change', (event) => {
        activeRange = event.currentTarget.value;
        $('#dateFrom').value = '';
        $('#dateTo').value = '';
        renderStatistics();
      });
      [$('#dateFrom'), $('#dateTo')].forEach((input) => input.addEventListener('change', () => {
        activeRange = 'all';
        $('#periodFilter').value = 'all';
        renderStatistics();
      }));
      $('#clearDates').addEventListener('click', () => {
        $('#dateFrom').value = '';
        $('#dateTo').value = '';
        activeRange = 'year';
        $('#periodFilter').value = 'year';
        renderStatistics();
      });
      renderStatistics();
    })();