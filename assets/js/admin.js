import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { ADMIN_USER_ID, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const loginForm = document.querySelector('#admin-login-form');
const loginStatus = document.querySelector('#login-status');
const adminContent = document.querySelector('#admin-content');
const submissionsStatus = document.querySelector('#submissions-status');
const submissionsList = document.querySelector('#submissions-list');
const refreshButton = document.querySelector('#refresh-submissions');
const logoutButton = document.querySelector('#admin-logout');

if (SUPABASE_URL && SUPABASE_ANON_KEY && ADMIN_USER_ID) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const showSubmissions = async () => {
    submissionsStatus.textContent = 'Загружаем заявки...';
    submissionsStatus.classList.remove('is-error');

    const { data, error } = await supabase
      .from('contact_submissions')
      .select('name, email, phone, message, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      submissionsStatus.textContent = 'Не удалось загрузить заявки. Проверьте настройки доступа к базе.';
      submissionsStatus.classList.add('is-error');
      return;
    }

    submissionsList.replaceChildren();
    for (const submission of data) {
      const row = document.createElement('tr');
      const submittedAt = new Date(submission.created_at).toLocaleString('ru-RU');
      for (const value of [submittedAt, submission.name, submission.email, submission.phone || '—', submission.message || '—']) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      }
      submissionsList.append(row);
    }

    submissionsStatus.textContent = data.length ? `Заявок: ${data.length}` : 'Заявок пока нет.';
  };

  const enterAdmin = async (user) => {
    if (user.id !== ADMIN_USER_ID) {
      await supabase.auth.signOut();
      loginStatus.textContent = 'Эта учётная запись не имеет доступа к разделу.';
      loginStatus.classList.add('is-error');
      return;
    }

    loginForm.hidden = true;
    adminContent.hidden = false;
    await showSubmissions();
  };

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;

    const button = loginForm.querySelector('button[type="submit"]');
    const formData = new FormData(loginForm);
    button.disabled = true;
    loginStatus.textContent = 'Выполняется вход...';
    loginStatus.classList.remove('is-error');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(formData.get('email')).trim(),
      password: String(formData.get('password')),
    });

    button.disabled = false;
    if (error) {
      loginStatus.textContent = 'Не удалось войти. Проверьте email и пароль.';
      loginStatus.classList.add('is-error');
      return;
    }

    await enterAdmin(data.user);
  });

  refreshButton.addEventListener('click', showSubmissions);
  logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    adminContent.hidden = true;
    loginForm.hidden = false;
    loginForm.reset();
    loginStatus.textContent = 'Вы вышли из учётной записи.';
  });

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) await enterAdmin(userData.user);
  }
} else {
  loginStatus.textContent = 'Админ-раздел не настроен. Заполните настройки Supabase.';
  loginStatus.classList.add('is-error');
  loginForm.querySelector('button[type="submit"]').disabled = true;
}