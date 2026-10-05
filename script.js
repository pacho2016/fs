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
