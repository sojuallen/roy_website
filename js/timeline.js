var MARGIN = 80;
var ENTRIES_PER_ROW = 4;
var ROW_HEIGHT = 200;
var PADDING_TOP = 80;
var PADDING_BOTTOM = 80;
var TILE_SIZE = 160;

var _entries = [];
var _tilePositions = [];
var _svgHeight = 0;

function loadTimeline() {
  fetch('data/entries.json?v=' + Date.now())
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load entries');
      return res.json();
    })
    .then(function (data) {
      _entries = (data.entries || []).filter(function (e) { return e.date; });
      _entries.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
      });
      renderAll();
      populateStats();
    })
    .catch(function (err) {
      console.error('Timeline load error:', err);
      showEmptyState();
    });
}

function renderAll() {
  clearAll();
  if (_entries.length === 0) {
    showEmptyState();
    return;
  }

  var wrapper = document.querySelector('.timeline-wrapper');
  var svg = document.getElementById('timeline-svg');
  var tilesLayer = document.getElementById('tiles-layer');

  var wrapperWidth = wrapper.clientWidth || 600;
  var svgWidth = Math.max(wrapperWidth - 32, 400);
  var margin = Math.min(MARGIN, svgWidth * 0.1);
  var usableWidth = svgWidth - 2 * margin;
  var rightX = svgWidth - margin;

  var n = _entries.length;
  var numRows = Math.ceil(n / ENTRIES_PER_ROW);
  _svgHeight = PADDING_TOP + numRows * ROW_HEIGHT + PADDING_BOTTOM;

  svg.setAttribute('viewBox', '0 0 ' + svgWidth + ' ' + _svgHeight);
  svg.style.width = '100%';
  svg.style.height = _svgHeight + 'px';
  tilesLayer.style.height = _svgHeight + 'px';

  _tilePositions = [];
  for (var r = 0; r < numRows; r++) {
    var rowDir = (r % 2 === 0) ? 1 : -1;
    var tilesInRow = Math.min(ENTRIES_PER_ROW, n - r * ENTRIES_PER_ROW);
    var rowY = PADDING_TOP + r * ROW_HEIGHT + ROW_HEIGHT / 2;

    for (var t = 0; t < tilesInRow; t++) {
      var entry = _entries[r * ENTRIES_PER_ROW + t];
      var x;
      if (tilesInRow === 1) {
        x = margin + usableWidth / 2;
      } else {
        var frac = t / (tilesInRow - 1);
        if (rowDir === -1) frac = 1 - frac;
        x = margin + frac * usableWidth;
      }
      _tilePositions.push({ x: x, y: rowY, entry: entry });
    }
  }

  drawPath(svg, numRows, margin, rightX);
  drawStartDot(svg, margin, PADDING_TOP + ROW_HEIGHT / 2);
  placeTiles(tilesLayer, svgWidth);
  buildSideTimeline();
  setupScrollObserver();
}

function clearAll() {
  var svg = document.getElementById('timeline-svg');
  var tilesLayer = document.getElementById('tiles-layer');
  var dots = document.getElementById('side-dots');
  svg.innerHTML = '';
  tilesLayer.innerHTML = '';
  if (dots) dots.innerHTML = '';
}

function drawPath(svg, numRows, margin, rightX) {
  var d = '';
  var startY = PADDING_TOP + ROW_HEIGHT / 2;
  d += 'M ' + margin + ' ' + startY;

  var prevEndX = margin;

  for (var r = 0; r < numRows; r++) {
    var rowDir = (r % 2 === 0) ? 1 : -1;
    var rowY = PADDING_TOP + r * ROW_HEIGHT + ROW_HEIGHT / 2;
    var endX = rowDir === 1 ? rightX : margin;

    if (r > 0) {
      d += ' L ' + prevEndX + ' ' + rowY;
    }
    d += ' L ' + endX + ' ' + rowY;

    prevEndX = endX;
  }

  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('class', 'timeline-path');
  svg.appendChild(path);

  for (var cr = 1; cr < numRows; cr++) {
    var cx = (cr % 2 === 1) ? rightX : margin;
    var cy = PADDING_TOP + cr * ROW_HEIGHT + ROW_HEIGHT / 2;
    var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
    dot.setAttribute('r', '4');
    dot.setAttribute('class', 'timeline-corner-dot');
    svg.appendChild(dot);
  }
}

