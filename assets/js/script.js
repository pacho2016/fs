const counters = document.querySelectorAll('[data-count]');

const animateCounter = (element) => {
  const target = Number(element.dataset.count);
  const duration = 1400;
  const start = performance.now();

  const step = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const value = target * progress;

    if (target % 1 !== 0) {
      element.textContent = value.toFixed(1);
    } else {
      element.textContent = Math.floor(value);
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = target % 1 === 0 ? target : target.toFixed(1);
    }
  };

  requestAnimationFrame(step);
};

counters.forEach((counter) => {
  animateCounter(counter);
});

const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.18)';
  } else {
    header.style.boxShadow = 'none';
  }
});

const donationForm = document.querySelector('#donation-form');

if (donationForm) {
  const amountInput = donationForm.querySelector('#donation-amount');
  const amountOptions = donationForm.querySelectorAll('[data-amount]');
  const status = donationForm.querySelector('#donation-status');

  amountOptions.forEach((option) => {
    option.addEventListener('click', () => {
      amountInput.value = option.dataset.amount;
      amountOptions.forEach((item) => {
        const isSelected = item === option;
        item.classList.toggle('is-selected', isSelected);
        item.setAttribute('aria-pressed', String(isSelected));
      });
      status.textContent = '';
    });
  });

  amountInput.addEventListener('input', () => {
    amountOptions.forEach((option) => {
      const isSelected = Number(option.dataset.amount) === Number(amountInput.value);
      option.classList.toggle('is-selected', isSelected);
      option.setAttribute('aria-pressed', String(isSelected));
    });
    status.textContent = '';
  });

  donationForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!amountInput.reportValidity()) {
      return;
    }

    const amount = Number(amountInput.value);
    if (!Number.isInteger(amount) || amount < 10 || amount > 100000) {
      status.textContent = 'Укажите целую сумму от 10 до 100 000 ₽.';
      amountInput.focus();
      return;
    }

    const paymentUrlTemplate = donationForm.dataset.paymentUrlTemplate.trim();
    if (!paymentUrlTemplate || !paymentUrlTemplate.includes('{amount}')) {
      status.textContent = 'Приём платежей пока не подключён. Добавьте ссылку СБП-провайдера с параметром {amount} в настройку формы.';
      return;
    }

    const paymentUrl = paymentUrlTemplate.replace('{amount}', String(amount));
    try {
      const parsedUrl = new URL(paymentUrl);
      if (parsedUrl.protocol !== 'https:') {
        throw new Error('Payment URL must use HTTPS');
      }
      window.location.assign(parsedUrl.href);
    } catch {
      status.textContent = 'Ссылка для оплаты настроена некорректно. Проверьте URL СБП-провайдера.';
    }
  });
}


