    // Widget z-index stacking: most recently opened / clicked widget stays on top.
    var __widgetZ = 10500;
    function __bringToTop(el) { el.style.zIndex = ++__widgetZ; }

    // Reveal on scroll (flow-step entry animation is CSS-driven; JS only adds .visible)
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '200px 0px 0px 0px' });
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
      var wantSmooth = behavior === 'smooth';
      if (wantSmooth) {
        document.documentElement.classList.add('js-smooth-scroll');
        setTimeout(function () { document.documentElement.classList.remove('js-smooth-scroll'); }, 800);
      }
      window.scrollTo({ top: top, behavior: 'auto' });
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
    window.__toggleDarkLight = function () { themeToggle.click(); };
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

      document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('.bonus-btn');
        if (!btn) return;
        openModal(btn.dataset.bonusTitle || '', btn.dataset.bonusContent || '');
      });
    })();

    // Share widget (Q key)
    (function () {
      var widget = document.getElementById('share-widget');
      if (!widget) return;
      var dragHandle = document.getElementById('share-drag-handle');
      var closeBtn = document.getElementById('share-widget-close');
      var shareQrContainer = document.getElementById('share-qr-container');
      var shareOgImg = document.getElementById('share-og-img');
      var shareUrlLink = document.getElementById('share-url-link');
      var shareCopyBtn = document.getElementById('share-copy-btn');

      new MutationObserver(function () {
        if (widget.classList.contains('open')) __bringToTop(widget);
      }).observe(widget, { attributes: true, attributeFilter: ['class'] });
      widget.addEventListener('mousedown', function () { __bringToTop(widget); });

      function renderContent() {
        var url = window.location.href;
        var ogMeta = document.querySelector('meta[property="og:image"]');
        var ogImgUrl = ogMeta ? ogMeta.getAttribute('content') : '';
        var qrSize = Math.floor(widget.clientWidth / 3);
        qrSize = Math.max(120, Math.min(qrSize, 400));
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
      }

      function hideWidget() { widget.classList.remove('open'); }
      function openWidget() {
        widget.classList.add('open');
        requestAnimationFrame(function () { renderContent(); });
      }
      function toggleWidget() {
        if (widget.classList.contains('open')) { hideWidget(); return; }
        openWidget();
      }
      window.__toggleShareWidget = toggleWidget;

      if (closeBtn) closeBtn.addEventListener('click', hideWidget);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && widget.classList.contains('open')) hideWidget();
      });

      var shareToggleBtn = document.getElementById('share-toggle');
      if (shareToggleBtn) shareToggleBtn.addEventListener('click', openWidget);

      // Drag
      var dragging = false, dragOffX = 0, dragOffY = 0;
      if (dragHandle) {
        dragHandle.addEventListener('mousedown', function (e) {
          if (e.button !== 0) return;
          var rect = widget.getBoundingClientRect();
          widget.style.right = 'auto'; widget.style.bottom = 'auto';
          widget.style.transform = 'none';
          widget.style.left = rect.left + 'px'; widget.style.top = rect.top + 'px';
          dragging = true;
          dragOffX = e.clientX - rect.left;
          dragOffY = e.clientY - rect.top;
          e.preventDefault();
        });
      }
      document.addEventListener('mousemove', function (e) {
        if (!dragging) return;
        var x = Math.max(0, Math.min(e.clientX - dragOffX, window.innerWidth - widget.offsetWidth));
        var y = Math.max(0, Math.min(e.clientY - dragOffY, window.innerHeight - widget.offsetHeight));
        widget.style.left = x + 'px'; widget.style.top = y + 'px';
      });
      document.addEventListener('mouseup', function () { dragging = false; });

      if (shareCopyBtn) {
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
      }
      function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); shareCopyBtn.textContent = '已複製！'; setTimeout(function () { shareCopyBtn.textContent = '複製'; }, 2000); } catch (e) { }
        document.body.removeChild(ta);
      }
    })();


    // Keyboard shortcuts modal
    (function () {
      var overlay = document.getElementById('shortcut-overlay');
      if (!overlay) return;
      var closeBtn = document.getElementById('shortcut-modal-close');
      var openBtn = document.getElementById('shortcut-modal-btn');

      function openShortcuts() {
        var sp = document.getElementById('settings-panel');
        if (sp && sp.classList.contains('open')) {
          sp.classList.remove('open');
          var toggle = document.getElementById('settings-toggle');
          if (toggle) toggle.classList.remove('active');
        }
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
      }
      function closeShortcuts() {
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
      }

      if (openBtn) openBtn.addEventListener('click', openShortcuts);
      if (closeBtn) closeBtn.addEventListener('click', closeShortcuts);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeShortcuts(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('visible')) closeShortcuts();
      });
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
    window.__increaseFontSize = function () { if (fontIdx < fontSizes.length - 1) { fontIdx++; applyFontSize(); } };
    window.__decreaseFontSize = function () { if (fontIdx > 0) { fontIdx--; applyFontSize(); } };

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
        var firstSwatch = document.querySelector('.color-swatch[data-theme-id="red"]');
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
      window.__cycleColorTheme = function () {
        var swatches = Array.from(document.querySelectorAll('.color-swatch'));
        if (!swatches.length) return;
        var curIdx = swatches.findIndex(function (sw) { return sw.classList.contains('selected'); });
        var nextIdx = (curIdx + 1) % swatches.length;
        swatches[nextIdx].click();
      };

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
      if (widget) {
        new MutationObserver(function () {
          if (widget.classList.contains('open')) __bringToTop(widget);
        }).observe(widget, { attributes: true, attributeFilter: ['class'] });
        widget.addEventListener('mousedown', function () { __bringToTop(widget); });
      }
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
      var customBaseSeconds = 600;
      var running = false;

      // Top progress bar – shown when timer is running and widget is hidden
      var topBar = document.createElement('div');
      topBar.className = 'timer-top-bar';
      var topBarFill = document.createElement('div');
      topBarFill.className = 'timer-top-bar-fill';
      topBar.appendChild(topBarFill);
      document.body.appendChild(topBar);

      // Restructure DOM: [−] [display + overlay input] [+]
      var timeEdit = document.createElement('input');
      timeEdit.type = 'text';
      timeEdit.className = 'timer-time-edit';

      var displayArea = document.createElement('div');
      displayArea.className = 'timer-display-area';
      var displayRow = document.createElement('div');
      displayRow.className = 'timer-display-row';
      displayEl.parentNode.insertBefore(displayRow, displayEl);
      displayRow.appendChild(decBtn);
      displayRow.appendChild(displayArea);
      displayRow.appendChild(incBtn);
      displayArea.appendChild(displayEl);
      displayArea.appendChild(timeEdit);

      var inputRow = document.querySelector('.timer-input-row');
      if (inputRow) inputRow.style.display = 'none';

      function pad(n) { return n < 10 ? '0' + n : '' + n; }

      function updateTopBar() {
        var pct = totalSeconds > 0 ? (remaining / totalSeconds * 100) : 100;
        topBarFill.style.width = pct + '%';
        if (running && !widget.classList.contains('open')) {
          topBar.classList.add('active');
        } else {
          topBar.classList.remove('active');
        }
      }

      function renderDisplay(secs) {
        displayEl.textContent = pad(Math.floor(secs / 60)) + ':' + pad(secs % 60);
        var pct = totalSeconds > 0 ? (secs / totalSeconds * 100) : 100;
        progressFill.style.width = pct + '%';
        updateTopBar();
      }

      function applySeconds(secs) {
        secs = Math.max(1, Math.min(7200, secs));
        customBaseSeconds = secs;
        remaining = secs;
        totalSeconds = secs;
        progressFill.style.transition = 'none';
        topBarFill.style.transition = 'none';
        renderDisplay(secs);
        minutesInput.value = Math.max(1, Math.round(secs / 60));
      }

      function applyMinutes(mins) { applySeconds(mins * 60); }

      function stopTimer() {
        if (timer) { clearInterval(timer); timer = null; }
        running = false;
        updateTopBar();
      }

      function resetTimer() {
        stopTimer();
        displayEl.classList.remove('running', 'done');
        startBtn.textContent = '開始';
        applySeconds(customBaseSeconds);
      }

      // Show / hide (does NOT affect timer state)
      function hideWidget() { widget.classList.remove('open'); updateTopBar(); }
      function toggleWidget() { widget.classList.toggle('open'); updateTopBar(); }
      window.__toggleTimerWidget = toggleWidget;

      // Open from settings panel button
      document.getElementById('break-timer-btn').addEventListener('click', function () {
        var sp = document.getElementById('settings-panel');
        sp.classList.remove('open');
        document.getElementById('settings-toggle').classList.remove('active');
        widget.classList.add('open');
        updateTopBar();
      });

      // Close button = hide only (same as T key)
      closeBtn.addEventListener('click', hideWidget);

      // +/− adjust by 1 minute (60 s)
      decBtn.addEventListener('click', function () {
        if (running) return;
        applySeconds(Math.max(60, customBaseSeconds - 60));
      });
      incBtn.addEventListener('click', function () {
        if (running) return;
        applySeconds(Math.min(7200, customBaseSeconds + 60));
      });
      minutesInput.addEventListener('input', function () {
        if (running) return;
        var v = Math.max(1, Math.min(120, parseInt(minutesInput.value) || 1));
        applySeconds(v * 60);
      });

      // Direct 4-digit input: click display → type MMSS → auto-applies on 4th digit
      var digitBuf = [];
      var editingTime = false;

      function updateTimeEditValue() {
        var buf = digitBuf.slice(-4);
        while (buf.length < 4) buf.unshift('0');
        timeEdit.value = buf[0] + buf[1] + ':' + buf[2] + buf[3];
      }

      function openTimeEdit() {
        if (running || displayEl.classList.contains('done')) return;
        digitBuf = [];
        editingTime = true;
        updateTimeEditValue();
        displayEl.classList.add('editing');
        timeEdit.style.display = 'block';
        timeEdit.focus();
      }

      function closeTimeEdit() {
        if (!editingTime) return;
        editingTime = false;
        displayEl.classList.remove('editing');
        timeEdit.style.display = 'none';
      }

      function commitTimeEdit() {
        if (!editingTime) return;
        var buf = digitBuf.slice(-4);
        while (buf.length < 4) buf.unshift('0');
        var mm = parseInt(buf[0] + buf[1]) || 0;
        var ss = parseInt(buf[2] + buf[3]) || 0;
        var secs = mm * 60 + ss;
        closeTimeEdit();
        if (secs > 0) applySeconds(secs);
      }

      displayEl.addEventListener('click', openTimeEdit);

      timeEdit.addEventListener('blur', commitTimeEdit);
      timeEdit.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { closeTimeEdit(); e.preventDefault(); return; }
        if (e.key === 'Enter') { commitTimeEdit(); e.preventDefault(); return; }
        if (e.key === 'Backspace') { digitBuf.pop(); updateTimeEditValue(); e.preventDefault(); return; }
        if (/^\d$/.test(e.key) && digitBuf.length < 4) {
          digitBuf.push(e.key);
          updateTimeEditValue();
          e.preventDefault();
          if (digitBuf.length === 4) commitTimeEdit();
          return;
        }
        e.preventDefault();
      });

      // Start / Pause / Resume
      startBtn.addEventListener('click', function () {
        if (displayEl.classList.contains('done')) { resetTimer(); return; }
        if (!running) {
          running = true;
          if (remaining <= 0) applySeconds(customBaseSeconds);
          displayEl.classList.remove('done');
          displayEl.classList.add('running');
          progressFill.style.transition = 'width .95s linear';
          topBarFill.style.transition = 'width .95s linear';
          startBtn.textContent = '暫停';
          updateTopBar();
          timer = setInterval(function () {
            remaining--;
            renderDisplay(remaining);
            if (remaining <= 0) {
              stopTimer();
              displayEl.classList.remove('running');
              displayEl.classList.add('done');
              startBtn.textContent = '重新開始';
              if (!widget.classList.contains('open')) widget.classList.add('open');
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

      applySeconds(600);
    })();

    function exportPDF() {
      var sections = document.querySelectorAll('section.section');
      if (!sections.length) { alert('找不到課程章節，請確認頁面已正常載入。'); return; }

      // Force light theme for PDF export, restore after
      var origTheme = document.documentElement.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', 'light');

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
        // Always use A1 (16px, smallest) for PDF export regardless of user's current setting
        var PRINT_SCALE = 1.2;
        var webFontSize = fontSizes[0];
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
          // Restore original theme after printing
          if (origTheme === null) document.documentElement.removeAttribute('data-theme');
          else document.documentElement.setAttribute('data-theme', origTheme);
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
      enterBtn.setAttribute('aria-label', '簡報模式');
      enterBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>';
      enterBtn.addEventListener('click', enterPresentation);

      var exportIconBtn = document.createElement('button');
      exportIconBtn.className = 'settings-export-icon';
      exportIconBtn.setAttribute('aria-label', '匯出 PDF');
      exportIconBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>';
      exportIconBtn.addEventListener('click', function () { exportPDF(); });

      var firstRow = document.querySelector('.settings-controls-row');
      if (firstRow) {
        var row2 = document.createElement('div');
        row2.className = 'settings-controls-row';
        row2.appendChild(enterBtn);
        row2.appendChild(exportIconBtn);
        firstRow.insertAdjacentElement('afterend', row2);
        window.__settingsRow2 = row2;
        var oldExportBtn = document.getElementById('export-pdf-btn');
        if (oldExportBtn) {
          var oldSection = oldExportBtn.closest('.settings-section');
          var oldDivider = oldSection && oldSection.previousElementSibling;
          if (oldDivider && oldDivider.classList.contains('settings-divider')) oldDivider.style.display = 'none';
          if (oldSection) oldSection.style.display = 'none';
        }
      }

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
          if (window.__toggleShareWidget) window.__toggleShareWidget();
        }
        if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.__toggleTimerWidget) window.__toggleTimerWidget();
        }
        if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.__toggleLotteryWidget) window.__toggleLotteryWidget();
        }
        if (e.key === 'b' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.__toggleDoodle) window.__toggleDoodle();
        }
        if (e.key === 'B' && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.__doodleActive && window.__toggleDoodleEraser) window.__toggleDoodleEraser();
        }
        if (e.key === 'c' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.__doodleActive && window.__doodleCycleColor) window.__doodleCycleColor();
          else if (window.__cycleColorTheme) window.__cycleColorTheme();
        }
        if (e.key === 'C' && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.__doodleActive && window.__clearDoodle) window.__clearDoodle();
          else window.__toggleDarkLight();
        }
        if ((e.key === '=' || e.key === '+') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.__increaseFontSize) window.__increaseFontSize();
        }
        if ((e.key === '-' || e.key === '_') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.__decreaseFontSize) window.__decreaseFontSize();
        }
        if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (window.__toggleSpotlight) window.__toggleSpotlight();
        }
        if ((e.key === 'x' || e.key === 'X') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          ['timer-widget', 'lottery-widget', 'vote-widget'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.classList.remove('open');
          });
          var shareW = document.getElementById('share-widget');
          if (shareW) shareW.classList.remove('open');
          var sl = document.getElementById('spotlight-overlay');
          if (sl) { sl.classList.remove('active'); window.__spotlightActive = false; }
          if (window.__hideMagnifier) window.__hideMagnifier();
          if (window.__hideDoodle) window.__hideDoodle();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.altKey) {
          if (window.__doodleActive && window.__doodleUndo) { window.__doodleUndo(); e.preventDefault(); }
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
            if (child.querySelector(':scope > .section-label')) return;
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

          // Chapter-hero reveal must be a direct child of the slide for CSS background positioning
          var hasHero = allReveals.length > 0 && allReveals[0].classList.contains('chapter-hero__header');
          if (hasHero) {
            var heroClone = allReveals[0].cloneNode(true);
            heroClone.classList.add('visible');
            ts.appendChild(heroClone);
            ts.classList.add('pres-slide--has-hero');
          }

          var titleInner = document.createElement('div');
          titleInner.className = 'pres-title-inner';
          titleInner.innerHTML = '<div class="pres-section-num">' + presEsc(sectionNum) + '</div>'
            + '<h2>' + presEsc(sectionTitle) + '</h2>'
            + (sectionLead ? '<p class="pres-lead">' + sectionLead + '</p>' : '');
          var preStart = hasHero ? 1 : 0;
          for (var pi = preStart; pi < preBlockCount; pi++) {
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
        deck.querySelectorAll('iframe[src*="youtube.com/embed"]').forEach(function (f) {
          if (f.src.indexOf('enablejsapi') === -1) {
            f.src += (f.src.indexOf('?') === -1 ? '?' : '&') + 'enablejsapi=1';
          }
        });
        updateProgress();
        if (window.__invalidateMagnifierClone) window.__invalidateMagnifierClone();

        document.addEventListener('keydown', presKeyHandler);

        var touchX = 0;
        deck.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].screenX; }, { passive: true });
        deck.addEventListener('touchend', function (e) {
          var dx = e.changedTouches[0].screenX - touchX;
          if (Math.abs(dx) > 50) goSlide(slideIdx + (dx > 0 ? -1 : 1));
        });

        deck.addEventListener('click', function (e) {
          if (e.target.closest('a, button, input, textarea, .prompt-block, iframe, summary, details, .accordion, .spoiler, .tabs-block, .gloss, .code-block')) return;
          goSlide(slideIdx + (e.clientX / window.innerWidth < 0.25 ? -1 : 1));
        });
      }

      function exitPresentation() {
        var curSlide = slides[slideIdx];
        if (curSlide) pauseYouTubeInSlide(curSlide);
        var targetId = curSlide ? (curSlide.dataset.anchorId || curSlide.dataset.sourceId) : '';
        document.body.classList.remove('pres-active');
        var deck = document.getElementById('pres-deck');
        if (deck) deck.remove();
        if (window.__invalidateMagnifierClone) window.__invalidateMagnifierClone();
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
        if (e.target.tagName === 'SUMMARY' && (e.key === ' ' || e.key === 'Enter')) return;
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

      function pauseYouTubeInSlide(slide) {
        slide.querySelectorAll('iframe[src*="youtube.com/embed"]').forEach(function (f) {
          f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        });
      }

      function goSlide(n) {
        if (!slides.length) return;
        n = Math.max(0, Math.min(n, slides.length - 1));
        if (n === slideIdx) return;
        pauseYouTubeInSlide(slides[slideIdx]);
        slides[slideIdx].classList.remove('active');
        slideIdx = n;
        slides[slideIdx].classList.add('active');
        var pc = slides[slideIdx].querySelector('.pres-content');
        if (pc) pc.scrollTop = 0;
        updateProgress();
        if (window.__invalidateMagnifierClone) window.__invalidateMagnifierClone();
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

    // ===== LOTTERY WIDGET =====
    (function () {
      var widget = document.getElementById('lottery-widget');
      var dragHandle = document.getElementById('lottery-drag-handle');
      if (widget) {
        new MutationObserver(function () {
          if (widget.classList.contains('open')) __bringToTop(widget);
        }).observe(widget, { attributes: true, attributeFilter: ['class'] });
        widget.addEventListener('mousedown', function () { __bringToTop(widget); });
      }
      var closeBtn = document.getElementById('lottery-widget-close');
      var modeNumberPanel = document.getElementById('lottery-mode-number');
      var modeNamePanel = document.getElementById('lottery-mode-name');
      var numStartInput = document.getElementById('lottery-num-start');
      var numEndInput = document.getElementById('lottery-num-end');
      var namesInput = document.getElementById('lottery-names-input');
      var applyNamesBtn = document.getElementById('lottery-apply-names');
      var resultEl = document.getElementById('lottery-result');
      var poolInfoEl = document.getElementById('lottery-pool-info');
      var drawBtn = document.getElementById('lottery-draw-btn');
      var resetDrawBtn = document.getElementById('lottery-reset-draw-btn');
      var allowRepeatChk = document.getElementById('lottery-allow-repeat');
      var resetListBtn = document.getElementById('lottery-reset-list-btn');
      var drawnWrap = document.getElementById('lottery-drawn-wrap');
      var drawnListEl = document.getElementById('lottery-drawn-list');

      if (!widget) return;

      // ── State ──
      var mode = 'number';
      var fullList = [];
      var pool = [];
      var drawn = [];
      var spinning = false;
      var spinTimer = null;
      var groupResults = [];
      var scoreTeams = [
        { name: '隊伍 1', score: 0 },
        { name: '隊伍 2', score: 0 },
        { name: '隊伍 3', score: 0 },
        { name: '隊伍 4', score: 0 }
      ];

      // ── Panel switching ──
      function showPanel(name) {
        ['draw', 'group', 'score'].forEach(function (p) {
          var el = document.getElementById('lottery-panel-' + p);
          if (el) el.style.display = p === name ? '' : 'none';
        });
        document.querySelectorAll('.lottery-main-tab').forEach(function (btn) {
          btn.classList.toggle('active', btn.dataset.panel === name);
        });
        if (name === 'group') updateGroupSourceInfo();
        if (name === 'score') renderScoreTeams();
      }

      document.querySelectorAll('.lottery-main-tab').forEach(function (btn) {
        btn.addEventListener('click', function () { showPanel(btn.dataset.panel); });
      });

      // ── Draw panel ──
      function buildNumberList() {
        var s = parseInt(numStartInput.value) || 1;
        var e = parseInt(numEndInput.value) || 50;
        if (s > e) { var t = s; s = e; e = t; numStartInput.value = s; numEndInput.value = e; }
        s = Math.max(1, s); e = Math.min(9999, e);
        var list = [];
        for (var i = s; i <= e; i++) list.push(String(i));
        return list;
      }

      function updatePoolInfo() {
        poolInfoEl.textContent = '剩餘 ' + pool.length + ' / ' + fullList.length;
      }

      function updateDrawnDisplay() {
        if (!drawn.length) { drawnWrap.style.display = 'none'; drawnListEl.textContent = ''; return; }
        drawnWrap.style.display = '';
        drawnListEl.textContent = drawn.slice().reverse().join('、');
      }

      function initPool() {
        pool = fullList.slice();
        drawn = [];
        resultEl.textContent = '---';
        resultEl.className = 'lottery-result';
        updatePoolInfo();
        updateDrawnDisplay();
      }

      function setResultText(text, cls) {
        resultEl.textContent = text;
        resultEl.className = 'lottery-result' + (cls ? ' ' + cls : '');
      }

      function onListChange() {
        initPool();
        updateGroupSourceInfo();
      }

      fullList = buildNumberList();
      initPool();

      // Draw panel sub-tabs (學號 / 人名)
      document.querySelectorAll('.lottery-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          mode = btn.dataset.mode;
          document.querySelectorAll('.lottery-tab').forEach(function (b) {
            b.classList.toggle('active', b === btn);
          });
          modeNumberPanel.style.display = mode === 'number' ? '' : 'none';
          modeNamePanel.style.display = mode === 'name' ? '' : 'none';
          fullList = mode === 'number' ? buildNumberList() : [];
          onListChange();
        });
      });

      [numStartInput, numEndInput].forEach(function (inp) {
        inp.addEventListener('change', function () {
          if (mode !== 'number') return;
          fullList = buildNumberList();
          onListChange();
        });
      });

      applyNamesBtn.addEventListener('click', function () {
        var lines = namesInput.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
        fullList = lines;
        onListChange();
      });

      resetDrawBtn.addEventListener('click', initPool);

      resetListBtn.addEventListener('click', function () {
        if (mode === 'number') {
          numStartInput.value = 1; numEndInput.value = 50;
          fullList = buildNumberList();
        } else {
          namesInput.value = ''; fullList = [];
        }
        onListChange();
      });

      drawBtn.addEventListener('click', function () {
        if (spinning) return;
        var available = allowRepeatChk.checked ? fullList : pool;
        if (!available.length) { setResultText('已全部抽完', 'exhausted'); return; }

        spinning = true; drawBtn.disabled = true;
        var count = 0, spinTotal = 14;
        spinTimer = setInterval(function () {
          setResultText(available[Math.floor(Math.random() * available.length)], 'spinning');
          if (++count >= spinTotal) {
            clearInterval(spinTimer);
            var result = available[Math.floor(Math.random() * available.length)];
            if (!allowRepeatChk.checked) {
              var pi = pool.indexOf(result);
              if (pi !== -1) pool.splice(pi, 1);
              drawn.push(result);
              updatePoolInfo(); updateDrawnDisplay();
            }
            resultEl.className = 'lottery-result';
            setTimeout(function () { setResultText(result, 'drawn'); }, 40);
            spinning = false; drawBtn.disabled = false;
          }
        }, 55);
      });

      // ── Group panel ──
      function updateGroupSourceInfo() {
        var el = document.getElementById('lottery-group-source-info');
        if (el) el.textContent = '使用抽籤名單（' + fullList.length + ' 人）';
      }

      function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      }

      function renderGroupResults() {
        var container = document.getElementById('lottery-group-results');
        var toScoreBtn = document.getElementById('lottery-group-to-score-btn');
        container.innerHTML = '';
        if (!groupResults.length) { toScoreBtn.style.display = 'none'; return; }
        groupResults.forEach(function (members, idx) {
          var card = document.createElement('div');
          card.className = 'lottery-group-card';
          var title = document.createElement('div');
          title.className = 'lottery-group-card-title';
          title.textContent = '第 ' + (idx + 1) + ' 組';
          var memberEl = document.createElement('div');
          memberEl.className = 'lottery-group-card-members';
          memberEl.textContent = members.join('　');
          card.appendChild(title); card.appendChild(memberEl);
          container.appendChild(card);
        });
        toScoreBtn.style.display = '';
      }

      var groupDrawBtn = document.getElementById('lottery-group-draw-btn');
      if (groupDrawBtn) {
        groupDrawBtn.addEventListener('click', function () {
          if (!fullList.length) {
            var container = document.getElementById('lottery-group-results');
            container.innerHTML = '<div style="font-size:.78rem;color:var(--text-dim);text-align:center;padding:.5rem 0">請先在抽籤頁填入名單</div>';
            document.getElementById('lottery-group-to-score-btn').style.display = 'none';
            return;
          }
          var n = parseInt(document.getElementById('lottery-group-count').value) || 4;
          n = Math.max(2, Math.min(10, Math.min(n, fullList.length)));
          var shuffled = shuffle(fullList);
          groupResults = [];
          for (var k = 0; k < n; k++) groupResults.push([]);
          shuffled.forEach(function (item, i) { groupResults[i % n].push(item); });
          renderGroupResults();
        });
      }

      var toScoreBtn = document.getElementById('lottery-group-to-score-btn');
      if (toScoreBtn) {
        toScoreBtn.addEventListener('click', function () {
          scoreTeams = groupResults.map(function (_, idx) {
            return { name: '第 ' + (idx + 1) + ' 組', score: 0 };
          });
          showPanel('score');
        });
      }

      // ── Score panel ──
      function makeTeamRow(idx) {
        var team = scoreTeams[idx];
        var row = document.createElement('div');
        row.className = 'lottery-score-team';

        var nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'lottery-score-name';
        nameInput.value = team.name;
        nameInput.addEventListener('blur', function () {
          scoreTeams[idx].name = nameInput.value.trim() || ('隊伍 ' + (idx + 1));
          nameInput.value = scoreTeams[idx].name;
        });

        var decBtn = document.createElement('button');
        decBtn.className = 'lottery-score-adj';
        decBtn.textContent = '−';

        var scoreEl = document.createElement('div');
        scoreEl.className = 'lottery-score-value';
        scoreEl.id = 'lottery-sv-' + idx;
        scoreEl.textContent = team.score;

        var incBtn = document.createElement('button');
        incBtn.className = 'lottery-score-adj';
        incBtn.textContent = '+';

        decBtn.addEventListener('click', function () {
          scoreTeams[idx].score--;
          document.getElementById('lottery-sv-' + idx).textContent = scoreTeams[idx].score;
        });
        incBtn.addEventListener('click', function () {
          scoreTeams[idx].score++;
          document.getElementById('lottery-sv-' + idx).textContent = scoreTeams[idx].score;
        });

        row.appendChild(nameInput);
        row.appendChild(decBtn);
        row.appendChild(scoreEl);
        row.appendChild(incBtn);
        return row;
      }

      function renderScoreTeams() {
        var container = document.getElementById('lottery-score-teams');
        if (!container) return;
        container.innerHTML = '';
        scoreTeams.forEach(function (_, idx) { container.appendChild(makeTeamRow(idx)); });
      }

      var scoreResetBtn = document.getElementById('lottery-score-reset-btn');
      if (scoreResetBtn) {
        scoreResetBtn.addEventListener('click', function () {
          scoreTeams.forEach(function (t) { t.score = 0; });
          renderScoreTeams();
        });
      }

      // ── Show / hide ──
      function hideWidget() { widget.classList.remove('open'); }
      function toggleWidget() { widget.classList.toggle('open'); }
      window.__toggleLotteryWidget = toggleWidget;

      closeBtn.addEventListener('click', hideWidget);

      // ── Settings panel button ──
      var lotteryBtn = document.createElement('button');
      lotteryBtn.className = 'lottery-settings-btn';
      lotteryBtn.setAttribute('aria-label', '抽籤器');
      lotteryBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"/></svg>';
      lotteryBtn.addEventListener('click', function () {
        var sp = document.getElementById('settings-panel');
        sp.classList.remove('open');
        document.getElementById('settings-toggle').classList.remove('active');
        widget.classList.add('open');
      });

      var targetRow = window.__settingsRow2 || document.querySelectorAll('.settings-controls-row')[1];
      if (targetRow) targetRow.appendChild(lotteryBtn);

      // ── Drag ──
      var dragging = false, dragOffX = 0, dragOffY = 0;
      dragHandle.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        var rect = widget.getBoundingClientRect();
        widget.style.right = 'auto'; widget.style.bottom = 'auto';
        widget.style.left = rect.left + 'px'; widget.style.top = rect.top + 'px';
        dragging = true; dragOffX = e.clientX - rect.left; dragOffY = e.clientY - rect.top;
        e.preventDefault();
      });
      document.addEventListener('mousemove', function (e) {
        if (!dragging) return;
        var x = Math.max(0, Math.min(e.clientX - dragOffX, window.innerWidth - widget.offsetWidth));
        var y = Math.max(0, Math.min(e.clientY - dragOffY, window.innerHeight - widget.offsetHeight));
        widget.style.left = x + 'px'; widget.style.top = y + 'px';
      });
      document.addEventListener('mouseup', function () { dragging = false; });
    })();

    // ── Vote Widget ──
    (function () {
      var widget = document.getElementById('vote-widget');
      if (!widget) return;
      new MutationObserver(function () {
        if (widget.classList.contains('open')) __bringToTop(widget);
      }).observe(widget, { attributes: true, attributeFilter: ['class'] });
      widget.addEventListener('mousedown', function () { __bringToTop(widget); });

      var GAS_KEY = 'voteGasEndpoint';
      var gasEndpoint = (window.__voteGasUrl__ || '') || localStorage.getItem(GAS_KEY) || '';
      var currentSessionId = null;
      var pollInterval = null;
      var currentQuestion = null;
      var isStopped = true;
      // Lecture session：widget 首次開啟時產生，整堂課固定。學生掃一次 QR 就能跟隨老師切換題目。
      var lectureSessionId = null;

      var dragHandle = document.getElementById('vote-drag-handle');
      var closeBtn = document.getElementById('vote-widget-close');
      var panelSetup = document.getElementById('vote-panel-setup');
      var panelActive = document.getElementById('vote-panel-active');
      var panelResults = document.getElementById('vote-panel-results');
      var panelPicker = document.getElementById('vote-panel-picker');
      // 新版 base.html 的 setup 設為 display:none（由 JS 決定初始面板）；舊版仍維持預設顯示。
      if (panelSetup && panelPicker && !panelSetup.style.display) panelSetup.style.display = 'none';
      var epInput = document.getElementById('vote-ep-input');
      var epSaveBtn = document.getElementById('vote-ep-save-btn');
      var epStatus = document.getElementById('vote-ep-status');
      var epRow = document.getElementById('vote-ep-row');
      var hasAnswerCb = document.getElementById('vote-has-answer');
      var answerChoice = document.getElementById('vote-answer-choice');

      if (epInput) epInput.value = gasEndpoint;
      updateEpDisplay();

      function updateEpDisplay() {
        if (epRow) epRow.style.display = gasEndpoint ? 'none' : 'flex';
        if (epStatus) {
          epStatus.className = 'vote-ep-dot ' + (gasEndpoint ? 'ok' : 'warn');
          epStatus.title = gasEndpoint ? '已設定 GAS 後端連線' : '尚未設定後端 URL';
        }
      }

      if (epSaveBtn) {
        epSaveBtn.addEventListener('click', function () {
          var url = (epInput ? epInput.value : '').trim();
          if (!url) return;
          gasEndpoint = url;
          localStorage.setItem(GAS_KEY, url);
          updateEpDisplay();
        });
      }

      if (hasAnswerCb && answerChoice) {
        hasAnswerCb.addEventListener('change', function () {
          answerChoice.style.display = hasAnswerCb.checked ? 'inline-block' : 'none';
        });
      }

      function genSessionId() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var id = '';
        for (var i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
        return id;
      }

      function getVotePageUrl(sid) {
        var pathname = window.location.pathname.replace(/\/[^\/]*$/, '');
        var segments = pathname.split('/').filter(function (s) { return s.length > 0; });
        segments = segments.slice(0, Math.max(0, segments.length - 2));
        var repoBase = segments.length > 0 ? '/' + segments.join('/') : '';
        var url = window.location.origin + repoBase + '/vote/?s=' + sid;
        if (gasEndpoint) url += '&ep=' + encodeURIComponent(gasEndpoint);
        return url;
      }

      // 統一管理 4 個面板（picker / setup / active / results）的顯示。
      // 舊版 base.html 沒有 panelPicker 節點，此處對 null 做保護。
      function showPanel(name) {
        if (panelPicker)  panelPicker.style.display  = name === 'picker'  ? 'flex' : 'none';
        if (panelSetup)   panelSetup.style.display   = name === 'setup'   ? 'flex' : 'none';
        if (panelActive)  panelActive.style.display  = name === 'active'  ? 'flex' : 'none';
        if (panelResults) panelResults.style.display = name === 'results' ? 'flex' : 'none';
      }

      // 蒐集目前頁面上所有 [vote] 區塊，依 data-vote-id 去重。
      function getPageVotes() {
        var els = document.querySelectorAll('.inline-vote');
        var seen = {};
        var votes = [];
        els.forEach(function (el) {
          var id = el.getAttribute('data-vote-id');
          if (!id || seen[id]) return;
          seen[id] = true;
          var qEl = el.querySelector('.inline-vote-q');
          var title = qEl ? qEl.textContent.trim() : id;
          var opts = [];
          try { opts = JSON.parse(el.getAttribute('data-vote-options') || '[]'); } catch (e) { opts = []; }
          votes.push({ id: id, title: title, options: opts, el: el });
        });
        return votes;
      }

      function renderPicker() {
        var list = document.getElementById('vote-picker-list');
        if (!list) return;
        var votes = getPageVotes();
        list.innerHTML = '';
        if (votes.length === 0) {
          var empty = document.createElement('div');
          empty.className = 'vote-picker-empty';
          empty.innerHTML = '此頁面沒有投票題目<br><button class="vote-picker-empty-btn" id="vote-picker-empty-btn" type="button">手動建立投票</button>';
          list.appendChild(empty);
          var eb = document.getElementById('vote-picker-empty-btn');
          if (eb) eb.addEventListener('click', function () { showPanel('setup'); });
          return;
        }
        votes.forEach(function (v) {
          var item = document.createElement('div');
          item.className = 'vote-picker-item';
          item.setAttribute('data-pick-id', v.id);

          var optHtml = (v.options || []).map(function (o, i) {
            return '<li><span class="vote-picker-opt-key">' + String.fromCharCode(65 + i) + '</span>'
              + '<span class="vote-picker-opt-text">' + escHtml(o) + '</span></li>';
          }).join('');

          item.innerHTML =
            '<div class="vote-picker-main">' +
              '<div class="vote-picker-title">' + escHtml(v.title) + '</div>' +
              (optHtml ? '<ul class="vote-picker-options">' + optHtml + '</ul>' : '') +
            '</div>' +
            '<button type="button" class="vote-picker-launch-btn">啟動</button>';

          var btn = item.querySelector('.vote-picker-launch-btn');
          if (btn) btn.addEventListener('click', function (e) {
            e.stopPropagation();
            ensureLectureSession().then(function () {
              startQuestion(v.id, v.title, v.options || [], null);
            });
          });
          list.appendChild(item);
        });
      }

      // 將選到的頁面 [vote] 題本預填進 setup 表單，切到 setup 面板讓講者檢視/微調後按「開始投票」。
      // 不在此處啟動投票（不產生 sessionId、不呼叫 GAS、不繪 QR、不 polling），保持單一啟動入口。
      function prefillSetup(vote) {
        var qInput = document.getElementById('vote-question-input');
        if (qInput) qInput.value = vote.title;
        var optInputs = document.querySelectorAll('.vote-option-input');
        optInputs.forEach(function (inp) { inp.value = ''; });
        (vote.options || []).forEach(function (opt, i) { if (optInputs[i]) optInputs[i].value = opt; });
        if (hasAnswerCb) {
          hasAnswerCb.checked = false;
          if (answerChoice) answerChoice.style.display = 'none';
        }
        showPanel('setup');
        if (!gasEndpoint) {
          if (epRow) epRow.style.display = 'flex';
          if (epInput) epInput.focus();
        } else {
          if (qInput) qInput.focus();
        }
      }

      // --- Lecture session helpers -----------------------------------------
      // 從頁面 title 或 pathname 推斷一個穩定的 lecture slug，作為 session 的識別（僅供紀錄用）。
      function lectureSlugOf() {
        var m = window.location.pathname.match(/\/lectures\/([^/]+)/);
        return m ? m[1] : (document.title || 'lecture').slice(0, 40);
      }

      // 確保 lecture session 已建立：第一次呼叫時同步指派 sessionId，並在背景並行
      // 呼叫 GAS open 與 register（不阻塞 caller）。後續呼叫為 no-op。
      function ensureLectureSession() {
        if (lectureSessionId || !gasEndpoint) return Promise.resolve(false);
        lectureSessionId = genSessionId();
        var slug = lectureSlugOf();
        var votes = getPageVotes();
        var calls = [
          fetch(gasEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'open', sessionId: lectureSessionId, lectureSlug: slug })
          }).catch(function () {})
        ].concat(votes.map(function (v) {
          return fetch(gasEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'register', sessionId: lectureSessionId, qid: v.id,
              question: v.title, options: v.options, answerId: null
            })
          }).catch(function () {});
        }));
        Promise.all(calls).catch(function () {});
        return Promise.resolve(true);
      }

      // 根據容器當下寬度渲染 / 重繪 QR Code（canvas 圖素對齊，避免 CSS 縮放模糊）。
      // 整堂課 URL 不變，故 ResizeObserver 只改尺寸、不重新產生 sessionId。
      var lectureQrUrl = null;
      var lectureQrObs = null;
      function renderLectureQr() {
        var qrContainer = document.getElementById('vote-qr-container');
        if (!qrContainer || typeof QRCode === 'undefined') return;
        if (!lectureQrUrl) lectureQrUrl = getVotePageUrl(lectureSessionId);

        var wrap = qrContainer.parentElement;
        var wrapStyle = wrap ? getComputedStyle(wrap) : null;
        var padX = wrapStyle ? (parseFloat(wrapStyle.paddingLeft) || 0) + (parseFloat(wrapStyle.paddingRight) || 0) : 0;
        var availW = (wrap ? wrap.clientWidth : qrContainer.clientWidth) - padX;
        var side = Math.max(100, Math.floor(availW));

        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
          text: lectureQrUrl,
          width: side, height: side, correctLevel: QRCode.CorrectLevel.M
        });

        if (!lectureQrObs && typeof ResizeObserver !== 'undefined' && wrap) {
          lectureQrObs = new ResizeObserver(function () { renderLectureQr(); });
          lectureQrObs.observe(wrap);
        }
      }

      // 統一處理「啟動一題」：register（冪等）→ setCurrent → 切到 active → 渲染 QR → 開始 polling。
      // qid 為題目標識；options 可為 null/空 表示沿用頁面 [vote] 的題本（自動查表補齊）。
      function startQuestion(qid, title, options, answerId) {
        if (!gasEndpoint) { prefillSetup({ title: title, options: options }); return; }
        if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }

        if (!options || !options.length) {
          var pageMatch = getPageVotes().filter(function (v) { return v.id === qid; })[0];
          if (pageMatch) {
            options = pageMatch.options || [];
            if (!title) title = pageMatch.title;
          } else {
            options = options || [];
          }
        }

        var doStart = function () {
          currentSessionId = lectureSessionId;
          currentQuestion = { qid: qid, question: title, options: options || [], answerId: answerId };
          isStopped = false;

          fetch(gasEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'setCurrent', sessionId: lectureSessionId, qid: qid })
          }).catch(function () {});

          showPanel('active');
          requestAnimationFrame(function () { renderLectureQr(); });

          var curQEl = document.getElementById('vote-current-q');
          if (curQEl) curQEl.textContent = title || qid;

          renderBars(document.getElementById('vote-bars'), options || [], [], 0, null);
          var labelEl = document.getElementById('vote-count-label');
          if (labelEl) labelEl.textContent = '等待投票中...';

          if (pollInterval) clearInterval(pollInterval);
          pollInterval = setInterval(fetchResults, 5000);
        };

        var registerPromise = options
          ? fetch(gasEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'register', sessionId: lectureSessionId, qid: qid,
                question: title, options: options, answerId: answerId
              })
            }).catch(function () {})
          : Promise.resolve();
        registerPromise.then(doStart);
      }

      function escHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      function renderBars(container, options, counts, total, answerId) {
        if (!container || !options) return;
        var html = '';
        options.forEach(function (opt, i) {
          var count = counts[i] || 0;
          var pct = total > 0 ? Math.round(count / total * 100) : 0;
          var correct = (answerId !== null && answerId !== undefined && answerId !== '' && parseInt(answerId) === i);
          html += '<div class="vote-bar-row' + (correct ? ' vote-bar-correct' : '') + '">';
          html += '<span class="vote-bar-label">' + String.fromCharCode(65 + i) + '</span>';
          html += '<div class="vote-bar-wrap">';
          html += '<span class="vote-bar-text">' + escHtml(opt) + '</span>';
          html += '<div class="vote-bar-track"><div class="vote-bar-fill" style="width:' + pct + '%"></div></div>';
          html += '</div>';
          html += '<span class="vote-bar-stat">' + count + ' (' + pct + '%)</span>';
          html += '</div>';
        });
        container.innerHTML = html;
      }

      var startBtn = document.getElementById('vote-start-btn');
      if (startBtn) {
        startBtn.addEventListener('click', function () {
          if (!gasEndpoint) {
            if (epRow) epRow.style.display = 'flex';
            if (epInput) epInput.focus();
            return;
          }
          var questionEl = document.getElementById('vote-question-input');
          var question = questionEl ? questionEl.value.trim() : '';
          if (!question) { alert('請輸入問題'); return; }
          var optionInputs = document.querySelectorAll('.vote-option-input');
          var options = [];
          optionInputs.forEach(function (inp) { if ((inp.value || '').trim()) options.push(inp.value.trim()); });
          if (options.length < 2) { alert('請至少填入 2 個選項'); return; }
          var hasAns = hasAnswerCb && hasAnswerCb.checked;
          var answerId = (hasAns && answerChoice) ? answerChoice.value : null;

          ensureLectureSession().then(function () {
            startQuestion('adhoc-' + Date.now(), question, options, answerId);
          });
        });
      }

      function fetchResults() {
        if (!gasEndpoint || !currentSessionId || isStopped) return;
        var qid = (currentQuestion && currentQuestion.qid) ? currentQuestion.qid : '';
        var url = gasEndpoint + '?action=results&s=' + encodeURIComponent(currentSessionId);
        if (qid) url += '&qid=' + encodeURIComponent(qid);
        fetch(url)
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (!data || !currentQuestion) return;
            var counts = data.counts || [];
            var total = counts.reduce(function (a, b) { return a + b; }, 0);
            var opts = currentQuestion.options || [];
            if (!opts.length && qid) {
              var pageMatch = getPageVotes().filter(function (v) { return v.id === qid; })[0];
              if (pageMatch) {
                opts = pageMatch.options || [];
                currentQuestion.options = opts;
              }
            }
            renderBars(document.getElementById('vote-bars'), opts, counts, total, currentQuestion.answerId);
            var labelEl = document.getElementById('vote-count-label');
            if (labelEl) labelEl.textContent = '已有 ' + total + ' 人投票';
          })
          .catch(function () {});
      }

      var stopBtn = document.getElementById('vote-stop-btn');
      if (stopBtn) {
        stopBtn.addEventListener('click', function () {
          // 暫停目前題目：學生端 polling 會收到 qid=null → 顯示「等待老師啟動題目」。
          if (gasEndpoint && lectureSessionId) {
            fetch(gasEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({ action: 'setCurrent', sessionId: lectureSessionId, qid: null })
            }).catch(function () {});
          }
          isStopped = true;
          if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
          currentQuestion = null;
          if (panelPicker && getPageVotes().length > 0) { renderPicker(); showPanel('picker'); }
          else { showPanel('setup'); }
        });
      }

      function showResults(data) {
        var counts = (data && data.counts) ? data.counts : [];
        var total = counts.reduce(function (a, b) { return a + b; }, 0);
        renderBars(document.getElementById('vote-results-bars'), currentQuestion ? currentQuestion.options : [], counts, total, currentQuestion ? currentQuestion.answerId : null);
        var totalEl = document.getElementById('vote-results-total');
        if (totalEl) totalEl.textContent = '共 ' + total + ' 人參與投票';
        showPanel('results');
      }

      var restartBtn = document.getElementById('vote-restart-btn');
      if (restartBtn) {
        restartBtn.addEventListener('click', function () {
          if (gasEndpoint && lectureSessionId) {
            fetch(gasEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({ action: 'setCurrent', sessionId: lectureSessionId, qid: null })
            }).catch(function () {});
          }
          currentQuestion = null;
          isStopped = true;
          if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
          if (panelPicker && getPageVotes().length > 0) {
            renderPicker();
            showPanel('picker');
          } else {
            showPanel('setup');
          }
        });
      }

      // 「切換題目」：先通知 server 停用目前題目（學生端 polling 收到 qid=null → 等待），再回 picker 選下一題。
      var switchBtn = document.getElementById('vote-switch-btn');
      if (switchBtn) {
        switchBtn.addEventListener('click', function () {
          if (gasEndpoint && lectureSessionId) {
            fetch(gasEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({ action: 'setCurrent', sessionId: lectureSessionId, qid: null })
            }).catch(function () {});
          }
          isStopped = true;
          if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
          currentQuestion = null;
          if (panelPicker) { renderPicker(); showPanel('picker'); }
          else { showPanel('setup'); }
        });
      }

      // 「重置投票」：清掉本 lecture session 的所有投票紀錄，需二次確認。
      var resetBtn = document.getElementById('vote-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          if (!confirm('確定要清空本堂課所有投票紀錄嗎？此操作無法復原。')) return;
          if (!gasEndpoint || !lectureSessionId) return;
          isStopped = true;
          if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
          fetch(gasEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'reset', sessionId: lectureSessionId })
          }).then(function () {
            renderBars(document.getElementById('vote-bars'), currentQuestion ? currentQuestion.options : [], [], 0, null);
            var labelEl = document.getElementById('vote-count-label');
            if (labelEl) labelEl.textContent = '已重置，等待投票中...';
            // 重新啟動 polling 以便繼續接收新投票
            isStopped = false;
            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(fetchResults, 5000);
          }).catch(function () {
            alert('重置失敗，請檢查網路連線。');
          });
        });
      }

      function hideWidget() { widget.classList.remove('open'); }
      // 開啟 widget 並依目前狀態決定初始面板：
      //   - 已有進行中 session → 保留目前面板（active 或 results）
      //   - 否則，先確保 lecture session 存在，再依頁面 [vote] 有無顯示 picker 或 setup
      function openWidgetSmartly() {
        widget.classList.add('open');
        if (!isStopped || currentSessionId) return;
        ensureLectureSession().then(function () {
          if (panelPicker) {
            var votes = getPageVotes();
            if (votes.length > 0) { renderPicker(); showPanel('picker'); }
            else { showPanel('setup'); }
          } else {
            showPanel('setup');
          }
        });
      }
      function toggleWidget() {
        if (widget.classList.contains('open')) { widget.classList.remove('open'); return; }
        openWidgetSmartly();
      }
      window.__toggleVoteWidget = toggleWidget;
      closeBtn.addEventListener('click', hideWidget);

      var pickerManualBtn = document.getElementById('vote-picker-manual');
      if (pickerManualBtn) pickerManualBtn.addEventListener('click', function () { showPanel('setup'); });

      var setupBackBtn = document.getElementById('vote-setup-back-btn');
      if (setupBackBtn) setupBackBtn.addEventListener('click', function () {
        if (panelPicker) { renderPicker(); showPanel('picker'); }
        else { showPanel('setup'); }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'v' || e.key === 'V') {
          if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(((document.activeElement || {}).tagName || '').toUpperCase()) >= 0) return;
          toggleWidget();
        }
      });

      // 接住頁面 [vote] 區塊「開啟投票」按鈕派发的自訂事件：開 widget 並直接啟動該題。
      document.addEventListener('lecture-vote-launch', function (e) {
        var qid = (e.detail || {}).qid;
        if (!qid) return;
        widget.classList.add('open');
        ensureLectureSession().then(function () {
          var match = getPageVotes().filter(function (v) { return v.id === qid; })[0];
          if (match) startQuestion(match.id, match.title, match.options, null);
          else {
            var votes = getPageVotes();
            if (votes.length > 0) { renderPicker(); showPanel('picker'); }
            else { showPanel('setup'); }
          }
        });
      });

      var voteBtn = document.createElement('button');
      voteBtn.className = 'vote-settings-btn';
      voteBtn.setAttribute('aria-label', '投票');
      voteBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>';
      voteBtn.addEventListener('click', function () {
        var sp = document.getElementById('settings-panel');
        if (sp) sp.classList.remove('open');
        var st = document.getElementById('settings-toggle');
        if (st) st.classList.remove('active');
        openWidgetSmartly();
      });
      var targetRow = window.__settingsRow2 || document.querySelectorAll('.settings-controls-row')[1];
      if (targetRow) targetRow.appendChild(voteBtn);

      var dragging = false, dragOffX = 0, dragOffY = 0;
      dragHandle.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        var rect = widget.getBoundingClientRect();
        widget.style.right = 'auto'; widget.style.bottom = 'auto';
        widget.style.left = rect.left + 'px'; widget.style.top = rect.top + 'px';
        dragging = true; dragOffX = e.clientX - rect.left; dragOffY = e.clientY - rect.top;
        e.preventDefault();
      });
      document.addEventListener('mousemove', function (e) {
        if (!dragging) return;
        var x = Math.max(0, Math.min(e.clientX - dragOffX, window.innerWidth - widget.offsetWidth));
        var y = Math.max(0, Math.min(e.clientY - dragOffY, window.innerHeight - widget.offsetHeight));
        widget.style.left = x + 'px'; widget.style.top = y + 'px';
      });
      document.addEventListener('mouseup', function () { dragging = false; });
    })();
    // Syntax highlight for prompt blocks
    (function () {
      var BASH_CMDS = 'npm npx node git docker curl brew pip python python3 ruby go openspec claude bash sh zsh cd ls cp mv rm mkdir echo export source chmod cat grep find head tail wc sort uniq tee xargs'.split(' ');

      function escH(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }

      function hlBashLine(line) {
        if (/^\s*#/.test(line)) return '<span class="hl-cmt">' + escH(line) + '</span>';
        var out = '', i = 0, n = line.length, beforeFirst = true;
        while (i < n) {
          var c = line[i];
          if (c === '"' || c === "'") {
            var q = c, s = q; i++;
            while (i < n) {
              if (line[i] === '\\' && i + 1 < n) { s += line[i] + line[i + 1]; i += 2; continue; }
              if (line[i] === q) { s += line[i++]; break; }
              s += line[i++];
            }
            out += '<span class="hl-str">' + escH(s) + '</span>';
            beforeFirst = false; continue;
          }
          if (c === '$') {
            var s = '$'; i++;
            var brace = i < n && line[i] === '{';
            if (brace) s += line[i++];
            while (i < n && /\w/.test(line[i])) s += line[i++];
            if (brace && i < n && line[i] === '}') s += line[i++];
            out += s.length > 1 ? '<span class="hl-var">' + escH(s) + '</span>' : escH(s);
            beforeFirst = false; continue;
          }
          if (c === '-' && (i === 0 || line[i - 1] === ' ' || line[i - 1] === '\t') && i + 1 < n && (line[i + 1] === '-' || /[a-zA-Z]/.test(line[i + 1]))) {
            var s = '-'; i++;
            while (i < n && /[\w-]/.test(line[i])) s += line[i++];
            out += '<span class="hl-flag">' + escH(s) + '</span>';
            beforeFirst = false; continue;
          }
          if (beforeFirst && c !== ' ' && c !== '\t') {
            var s = '';
            while (i < n && line[i] !== ' ' && line[i] !== '\t') s += line[i++];
            beforeFirst = false;
            out += BASH_CMDS.indexOf(s) >= 0 ? '<span class="hl-cmd">' + escH(s) + '</span>' : escH(s);
            continue;
          }
          out += escH(c); i++;
        }
        return out;
      }

      function hlPromptLine(line) {
        var e = escH(line);
        e = e.replace(/`([^`]+)`/g, '<span class="hl-code">`$1`</span>');
        if (!e.includes('<span') && /^([ \t]*)([\w-]+)(:\s+)(.*)$/.test(e)) {
          e = e.replace(/^([ \t]*)([\w-]+)(:\s+)(.*)$/, function (m, sp, key, col, val) {
            var cls = /^(true|false|null|yes|no)$/.test(val.trim()) ? ' class="hl-bool"'
              : /^\d/.test(val.trim()) ? ' class="hl-num"' : '';
            return sp + '<span class="hl-key">' + key + '</span>' + col + (cls ? '<span' + cls + '>' + val + '</span>' : val);
          });
        }
        return e;
      }

      try {
        document.querySelectorAll('.prompt-body').forEach(function (el) {
          var raw = el.textContent;
          var block = el.closest('.prompt-block');
          var isTerminal = block && /Terminal/i.test(block.querySelector('.prompt-header').textContent);
          el.innerHTML = raw.split('\n').map(isTerminal ? hlBashLine : hlPromptLine).join('\n');
        });
      } catch (e) { }
    })();

  // ─── Inline Vote Launch Button ─────────────────────────────
  // 頁面上的 [vote] 區塊改為純展示（題目 + 選項 + 「開啟投票」按鈕）。
  // 按下按鈕時派发自訂事件，由 Vote Widget IIFE 接住後開 widget 並直接啟動該題。
  (function () {
    document.querySelectorAll('.inline-vote-launch-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var voteId = btn.getAttribute('data-vote-id');
        if (!voteId) return;
        document.dispatchEvent(new CustomEvent('lecture-vote-launch', { detail: { qid: voteId } }));
      });
    });
  })();

  // ─── Quiz Block ────────────────────────────────────────────
  (function () {
    var QUIZ_KEY = 'quizResults_' + location.pathname;
    function getResults() { try { return JSON.parse(localStorage.getItem(QUIZ_KEY) || '{}'); } catch (e) { return {}; } }
    function saveResult(qid, ok) { var r = getResults(); r[qid] = ok ? 'correct' : 'wrong'; localStorage.setItem(QUIZ_KEY, JSON.stringify(r)); }

    function applyQuizResult(block, correct, chosenIdx) {
      var btns = block.querySelectorAll('.quiz-btn');
      var hintEl = block.querySelector('.quiz-hint');
      var fbEl = block.querySelector('.quiz-fb');
      var answerIdx = parseInt(block.dataset.quizAnswer);
      btns.forEach(function (b) { b.disabled = true; });
      if (correct) {
        btns[chosenIdx] && btns[chosenIdx].classList.add('quiz-btn--correct');
        if (fbEl) { fbEl.textContent = '正確！'; fbEl.className = 'quiz-fb quiz-fb--correct'; fbEl.removeAttribute('hidden'); }
      } else {
        btns[chosenIdx] && btns[chosenIdx].classList.add('quiz-btn--wrong');
        if (answerIdx >= 0) btns[answerIdx] && btns[answerIdx].classList.add('quiz-btn--correct');
        if (hintEl) hintEl.removeAttribute('hidden');
        if (fbEl) { fbEl.textContent = '答錯了，正確答案已標示'; fbEl.className = 'quiz-fb quiz-fb--wrong'; fbEl.removeAttribute('hidden'); }
      }
    }

    function restoreQuizBlock(block) {
      var qid = block.dataset.quizId;
      var answerIdx = parseInt(block.dataset.quizAnswer);
      var prev = getResults()[qid];
      if (!prev) return;
      var prevIdx = prev === 'correct' ? answerIdx : -1;
      applyQuizResult(block, prev === 'correct', prevIdx);
    }

    document.querySelectorAll('.quiz-block').forEach(restoreQuizBlock);
    window.__restoreQuiz = restoreQuizBlock;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.quiz-btn');
      if (!btn || btn.disabled) return;
      var block = btn.closest('.quiz-block');
      if (!block) return;
      var qid = block.dataset.quizId;
      var answerIdx = parseInt(block.dataset.quizAnswer);
      var idx = parseInt(btn.dataset.idx);
      var correct = idx === answerIdx;
      saveResult(qid, correct);
      // Sync state across all instances (e.g. original + presentation clone)
      document.querySelectorAll('.quiz-block[data-quiz-id="' + qid + '"]').forEach(function (b) {
        applyQuizResult(b, correct, idx);
      });
    });
  })();

  // ─── Spotlight Mode + Magnifier ────────────────────────────
  (function () {
    var overlay = document.createElement('div');
    overlay.id = 'spotlight-overlay';
    document.body.appendChild(overlay);

    var magnifier = document.createElement('div');
    magnifier.id = 'magnifier-overlay';
    var magContent = document.createElement('div');
    magContent.id = 'magnifier-content';
    magnifier.appendChild(magContent);
    document.body.appendChild(magnifier);

    window.__spotlightActive = false;
    window.__magnifierZoom = 1;
    var MIN_R = 60;
    var MAX_R = 600;
    var STEP = 18;
    var EASE = 0.18;
    var MIN_Z = 1;
    var MAX_Z = 5;
    var Z_STEP = 0.5;
    var targetR = 190;
    var currentR = 190;
    var rafId = null;
    var cloneDirty = true;
    var magCursorX = window.innerWidth / 2;
    var magCursorY = window.innerHeight / 2;

    function applyRadius() {
      overlay.style.setProperty('--sl-r', currentR.toFixed(1) + 'px');
      if (window.__spotlightActive && window.__magnifierZoom > 1) {
        magnifier.style.setProperty('--mg-r', currentR.toFixed(1) + 'px');
      }
    }
    applyRadius();

    function animate() {
      var diff = targetR - currentR;
      if (Math.abs(diff) < 0.3) {
        currentR = targetR;
        applyRadius();
        rafId = null;
        return;
      }
      currentR += diff * EASE;
      applyRadius();
      rafId = requestAnimationFrame(animate);
    }

    function setTarget(v) {
      targetR = Math.min(MAX_R, Math.max(MIN_R, v));
      if (rafId == null) rafId = requestAnimationFrame(animate);
    }

    function rebuildMagnifierClone() {
      magContent.innerHTML = '';
      var presActive = document.body.classList.contains('pres-active');
      var sourceEls;
      if (presActive) {
        var deck = document.getElementById('pres-deck');
        sourceEls = deck ? [deck] : [];
      } else {
        sourceEls = Array.from(document.querySelectorAll('body > header, body > section, body > footer, body > hr'));
      }
      sourceEls.forEach(function (el) {
        var c = el.cloneNode(true);
        if (c.id) c.removeAttribute('id');
        if (c.querySelectorAll) {
          c.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
          c.querySelectorAll('iframe, video').forEach(function (n) { n.remove(); });
        }
        if (presActive) {
          // The cloned deck loses its #pres-deck id (so the `body.pres-active #pres-deck`
          // display rule no longer applies) and its fixed positioning would otherwise
          // pin it to the viewport. Force a normal-flow block so it renders inside
          // magnifier-content and scales with the magnifier transform.
          c.style.display = 'block';
          c.style.position = 'relative';
          c.style.inset = 'auto';
          c.style.width = '100vw';
          c.style.height = '100vh';
          c.style.background = 'var(--bg)';
        }
        magContent.appendChild(c);
      });
      cloneDirty = false;
    }

    window.__invalidateMagnifierClone = function () {
      cloneDirty = true;
      if (window.__spotlightActive && window.__magnifierZoom > 1) updateMagnifier();
    };

    function updateMagnifier() {
      var active = window.__spotlightActive && window.__magnifierZoom > 1;
      magnifier.classList.toggle('active', active);
      if (!active) return;
      if (cloneDirty) rebuildMagnifierClone();
      var z = window.__magnifierZoom;
      var sy = window.scrollY || window.pageYOffset || 0;
      magnifier.style.setProperty('--mg-r', currentR.toFixed(1) + 'px');
      magnifier.style.setProperty('--mg-x', magCursorX + 'px');
      magnifier.style.setProperty('--mg-y', magCursorY + 'px');
      magContent.style.top = (-sy) + 'px';
      magContent.style.transformOrigin = magCursorX + 'px ' + (magCursorY + sy) + 'px';
      magContent.style.transform = 'scale(' + z + ')';
    }

    document.addEventListener('mousemove', function (e) {
      if (!window.__spotlightActive) return;
      magCursorX = e.clientX;
      magCursorY = e.clientY;
      overlay.style.setProperty('--sl-x', e.clientX + 'px');
      overlay.style.setProperty('--sl-y', e.clientY + 'px');
      if (window.__magnifierZoom > 1) updateMagnifier();
    });

    window.addEventListener('scroll', function () {
      if (window.__spotlightActive && window.__magnifierZoom > 1) updateMagnifier();
    }, { passive: true });

    window.addEventListener('resize', function () {
      cloneDirty = true;
      if (window.__spotlightActive && window.__magnifierZoom > 1) updateMagnifier();
    });

    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (window.__doodleActive && (e.key === '[' || e.key === ']')) {
        if (window.__doodleSize) window.__doodleSize(e.key === '[' ? -2 : 2);
        e.preventDefault();
        return;
      }
      if (!window.__spotlightActive) return;
      if (e.key === '[') {
        setTarget(targetR - STEP);
        e.preventDefault();
      } else if (e.key === ']') {
        setTarget(targetR + STEP);
        e.preventDefault();
      } else if (e.key === '{') {
        var nz = Math.max(MIN_Z, Math.round((window.__magnifierZoom - Z_STEP) * 100) / 100);
        window.__magnifierZoom = nz;
        updateMagnifier();
        e.preventDefault();
      } else if (e.key === '}') {
        var nz2 = Math.min(MAX_Z, Math.round((window.__magnifierZoom + Z_STEP) * 100) / 100);
        window.__magnifierZoom = nz2;
        updateMagnifier();
        e.preventDefault();
      }
    });

    var settingsBtn = document.createElement('button');
    settingsBtn.className = 'spotlight-settings-btn';
    settingsBtn.setAttribute('aria-label', '聚光燈');
    settingsBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>';
    settingsBtn.addEventListener('click', function () {
      var sp = document.getElementById('settings-panel');
      if (sp) sp.classList.remove('open');
      var st = document.getElementById('settings-toggle');
      if (st) st.classList.remove('active');
      if (window.__toggleSpotlight) window.__toggleSpotlight();
    });
    (function appendBtn() {
      var targetRow = window.__settingsRow2 || document.querySelectorAll('.settings-controls-row')[1];
      if (targetRow) targetRow.appendChild(settingsBtn);
      else setTimeout(appendBtn, 50);
    })();

    window.__toggleSpotlight = function () {
      window.__spotlightActive = !window.__spotlightActive;
      overlay.classList.toggle('active', window.__spotlightActive);
      settingsBtn.classList.toggle('active', window.__spotlightActive);
      if (window.__spotlightActive) {
        overlay.style.setProperty('--sl-x', '50%');
        overlay.style.setProperty('--sl-y', '50%');
        cloneDirty = true;
      }
      updateMagnifier();
    };

    window.__hideMagnifier = function () {
      magnifier.classList.remove('active');
      settingsBtn.classList.remove('active');
      cloneDirty = true;
    };
  })();

  // ─── Tabs Block ────────────────────────────────────────────
  (function () {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.tab-btn');
      if (!btn) return;
      var block = btn.closest('.tabs-block');
      if (!block) return;
      var idx = btn.dataset.tab;
      block.querySelectorAll('.tab-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.tab === idx);
      });
      block.querySelectorAll('.tab-panel').forEach(function (p) {
        p.classList.toggle('active', p.dataset.panel === idx);
      });
    });
  })();

  // ─── Chapter Progress Tracking ─────────────────────────────
  (function () {
    var READ_KEY = 'readSections_' + location.pathname;
    function getRead() { try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch (e) { return []; } }
    function markRead(id) {
      var r = getRead();
      if (r.indexOf(id) < 0) { r.push(id); localStorage.setItem(READ_KEY, JSON.stringify(r)); }
    }
    function setDot(id) {
      var dot = document.querySelector('.toc-read-dot[data-for="' + id + '"]');
      if (dot) dot.classList.add('read');
    }

    // Restore persisted state
    getRead().forEach(setDot);

    // Mark section as read when its heading scrolls off the top (user passed it)
    var readObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) return;
        if (e.boundingClientRect.top > 0) return; // exited at bottom, not top
        markRead(e.target.id);
        setDot(e.target.id);
      });
    }, { threshold: 0 });

    document.querySelectorAll('.section-label[id]').forEach(function (el) {
      readObs.observe(el);
    });
  })();

  // ─── Doodle Pen ──────────────────────────────────────────────
  (function () {
    var active = false;
    var erasing = false;
    var color = '#e03040';
    var colorIdx = 0;
    var size = 10;
    var strokes = [];
    var currentStroke = null;
    var MIN_SIZE = 2, MAX_SIZE = 20;

    var COLORS = ['#e03040', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#a855f7', '#ffffff', '#1a1a2e'];

    // --- Canvas ---
    var canvas = document.createElement('canvas');
    canvas.id = 'doodle-canvas';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    function fitCanvas() {
      var img = null;
      if (canvas.width && canvas.height) {
        try { img = ctx.getImageData(0, 0, canvas.width, canvas.height); } catch (e) {}
      }
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (img) { try { ctx.putImageData(img, 0, 0); } catch (e) {} }
    }
    fitCanvas();
    window.addEventListener('resize', fitCanvas);

    // --- Custom cursor ---
    var cursor = document.createElement('div');
    cursor.id = 'doodle-cursor';
    document.body.appendChild(cursor);
    var lastMX = 0, lastMY = 0;

    function updateCursor(e) {
      if (!active || !e) return;
      lastMX = e.clientX;
      lastMY = e.clientY;
      applyCursorStyle();
    }

    function applyCursorStyle() {
      var s = erasing ? size * 4 : size;
      cursor.style.width = s + 'px';
      cursor.style.height = s + 'px';
      cursor.style.backgroundColor = erasing ? 'rgba(255,255,255,.7)' : color;
      cursor.style.left = (lastMX - s / 2) + 'px';
      cursor.style.top = (lastMY - s / 2) + 'px';
    }

    canvas.addEventListener('pointermove', function (e) { updateCursor(e); });
    canvas.addEventListener('pointerenter', function () { if (active) cursor.classList.add('active'); });
    canvas.addEventListener('pointerleave', function () { cursor.classList.remove('active'); });

    // --- Drawing ---
    canvas.addEventListener('pointerdown', function (e) {
      if (!active) return;
      canvas.setPointerCapture(e.pointerId);
      currentStroke = { color: color, size: size, erasing: erasing, points: [{x: e.clientX, y: e.clientY}] };
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (erasing) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = size * 4;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
      }
    });

    canvas.addEventListener('pointermove', function (e) {
      if (!currentStroke) return;
      currentStroke.points.push({x: e.clientX, y: e.clientY});
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);
    });

    canvas.addEventListener('pointerup', function () {
      if (currentStroke) { strokes.push(currentStroke); currentStroke = null; }
      ctx.globalCompositeOperation = 'source-over';
      updateToolbar();
    });

    canvas.addEventListener('pointercancel', function () {
      currentStroke = null;
      ctx.globalCompositeOperation = 'source-over';
    });

    // --- Redraw ---
    function redraw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      for (var i = 0; i < strokes.length; i++) {
        var s = strokes[i];
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (s.erasing) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = s.size * 4;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.size;
        }
        for (var j = 0; j < s.points.length; j++) {
          if (j === 0) ctx.moveTo(s.points[j].x, s.points[j].y);
          else ctx.lineTo(s.points[j].x, s.points[j].y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // --- Widget ---
    var widget = document.createElement('div');
    widget.className = 'doodle-widget';
    widget.id = 'doodle-widget';

    var ERASER_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>';
    var UNDO_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
    var CLEAR_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    var CLOSE_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    var MINUS_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    var PLUS_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    var PENCIL_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';

    function buildWidget() {
      var header = '<div class="doodle-header" id="doodle-drag-handle">';
      header += '<span class="doodle-title">' + PENCIL_SVG + ' 塗鴉筆</span>';
      header += '<button class="doodle-close" id="doodle-widget-close">' + CLOSE_SVG + '</button>';
      header += '</div>';

      var body = '<div class="doodle-body">';
      // Colors
      body += '<div class="doodle-row">';
      COLORS.forEach(function (c, i) {
        var sel = i === colorIdx ? ' active' : '';
        body += '<button class="doodle-color' + sel + '" data-color="' + c + '" data-idx="' + i + '" style="background:' + c + '" aria-label="顏色"></button>';
      });
      body += '</div>';
      // Size + tools
      body += '<div class="doodle-row">';
      body += '<button class="doodle-tool-sm" id="doodle-size-down">' + MINUS_SVG + '</button>';
      body += '<span class="doodle-size-label" id="doodle-size-label">' + size + 'px</span>';
      body += '<button class="doodle-tool-sm" id="doodle-size-up">' + PLUS_SVG + '</button>';
      body += '<span class="doodle-sep"></span>';
      body += '<button class="doodle-tool" id="doodle-eraser-btn">' + ERASER_SVG + '</button>';
      body += '<button class="doodle-tool" id="doodle-undo-btn">' + UNDO_SVG + '</button>';
      body += '<button class="doodle-tool" id="doodle-clear-btn">' + CLEAR_SVG + '</button>';
      body += '</div>';
      body += '</div>';

      widget.innerHTML = header + body;
    }
    buildWidget();
    document.body.appendChild(widget);

    // --- Drag ---
    var dragHandle = document.getElementById('doodle-drag-handle');
    var dragging = false, dragOffX = 0, dragOffY = 0;
    dragHandle.addEventListener('mousedown', function (e) {
      if (e.target.closest('button')) return;
      dragging = true;
      var r = widget.getBoundingClientRect();
      dragOffX = e.clientX - r.left;
      dragOffY = e.clientY - r.top;
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
      widget.style.transform = 'none';
      dragHandle.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var x = Math.max(0, Math.min(window.innerWidth - widget.offsetWidth, e.clientX - dragOffX));
      var y = Math.max(0, Math.min(window.innerHeight - widget.offsetHeight, e.clientY - dragOffY));
      widget.style.left = x + 'px';
      widget.style.top = y + 'px';
    });
    document.addEventListener('mouseup', function () {
      dragging = false;
      dragHandle.style.cursor = 'grab';
    });

    // --- z-index ---
    if (widget) {
      new MutationObserver(function () {
        if (widget.classList.contains('open')) __bringToTop(widget);
      }).observe(widget, { attributes: true, attributeFilter: ['class'] });
      widget.addEventListener('mousedown', function () { __bringToTop(widget); });
    }

    function updateToolbar() {
      var sizeLabel = document.getElementById('doodle-size-label');
      if (sizeLabel) sizeLabel.textContent = size + 'px';
      widget.querySelectorAll('.doodle-color').forEach(function (btn) {
        btn.classList.toggle('active', parseInt(btn.dataset.idx) === colorIdx);
      });
      var eraserBtn = document.getElementById('doodle-eraser-btn');
      if (eraserBtn) eraserBtn.classList.toggle('active', erasing);
      var undoBtn = document.getElementById('doodle-undo-btn');
      if (undoBtn) undoBtn.disabled = strokes.length === 0;
    }

    widget.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.color !== undefined && btn.dataset.color !== '') {
        colorIdx = parseInt(btn.dataset.idx);
        color = COLORS[colorIdx];
        erasing = false;
        updateToolbar();
      } else if (btn.id === 'doodle-size-down') {
        changeSize(-2);
      } else if (btn.id === 'doodle-size-up') {
        changeSize(2);
      } else if (btn.id === 'doodle-eraser-btn') {
        erasing = !erasing;
        updateToolbar();
      } else if (btn.id === 'doodle-undo-btn') {
        undo();
      } else if (btn.id === 'doodle-clear-btn') {
        clearAll();
      } else if (btn.id === 'doodle-widget-close') {
        hideDoodle();
      }
    });

    function changeSize(delta) {
      size = Math.max(MIN_SIZE, Math.min(MAX_SIZE, size + delta));
      updateToolbar();
      applyCursorStyle();
    }

    function cycleColor() {
      colorIdx = (colorIdx + 1) % COLORS.length;
      color = COLORS[colorIdx];
      erasing = false;
      updateToolbar();
      applyCursorStyle();
    }

    function undo() {
      if (strokes.length === 0) return;
      strokes.pop();
      redraw();
      updateToolbar();
    }

    function clearAll() {
      strokes = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateToolbar();
    }

    function showDoodle() {
      active = true;
      erasing = false;
      canvas.classList.add('active');
      widget.classList.add('open');
      cursor.classList.add('active');
      updateToolbar();
    }

    function hideDoodle() {
      active = false;
      erasing = false;
      canvas.classList.remove('active');
      widget.classList.remove('open');
      cursor.classList.remove('active');
    }

    function toggleDoodle() {
      if (active) hideDoodle(); else showDoodle();
    }

    function toggleEraser() {
      erasing = !erasing;
      updateToolbar();
      applyCursorStyle();
    }

    window.__toggleDoodle = toggleDoodle;
    window.__toggleDoodleEraser = toggleEraser;
    window.__doodleSize = changeSize;
    window.__doodleUndo = undo;
    window.__clearDoodle = clearAll;
    window.__hideDoodle = hideDoodle;
    window.__doodleCycleColor = cycleColor;
    Object.defineProperty(window, '__doodleActive', { get: function () { return active; } });

    // --- Settings panel button ---
    var settingsBtn = document.createElement('button');
    settingsBtn.className = 'doodle-settings-btn';
    settingsBtn.setAttribute('aria-label', '塗鴉筆');
    settingsBtn.innerHTML = PENCIL_SVG.replace('width="14"', 'width="15"').replace('height="14"', 'height="15"');
    settingsBtn.addEventListener('click', function () {
      var sp = document.getElementById('settings-panel');
      if (sp) sp.classList.remove('open');
      var st = document.getElementById('settings-toggle');
      if (st) st.classList.remove('active');
      toggleDoodle();
    });
    (function appendBtn() {
      var targetRow = window.__settingsRow2 || document.querySelectorAll('.settings-controls-row')[1];
      if (targetRow) targetRow.appendChild(settingsBtn);
      else setTimeout(appendBtn, 50);
    })();
  })();
