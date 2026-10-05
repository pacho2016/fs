import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const form = document.querySelector('#contact-submission-form');
const status = document.querySelector('#contact-submission-status');

if (form && status && SUPABASE_URL && SUPABASE_ANON_KEY) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    submitButton.disabled = true;
    status.textContent = 'Отправляем заявку...';
    status.classList.remove('is-error');

    const { error } = await supabase.from('contact_submissions').insert({
      name: String(formData.get('Имя')).trim(),
      email: String(formData.get('Email')).trim(),
      phone: String(formData.get('Телефон') || '').trim() || null,
      message: String(formData.get('Сообщение') || '').trim() || null,
      consent: formData.get('Согласие') === 'on',
    });

    submitButton.disabled = false;
    if (error) {
      status.textContent = 'Не удалось отправить заявку. Попробуйте позже.';
      status.classList.add('is-error');
      return;
    }

    form.reset();
    status.textContent = 'Заявка отправлена. Спасибо!';
  });
}