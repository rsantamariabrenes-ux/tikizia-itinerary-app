let currentSlide = 0;
const totalSlides = document.querySelectorAll('.day-card').length || 5;
const track = document.getElementById('daySliderTrack');
const dotsContainer = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

for (let i = 0; i < totalSlides; i++) {
  const dot = document.createElement('div');
  dot.className = 'slider-dot';
  if (i === 0) dot.classList.add('active');
  dot.onclick = () => goToSlide(i);
  dotsContainer.appendChild(dot);
}

function updateSlider() {
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.slider-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === totalSlides - 1;
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) { currentSlide++; updateSlider(); }
}

function previousSlide() {
  if (currentSlide > 0) { currentSlide--; updateSlider(); }
}

function goToSlide(index) {
  currentSlide = index;
  updateSlider();
}

function scrollToItinerario() {
  const el = document.getElementById('itinerario');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') previousSlide();
  if (e.key === 'ArrowRight') nextSlide();
});

let touchStartX = 0;
let touchEndX = 0;
track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; });
track.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); });
function handleSwipe() {
  if (touchEndX < touchStartX - 50) nextSlide();
  if (touchEndX > touchStartX + 50) previousSlide();
}

updateSlider();