function drawStartDot(svg, x, y) {
  var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y);
  circle.setAttribute('r', '7');
  circle.setAttribute('class', 'timeline-start-dot');
  svg.appendChild(circle);

  var ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ring.setAttribute('cx', x);
  ring.setAttribute('cy', y);
  ring.setAttribute('r', '16');
  ring.setAttribute('class', 'timeline-start-ring');
  svg.appendChild(ring);
}

function populateStats() {
  var bookCount = 0;
  var eventCount = 0;
  for (var i = 0; i < _entries.length; i++) {
    if (_entries[i].type === 'book') bookCount++;
    else eventCount++;
  }

  var elBooks = document.getElementById('stat-books');
  var elEvents = document.getElementById('stat-events');
  var elTotal = document.getElementById('stat-total');
  if (elBooks) elBooks.textContent = bookCount;
  if (elEvents) elEvents.textContent = eventCount;
  if (elTotal) elTotal.textContent = _entries.length;
}

function placeTiles(layer, svgWidth) {
  for (var i = 0; i < _tilePositions.length; i++) {
    var pos = _tilePositions[i];
    var entry = pos.entry;

    var tile = document.createElement('div');
    tile.className = 'timeline-tile tile-' + entry.type;
    tile.setAttribute('data-index', i);

    var leftPct = (pos.x / svgWidth) * 100;
    var topPct = (pos.y / _svgHeight) * 100;
    tile.style.left = leftPct + '%';
    tile.style.top = topPct + '%';
    tile.style.width = TILE_SIZE + 'px';
    tile.style.height = TILE_SIZE + 'px';

    var content = document.createElement('div');
    content.className = 'tile-content';

    if (entry.type === 'book') {
      var img = document.createElement('img');
      img.className = 'tile-cover';
      img.src = entry.coverImage || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="84"><rect fill="#5a8ec0" width="120" height="84" rx="8"/><text x="60" y="50" text-anchor="middle" fill="white" font-size="28" font-family="Georgia,serif">📖</text></svg>');
      img.alt = entry.title;
      img.loading = 'lazy';

      var label = document.createElement('div');
      label.className = 'tile-label';
      label.innerHTML =
        '<div class="tile-title">' + escapeHTML(entry.title) + '</div>' +
        '<span class="tile-date">' + shortDate(entry.date) + '</span>';

      content.appendChild(img);
      content.appendChild(label);
    } else {
      var iconWrap = document.createElement('div');
      iconWrap.className = 'event-icon-wrap';

      var iconImg = document.createElement('img');
      iconImg.src = entry.icon || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="8" r="7" fill="%236c63ff"/><polygon points="10,22 18,14 26,22" fill="%236c63ff"/><rect x="14" y="20" width="8" height="14" rx="3" fill="%23ffc857"/></svg>');
      iconImg.alt = entry.title;
      iconWrap.appendChild(iconImg);

      var label2 = document.createElement('div');
      label2.className = 'tile-label';
      label2.innerHTML =
        '<div class="tile-title">' + escapeHTML(entry.title) + '</div>' +
        '<span class="tile-date">' + shortDate(entry.date) + '</span>';

      content.appendChild(iconWrap);
      content.appendChild(label2);
    }

    tile.appendChild(content);

    tile.addEventListener('click', function (evt) {
      var idx = parseInt(this.getAttribute('data-index'));
      openModal(_entries[idx]);
    });

    layer.appendChild(tile);
  }
}

