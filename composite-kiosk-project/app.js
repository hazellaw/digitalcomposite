(function () {
  "use strict";

  /* ---------------------------------------------------------
   * Directory data — generated from DirectoryNamesYears.csv
   * Each person maps to a shared class composite photo via
   * `photo` (key into the PHOTOS lookup below). Degree and
   * Email are NOT directory facts — they are collected from
   * the requester on the form screen.
   * --------------------------------------------------------- */
  var DIRECTORY = [
    { first: "Charlie", last: "Brown", year: "2011", photo: "composite_2011" },
    { first: "Lucy", last: "Red", year: "2012", photo: "composite_2012" },
    { first: "Linus", last: "Green", year: "2013", photo: "composite_2013" },
    { first: "Marcie", last: "Purple", year: "2014", photo: "composite_2014" },
    { first: "Peppermint", last: "Patty", year: "2015", photo: "composite_2015" },
    { first: "Franklin", last: "Yellow", year: "2012", photo: "composite_2012" },
    { first: "Pigpen", last: "Black", year: "2014", photo: "composite_2014" },
    { first: "Sally", last: "Blue", year: "2011", photo: "composite_2011" },
    { first: "Rerun", last: "Grey", year: "2011", photo: "composite_2011" },
    { first: "Snoopy", last: "White", year: "2015", photo: "composite_2015" },
    { first: "Woodstock", last: "Yellow", year: "2013", photo: "composite_2013" },
    { first: "Schroeder", last: "Brown", year: "2014", photo: "composite_2014" },
    { first: "Shermy", last: "Green", year: "2014", photo: "composite_2014" },
    { first: "Violet", last: "Orange", year: "2011", photo: "composite_2011" },
    { first: "Patty", last: "Pink", year: "2011", photo: "composite_2011" },
    { first: "Frieda", last: "Teal", year: "2015", photo: "composite_2015" },
    { first: "Spike", last: "Red", year: "2013", photo: "composite_2013" },
    { first: "Loretta", last: "Pink", year: "2014", photo: "composite_2014" },
    { first: "Lila", last: "Lilac", year: "2013", photo: "composite_2013" },
    { first: "Lily", last: "Ginger", year: "2013", photo: "composite_2013" },
    { first: "Charlotte", last: "Braun", year: "2012", photo: "composite_2012" },
    { first: "Marbles", last: "White", year: "2013", photo: "composite_2013" },
    { first: "Belle", last: "Beast", year: "2015", photo: "composite_2015" }
  ].map(function (p) { p.name = p.first + " " + p.last; return p; });

  /* PHOTOS: filled in at build time with base64 data URIs, one per class year */
  var PHOTOS = window.__COMPOSITE_PHOTOS__ || {};

  /* ---------------------------------------------------------
   * EmailJS — sends the actual "digital composite" email
   * straight from the browser, no backend server required.
   * See EMAIL-SETUP.md for how to get these three values.
   * --------------------------------------------------------- */
  var EMAILJS_CONFIG = {
    publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
    serviceId: "YOUR_EMAILJS_SERVICE_ID",
    templateId: "YOUR_EMAILJS_TEMPLATE_ID"
  };
  var emailjsReady = false;
  if (window.emailjs && EMAILJS_CONFIG.publicKey.indexOf("YOUR_") !== 0) {
    try {
      window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
      emailjsReady = true;
    } catch (e) {
      console.error("EmailJS init failed:", e);
    }
  }

  /* ---------------------------------------------------------
   * Navigation
   * --------------------------------------------------------- */
  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var confirmTimer = null;

  function goTo(name) {
    screens.forEach(function (s) {
      s.classList.toggle("is-active", s.dataset.screen === name);
    });
    if (name !== "confirm" && confirmTimer) {
      clearTimeout(confirmTimer);
      confirmTimer = null;
    }
    if (typeof hideKeyboards === "function") hideKeyboards();
    if (typeof suggestionsEl !== "undefined" && suggestionsEl) suggestionsEl.hidden = true;
  }

  /* ---------------------------------------------------------
   * Screen 1 -> 2 : landing tap
   * --------------------------------------------------------- */
  document.getElementById("btn-start").addEventListener("click", function () {
    goTo("search");
    setActiveField(inputName, { showKeyboard: false });
  });

  /* ---------------------------------------------------------
   * Screen 2 : search fields + keyboard
   * --------------------------------------------------------- */
  var inputName = document.getElementById("input-name");
  var inputYear = document.getElementById("input-year");
  var activeField = null;

  var formFieldsOrder = ["f-first", "f-last", "f-classyear", "f-degree", "f-email", "f-phone"]
    .map(function (id) { return document.getElementById(id); });

  var searchKeyboardEl = document.getElementById("keyboard");
  var formKeyboardEl = document.getElementById("keyboard-form");
  var kbAlphaPanel = document.getElementById("kb-alpha");
  var kbNumericPanel = document.getElementById("kb-numeric");

  function keyboardForField(el) {
    if (!el) return null;
    return formFieldsOrder.indexOf(el) !== -1 ? formKeyboardEl : searchKeyboardEl;
  }

  var fieldNameEl = document.getElementById("field-name");
  var fieldYearEl = document.getElementById("field-year");
  var searchBtnRow = document.getElementById("search-btn-row");
  var searchHeadlineEl = document.getElementById("search-headline");
  var searchSubtextEl = document.getElementById("search-subtext");
  var screenSearchEl = document.getElementById("screen-search");
  var screenFormEl = document.getElementById("screen-form");

  // Matches the Figma frames "If user touches the name field" / "...the
  // graduation year field": once a field is actually being edited, the
  // title, subtitle, other field, and Search/Reset buttons all disappear
  // so only the field in progress (plus its keyboard) is on screen. The
  // field then centers within the space still available above the
  // keyboard (not the full screen — the keyboard occupies close to half
  // the screen height in Figma), matching exactly how high up the field
  // sits in the Figma "touched field" frames.
  var exitBtnName = document.querySelector('.field__exit[data-target="input-name"]');
  var exitBtnYear = document.querySelector('.field__exit[data-target="input-year"]');

  var focusedSearchField = null; // set only while the single-field focused view is actually showing

  function showOnlySearchField(el) {
    if (!fieldNameEl || !fieldYearEl || !searchBtnRow) return;
    if (searchHeadlineEl) searchHeadlineEl.hidden = true;
    if (searchSubtextEl) searchSubtextEl.hidden = true;
    if (screenSearchEl) screenSearchEl.classList.add("keyboard-open");
    focusedSearchField = el;
    if (el === inputName) {
      fieldNameEl.hidden = false;
      fieldYearEl.hidden = true;
      searchBtnRow.hidden = true;
      if (exitBtnName) exitBtnName.hidden = false;
      if (exitBtnYear) exitBtnYear.hidden = true;
    } else if (el === inputYear) {
      fieldNameEl.hidden = true;
      fieldYearEl.hidden = false;
      searchBtnRow.hidden = true;
      if (exitBtnName) exitBtnName.hidden = true;
      if (exitBtnYear) exitBtnYear.hidden = false;
    }
    updateClearButtons();
  }

  function showBothSearchFields() {
    if (!fieldNameEl || !fieldYearEl || !searchBtnRow) return;
    if (searchHeadlineEl) searchHeadlineEl.hidden = false;
    if (searchSubtextEl) searchSubtextEl.hidden = false;
    if (screenSearchEl) screenSearchEl.classList.remove("keyboard-open");
    focusedSearchField = null;
    fieldNameEl.hidden = false;
    fieldYearEl.hidden = false;
    searchBtnRow.hidden = false;
    // The back-arrow only appears in the single-field focused view — the
    // combined "both fields" view (matching Figma's "Search" / "Name
    // added" / "Year added" frames) never shows it.
    if (exitBtnName) exitBtnName.hidden = true;
    if (exitBtnYear) exitBtnYear.hidden = true;
    updateClearButtons();
  }

  function setActiveField(el, opts) {
    var showKeyboard = !opts || opts.showKeyboard !== false;
    activeField = el;
    [inputName, inputYear].concat(formFieldsOrder).forEach(function (f) {
      if (f) f.dataset.active = f === el ? "true" : "false";
    });
    // The search screen's keyboard isn't tabbed (unlike the form) — it
    // auto-switches between the alpha and numeric panel depending on
    // which field is active, matching the two separate keyboards shown
    // in the Figma file (Name Search vs. Graduation Year Search).
    if (el === inputName) {
      kbAlphaPanel.hidden = false;
      kbNumericPanel.hidden = true;
    } else if (el === inputYear) {
      kbAlphaPanel.hidden = true;
      kbNumericPanel.hidden = false;
    }
    // hide both keyboards, then reveal the one matching this field
    searchKeyboardEl.classList.remove("is-open");
    formKeyboardEl.classList.remove("is-open");
    if (screenFormEl) screenFormEl.classList.remove("keyboard-open");
    if (el && showKeyboard) {
      var kb = keyboardForField(el);
      if (kb) kb.classList.add("is-open");
      if (kb === formKeyboardEl && screenFormEl) screenFormEl.classList.add("keyboard-open");
    }
    // Only actually focusing a search field (keyboard opening) enters the
    // single-field view — a passive default (showKeyboard: false, used
    // when first landing on the search screen) keeps both fields visible.
    if (showKeyboard && (el === inputName || el === inputYear)) {
      showOnlySearchField(el);
    } else if (el === inputName || el === inputYear || el === null) {
      showBothSearchFields();
    }
  }

  function hideKeyboards() {
    searchKeyboardEl.classList.remove("is-open");
    formKeyboardEl.classList.remove("is-open");
    if (screenFormEl) screenFormEl.classList.remove("keyboard-open");
    activeField = null;
    [inputName, inputYear].concat(formFieldsOrder).forEach(function (f) {
      if (f) f.dataset.active = "false";
    });
    showBothSearchFields();
  }

  inputName.addEventListener("click", function (e) { e.stopPropagation(); setActiveField(inputName); updateSuggestions(); });
  inputYear.addEventListener("click", function (e) { e.stopPropagation(); setActiveField(inputYear); updateSuggestions(); });

  // Tapping anywhere outside an input, the keyboard, or the suggestions
  // dropdown closes the keyboard and dismisses suggestions.
  document.addEventListener("click", function (e) {
    var isField = e.target.matches && e.target.matches("input.field__input");
    var isKeyboard = e.target.closest && e.target.closest(".keyboard");
    var isSuggestions = e.target.closest && e.target.closest(".suggestions");
    if (!isField && !isKeyboard) hideKeyboards();
    // Typing on the on-screen keyboard must never dismiss the suggestions
    // that just appeared — only a genuine tap outside the field, the
    // keyboard, and the suggestions box itself should close them.
    if (!isField && !isKeyboard && !isSuggestions && typeof suggestionsEl !== "undefined" && suggestionsEl) {
      suggestionsEl.hidden = true;
    }
  });

  function bindKeyboard(root, fields) {
    var tabs = root.querySelectorAll(".kbtab");
    var alphaPanel = root.querySelector('[id$="-alpha"]');
    var numericPanel = root.querySelector('[id$="-numeric"]');
    var caps = false;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        var numeric = tab.dataset.mode === "numeric";
        alphaPanel.hidden = numeric;
        numericPanel.hidden = !numeric;
      });
    });

    // Shift key — matches the iPhone keyboard's shift glyph in Figma.
    // Acts as a caps-lock-style toggle: flips every visible letter key
    // (and what gets typed) between lowercase and uppercase.
    var shiftKey = root.querySelector('[data-action="shift"]');
    if (shiftKey) {
      shiftKey.addEventListener("click", function () {
        caps = !caps;
        shiftKey.classList.toggle("is-caps-on", caps);
        root.querySelectorAll(".key[data-key]").forEach(function (k) {
          var char = k.dataset.key;
          if (char.length === 1 && /[a-z]/i.test(char)) {
            var next = caps ? char.toUpperCase() : char.toLowerCase();
            k.dataset.key = next;
            k.textContent = next;
          }
        });
      });
    }

    root.querySelectorAll(".key").forEach(function (key) {
      key.addEventListener("click", function () {
        var target = fields.getActive();
        if (!target) return;
        var action = key.dataset.action;
        if (action === "shift") {
          return; // handled above
        } else if (action === "backspace") {
          target.value = target.value.slice(0, -1);
        } else if (action === "tab") {
          fields.next();
        } else if (action === "close") {
          hideKeyboards();
        } else if (key.dataset.key !== undefined) {
          target.value += key.dataset.key;
        }
        target.dispatchEvent(new Event("input"));
      });
    });
  }

  bindKeyboard(document.getElementById("keyboard"), {
    getActive: function () { return activeField; },
    // Tapping the → arrow no longer jumps straight into the other field's
    // focused view — it returns to the combined overview first (both
    // fields visible, title/subtitle back), same as tapping outside the
    // keyboard, so the visitor can actually see what they just typed
    // before tapping into the next field themselves.
    next: function () { hideKeyboards(); }
  });

  function filterDirectory(nameQ, yearQ) {
    nameQ = (nameQ || "").trim().toLowerCase();
    yearQ = (yearQ || "").trim();
    return DIRECTORY.filter(function (p) {
      var nameMatch = nameQ === "" || p.name.toLowerCase().indexOf(nameQ) !== -1;
      var yearMatch = yearQ === "" || p.year.indexOf(yearQ) !== -1;
      return nameMatch && yearMatch;
    });
  }

  // Collapse person-level matches down to one entry per class year, since
  // every student in a class (15–85 of them) shares a single composite
  // photo. No individual name is ever carried past this point.
  function groupMatchesByYear(results) {
    var groups = [];
    var seen = {};
    results.forEach(function (person) {
      if (seen[person.year]) return;
      seen[person.year] = true;
      groups.push({ year: person.year, photo: person.photo });
    });
    groups.sort(function (a, b) { return a.year.localeCompare(b.year); });
    return groups;
  }

  function runSearch() {
    var nameQ = inputName.value.trim();
    var yearQ = inputYear.value.trim();

    var groups = groupMatchesByYear(filterDirectory(nameQ, yearQ));

    if (groups.length === 1) {
      // Unambiguous — skip the results screen and go straight to the photo.
      selectYear(groups[0]);
      return;
    }
    renderResults(groups, nameQ, yearQ);
    goTo("results");
  }

  var searchBtn = document.getElementById("btn-search");

  function updateSearchButtonState() {
    var hasBoth = inputName.value.trim().length > 0 && inputYear.value.trim().length > 0;
    searchBtn.disabled = !hasBoth;
  }
  updateSearchButtonState();
  inputName.addEventListener("input", updateSearchButtonState);
  inputYear.addEventListener("input", updateSearchButtonState);

  searchBtn.addEventListener("click", runSearch);

  document.getElementById("btn-reset").addEventListener("click", function () {
    inputName.value = "";
    inputYear.value = "";
    setActiveField(inputName, { showKeyboard: false });
    updateSuggestions();
    updateClearButtons();
    updateSearchButtonState();
  });

  /* ---------------------------------------------------------
   * Live suggestions — update as the user types on either field.
   * Shown as one tile per class year (no names), same as results.
   * --------------------------------------------------------- */
  var suggestionsEl = document.getElementById("suggestions");
  var MAX_SUGGESTIONS = 2; // keep short so the on-screen keyboard stays reachable on a touchscreen

  var MIN_NAME_CHARS_FOR_SUGGESTIONS = 3;

  function updateSuggestions() {
    var nameQ = inputName.value.trim();
    var yearQ = inputYear.value.trim();

    // Suggestions only start once at least 3 letters have been typed in
    // the Name field — typing only a graduation year, or just 1-2
    // letters, shouldn't trigger anything yet.
    if (nameQ.length < MIN_NAME_CHARS_FOR_SUGGESTIONS) {
      suggestionsEl.hidden = true;
      suggestionsEl.innerHTML = "";
      return;
    }

    // Suggestions show actual matching student names (as in the Figma
    // "User input name" frame), not class years — that keeps the
    // suggestion list genuinely useful for finding the right person.
    // The final results screen still resolves to a class year's photo
    // only, with no names shown, once a suggestion or Search is used.
    var matches = filterDirectory(nameQ, yearQ);
    suggestionsEl.innerHTML = "";

    if (matches.length === 0) {
      suggestionsEl.hidden = false;
      var empty = document.createElement("p");
      empty.className = "suggestions__empty";
      empty.textContent = "No matches yet";
      suggestionsEl.appendChild(empty);
      return;
    }

    matches.slice(0, MAX_SUGGESTIONS).forEach(function (person) {
      var item = document.createElement("button");
      item.className = "suggestion-item";
      item.innerHTML =
        '<span class="suggestion-item__name">' + person.name + '</span>' +
        '<span class="suggestion-item__year">Class of ' + person.year + '</span>';
      item.addEventListener("click", function (e) {
        e.stopPropagation();
        selectYear({ year: person.year, photo: person.photo });
      });
      suggestionsEl.appendChild(item);
    });

    if (matches.length > MAX_SUGGESTIONS) {
      var more = document.createElement("p");
      more.className = "suggestions__more";
      more.textContent = "+" + (matches.length - MAX_SUGGESTIONS) + " more — keep typing to narrow it down";
      suggestionsEl.appendChild(more);
    }

    suggestionsEl.hidden = false;
  }

  inputName.addEventListener("input", updateSuggestions);
  inputYear.addEventListener("input", updateSuggestions);

  /* ---------------------------------------------------------
   * Field clear (inline X) / field exit (outer X, back to landing)
   * --------------------------------------------------------- */
  var fieldsById = { "input-name": inputName, "input-year": inputYear };

  function updateClearButtons() {
    // Matches Figma exactly: the inline clear-X never appears in the
    // combined overview, even when a field already has text (e.g. the
    // "Name added" frame shows "Daniel" with no X). It only shows when
    // that specific field is both focused AND has something typed.
    document.querySelectorAll(".field__clear").forEach(function (btn) {
      var target = fieldsById[btn.dataset.target];
      var isFocused = target && target === focusedSearchField;
      btn.hidden = !target || !isFocused || target.value.length === 0;
    });
  }
  inputName.addEventListener("input", updateClearButtons);
  inputYear.addEventListener("input", updateClearButtons);

  document.querySelectorAll(".field__clear").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var target = fieldsById[btn.dataset.target];
      if (!target) return;
      target.value = "";
      target.dispatchEvent(new Event("input"));
      setActiveField(target);
    });
  });

  document.querySelectorAll(".field__exit").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      inputName.value = "";
      inputYear.value = "";
      updateClearButtons();
      updateSuggestions();
      updateSearchButtonState();
      goTo("landing");
    });
  });

  /* ---------------------------------------------------------
   * Screen 3 : results — one photo tile per matching class year,
   * no student names shown at any point in this flow.
   * --------------------------------------------------------- */
  var resultsList = document.getElementById("results-list");
  var resultsSummary = document.getElementById("results-summary");

  function renderResults(groups, nameQ, yearQ) {
    resultsList.innerHTML = "";
    var queryLabel = [nameQ, yearQ].filter(Boolean).join(" · ") || "all records";

    resultsSummary.textContent = groups.length + " class year" + (groups.length === 1 ? "" : "s") + " found for " + queryLabel;

    if (groups.length === 0) {
      var empty = document.createElement("p");
      empty.className = "results-empty";
      empty.textContent = "No matches found. Try a different name or graduation year.";
      resultsList.appendChild(empty);
      return;
    }

    groups.forEach(function (group) {
      var card = document.createElement("button");
      card.className = "result-photo-card";
      var photoUrl = PHOTOS[group.photo];
      if (photoUrl) card.style.backgroundImage = "url('" + photoUrl + "')";
      card.innerHTML = '<span class="result-photo-card__label">Class of ' + group.year + '</span>';
      card.addEventListener("click", function () { selectYear(group); });
      resultsList.appendChild(card);
    });
  }

  document.getElementById("btn-results-search").addEventListener("click", function () {
    inputName.value = "";
    inputYear.value = "";
    updateSuggestions();
    updateClearButtons();
    updateSearchButtonState();
    goTo("search");
    setActiveField(inputName, { showKeyboard: false });
  });
  document.getElementById("btn-results-reset").addEventListener("click", function () {
    inputName.value = "";
    inputYear.value = "";
    goTo("search");
    setActiveField(inputName, { showKeyboard: false });
  });

  /* ---------------------------------------------------------
   * Screen 4 : composite board
   * --------------------------------------------------------- */
  var currentSelection = null; // { year, photo }

  function selectYear(group) {
    currentSelection = { year: group.year, photo: group.photo };

    document.getElementById("composite-board-title").textContent = group.year + " Class Composite";
    document.getElementById("composite-title").textContent = group.year + " Class Composite";
    document.getElementById("composite-year").textContent = "Class of " + group.year;

    var portraitEl = document.getElementById("composite-portrait");
    var photoUrl = PHOTOS[group.photo];

    if (photoUrl) {
      portraitEl.style.backgroundImage = "url('" + photoUrl + "')";
      portraitEl.classList.add("composite-board__portrait--photo");
    }
    suggestionsEl.hidden = true;
    goTo("composite");
  }

  document.getElementById("btn-search-again").addEventListener("click", function () {
    inputName.value = "";
    inputYear.value = "";
    updateSuggestions();
    updateClearButtons();
    updateSearchButtonState();
    goTo("search");
    setActiveField(inputName, { showKeyboard: false });
  });

  document.getElementById("btn-form-search-again").addEventListener("click", function () {
    inputName.value = "";
    inputYear.value = "";
    updateSuggestions();
    updateClearButtons();
    updateSearchButtonState();
    goTo("search");
    setActiveField(inputName, { showKeyboard: false });
  });

  document.getElementById("btn-email").addEventListener("click", function () {
    if (currentSelection) {
      document.getElementById("form-board-title").textContent = currentSelection.year + " Digital Composite";
      document.getElementById("form-title").textContent = currentSelection.year + " Digital Composite";

      // Anyone can request any class's composite as long as they know the
      // name and year — the request isn't tied to who searched, so the
      // form is left blank for the visitor to fill in themselves. Class
      // Year is the one exception: it's pre-filled since it's determined
      // by which photo they selected, not by anyone's identity.
      document.getElementById("f-first").value = "";
      document.getElementById("f-last").value = "";
      document.getElementById("f-classyear").value = currentSelection.year;
      document.getElementById("f-degree").value = "";
      document.getElementById("f-email").value = "";
      document.getElementById("f-phone").value = "";

      var formPhotoEl = document.getElementById("form-portrait");
      var photoUrl = PHOTOS[currentSelection.photo];
      if (formPhotoEl && photoUrl) {
        formPhotoEl.style.backgroundImage = "url('" + photoUrl + "')";
        formPhotoEl.classList.add("composite-board__portrait--photo");
      }
    }
    goTo("form");
  });

  /* ---------------------------------------------------------
   * Screen 5 : form + its own keyboard
   * --------------------------------------------------------- */
  formFieldsOrder.forEach(function (el) {
    el.addEventListener("click", function (e) { e.stopPropagation(); setActiveField(el); });
  });

  bindKeyboard(document.getElementById("keyboard-form"), {
    getActive: function () { return activeField; },
    next: function () {
      var idx = formFieldsOrder.indexOf(activeField);
      var nextEl = formFieldsOrder[(idx + 1) % formFieldsOrder.length];
      setActiveField(nextEl);
    }
  });

  var formError = document.getElementById("form-error");
  var submitBtn = document.getElementById("btn-submit");
  var submitBtnDefaultText = submitBtn.textContent;

  document.getElementById("btn-submit").addEventListener("click", function () {
    var first = document.getElementById("f-first").value.trim();
    var last = document.getElementById("f-last").value.trim();
    var classYear = document.getElementById("f-classyear").value.trim();
    var degree = document.getElementById("f-degree").value.trim();
    var email = document.getElementById("f-email").value.trim();
    var phone = document.getElementById("f-phone").value.trim();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!first || !last || !classYear || !emailOk) {
      formError.hidden = false;
      formError.textContent = "Please fill in all required fields (marked with *) and a valid email address.";
      return;
    }
    formError.hidden = true;

    if (!emailjsReady) {
      // Not configured yet — see EMAIL-SETUP.md. Demo mode still lets you
      // test the on-screen flow without sending a real email.
      console.warn("EmailJS is not configured (see EMAIL-SETUP.md) — showing confirmation without sending an email.");
      goTo("confirm");
      confirmTimer = setTimeout(function () { resetAll(); goTo("landing"); }, 8000);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    var templateParams = {
      to_email: email,
      first_name: first,
      last_name: last,
      class_year: classYear,
      degree: degree,
      phone: phone
    };

    window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtnDefaultText;
        goTo("confirm");
        confirmTimer = setTimeout(function () { resetAll(); goTo("landing"); }, 8000);
      })
      .catch(function (err) {
        console.error("EmailJS send failed:", err);
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtnDefaultText;
        formError.hidden = false;
        formError.textContent = "We couldn't send that email — please try again in a moment.";
      });
  });

  /* ---------------------------------------------------------
   * Screen 6 : confirmation
   * --------------------------------------------------------- */
  document.getElementById("btn-confirm-home").addEventListener("click", function () {
    resetAll();
    goTo("landing");
  });

  function resetAll() {
    inputName.value = "";
    inputYear.value = "";
    formFieldsOrder.forEach(function (f) { f.value = ""; });
    document.getElementById("f-consent").checked = false;
    formError.hidden = true;
    currentSelection = null;
    if (typeof updateClearButtons === "function") updateClearButtons();
    if (typeof updateSearchButtonState === "function") updateSearchButtonState();
  }

  /* Idle timeout: return any screen to landing after 60s of inactivity */
  var idleTimer = null;
  function armIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      resetAll();
      goTo("landing");
    }, 60000);
  }
  document.addEventListener("click", armIdleTimer);
  armIdleTimer();

  /* ---------------------------------------------------------
   * Landing screen carousel — cycles through one photo per
   * class year represented in the directory, 15s per photo.
   * --------------------------------------------------------- */
  var CAROUSEL_INTERVAL_MS = 15000;

  function initCarousel() {
    var years = [];
    DIRECTORY.forEach(function (p) {
      if (years.indexOf(p.year) === -1) years.push(p.year);
    });
    years.sort();

    var slidesEl = document.getElementById("carousel-slides");
    var dotsEl = document.getElementById("carousel-dots");
    var captionEl = document.getElementById("carousel-caption");
    if (!slidesEl || years.length === 0) return;

    years.forEach(function (year, i) {
      var slide = document.createElement("div");
      slide.className = "carousel__slide" + (i === 0 ? " is-active" : "");
      var photoUrl = PHOTOS["composite_" + year];
      if (photoUrl) slide.style.backgroundImage = "url('" + photoUrl + "')";
      slidesEl.appendChild(slide);

      var dot = document.createElement("span");
      dot.className = "carousel__dot" + (i === 0 ? " is-active" : "");
      dotsEl.appendChild(dot);
    });
    captionEl.textContent = "Class of " + years[0];

    if (years.length < 2) return;

    var index = 0;
    var slides = slidesEl.querySelectorAll(".carousel__slide");
    var dots = dotsEl.querySelectorAll(".carousel__dot");

    setInterval(function () {
      slides[index].classList.remove("is-active");
      dots[index].classList.remove("is-active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("is-active");
      dots[index].classList.add("is-active");
      captionEl.textContent = "Class of " + years[index];
    }, CAROUSEL_INTERVAL_MS);
  }
  initCarousel();

  goTo("landing");
})();
