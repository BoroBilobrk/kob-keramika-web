// js/app.js

document.addEventListener('DOMContentLoaded', () => {
  const authView = document.getElementById('authView');
  const appView  = document.getElementById('appView');
  const userLabel = document.getElementById('userEmailLabel');
  const btnLogout = document.getElementById('btnLogout');

  const btnLogin    = document.getElementById('btnLogin');
  const btnRegister = document.getElementById('btnRegister');
  const authMsg     = document.getElementById('authMessage');

  const btnAddExtraDim = document.getElementById('btnAddExtraDim');
  const btnCalcNow     = document.getElementById('btnCalcNow');

  // prebacivanje između homeView i calcView
  document.querySelectorAll('[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      document.querySelectorAll('.view-inner').forEach(v => v.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
    });
  });

  if (btnAddExtraDim) {
    btnAddExtraDim.addEventListener('click', addExtraDimRow);
  }

  if (btnCalcNow) {
    btnCalcNow.addEventListener('click', () => {
      try {
        runAutoCalc();
      } catch (e) {
        console.error(e);
        alert('Greška u izračunu, provjeri unesene vrijednosti.');
      }
    });
  }

  // Firebase auth
  const auth = window.__kobAuth;

  function showAuth() {
    authView.classList.add('active');
    appView.classList.remove('active');
    userLabel.textContent = '';
    btnLogout.style.display = 'none';
  }

  function showApp(user) {
    authView.classList.remove('active');
    appView.classList.add('active');
    userLabel.textContent = user.email || '';
    btnLogout.style.display = 'inline-block';
  }

  if (auth) {
    auth.onAuthStateChanged(user => {
      if (user) {
        showApp(user);
      } else {
        showAuth();
      }
    });
  } else {
    // ako Firebase ne radi
    showAuth();
  }

  if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
      authMsg.textContent = '';
      authMsg.className = 'msg';
      try {
        const email = document.getElementById('loginEmail').value.trim();
        const pass  = document.getElementById('loginPassword').value;
        if (!email || !pass) {
          authMsg.textContent = 'Unesi email i lozinku.';
          authMsg.classList.add('error');
          return;
        }
        await auth.signInWithEmailAndPassword(email, pass);
        authMsg.textContent = 'Prijava uspješna.';
        authMsg.classList.add('success');
      } catch (e) {
        console.error(e);
        authMsg.textContent = e.message || 'Greška kod prijave.';
        authMsg.classList.add('error');
      }
    });
  }

  if (btnRegister) {
    btnRegister.addEventListener('click', async () => {
      authMsg.textContent = '';
      authMsg.className = 'msg';
      try {
        const email = document.getElementById('regEmail').value.trim();
        const pass  = document.getElementById('regPassword').value;
        if (!email || !pass) {
          authMsg.textContent = 'Unesi email i lozinku.';
          authMsg.classList.add('error');
          return;
        }
        await auth.createUserWithEmailAndPassword(email, pass);
        authMsg.textContent = 'Korisnik registriran. Možeš se prijaviti.';
        authMsg.classList.add('success');
      } catch (e) {
        console.error(e);
        authMsg.textContent = e.message || 'Greška kod registracije.';
        authMsg.classList.add('error');
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try {
        await auth.signOut();
      } catch (e) {
        console.error(e);
      }
    });
  }

  // inicijalno dodaj jedan red dodatnih dimenzija (ako želiš)
  addExtraDimRow();
});