function buildSideTimeline() {
  var dotsContainer = document.getElementById('side-dots');
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';

  for (var i = 0; i < _entries.length; i++) {
    var entry = _entries[i];
    var dot = document.createElement('div');
    dot.className = 'side-dot type-' + entry.type;
    dot.setAttribute('data-index', i);
    dot.setAttribute('data-title', entry.title);
    dot.setAttribute('data-date', entry.date);
    dot.style.top = ((i / (_entries.length - 1 || 1)) * 100) + '%';

    var dateLabel = document.createElement('span');
    dateLabel.className = 'side-dot-date';
    dateLabel.textContent = yearOnly(entry.date);
    dot.appendChild(dateLabel);

    dot.addEventListener('click', function () {
      var idx = parseInt(this.getAttribute('data-index'));
      scrollToEntry(idx);
    });

    dotsContainer.appendChild(dot);
  }
}

function scrollToEntry(index) {
  var tile = document.querySelector('.timeline-tile[data-index="' + index + '"]');
  if (tile) {
    tile.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function setupScrollObserver() {
  var tiles = document.querySelectorAll('.timeline-tile');
  var dots = document.querySelectorAll('.side-dot');
  var highlight = document.getElementById('side-highlight');
  var tooltip = document.getElementById('side-tooltip');

  var observer = new IntersectionObserver(
    function (observed) {
      var visible = [];
      for (var i = 0; i < observed.length; i++) {
        if (observed[i].isIntersecting) {
          visible.push(parseInt(observed[i].target.getAttribute('data-index')));
        }
      }
      if (visible.length > 0) {
        var activeIndex = visible[0];
        for (var j = 0; j < dots.length; j++) {
          dots[j].classList.remove('active');
        }
        if (dots[activeIndex]) {
          dots[activeIndex].classList.add('active');
          if (highlight) {
            highlight.style.top = dots[activeIndex].style.top;
            highlight.classList.add('visible');
          }
          if (tooltip) {
            var entryDate = dots[activeIndex].getAttribute('data-date');
            var entryTitle = dots[activeIndex].getAttribute('data-title');
            tooltip.textContent = entryTitle + ' · ' + formatFullDate(entryDate);
            tooltip.style.top = dots[activeIndex].style.top;
            tooltip.classList.add('visible');
          }
        }
      } else if (highlight) {
        highlight.classList.remove('visible');
        if (tooltip) tooltip.classList.remove('visible');
      }
    },
    { rootMargin: '-20% 0px -55% 0px', threshold: 0 }
  );

  for (var k = 0; k < tiles.length; k++) {
    observer.observe(tiles[k]);
  }

  if (highlight && dots.length > 0) {
    highlight.style.top = dots[0].style.top;
  }
}

/* ── Scroll Hint ──────────────────────── */

function setupScrollHint() {
  var hint = document.getElementById('scroll-hint');
  if (!hint) return;

  function checkHint() {
    var vh = window.innerHeight;
    var docH = document.documentElement.scrollHeight;
    var scrollY = window.pageYOffset;
    if (docH > vh * 1.3 && scrollY < 200) {
      hint.classList.add('visible');
    } else {
      hint.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', throttle(checkHint, 100));
  checkHint();
}

function showEmptyState() {
  var wrapper = document.querySelector('.timeline-wrapper');
  wrapper.innerHTML = '<div class="empty-state"><div class="empty-icon">🚀</div><p>No entries yet!</p><p>Roy\'s mission log is waiting for its first entry.</p></div>';
}

/* ── Utilities ────────────────────────── */

function shortDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function yearOnly(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 4);
}

function formatFullDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHTML(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function throttle(fn, delay) {
  var last = 0;
  return function () {
    var now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, arguments);
    }
  };
}

/* ── Resize Handler ────────────────────── */

window.addEventListener('resize', throttle(function () {
  if (_entries.length > 0) renderAll();
  populateStats();
}, 400));

/* ── Init ──────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {
  loadTimeline();
  setupScrollHint();
});
