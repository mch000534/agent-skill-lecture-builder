    // Reveal on scroll
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('visible') });
    }, { threshold: .08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el) });

    // Sidebar / Hamburger
    var sidebar = document.getElementById('sidebar');
    var hamburger = document.getElementById('hamburger');
    var overlay = document.getElementById('overlay');

    function toggleSidebar() {
      var open = sidebar.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      overlay.classList.toggle('visible', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      hamburger.classList.remove('active');
      overlay.classList.remove('visible');
      document.body.style.overflow = '';
    }
    hamburger.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth < 1100) closeSidebar();
      })
    });

    // Desktop sidebar collapse
    var collapseBtn = document.getElementById('sidebar-collapse');
    if (localStorage.getItem('sidebar-collapsed') === 'true' && window.innerWidth >= 1100) {
      sidebar.classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed');
    }
    collapseBtn.addEventListener('click', function () {
      var c = sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-collapsed', c);
      localStorage.setItem('sidebar-collapsed', c);
    });

    // Scroll spy — 這兩個陣列需根據實際內容填入
    var sectionIds = window.__sectionIds__ || [];        // e.g. ['instructor','new-project','old-project','testing','summary']
    var allAnchorIds = window.__allAnchorIds__ || [];   // e.g. ['instructor','new-project','sub-create-project',...]

    var sectionForAnchor = {};
    allAnchorIds.forEach(function (id) {
      if (sectionIds.includes(id)) { sectionForAnchor[id] = id }
      else {
        for (var i = sectionIds.length - 1; i >= 0; i--) {
          var idx = allAnchorIds.indexOf(sectionIds[i]);
          if (idx <= allAnchorIds.indexOf(id)) { sectionForAnchor[id] = sectionIds[i]; break }
        }
      }
    });

    function updateToc() {
      var scrollY = window.scrollY + 20;
      var activeAnchor = allAnchorIds[0];
      allAnchorIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) activeAnchor = id;
      });
      var activeSection = sectionForAnchor[activeAnchor] || sectionIds[0];
      document.querySelectorAll('.toc-group').forEach(function (g) {
        var isActive = g.dataset.section === activeSection;
        g.classList.toggle('expanded', isActive);
        g.querySelector('.toc-group-title').classList.toggle('active', isActive);
      });
      document.querySelectorAll('.toc-sub a').forEach(function (a) {
        var href = a.getAttribute('href').replace('#', '');
        a.classList.toggle('active', href === activeAnchor);
      });
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? Math.round((window.scrollY / docH) * 100) : 0;
      document.getElementById('progress-fill').style.width = pct + '%';
      document.getElementById('progress-pct').textContent = pct + '%';
      document.getElementById('collapsed-progress-fill').style.width = pct + '%';
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(function () { updateToc(); ticking = false }); ticking = true }
    });
    updateToc();

    // Anchor scroll stabilization — images may change layout after initial jump.
    var hashScrollTimer = null;
    function scrollToHashTarget(hash, behavior) {
      if (!hash || hash === '#') return;
      var id = hash.charAt(0) === '#' ? hash.slice(1) : hash;
      var el = document.getElementById(id);
      if (!el) return;
      var top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 20);
      window.scrollTo({ top: top, behavior: behavior || 'auto' });
    }
    function scheduleHashScrollFix(delay, behavior) {
      if (!window.location.hash) return;
      clearTimeout(hashScrollTimer);
      hashScrollTimer = setTimeout(function () {
        scrollToHashTarget(window.location.hash, behavior || 'auto');
        updateToc();
      }, delay || 0);
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        var id = hash.slice(1);
        if (!document.getElementById(id)) return;
        e.preventDefault();
        if (window.location.hash !== hash) history.pushState(null, '', hash);
        scrollToHashTarget(hash, 'smooth');
        scheduleHashScrollFix(220, 'auto');
        scheduleHashScrollFix(900, 'auto');
      });
    });

    window.addEventListener('hashchange', function () {
      scheduleHashScrollFix(0, 'auto');
      scheduleHashScrollFix(220, 'auto');
      scheduleHashScrollFix(900, 'auto');
    });

    Array.from(document.images).forEach(function (img) {
      if (img.complete) return;
      img.addEventListener('load', function () { scheduleHashScrollFix(0, 'auto'); }, { passive: true });
      img.addEventListener('error', function () { scheduleHashScrollFix(0, 'auto'); }, { passive: true });
    });

    window.addEventListener('load', function () {
      scheduleHashScrollFix(0, 'auto');
      scheduleHashScrollFix(300, 'auto');
    });

    // Theme toggle
    var themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
      }
    });
    window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', function (e) {
      if (localStorage.getItem('theme')) return;
      if (e.matches) { document.documentElement.removeAttribute('data-theme'); themeToggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' }
      else { document.documentElement.setAttribute('data-theme', 'light'); themeToggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' }
    });

    // Shared markdown helpers (used by bonus modal and PDF export)
    function fmtInline(s) {
      return s
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    function renderMd(text) {
      var lines = text.split('\n');
      var html = '';
      var paraLines = [];
      var inList = false;
      var inSteps = false;
      function flushPara() {
        if (paraLines.length) { html += '<p>' + paraLines.map(fmtInline).join('<br>') + '</p>'; paraLines = []; }
      }
      function flushList() { if (inList) { html += '</ul>'; inList = false; } }
      function flushSteps() { if (inSteps) { html += '</div>'; inSteps = false; } }
      for (var i = 0; i < lines.length; i++) {
        var l = lines[i];
        var stepMatch = l.match(/^(\d+)\.\s+(.*)/);
        if (stepMatch) {
          flushPara(); flushList();
          if (!inSteps) { html += '<div class="bonus-steps">'; inSteps = true; }
          html += '<div class="bonus-step"><span class="bonus-step-num">' + stepMatch[1] + '</span><span class="bonus-step-text">' + fmtInline(stepMatch[2]) + '</span></div>';
        } else if (/^- /.test(l)) {
          flushPara(); flushSteps();
          if (!inList) { html += '<ul>'; inList = true; }
          html += '<li>' + fmtInline(l.replace(/^- /, '')) + '</li>';
        } else if (l.trim() === '') {
          flushSteps(); flushList(); flushPara();
        } else {
          flushSteps(); flushList(); paraLines.push(l);
        }
      }
      flushSteps(); flushList(); flushPara();
      return html;
    }

    // Bonus Modal
    (function () {
      var overlay = document.getElementById('bonus-overlay');
      var closeBtn = document.getElementById('bonus-modal-close');
      var titleEl = document.getElementById('bonus-modal-title');
      var bodyEl = document.getElementById('bonus-modal-body');

      function openModal(title, content) {
        titleEl.textContent = title;
        bodyEl.innerHTML = renderMd(content);
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
      }
      function closeModal() {
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
      }

      closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

      document.querySelectorAll('.bonus-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openModal(btn.dataset.bonusTitle || '', btn.dataset.bonusContent || '');
        });
      });
    })();

    // Share modal (Q key)
    (function () {
      var shareOverlay = document.getElementById('share-overlay');
      var shareClose = document.getElementById('share-modal-close');
      var shareQrContainer = document.getElementById('share-qr-container');
      var shareOgImg = document.getElementById('share-og-img');
      var shareUrlLink = document.getElementById('share-url-link');
      var shareCopyBtn = document.getElementById('share-copy-btn');

      function openShare() {
        var url = window.location.href;
        var ogMeta = document.querySelector('meta[property="og:image"]');
        var ogImgUrl = ogMeta ? ogMeta.getAttribute('content') : '';
        var qrSize = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.9 * 0.55);
        qrSize = Math.max(200, Math.min(700, qrSize));
        shareQrContainer.style.width = qrSize + 'px';
        shareQrContainer.style.height = qrSize + 'px';
        shareQrContainer.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
          new QRCode(shareQrContainer, {
            text: url,
            width: qrSize,
            height: qrSize,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
          });
        }
        if (ogImgUrl) {
          shareOgImg.src = ogImgUrl;
          shareOgImg.parentElement.style.display = '';
        } else {
          shareOgImg.parentElement.style.display = 'none';
        }
        shareUrlLink.href = url;
        shareUrlLink.textContent = url;
        shareOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
      }
      function closeShare() {
        shareOverlay.classList.remove('visible');
        document.body.style.overflow = '';
      }

      shareClose.addEventListener('click', closeShare);
      shareOverlay.addEventListener('click', function (e) { if (e.target === shareOverlay) closeShare(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && shareOverlay.classList.contains('visible')) closeShare(); });
      var shareToggleBtn = document.getElementById('share-toggle');
      if (shareToggleBtn) shareToggleBtn.addEventListener('click', openShare);

      shareCopyBtn.addEventListener('click', function () {
        var url = shareUrlLink.href;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            shareCopyBtn.textContent = '已複製！';
            setTimeout(function () { shareCopyBtn.textContent = '複製'; }, 2000);
          }).catch(function () { fallbackCopy(url); });
        } else {
          fallbackCopy(url);
        }
      });
      function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); shareCopyBtn.textContent = '已複製！'; setTimeout(function () { shareCopyBtn.textContent = '複製'; }, 2000); } catch (e) { }
        document.body.removeChild(ta);
      }

      window.__openShareModal = openShare;
      window.__closeShareModal = closeShare;
      window.__toggleShareModal = function () {
        if (shareOverlay.classList.contains('visible')) closeShare();
        else openShare();
      };
    })();

    // Copy prompt
    function copyPrompt(btn) {
      var text = btn.closest('.prompt-block').querySelector('.prompt-body').textContent;
      navigator.clipboard.writeText(text).then(function () {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.style.opacity = '1';
        setTimeout(function () {
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
          btn.style.opacity = '';
        }, 1500);
      });
    }

    // Font size toggle (5 levels)
    var fontSizes = [16, 21, 22, 23, 24];
    var fontLabels = ['A1', 'A2', 'A3', 'A4', 'A5'];
    var fontIdx = fontSizes.indexOf(parseInt(localStorage.getItem('fontSize')) || 18);
    if (fontIdx < 0) fontIdx = 2;
    var fontBtn = document.getElementById('fontsize-toggle');
    function applyFontSize() {
      document.documentElement.style.fontSize = fontSizes[fontIdx] + 'px';
      fontBtn.textContent = fontLabels[fontIdx];
      localStorage.setItem('fontSize', fontSizes[fontIdx]);
    }
    applyFontSize();
    fontBtn.addEventListener('click', function () {
      fontIdx = (fontIdx + 1) % fontSizes.length;
      applyFontSize();
    });

    // ===== SETTINGS PANEL =====
    (function () {
      var settingsToggle = document.getElementById('settings-toggle');
      var settingsPanel = document.getElementById('settings-panel');

      function openSettings() {
        var rect = settingsToggle.getBoundingClientRect();
        settingsPanel.style.top = '';
        settingsPanel.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
        settingsPanel.style.left = Math.min(rect.left, window.innerWidth - 218) + 'px';
        settingsPanel.classList.add('open');
        settingsToggle.classList.add('active');
      }
      function closeSettings() {
        settingsPanel.classList.remove('open');
        settingsToggle.classList.remove('active');
      }

      settingsToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        settingsPanel.classList.contains('open') ? closeSettings() : openSettings();
      });

      settingsPanel.addEventListener('click', function (e) { e.stopPropagation(); });

      document.addEventListener('click', closeSettings);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSettings(); });

      // ===== COLOR THEMES =====
      function hexToRgbStr(hex) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return r + ' ' + g + ' ' + b;
      }

      function applyPalette(data, isLight) {
        var root = document.documentElement;
        var suffix = isLight ? 'Light' : '';
        var a = isLight ? (data.accentLight || data.accent) : data.accent;
        var a2 = isLight ? (data.accent2Light || data.accent2) : data.accent2;
        var a3 = isLight ? (data.accent3Light || data.accent3) : data.accent3;
        root.style.setProperty('--accent', a);
        root.style.setProperty('--accent-rgb', hexToRgbStr(a));
        root.style.setProperty('--accent2', a2);
        root.style.setProperty('--accent2-rgb', hexToRgbStr(a2));
        root.style.setProperty('--accent3', a3);
        root.style.setProperty('--accent3-rgb', hexToRgbStr(a3));
      }

      function getSwatchData(sw) {
        return {
          accent: sw.dataset.accent,
          accentLight: sw.dataset.accentLight,
          accent2: sw.dataset.accent2,
          accent2Light: sw.dataset.accent2Light,
          accent3: sw.dataset.accent3,
          accent3Light: sw.dataset.accent3Light
        };
      }

      function updateSwatchSelection(activeId) {
        document.querySelectorAll('.color-swatch').forEach(function (sw) {
          sw.classList.toggle('selected', sw.dataset.themeId === activeId);
        });
      }

      // Restore saved palette on load
      var savedPalette = localStorage.getItem('colorPalette');
      if (savedPalette) {
        try {
          var sp = JSON.parse(savedPalette);
          var isLight = document.documentElement.getAttribute('data-theme') === 'light';
          applyPalette(sp, isLight);
          document.querySelectorAll('.color-swatch').forEach(function (sw) {
            if (sw.dataset.accent === sp.accent) sw.classList.add('selected');
          });
        } catch (e) { }
      } else {
        var firstSwatch = document.querySelector('.color-swatch[data-theme-id="coral"]');
        if (firstSwatch) firstSwatch.classList.add('selected');
      }

      document.querySelectorAll('.color-swatch').forEach(function (sw) {
        sw.addEventListener('click', function () {
          var data = getSwatchData(sw);
          var isLight = document.documentElement.getAttribute('data-theme') === 'light';
          applyPalette(data, isLight);
          localStorage.setItem('colorPalette', JSON.stringify(data));
          updateSwatchSelection(sw.dataset.themeId);
        });
      });

      // Re-apply palette when theme (dark/light) is toggled
      themeToggle.addEventListener('click', function () {
        var paletteData = localStorage.getItem('colorPalette');
        if (!paletteData) return;
        try {
          var pd = JSON.parse(paletteData);
          setTimeout(function () {
            var isLight = document.documentElement.getAttribute('data-theme') === 'light';
            applyPalette(pd, isLight);
          }, 0);
        } catch (e) { }
      });

      // ===== PDF EXPORT =====
      document.getElementById('export-pdf-btn').addEventListener('click', function () {
        closeSettings();
        exportPDF();
      });
    })();

    // ===== TIMER WIDGET =====
    (function () {
      var widget = document.getElementById('timer-widget');
      var dragHandle = document.getElementById('timer-drag-handle');
      var closeBtn = document.getElementById('timer-widget-close');
      var displayEl = document.getElementById('timer-display');
      var progressFill = document.getElementById('timer-progress-fill');
      var minutesInput = document.getElementById('timer-minutes');
      var startBtn = document.getElementById('timer-start-btn');
      var resetBtn = document.getElementById('timer-reset-btn');
      var decBtn = document.getElementById('timer-dec');
      var incBtn = document.getElementById('timer-inc');

      var timer = null;
      var remaining = 0;
      var totalSeconds = 0;
      var running = false;

      function pad(n) { return n < 10 ? '0' + n : '' + n; }

      function renderDisplay(secs) {
        displayEl.textContent = pad(Math.floor(secs / 60)) + ':' + pad(secs % 60);
        var pct = totalSeconds > 0 ? (secs / totalSeconds * 100) : 100;
        progressFill.style.width = pct + '%';
      }

      function applyMinutes(mins) {
        remaining = mins * 60;
        totalSeconds = remaining;
        progressFill.style.transition = 'none';
        renderDisplay(remaining);
      }

      function stopTimer() {
        if (timer) { clearInterval(timer); timer = null; }
        running = false;
      }

      function resetTimer() {
        stopTimer();
        displayEl.classList.remove('running', 'done');
        startBtn.textContent = '開始';
        var mins = Math.max(1, Math.min(120, parseInt(minutesInput.value) || 10));
        applyMinutes(mins);
      }

      // Show / hide (does NOT affect timer state)
      function hideWidget() { widget.classList.remove('open'); }
      function toggleWidget() { widget.classList.toggle('open'); }
      window.__toggleTimerWidget = toggleWidget;

      // Open from settings panel button
      document.getElementById('break-timer-btn').addEventListener('click', function () {
        var sp = document.getElementById('settings-panel');
        sp.classList.remove('open');
        document.getElementById('settings-toggle').classList.remove('active');
        widget.classList.add('open');
      });

      // Close button = hide only (same as T key)
      closeBtn.addEventListener('click', hideWidget);

      // +/−
      decBtn.addEventListener('click', function () {
        if (running) return;
        var v = Math.max(1, (parseInt(minutesInput.value) || 1) - 1);
        minutesInput.value = v; applyMinutes(v);
      });
      incBtn.addEventListener('click', function () {
        if (running) return;
        var v = Math.min(120, (parseInt(minutesInput.value) || 1) + 1);
        minutesInput.value = v; applyMinutes(v);
      });
      minutesInput.addEventListener('input', function () {
        if (running) return;
        var v = Math.max(1, Math.min(120, parseInt(minutesInput.value) || 1));
        applyMinutes(v);
      });

      // Start / Pause / Resume
      startBtn.addEventListener('click', function () {
        if (displayEl.classList.contains('done')) { resetTimer(); return; }
        if (!running) {
          running = true;
          if (remaining <= 0) applyMinutes(parseInt(minutesInput.value) || 10);
          displayEl.classList.remove('done');
          displayEl.classList.add('running');
          progressFill.style.transition = 'width .95s linear';
          startBtn.textContent = '暫停';
          timer = setInterval(function () {
            remaining--;
            renderDisplay(remaining);
            if (remaining <= 0) {
              stopTimer();
              displayEl.classList.remove('running');
              displayEl.classList.add('done');
              startBtn.textContent = '重新開始';
            }
          }, 1000);
        } else {
          stopTimer();
          displayEl.classList.remove('running');
          startBtn.textContent = '繼續';
        }
      });

      resetBtn.addEventListener('click', resetTimer);

      // Drag (mousedown converts right/bottom → left/top then tracks movement)
      var dragging = false, dragOffX = 0, dragOffY = 0;
      dragHandle.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        var rect = widget.getBoundingClientRect();
        widget.style.right = 'auto'; widget.style.bottom = 'auto';
        widget.style.left = rect.left + 'px'; widget.style.top = rect.top + 'px';
        dragging = true;
        dragOffX = e.clientX - rect.left;
        dragOffY = e.clientY - rect.top;
        e.preventDefault();
      });
      document.addEventListener('mousemove', function (e) {
        if (!dragging) return;
        var x = Math.max(0, Math.min(e.clientX - dragOffX, window.innerWidth - widget.offsetWidth));
        var y = Math.max(0, Math.min(e.clientY - dragOffY, window.innerHeight - widget.offsetHeight));
        widget.style.left = x + 'px'; widget.style.top = y + 'px';
      });
      document.addEventListener('mouseup', function () { dragging = false; });

      applyMinutes(10);
    })();

    function exportPDF() {
      var sections = document.querySelectorAll('section.section');
      if (!sections.length) { alert('找不到課程章節，請確認頁面已正常載入。'); return; }

      var printSlides = document.createElement('div');
      printSlides.id = 'print-slides';
      // Off-screen for height measurement
      printSlides.style.cssText = 'position:fixed;left:-9999px;width:1280px;display:block;visibility:hidden;';
      document.body.appendChild(printSlides);

      // Hero title page
      var heroEl = document.querySelector('header.hero');
      if (heroEl) {
        var heroSlide = document.createElement('div');
        heroSlide.className = 'slide slide-hero';
        heroSlide.appendChild(heroEl.cloneNode(true));
        printSlides.appendChild(heroSlide);
      }

      // Opening quote (before first section.section)
      document.querySelectorAll('section.quote-page').forEach(function (qp) {
        var qSlide = document.createElement('div');
        qSlide.className = 'slide slide-quote';
        var clone = qp.cloneNode(true);
        clone.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
        qSlide.appendChild(clone);
        // Insert opening quotes before sections, closing quotes after
        var isClosing = qp.compareDocumentPosition(sections[0]) & Node.DOCUMENT_POSITION_PRECEDING;
        if (isClosing) {
          printSlides._closingQuotes = printSlides._closingQuotes || [];
          printSlides._closingQuotes.push(qSlide);
        } else {
          printSlides.appendChild(qSlide);
        }
      });

      sections.forEach(function (section) {
        var h2El = section.querySelector('h2');
        var mainTitle = h2El ? h2El.textContent.trim() : '';

        var leadClone = null;
        var contentChildren = [];
        section.childNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.classList.contains('reveal') && node.querySelector('.section-label')) {
            var lead = node.querySelector('.lead');
            if (lead) leadClone = lead.cloneNode(true);
            return;
          }
          contentChildren.push(node);
        });

        // Separate [bonus] blocks from normal content — bonus gets standalone slides
        var bonusChildren = [];
        var normalChildren = [];
        contentChildren.forEach(function (child) {
          if (child.querySelector && child.querySelector(':scope > .bonus-btn')) {
            bonusChildren.push(child);
          } else {
            normalChildren.push(child);
          }
        });

        // Split normal content by ## sub-sections; ### (card) stays within the same page.
        // YouTube embeds become dedicated print slides so PDFs get one video per page.
        var entries = [];
        var currentPage = [];
        var activeSubTitle = '';
        function flushCurrentPage() {
          if (!currentPage.length) return;
          entries.push({ type: 'page', subTitle: activeSubTitle, children: currentPage });
          currentPage = [];
        }
        normalChildren.forEach(function (child) {
          var isSub = child.querySelector && child.querySelector(':scope > .sub-title');
          var isYoutube = child.querySelector && child.querySelector(':scope > .youtube-embed');
          if (isSub && currentPage.length > 0) {
            // Flush the previous ## block before switching subtitle context,
            // otherwise intro paragraphs get mislabeled as the next subsection.
            flushCurrentPage();
          }
          if (isSub) {
            var subEl = child.querySelector(':scope > .sub-title');
            activeSubTitle = subEl ? subEl.textContent.trim() : activeSubTitle;
          }
          if (isYoutube) {
            flushCurrentPage();
            entries.push({ type: 'youtube', subTitle: activeSubTitle, child: child });
            return;
          }
          currentPage.push(child);
        });
        flushCurrentPage();

        // Section title page — always render (except instructor); lead is optional
        var labelEl = section.querySelector('.section-label');
        if (labelEl && labelEl.id !== 'instructor') {
          var sectionLabel = labelEl ? labelEl.textContent.trim() : '';
          var titleSlide = document.createElement('div');
          titleSlide.className = 'slide slide-section-title';
          titleSlide.innerHTML =
            '<div class="section-title-inner">' +
            (sectionLabel ? '<div class="section-title-num">' + sectionLabel + '</div>' : '') +
            '<h2 class="section-title-heading">' + mainTitle + '</h2>' +
            (leadClone ? '<div class="section-title-lead">' + leadClone.innerHTML + '</div>' : '') +
            '</div>';
          printSlides.appendChild(titleSlide);
        }

        entries.forEach(function (entry) {
          if (entry.type === 'page') {
            var slide = makeSlide(mainTitle, entry.subTitle, 0);
            var body = slide.querySelector('.slide-body');
            entry.children.forEach(function (child) {
              var clone = child.cloneNode(true);
              // ## sub-title is shown in the header, remove it from body to avoid duplication
              var subTitleInBody = clone.querySelector(':scope > .sub-title');
              if (subTitleInBody) {
                subTitleInBody.remove();
                // Skip empty clones (sub-title was the only content in this reveal)
                if (!clone.hasChildNodes() || clone.textContent.trim() === '') return;
              }
              if (clone.classList.contains('reveal')) clone.classList.add('visible');
              clone.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
              body.appendChild(clone);
            });
            printSlides.appendChild(slide);
            return;
          }

          var embed = entry.child.querySelector(':scope > .youtube-embed');
          var wrapper = embed ? embed.querySelector('.youtube-wrapper') : null;
          var captionEl = embed ? embed.querySelector('.youtube-caption') : null;
          var videoId = wrapper ? wrapper.getAttribute('data-id') : '';
          var videoUrl = 'https://www.youtube.com/watch?v=' + videoId;
          var videoTitle = captionEl ? captionEl.textContent.trim() : 'YouTube 影片';
          var youtubeSlide = makeSlide(videoTitle, '', 0);
          youtubeSlide.classList.add('slide-youtube');
          var youtubeBody = youtubeSlide.querySelector('.slide-body');
          var link = document.createElement('a');
          link.className = 'youtube-print-link';
          link.href = videoUrl;
          link.target = '_blank';
          link.rel = 'noopener';

          var url = document.createElement('div');
          url.className = 'youtube-print-link-url';
          url.textContent = videoUrl;
          link.appendChild(url);

          var hint = document.createElement('div');
          hint.className = 'youtube-print-link-hint';
          hint.textContent = '可點擊此頁面直接開啟影片';
          link.appendChild(hint);

          youtubeBody.appendChild(link);
          printSlides.appendChild(youtubeSlide);
        });

        // Bonus blocks → standalone headerless slides
        bonusChildren.forEach(function (child) {
          var slide = document.createElement('div');
          slide.className = 'slide slide-bonus';
          var body = document.createElement('div');
          body.className = 'slide-body';
          child.querySelectorAll('.bonus-btn').forEach(function (btn) {
            var card = document.createElement('div');
            card.className = 'card';
            var h3 = document.createElement('h3');
            h3.textContent = btn.dataset.bonusTitle || '';
            card.appendChild(h3);
            var inner = document.createElement('div');
            inner.innerHTML = renderMd(btn.dataset.bonusContent || '');
            card.appendChild(inner);
            body.appendChild(card);
          });
          slide.appendChild(body);
          printSlides.appendChild(slide);
        });
      });

      // Append closing quote pages after all content sections
      if (printSlides._closingQuotes) {
        printSlides._closingQuotes.forEach(function (s) { printSlides.appendChild(s); });
        delete printSlides._closingQuotes;
      }

      // Footer → "Thank You" closing slide
      var footerEl = document.querySelector('footer.footer');
      if (footerEl) {
        var footerSlide = document.createElement('div');
        footerSlide.className = 'slide slide-footer';

        var inner = document.createElement('div');
        inner.className = 'footer-inner';

        // Thank you title
        var thanks = document.createElement('div');
        thanks.className = 'footer-thanks';
        thanks.textContent = 'Thank You';
        inner.appendChild(thanks);

        // Accent line
        var line = document.createElement('div');
        line.className = 'footer-line';
        inner.appendChild(line);

        // CTA text (from original footer)
        var ctaSrc = footerEl.querySelector('p[style*="font-size"]');
        if (ctaSrc) {
          var cta = document.createElement('div');
          cta.className = 'footer-cta';
          cta.textContent = ctaSrc.textContent.trim();
          inner.appendChild(cta);
        }

        // Social links (clone from original footer, re-wrap)
        var socialsSrc = footerEl.querySelector('.social-links');
        if (socialsSrc) {
          var socials = socialsSrc.cloneNode(true);
          socials.className = 'footer-socials';
          socials.removeAttribute('style');
          inner.appendChild(socials);
        }

        // Copyright
        var copySrc = footerEl.querySelectorAll('p');
        var copyText = '';
        copySrc.forEach(function (p) {
          if (!p.getAttribute('style')) copyText = p.textContent.trim();
        });
        if (copyText) {
          var copy = document.createElement('div');
          copy.className = 'footer-copyright';
          copy.textContent = copyText;
          inner.appendChild(copy);
        }

        footerSlide.appendChild(inner);
        printSlides.appendChild(footerSlide);
      }

      // Strip loading="lazy" — lazy images have 0 height off-screen,
      // which makes all slide measurements wrong.
      Array.from(printSlides.querySelectorAll('img[loading]')).forEach(function (img) {
        img.removeAttribute('loading');
      });

      // Wait for ALL images to load before measuring slides.
      // Most are cached from the live page; uncached ones need a real load.
      var allImgs = Array.from(printSlides.querySelectorAll('img'));
      var unloaded = allImgs.filter(function (i) { return !i.complete; });

      function runPackerAndPrint() {
        // Force layout before measuring
        // Scale print font-size proportionally from the user's A1–A5 selection (1.5× web size)
        var PRINT_SCALE = 1.2;
        var webFontSize = fontSizes[fontIdx] || 16;
        var printFontSize = webFontSize * PRINT_SCALE;
        var origFontSize = document.documentElement.style.fontSize;
        document.documentElement.style.fontSize = printFontSize + 'px';
        void printSlides.offsetHeight;

        // ── Greedy slide packer ──
        // Add children one by one; when adding one causes overflow, start a new
        // slide. If a single child alone overflows (e.g. a big image), shrink it
        // to fit. Consecutive images naturally get separate slides.
        var MAX_H = 720;

        // Fit instructor slide: compact layout, then size avatar to fill remaining space.
        Array.from(printSlides.querySelectorAll('.slide')).forEach(function (s) {
          var inst = s.querySelector('.instructor');
          if (!inst) return;
          var av = s.querySelector('.instructor-avatar, .instructor-avatar-placeholder');

          // Compact the instructor box for print — web CSS has 2rem padding/margin
          inst.style.padding = '1rem';
          inst.style.margin = '0';
          inst.style.gap = '1.5rem';
          inst.style.alignItems = 'center';
          inst.style.border = 'none';
          inst.style.background = 'none';

          if (!av) return;
          // Start large and shrink avatar only until slide fits 720px
          var size = 300;
          var minSize = 80;
          av.style.width = size + 'px';
          av.style.height = size + 'px';
          av.style.flexShrink = '0';
          void s.offsetHeight;
          while (s.scrollHeight > MAX_H && size > minSize) {
            size -= 8;
            av.style.width = size + 'px';
            av.style.height = size + 'px';
            void s.offsetHeight;
          }
        });

        function shrinkImagesInSlide(slide) {
          var imgs = Array.from(slide.querySelectorAll('img'));
          imgs.forEach(function (img) {
            var attempts = 0;
            while (attempts < 14 && slide.scrollHeight > MAX_H) {
              var curH = img.offsetHeight;
              if (curH < 50) break;
              img.style.maxHeight = Math.max(50, curH * 0.78) + 'px';
              img.style.width = 'auto';
              void slide.offsetHeight;
              attempts++;
            }
          });
        }

        function shrinkFontInSlide(slide) {
          var body = slide.querySelector('.slide-body') || slide;
          var attempts = 0;
          while (slide.scrollHeight > MAX_H && attempts < 8) {
            var cur = parseFloat(getComputedStyle(body).fontSize);
            var ratio = (MAX_H - 4) / slide.scrollHeight;
            body.style.fontSize = (cur * ratio) + 'px';
            void slide.offsetHeight;
            attempts++;
          }
        }

        Array.from(printSlides.children).forEach(function (origSlide) {
          if (origSlide.classList.contains('slide-hero') || origSlide.classList.contains('slide-quote')
            || origSlide.classList.contains('slide-footer') || origSlide.classList.contains('slide-bonus')
            || origSlide.classList.contains('slide-section-title')) return;
          if (origSlide.querySelector('.instructor')) return;

          var body = origSlide.querySelector('.slide-body');
          if (!body || body.children.length <= 1) {
            // Single-child slide that overflows → shrink to fit
            void origSlide.offsetHeight;
            if (origSlide.scrollHeight > MAX_H) {
              shrinkImagesInSlide(origSlide);
              if (origSlide.scrollHeight > MAX_H) shrinkFontInSlide(origSlide);
            }
            return;
          }

          void origSlide.offsetHeight;
          if (origSlide.scrollHeight <= MAX_H) return;

          var header = origSlide.querySelector('.slide-header');
          var mainTitle = header ? (header.querySelector('.slide-title') || {}).textContent || '' : '';
          var stEl = header ? header.querySelector('.slide-subtitle') : null;
          var subBase = stEl ? (stEl.dataset.base || stEl.textContent) : '';

          var allChildren = Array.from(body.children);
          while (body.firstChild) body.removeChild(body.firstChild);

          var curSlide = origSlide;
          var curBody = body;
          var group = [curSlide];

          allChildren.forEach(function (child) {
            curBody.appendChild(child);
            void curSlide.offsetHeight;

            if (curSlide.scrollHeight <= MAX_H) return;

            // First child on this slide must stay (avoid empty slides)
            if (curBody.children.length <= 1) {
              shrinkImagesInSlide(curSlide);
              if (curSlide.scrollHeight > MAX_H) shrinkFontInSlide(curSlide);
              return;
            }

            // This child causes overflow — move it to a new slide
            curBody.removeChild(child);

            var newSlide = makeSlide(mainTitle, subBase, 0);
            var newBody = newSlide.querySelector('.slide-body');
            newBody.appendChild(child);
            printSlides.insertBefore(newSlide, curSlide.nextSibling);

            curSlide = newSlide;
            curBody = newBody;
            group.push(curSlide);

            void curSlide.offsetHeight;

            // Single child alone exceeds MAX_H → shrink to fit
            if (curSlide.scrollHeight > MAX_H) {
              shrinkImagesInSlide(curSlide);
              if (curSlide.scrollHeight > MAX_H) shrinkFontInSlide(curSlide);
            }
          });

          if (group.length > 1) {
            group.forEach(function (s, i) {
              var st = s.querySelector('.slide-subtitle');
              if (st) st.textContent = (st.dataset.base || st.textContent) + ' (' + (i + 1) + '/' + group.length + ')';
            });
          }
        });

        // Split overflowing group-blocks across slides
        Array.from(printSlides.querySelectorAll('.slide')).forEach(function (s) {
          if (s.classList.contains('slide-hero') || s.classList.contains('slide-quote') || s.classList.contains('slide-footer')
            || s.classList.contains('slide-section-title')) return;
          if (s.querySelector('.instructor')) return;
          var body = s.querySelector('.slide-body');
          if (!body) return;
          void s.offsetHeight;
          if (s.scrollHeight <= MAX_H) return;

          // Find the overflowing group-block (may be the only child, or any child)
          var children = Array.from(body.children);
          for (var ci = 0; ci < children.length; ci++) {
            var reveal = children[ci];
            var groupBlock = reveal.querySelector(':scope > .group-block');
            if (!groupBlock) continue;

            var groupHeader = groupBlock.querySelector('.group-header');
            var groupBody = groupBlock.querySelector('.group-body');
            if (!groupBody || !groupHeader) continue;

            var groupChildren = Array.from(groupBody.children);
            if (groupChildren.length <= 1) continue;

            // Drain and re-pack group-body children
            while (groupBody.firstChild) groupBody.removeChild(groupBody.firstChild);

            var header = s.querySelector('.slide-header');
            var mainTitle = header ? (header.querySelector('.slide-title') || {}).textContent || '' : '';
            var stEl = header ? header.querySelector('.slide-subtitle') : null;
            var subBase = stEl ? (stEl.dataset.base || stEl.textContent) : '';

            var curSlide = s;
            var curGroupBody = groupBody;
            var splitGroup = [curSlide];

            groupChildren.forEach(function (gc) {
              curGroupBody.appendChild(gc);
              void curSlide.offsetHeight;
              if (curSlide.scrollHeight <= MAX_H) return;

              // First child on this group-body must stay (avoid empty groups)
              if (curGroupBody.children.length <= 1) {
                shrinkImagesInSlide(curSlide);
                if (curSlide.scrollHeight > MAX_H) shrinkFontInSlide(curSlide);
                return;
              }

              curGroupBody.removeChild(gc);

              var newSlide = makeSlide(mainTitle, subBase, 0);
              var newBody = newSlide.querySelector('.slide-body');
              var newReveal = document.createElement('div');
              newReveal.className = 'reveal';
              var newGB = document.createElement('div');
              newGB.className = 'group-block';
              newGB.appendChild(groupHeader.cloneNode(true));
              var newGBody = document.createElement('div');
              newGBody.className = 'group-body';
              newGB.appendChild(newGBody);
              newReveal.appendChild(newGB);
              newBody.appendChild(newReveal);
              printSlides.insertBefore(newSlide, curSlide.nextSibling);

              curSlide = newSlide;
              curGroupBody = newGBody;
              splitGroup.push(curSlide);

              curGroupBody.appendChild(gc);
              void curSlide.offsetHeight;
              if (curSlide.scrollHeight > MAX_H) {
                shrinkImagesInSlide(curSlide);
                if (curSlide.scrollHeight > MAX_H) shrinkFontInSlide(curSlide);
              }
            });

            if (splitGroup.length > 1) {
              splitGroup.forEach(function (sl, i) {
                var st = sl.querySelector('.slide-subtitle');
                if (st) st.textContent = (st.dataset.base || st.textContent) + ' (' + (i + 1) + '/' + splitGroup.length + ')';
              });
            }
            break; // one group-block per slide
          }
        });

        // Auto-shrink individual prompt-body blocks that are too wide/tall
        Array.from(printSlides.querySelectorAll('.prompt-body')).forEach(function (pb) {
          var slide = pb.closest('.slide');
          if (!slide) return;
          var MIN_FONT = 8;
          var cur = parseFloat(getComputedStyle(pb).fontSize);
          var attempts = 0;
          while (attempts < 12 && cur > MIN_FONT) {
            void slide.offsetHeight;
            var slideOver = slide.scrollHeight > MAX_H;
            var pbOver = pb.scrollWidth > pb.clientWidth + 2;
            if (!slideOver && !pbOver) break;
            cur = Math.max(MIN_FONT, cur * 0.88);
            pb.style.fontSize = cur + 'px';
            pb.style.lineHeight = '1.5';
            attempts++;
          }
        });

        // Merge thin slides (orphaned sub-titles, empty groups) into next slide
        var thinSlides = Array.from(printSlides.querySelectorAll('.slide'));
        for (var ti = 0; ti < thinSlides.length - 1; ti++) {
          var ts = thinSlides[ti];
          if (ts.classList.contains('slide-hero') || ts.classList.contains('slide-quote')
            || ts.classList.contains('slide-footer') || ts.classList.contains('slide-bonus')
            || ts.classList.contains('slide-section-title')) continue;
          var tBody = ts.querySelector('.slide-body');
          if (!tBody || tBody.children.length === 0) continue;
          void ts.offsetHeight;
          if (tBody.scrollHeight > 80) continue;

          var nextTs = thinSlides[ti + 1];
          if (nextTs.classList.contains('slide-hero') || nextTs.classList.contains('slide-quote')
            || nextTs.classList.contains('slide-footer') || nextTs.classList.contains('slide-bonus')
            || nextTs.classList.contains('slide-section-title')) continue;
          var nextTBody = nextTs.querySelector('.slide-body');
          if (!nextTBody) continue;

          var movers = Array.from(tBody.children);
          for (var mj = movers.length - 1; mj >= 0; mj--) {
            nextTBody.insertBefore(movers[mj], nextTBody.firstChild);
          }
          void nextTs.offsetHeight;
          if (nextTs.scrollHeight > MAX_H) shrinkFontInSlide(nextTs);

          ts.remove();
          thinSlides.splice(ti, 1);
          ti--;
        }

        // Re-number split slides after merge (group by subtitle base)
        var byBase = {};
        Array.from(printSlides.querySelectorAll('.slide-subtitle')).forEach(function (st) {
          var base = st.dataset.base || '';
          if (!base) return;
          if (!byBase[base]) byBase[base] = [];
          byBase[base].push(st);
        });
        Object.keys(byBase).forEach(function (base) {
          var sts = byBase[base];
          if (sts.length <= 1) {
            sts[0].textContent = base;
          } else {
            sts.forEach(function (st, i) {
              st.textContent = base + ' (' + (i + 1) + '/' + sts.length + ')';
            });
          }
        });

        // Remove ghost slides whose body is empty or has negligible content
        Array.from(printSlides.querySelectorAll('.slide')).forEach(function (s) {
          if (s.classList.contains('slide-hero') || s.classList.contains('slide-quote') || s.classList.contains('slide-footer')
            || s.classList.contains('slide-section-title')) return;
          if (s.querySelector('.instructor')) return;
          var body = s.querySelector('.slide-body');
          if (!body || body.children.length === 0 || body.scrollHeight < 50) {
            s.remove();
            return;
          }
          // Safety net: remove slides where the only content is a group-block with empty body
          var gb = body.querySelector('.group-body');
          if (gb && gb.children.length === 0 && body.querySelectorAll('.group-block').length === body.children.length) {
            s.remove();
          }
        });

        // Auto-shrink special slides (hero, quote, footer, instructor) via zoom
        // rem is relative to <html> root, not container — fontSize on container has no effect.
        // zoom scales everything including rem-based sizes.
        function shrinkSlideToFit(s) {
          void s.offsetHeight;
          if (s.scrollHeight <= MAX_H) return;
          var children = Array.from(s.children);
          if (!children.length) return;
          var attempts = 0;
          while (s.scrollHeight > MAX_H && attempts < 10) {
            var ratio = (MAX_H - 2) / s.scrollHeight;
            children.forEach(function (child) {
              var curZoom = parseFloat(child.style.zoom) || 1;
              child.style.zoom = (curZoom * ratio).toFixed(4);
            });
            void s.offsetHeight;
            attempts++;
          }
        }
        Array.from(printSlides.querySelectorAll('.slide-hero, .slide-quote, .slide-footer, .slide-section-title')).forEach(shrinkSlideToFit);

        // Final clamp: every slide is strictly 720px, no bleeding
        Array.from(printSlides.querySelectorAll('.slide')).forEach(function (s) {
          s.style.setProperty('max-height', MAX_H + 'px', 'important');
          s.style.setProperty('overflow', 'hidden', 'important');
        });

        // Set CSS variable so @media print uses the scaled font-size,
        // then restore the original web font-size for the live page.
        document.documentElement.style.setProperty('--print-font-size', printFontSize + 'px');
        document.documentElement.style.fontSize = origFontSize;

        // Remove measurement styles and print
        printSlides.removeAttribute('style');
        document.body.classList.add('printing');
        window.print();
        setTimeout(function () {
          document.body.classList.remove('printing');
          if (printSlides.parentNode) document.body.removeChild(printSlides);
        }, 500);

      } // end runPackerAndPrint

      // Kick off: wait for images then run packer
      if (!unloaded.length) {
        runPackerAndPrint();
      } else {
        var imgLoaded = 0;
        unloaded.forEach(function (img) {
          img.onload = img.onerror = function () {
            if (++imgLoaded >= unloaded.length) runPackerAndPrint();
          };
        });
        setTimeout(function () { if (imgLoaded < unloaded.length) runPackerAndPrint(); }, 3000);
      }
    }

    function makeSlide(mainTitle, subTitle, pageNum) {
      var slide = document.createElement('div');
      slide.className = 'slide';

      var header = document.createElement('div');
      header.className = 'slide-header';

      var titleEl = document.createElement('h2');
      titleEl.className = 'slide-title';
      titleEl.textContent = mainTitle;
      header.appendChild(titleEl);

      if (subTitle) {
        var subEl = document.createElement('h3');
        subEl.className = 'slide-subtitle';
        subEl.dataset.base = subTitle;
        subEl.textContent = pageNum > 0 ? subTitle + ' (' + pageNum + ')' : subTitle;
        header.appendChild(subEl);
      }

      var body = document.createElement('div');
      body.className = 'slide-body';
      slide.appendChild(header);
      slide.appendChild(body);
      return slide;
    }

    // ===== PRESENTATION MODE =====
    (function () {
      var slides = [];
      var slideIdx = 0;

      var enterBtn = document.createElement('button');
      enterBtn.className = 'pres-enter-btn';
      enterBtn.innerHTML = '&#9654; 簡報模式 <kbd style="font-size:.7rem;opacity:.5;margin-left:.2rem">P</kbd>';
      enterBtn.addEventListener('click', enterPresentation);
      document.body.appendChild(enterBtn);

      var progressBar = document.createElement('div');
      progressBar.className = 'pres-progress-bar';
      progressBar.innerHTML = '<div class="pres-progress-fill" id="pres-progress-fill"></div>';
      document.body.appendChild(progressBar);

      var presDefault = document.documentElement.dataset.mode === 'presentation'
        || /[?&]present(?:=|&|$)/.test(location.search);
      if (presDefault) enterPresentation();

      document.addEventListener('keydown', function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          document.body.classList.contains('pres-active') ? exitPresentation() : enterPresentation();
        }
        if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey && !document.body.classList.contains('pres-active')) {
          document.fullscreenElement
            ? document.exitFullscreen()
            : document.documentElement.requestFullscreen().catch(function () { });
        }
        if ((e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.innerWidth >= 1100) {
            var c = sidebar.classList.toggle('collapsed');
            document.body.classList.toggle('sidebar-collapsed', c);
            localStorage.setItem('sidebar-collapsed', c);
          } else {
            toggleSidebar();
          }
        }
        if ((e.key === 'q' || e.key === 'Q') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.__toggleShareModal) window.__toggleShareModal();
        }
        if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.__toggleTimerWidget) window.__toggleTimerWidget();
        }
      });

      function enterPresentation() {
        if (document.getElementById('pres-deck')) return;

        var deck = document.createElement('div');
        deck.id = 'pres-deck';
        slides = [];
        slideIdx = 0;

        var allSections = document.querySelectorAll('section.section');

        // Hero
        var hero = document.querySelector('header.hero');
        if (hero) {
          var hs = mkSlide('pres-slide--hero');
          hs.dataset.sourceId = 'hero';
          var hc = hero.cloneNode(true);
          hc.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
          hs.appendChild(hc);
          slides.push(hs);
        }

        // Opening quotes
        document.querySelectorAll('section.quote-page').forEach(function (qp) {
          if (allSections[0] && (qp.compareDocumentPosition(allSections[0]) & Node.DOCUMENT_POSITION_PRECEDING)) return;
          var qs = cloneQuoteSlide(qp);
          qs.dataset.sourceId = qp.id || 'opening-quote';
          slides.push(qs);
        });

        // Content sections
        allSections.forEach(function (section) {
          var labelEl = section.querySelector('.section-label');
          if (!labelEl) return;
          var numEl = labelEl.querySelector('.num');
          var sectionNum = numEl ? numEl.textContent.trim() : '';
          var h2El = section.querySelector('h2');
          var sectionTitle = h2El ? h2El.textContent.trim() : '';
          var leadEl = section.querySelector('.lead');
          var sectionLead = leadEl ? leadEl.innerHTML : '';
          var sectionName = labelEl.textContent.replace(sectionNum, '').trim();

          // Instructor section → single slide (no separate title slide)
          if (labelEl.id === 'instructor') {
            var instrEl = section.querySelector('.instructor');
            if (instrEl) {
              var is = mkContentSlide(sectionName, '', instrEl.cloneNode(true));
              slides.push(is);
            }
            return;
          }

          // Collect reveal children, split into pre-blocks (before first ##/###) and rest
          var allReveals = [];
          var preBlockCount = 0;
          var foundSubOrGroup = false;
          Array.from(section.children).forEach(function (child) {
            if (child.nodeType !== 1 || !child.classList.contains('reveal')) return;
            if (child.querySelector('.section-label')) return;
            if (!foundSubOrGroup) {
              if (child.querySelector(':scope > .sub-title') || child.querySelector(':scope > .group-block')) {
                foundSubOrGroup = true;
              } else {
                preBlockCount++;
              }
            }
            allReveals.push(child);
          });

          var srcLabel = section.querySelector('.section-label');
          var srcId = (srcLabel && srcLabel.id) || section.id || '';

          // Title slide — merge pre-blocks into it
          var ts = mkSlide('pres-slide--title');
          ts.dataset.sourceId = srcId;
          var titleInner = document.createElement('div');
          titleInner.className = 'pres-title-inner';
          titleInner.innerHTML = '<div class="pres-section-num">' + presEsc(sectionNum) + '</div>'
            + '<h2>' + presEsc(sectionTitle) + '</h2>'
            + (sectionLead ? '<p class="pres-lead">' + sectionLead + '</p>' : '');
          for (var pi = 0; pi < preBlockCount; pi++) {
            var clone = allReveals[pi].cloneNode(true);
            clone.classList.add('visible');
            titleInner.appendChild(clone);
          }
          ts.appendChild(titleInner);
          slides.push(ts);

          var currentSub = '';
          var currentSubId = '';
          var currentSlide = null;

          allReveals.forEach(function (child, idx) {
            if (idx < preBlockCount) return;

            var subEl = child.querySelector(':scope > .sub-title');
            if (subEl) {
              currentSub = subEl.textContent.trim();
              currentSubId = subEl.id || '';
              currentSlide = null;
              return;
            }

            var anchorId = currentSubId || srcId;
            var idEl = child.querySelector('[id]');
            if (idEl) anchorId = idEl.id;

            var groupEl = child.querySelector(':scope > .group-block');
            if (groupEl) {
              currentSlide = mkContentSlide(sectionName, currentSub, groupEl.cloneNode(true));
              currentSlide.dataset.sourceId = srcId;
              currentSlide.dataset.anchorId = anchorId;
              slides.push(currentSlide);
              return;
            }

            var ytEl = child.querySelector(':scope > .youtube-embed');
            if (ytEl) {
              var ys = mkContentSlide(sectionName, currentSub, ytEl.cloneNode(true));
              ys.dataset.sourceId = srcId;
              ys.dataset.anchorId = anchorId;
              slides.push(ys);
              currentSlide = null;
              return;
            }

            var clone = child.cloneNode(true);
            clone.classList.add('visible');
            if (currentSlide) {
              currentSlide.querySelector('.pres-content').appendChild(clone);
            } else {
              currentSlide = mkContentSlide(sectionName, currentSub, clone);
              currentSlide.dataset.sourceId = srcId;
              currentSlide.dataset.anchorId = anchorId;
              slides.push(currentSlide);
            }
          });
        });

        // Closing quotes
        document.querySelectorAll('section.quote-page').forEach(function (qp) {
          if (!allSections[0] || !(qp.compareDocumentPosition(allSections[0]) & Node.DOCUMENT_POSITION_PRECEDING)) return;
          var cqs = cloneQuoteSlide(qp);
          cqs.dataset.sourceId = qp.id || 'closing-quote';
          slides.push(cqs);
        });

        // Find the slide matching the currently visible content (fine-grained)
        var startIdx = 0;
        var viewMid = window.scrollY + window.innerHeight / 3;

        // Collect all anchors: hero, quote-pages, section-labels, sub-titles, and any [id] inside sections
        var anchors = [];
        var heroEl = document.querySelector('header.hero');
        if (heroEl) anchors.push({ el: heroEl, id: 'hero' });
        document.querySelectorAll('section.quote-page, .section-label[id], .sub-title[id], .group-block').forEach(function (el) {
          var aid = el.id;
          if (!aid && el.classList.contains('group-block')) {
            var prev = el.closest('.reveal');
            if (prev) {
              var sub = prev.previousElementSibling;
              while (sub && !sub.querySelector('.sub-title')) sub = sub.previousElementSibling;
              if (sub) { var st = sub.querySelector('.sub-title'); if (st) aid = st.id; }
            }
          }
          if (aid) anchors.push({ el: el, id: aid });
        });

        var matchId = '';
        for (var ai = anchors.length - 1; ai >= 0; ai--) {
          if (anchors[ai].el.getBoundingClientRect().top + window.scrollY <= viewMid) {
            matchId = anchors[ai].id;
            break;
          }
        }

        if (matchId) {
          // Try anchorId first (fine-grained), fall back to sourceId (section-level)
          for (var fi = 0; fi < slides.length; fi++) {
            if (slides[fi].dataset.anchorId === matchId || slides[fi].dataset.sourceId === matchId) {
              startIdx = fi; break;
            }
          }
        }

        slideIdx = startIdx;
        slides.forEach(function (s, i) {
          if (i === startIdx) s.classList.add('active');
          deck.appendChild(s);
        });

        document.body.appendChild(deck);
        document.body.classList.add('pres-active');
        updateProgress();

        document.addEventListener('keydown', presKeyHandler);

        var touchX = 0;
        deck.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].screenX; }, { passive: true });
        deck.addEventListener('touchend', function (e) {
          var dx = e.changedTouches[0].screenX - touchX;
          if (Math.abs(dx) > 50) goSlide(slideIdx + (dx > 0 ? -1 : 1));
        });

        deck.addEventListener('click', function (e) {
          if (e.target.closest('a, button, input, textarea, .prompt-block, iframe')) return;
          goSlide(slideIdx + (e.clientX / window.innerWidth < 0.25 ? -1 : 1));
        });
      }

      function exitPresentation() {
        var curSlide = slides[slideIdx];
        var targetId = curSlide ? (curSlide.dataset.anchorId || curSlide.dataset.sourceId) : '';
        document.body.classList.remove('pres-active');
        var deck = document.getElementById('pres-deck');
        if (deck) deck.remove();
        document.removeEventListener('keydown', presKeyHandler);
        if (document.fullscreenElement) document.exitFullscreen();
        slides = [];
        slideIdx = 0;
        if (targetId) {
          var el = targetId === 'hero'
            ? document.querySelector('header.hero')
            : document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'instant', block: 'start' });
          }
        }
      }

      function presKeyHandler(e) {
        if (!document.body.classList.contains('pres-active')) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        switch (e.key) {
          case 'ArrowRight': case 'ArrowDown': case ' ':
            e.preventDefault(); goSlide(slideIdx + 1); break;
          case 'ArrowLeft': case 'ArrowUp': case 'Backspace':
            e.preventDefault(); goSlide(slideIdx - 1); break;
          case 'Home': e.preventDefault(); goSlide(0); break;
          case 'End': e.preventDefault(); goSlide(slides.length - 1); break;
          case 'f': case 'F':
            if (!e.ctrlKey && !e.metaKey) {
              document.fullscreenElement
                ? document.exitFullscreen()
                : document.documentElement.requestFullscreen().catch(function () { });
            }
            break;
          case 'Escape':
            document.fullscreenElement ? document.exitFullscreen() : exitPresentation();
            break;
        }
      }

      function goSlide(n) {
        if (!slides.length) return;
        n = Math.max(0, Math.min(n, slides.length - 1));
        if (n === slideIdx) return;
        slides[slideIdx].classList.remove('active');
        slideIdx = n;
        slides[slideIdx].classList.add('active');
        var pc = slides[slideIdx].querySelector('.pres-content');
        if (pc) pc.scrollTop = 0;
        updateProgress();
      }

      function updateProgress() {
        var pct = slides.length ? ((slideIdx + 1) / slides.length * 100) : 0;
        var fill = document.getElementById('pres-progress-fill');
        if (fill) fill.style.width = pct.toFixed(1) + '%';
        var deck = document.getElementById('pres-deck');
        if (deck) {
          deck.querySelectorAll('.pres-counter').forEach(function (c) {
            c.textContent = (slideIdx + 1) + ' / ' + slides.length;
          });
        }
      }

      function mkSlide(cls) {
        var el = document.createElement('div');
        el.className = 'pres-slide ' + (cls || '');
        return el;
      }

      function cloneQuoteSlide(qp) {
        var qs = mkSlide('pres-slide--quote');
        var qc = qp.cloneNode(true);
        qc.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
        qs.appendChild(qc);
        return qs;
      }

      function mkContentSlide(sectionName, subTitle, content) {
        var slide = mkSlide('pres-slide--content');

        var bc = document.createElement('div');
        bc.className = 'pres-breadcrumb';
        bc.innerHTML = '<div class="pres-breadcrumb-path">'
          + '<span class="section-name">' + presEsc(sectionName) + '</span>'
          + (subTitle ? '<span class="sep">\u203A</span><span>' + presEsc(subTitle) + '</span>' : '')
          + '</div>'
          + '<span class="pres-counter"></span>';
        slide.appendChild(bc);

        var contentDiv = document.createElement('div');
        contentDiv.className = 'pres-content';
        content.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
        contentDiv.appendChild(content);
        slide.appendChild(contentDiv);

        return slide;
      }

      function presEsc(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
      }
    })();