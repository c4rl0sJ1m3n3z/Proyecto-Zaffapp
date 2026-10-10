const filterBtn = document.getElementById('filterBtn');
        const filterMenu = document.getElementById('filterMenu');

        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterMenu.classList.toggle('show');
        });

        window.addEventListener('click', () => {
            if (filterMenu.classList.contains('show')) {
                filterMenu.classList.remove('show');
            }
        });

        function filterReports(type) {
            alert('Filtro aplicado: ' + (type === 'recent' ? 'Más recientes' : type === 'oldest' ? 'Más antiguos' : 'Todos'));
            filterMenu.classList.remove('show');
        }

        // Modal functionality
        const modal = document.getElementById('reportModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalDate = document.getElementById('modalDate');
        const modalLocation = document.getElementById('modalLocation');

        function openModal(title, date, location) {
            modalTitle.innerText = title;
            modalDate.innerText = date;
            modalLocation.innerText = location;
            modal.classList.add('active');
        }

        function closeModal() {
            modal.classList.remove('active');
        }

        function closeModalOnOutside(e) {
            if (e.target === modal) {
                closeModal();
            }
        }