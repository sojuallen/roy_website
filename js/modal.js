function openModal(entry) {
  var overlay = document.getElementById('modal-overlay');
  var body = document.getElementById('modal-body');

  var badgeHTML = '';
  if (entry.type === 'book') {
    badgeHTML = '<span class="modal-type-badge badge-book">Book</span>';
  } else {
    badgeHTML = '<span class="modal-type-badge badge-event">Event</span>';
  }

  var imageHTML = '';
  if (entry.type === 'book' && entry.coverImage) {
    imageHTML = '<img class="modal-image" src="' + entry.coverImage + '" alt="' + entry.title + '">';
  } else if (entry.type === 'event' && entry.icon) {
    imageHTML = '<img class="modal-icon" src="' + entry.icon + '" alt="' + entry.title + '">';
  }

  body.innerHTML =
    badgeHTML +
    '<span class="modal-date">' + formatDate(entry.date) + '</span>' +
    '<h2 class="modal-title">' + entry.title + '</h2>' +
    imageHTML +
    '<div class="modal-details">' + (entry.details || '') + '</div>';

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  var overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('modal-overlay');
  var closeBtn = document.getElementById('modal-close');

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
});
