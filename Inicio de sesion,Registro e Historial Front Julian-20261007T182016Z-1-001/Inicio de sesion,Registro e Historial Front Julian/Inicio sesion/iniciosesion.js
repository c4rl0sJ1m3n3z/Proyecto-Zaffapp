(() => {
      const $ = (selector) => document.querySelector(selector);
      const identity = $('#identity');
      const password = $('#password');
      const remember = $('#rememberMe');
      const message = $('#formMessage');
      const storageKey = 'zaffapp-login-email';
      let lastFocusedElement;

      try {
        const savedEmail = localStorage.getItem(storageKey);
        if (savedEmail) {
          identity.value = savedEmail;
          remember.checked = true;
        }
      } catch (error) {
        showToast('No se pudo recuperar el correo guardado en este navegador.');
      }

      function showToast(text) {
        const toast = $('#toast');
        toast.textContent = text;
        toast.classList.add('show');
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3200);
      }

      $('#togglePassword').addEventListener('click', (event) => {
        const button = event.currentTarget;
        const visible = password.type === 'password';
        password.type = visible ? 'text' : 'password';
        button.setAttribute('aria-pressed', String(visible));
        button.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
      });

      $('#loginForm').addEventListener('submit', (event) => {
        event.preventDefault();
        message.textContent = '';
        if (!identity.value.trim()) {
          identity.focus();
          message.textContent = 'Escribe el correo electrónico o teléfono de tu cuenta.';
          return;
        }
        if (!password.checkValidity()) {
          password.focus();
          message.textContent = 'La contraseña debe tener al menos 8 caracteres.';
          return;
        }
        if (remember.checked) {
          try {
            localStorage.setItem(storageKey, identity.value.trim());
          } catch (error) {
            showToast('No se pudo recordar el correo, pero puedes continuar.');
          }
        } else {
          try {
            localStorage.removeItem(storageKey);
          } catch (error) {
            showToast('No se pudo eliminar el correo guardado.');
          }
        }
        message.textContent = 'El acceso todavía no está conectado. No se inició ninguna sesión.';
      });

      $('#googleSignIn').addEventListener('click', () => {
        showToast('El inicio de sesión con Google estará disponible al conectar OAuth.');
      });

      const modal = $('#recoveryModal');
      function openRecovery() {
        lastFocusedElement = document.activeElement;
        $('#recoveryMessage').textContent = '';
        modal.hidden = false;
        document.body.classList.add('modal-open');
        $('#recoveryEmail').focus();
      }
      function closeRecovery() {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
        $('#recoveryForm').reset();
        $('#recoveryMessage').textContent = '';
        lastFocusedElement?.focus();
      }
      $('#forgotPassword').addEventListener('click', openRecovery);
      $('#closeRecovery').addEventListener('click', closeRecovery);
      $('#cancelRecovery').addEventListener('click', closeRecovery);
      modal.addEventListener('click', (event) => {
        if (event.target === modal) closeRecovery();
      });
      $('#recoveryForm').addEventListener('submit', (event) => {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;
        $('#recoveryMessage').textContent = 'No se envió ningún correo: la recuperación aún no está conectada al servidor.';
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) closeRecovery();
        if (event.key === 'Tab' && !modal.hidden) {
          const focusable = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled])')];
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