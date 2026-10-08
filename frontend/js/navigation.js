function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    const overlay = document.getElementById('menu-overlay');
    const profileMenu = document.getElementById('profile-dropdown');
    const timetableMenu = document.getElementById('timetable-action-menu');

    // Close other menus
    if (profileMenu) profileMenu.classList.add('hidden');
    if (timetableMenu) {
        timetableMenu.classList.add('hidden');
        timetableMenu.classList.remove('animate-scaleIn');
    }

    if (panel.classList.contains('translate-x-full')) {
        panel.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        overlay.classList.add('animate-fadeIn');
        document.body.style.overflow = 'hidden';
    } else {
        panel.classList.add('translate-x-full');
        overlay.classList.add('hidden');
        overlay.classList.remove('animate-fadeIn');
        document.body.style.overflow = '';
    }
}

function toggleProfile() {
    const dropdown = document.getElementById('profile-dropdown');
    const panel = document.getElementById('notification-panel');
    const timetableMenu = document.getElementById('timetable-action-menu');
    const overlay = document.getElementById('menu-overlay');

    // Close other menus
    if (panel) {
        panel.classList.add('translate-x-full');
        document.body.style.overflow = '';
    }
    if (timetableMenu) {
        timetableMenu.classList.add('hidden');
        timetableMenu.classList.remove('animate-scaleIn');
    }

    if (dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden');
        overlay.classList.remove('hidden');
        overlay.classList.add('animate-fadeIn');
    } else {
        dropdown.classList.add('hidden');
        overlay.classList.add('hidden');
        overlay.classList.remove('animate-fadeIn');
    }
}

function toggleTimetableMenu(event, subjectName) {
    event.stopPropagation();
    const menu = document.getElementById('timetable-action-menu');
    const panel = document.getElementById('notification-panel');
    const profileDropdown = document.getElementById('profile-dropdown');
    const overlay = document.getElementById('menu-overlay');
    
    // Close other menus
    if (panel) {
        panel.classList.add('translate-x-full');
        document.body.style.overflow = '';
    }
    if (profileDropdown) profileDropdown.classList.add('hidden');

    // Update menu title for context
    const menuTitle = menu.querySelector('#menu-subject-name');
    if (menuTitle) menuTitle.textContent = subjectName;

    if (menu.classList.contains('hidden')) {
        // Position menu near the click using viewport-relative coordinates for fixed element
        const rect = event.currentTarget.getBoundingClientRect();
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;
        
        menu.classList.remove('hidden');
        menu.classList.add('animate-scaleIn');
        overlay.classList.remove('hidden');
        overlay.classList.add('animate-fadeIn');
    } else {
        menu.classList.add('hidden');
        menu.classList.remove('animate-scaleIn');
        overlay.classList.add('hidden');
        overlay.classList.remove('animate-fadeIn');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// cleanErrorMessage is now defined globally in toast.js

// ─────────────────────────────────────────────────────────────────────────────
// Modal Focus Trap
// ─────────────────────────────────────────────────────────────────────────────
let _modalFocusTrapHandler = null;
let _modalPreviousFocus    = null;

function _activateFocusTrap(modalCard) {
    _modalPreviousFocus = document.activeElement;

    // Attempt to focus the first focusable element in the modal
    const focusable = modalCard.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();

    _modalFocusTrapHandler = (e) => {
        if (e.key !== 'Tab') return;
        const all = Array.from(modalCard.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
        if (!all.length) return;
        const first = all[0];
        const last  = all[all.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
        }
    };
    document.addEventListener('keydown', _modalFocusTrapHandler);
}

function _deactivateFocusTrap() {
    if (_modalFocusTrapHandler) {
        document.removeEventListener('keydown', _modalFocusTrapHandler);
        _modalFocusTrapHandler = null;
    }
    if (_modalPreviousFocus && typeof _modalPreviousFocus.focus === 'function') {
        _modalPreviousFocus.focus();
        _modalPreviousFocus = null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Modal Open / Close
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Show the global modal with a standard content header (title + close button).
 * @param {string} title       - Header title text
 * @param {string} contentHtml - HTML string for the modal body
 */
function showModal(title, contentHtml, maxWidthClass) {
    const modal          = document.getElementById('global-modal');
    const backdrop       = document.getElementById('modal-backdrop');
    const modalCard      = document.getElementById('modal-card');
    const modalHeader    = document.getElementById('modal-header');
    const feedbackHeader = document.getElementById('feedback-modal-header');
    const modalTitle     = document.getElementById('modal-title');
    const modalBody      = document.getElementById('modal-body');

    // Configure for standard (content-driven) mode
    if (modalHeader)    modalHeader.classList.remove('hidden');
    if (feedbackHeader) feedbackHeader.classList.add('hidden');

    if (modalCard) {
        modalCard.className = `bg-white dark:bg-slate-900 w-full ${maxWidthClass || 'max-w-sm'} rounded-3xl shadow-2xl overflow-hidden relative pointer-events-auto transition-all duration-300 opacity-0 scale-95`;
    }

    modalTitle.textContent  = title;
    modalBody.innerHTML     = contentHtml;

    // Show the modal
    _openModalBase(modal, backdrop, modalCard);
}

/**
 * Show a styled feedback modal (success | error | warning | info).
 * @param {{ type: 'success'|'error'|'warning'|'info', title: string, message: string, action?: { label: string, handler: Function } }} opts
 */
function showFeedbackModal(opts) {
    const { type = 'info', title, message, action } = opts;

    const VARIANTS = {
        success: {
            icon:        'check_circle',
            iconColor:   'text-emerald-600 dark:text-emerald-400',
            circleBg:    'bg-emerald-50 dark:bg-emerald-900/30',
            accentBg:    'bg-emerald-500',
            btnBg:       'bg-emerald-600 hover:bg-emerald-700',
        },
        error: {
            icon:        'error',
            iconColor:   'text-rose-600 dark:text-rose-400',
            circleBg:    'bg-rose-50 dark:bg-rose-900/30',
            accentBg:    'bg-rose-500',
            btnBg:       'bg-rose-600 hover:bg-rose-700',
        },
        warning: {
            icon:        'warning',
            iconColor:   'text-amber-600 dark:text-amber-400',
            circleBg:    'bg-amber-50 dark:bg-amber-900/30',
            accentBg:    'bg-amber-500',
            btnBg:       'bg-amber-600 hover:bg-amber-700',
        },
        info: {
            icon:        'info',
            iconColor:   'text-blue-600 dark:text-blue-400',
            circleBg:    'bg-blue-50 dark:bg-blue-900/30',
            accentBg:    'bg-blue-500',
            btnBg:       'bg-primary hover:bg-blue-700',
        },
    };

    const v = VARIANTS[type] || VARIANTS.info;

    const modal          = document.getElementById('global-modal');
    const backdrop       = document.getElementById('modal-backdrop');
    const modalCard      = document.getElementById('modal-card');
    const modalHeader    = document.getElementById('modal-header');
    const feedbackHeader = document.getElementById('feedback-modal-header');
    const accentBar      = document.getElementById('feedback-accent-bar');
    const iconCircle     = document.getElementById('feedback-icon-circle');
    const iconEl         = document.getElementById('feedback-icon');
    const feedbackTitle  = document.getElementById('feedback-modal-title');
    const modalBody      = document.getElementById('modal-body');

    // Configure for feedback mode
    if (modalHeader) modalHeader.classList.add('hidden');
    feedbackHeader.classList.remove('hidden');

    // Apply variant styles
    accentBar.className   = `absolute top-0 left-0 right-0 h-1 rounded-t-3xl ${v.accentBg}`;
    iconCircle.className  = `w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${v.circleBg}`;
    iconEl.className      = `material-icons-outlined text-3xl ${v.iconColor}`;
    iconEl.textContent    = v.icon;
    feedbackTitle.textContent = title || _defaultTitle(type);
    modal.setAttribute('aria-labelledby', 'feedback-modal-title');

    const safeMessage = cleanErrorMessage(message || '');
    const actionBtnHtml = action
        ? `<button onclick="(${action.handler.toString()})(); closeModal();" class="w-full py-3 ${v.btnBg} text-white rounded-xl text-sm font-bold transition-all shadow-lg mt-1 active:scale-[0.98]">` +
          `${action.label}</button>`
        : '';

    modalBody.innerHTML = `
        <div class="text-center space-y-5 pb-1">
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">${safeMessage}</p>
            <div class="space-y-2">
                ${actionBtnHtml}
                <button onclick="closeModal()" class="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98]">
                    ${action ? 'Cancel' : 'Got it'}
                </button>
            </div>
        </div>
    `;

    _openModalBase(modal, backdrop, modalCard);
}

function _defaultTitle(type) {
    const titles = { success: 'Success!', error: 'Something went wrong', warning: 'Heads up!', info: 'Information' };
    return titles[type] || 'Notice';
}

function _openModalBase(modal, backdrop, modalCard) {
    // Show the overlay
    if (backdrop) {
        backdrop.classList.remove('hidden');
        requestAnimationFrame(() => {
            backdrop.style.opacity = '1';
        });
    }

    // Show modal container as flex
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    // Trigger card entry animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modalCard.style.opacity  = '1';
            modalCard.style.transform = 'scale(1)';
        });
    });

    document.body.style.overflow = 'hidden';
    _activateFocusTrap(modalCard);
}

function closeModal() {
    const modal     = document.getElementById('global-modal');
    const backdrop  = document.getElementById('modal-backdrop');
    const modalCard = document.getElementById('modal-card');

    // Animate the card out
    if (modalCard) {
        modalCard.style.opacity   = '0';
        modalCard.style.transform = 'scale(0.95)';
    }
    if (backdrop) {
        backdrop.style.opacity = '0';
    }

    setTimeout(() => {
        if (modal)   { modal.classList.add('hidden'); modal.style.display = ''; }
        if (backdrop) backdrop.classList.add('hidden');
        if (modalCard) {
            modalCard.className = 'bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative pointer-events-auto transition-all duration-300 opacity-0 scale-95';
        }

        // Only restore scroll if no other menus are open
        const panelOpen = document.getElementById('notification-panel') &&
            !document.getElementById('notification-panel').classList.contains('translate-x-full');
        const dropdownOpen = document.getElementById('profile-dropdown') &&
            !document.getElementById('profile-dropdown').classList.contains('hidden');
        if (!panelOpen && !dropdownOpen) {
            document.body.style.overflow = '';
        }

        _deactivateFocusTrap();
    }, 250);
}

// Timetable Actions
function showSubjectDetails(subject) {
    closeAllMenus();
    
    // Display a loader or template while fetching
    const loadingContent = `
        <div class="flex flex-col items-center justify-center py-8 space-y-3">
            <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs text-slate-400">Fetching details from database...</p>
        </div>
    `;
    showModal(`${subject} Details`, loadingContent);

    fetch(`/student/api/subject-details?subject=${encodeURIComponent(subject)}`)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(res => {
            if (!res.success) throw new Error(res.message || "Failed to fetch details");
            
            const data = res.data;
            const content = `
                <div class="space-y-4">
                    <div class="flex items-center gap-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-xl">
                        <span class="material-icons-outlined text-primary">person</span>
                        <div>
                            <p class="text-[10px] text-slate-500 uppercase">Teacher</p>
                            <p class="text-sm font-bold">${data.teacher}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-secondary/10 rounded-xl">
                        <span class="material-icons-outlined text-secondary">place</span>
                        <div>
                            <p class="text-[10px] text-slate-500 uppercase">Location</p>
                            <p class="text-sm font-bold">${data.room}</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span class="material-icons-outlined text-slate-500 mt-0.5">schedule</span>
                        <div>
                            <p class="text-[10px] text-slate-500 uppercase">Schedule</p>
                            <p class="text-sm font-bold leading-relaxed">${data.time}</p>
                        </div>
                    </div>
                    <div class="p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <p class="text-[10px] text-slate-500 uppercase mb-1">Topics</p>
                        <p class="text-sm">${data.syllabus}</p>
                    </div>
                </div>
            `;
            // Update the modal with the dynamic content
            const modalBody = document.getElementById('modal-body');
            if (modalBody) {
                modalBody.innerHTML = content;
            }
        })
        .catch(err => {
            console.warn("Using offline mock details for", subject);
            const teacherMap = {
                'Mathematics': 'Mr. Adams (HOD Mathematics)',
                'English Language': 'Mrs. Johnson (Senior English Tutor)',
                'Basic Science': 'Dr. Williams (Sciences Lead)',
                'Social Studies': 'Mrs. Davies (Social Sciences)',
                'Business Studies': 'Mr. Brown (Commerce Department)',
                'Computer Studies': 'Mr. Okon (IT Coordinator)'
            };
            const teacher = teacherMap[subject] || 'Assigned Subject Teacher';
            const content = `
                <div class="space-y-4">
                    <div class="flex items-center gap-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-xl">
                        <span class="material-icons-outlined text-primary">person</span>
                        <div>
                            <p class="text-[10px] text-slate-500 uppercase">Teacher</p>
                            <p class="text-sm font-bold">${teacher}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-secondary/10 rounded-xl">
                        <span class="material-icons-outlined text-secondary">place</span>
                        <div>
                            <p class="text-[10px] text-slate-500 uppercase">Location</p>
                            <p class="text-sm font-bold">Room 102 • Block B</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span class="material-icons-outlined text-slate-500 mt-0.5">schedule</span>
                        <div>
                            <p class="text-[10px] text-slate-500 uppercase">Schedule</p>
                            <p class="text-sm font-bold leading-relaxed">Mon, Wed: 8:00 AM - 9:00 AM</p>
                        </div>
                    </div>
                    <div class="p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <p class="text-[10px] text-slate-500 uppercase mb-1">Topics & Syllabus</p>
                        <p class="text-sm text-slate-600 dark:text-slate-300">Active Curriculum: Core principles, active exercises, weekly assessments, and interactive lab sessions.</p>
                    </div>
                </div>
            `;
            const modalBody = document.getElementById('modal-body');
            if (modalBody) modalBody.innerHTML = content;
        });
}

function showAddNote(subject) {
    closeAllMenus();
    const content = `
        <div class="space-y-4">
            <p class="text-xs text-slate-500 uppercase">Personal Note for ${subject}</p>
            <textarea id="subject-note" class="w-full h-32 p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Enter your notes here..."></textarea>
            <button onclick="saveNote('${subject}')" class="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">Save Note</button>
        </div>
    `;
    showModal(`Add Note`, content);
}

function saveNote(subject) {
    const note = document.getElementById('subject-note').value;
    if (note.trim()) {
        closeModal();
        showToast(`Note saved for ${subject}!`, 'success');
    } else {
        showToast('Please enter a note before saving.', 'warning');
    }
}

function showCourseMaterials(subject) {
    closeAllMenus();
    const content = `
        <div class="space-y-3">
            <p class="text-xs text-slate-500 uppercase">Available Resources</p>
            <a href="#" class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary transition-colors">
                <div class="flex items-center gap-3">
                    <span class="material-icons-outlined text-red-500">picture_as_pdf</span>
                    <span class="text-sm">Course Syllabus.pdf</span>
                </div>
                <span class="material-icons-outlined text-slate-400 text-sm">download</span>
            </a>
            <a href="#" class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary transition-colors">
                <div class="flex items-center gap-3">
                    <span class="material-icons-outlined text-primary">description</span>
                    <span class="text-sm">Practice Exercises.docx</span>
                </div>
                <span class="material-icons-outlined text-slate-400 text-sm">download</span>
            </a>
            <a href="#" class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary transition-colors">
                <div class="flex items-center gap-3">
                    <span class="material-icons-outlined text-secondary">slideshow</span>
                    <span class="text-sm">Introduction Slides.pptx</span>
                </div>
                <span class="material-icons-outlined text-slate-400 text-sm">download</span>
            </a>
        </div>
    `;
    showModal(`${subject} Materials`, content);
}

function closeAllMenus() {
    const panel        = document.getElementById('notification-panel');
    const dropdown     = document.getElementById('profile-dropdown');
    const timetableMenu= document.getElementById('timetable-action-menu');
    const modal        = document.getElementById('global-modal');
    const backdrop     = document.getElementById('modal-backdrop');
    const modalCard    = document.getElementById('modal-card');
    const overlay      = document.getElementById('menu-overlay');

    if (panel)    panel.classList.add('translate-x-full');
    if (dropdown) dropdown.classList.add('hidden');
    if (timetableMenu) {
        timetableMenu.classList.add('hidden');
        timetableMenu.classList.remove('animate-scaleIn');
    }
    if (modal)   { modal.classList.add('hidden'); modal.style.display = ''; }
    if (backdrop) { backdrop.classList.add('hidden'); backdrop.style.opacity = '0'; }
    if (modalCard) { modalCard.style.opacity = '0'; modalCard.style.transform = 'scale(0.95)'; }
    if (overlay)  { overlay.classList.add('hidden'); overlay.classList.remove('animate-fadeIn'); }
    document.body.style.overflow = '';
    _deactivateFocusTrap();
}

// Close menus on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllMenus();
});

function logout() {
    closeAllMenus();
    const content = `
        <div class="text-center space-y-4">
            <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-500">
                <span class="material-icons-outlined text-3xl">logout</span>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to log out of your student portal?</p>
            <div class="flex flex-col gap-2 pt-2">
                <button onclick="confirmLogout()" class="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg">Confirm Logout</button>
                <button onclick="closeModal()" class="w-full py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            </div>
        </div>
    `;
    showModal('Logout Confirmation', content);
}

function confirmLogout() {
    localStorage.removeItem('isAdmin');
    window.location.href = 'student-login.html';
}

// Results Page Functions
function changeSession(sessionId) {
    const sessionSelect = document.getElementById('session-select');
    const termId = sessionSelect ? sessionSelect.getAttribute('data-selected-term') : '3';
    const targetUrl = `results.html?session=${sessionId}&term=${termId}`;
    if (typeof navigateToPage === 'function') {
        navigateToPage(targetUrl);
    } else {
        window.location.href = targetUrl;
    }
}

function changeTerm(termId) {
    const sessionSelect = document.getElementById('session-select');
    const sessionId = sessionSelect ? sessionSelect.getAttribute('data-selected-session') : '2';
    const targetUrl = `results.html?session=${sessionId}&term=${termId}`;
    if (typeof navigateToPage === 'function') {
        navigateToPage(targetUrl);
    } else {
        window.location.href = targetUrl;
    }
}

function triggerReportDownload() {
    const sessionSelect = document.getElementById('session-select');
    const sessionId = sessionSelect ? sessionSelect.getAttribute('data-selected-session') : '2';
    const termId = sessionSelect ? sessionSelect.getAttribute('data-selected-term') : '3';
    window.open(`print-results.html?session=${sessionId}&term=${termId}`, '_blank');
}

function showSubjectResults(subject, grade, percentage, teacher, caScore, midTermScore, examScore, remarks) {
    if (typeof closeAllMenus === 'function') {
        closeAllMenus();
    }
    const displayCa = caScore !== undefined ? caScore : '28/30';
    const displayMid = midTermScore !== undefined ? midTermScore : '18/20';
    const displayExam = examScore !== undefined ? examScore : '46/50';
    const displayRemarks = remarks !== undefined ? remarks : `John has shown exceptional understanding of ${subject} concepts this term. His participation in class discussions is commendable.`;
    
    const content = `
        <div class="space-y-6">
            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div>
                    <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Overall Grade</p>
                    <p class="text-3xl font-black text-primary dark:text-blue-400">${grade}</p>
                </div>
                <div class="text-right">
                    <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Percentage</p>
                    <p class="text-xl font-bold text-slate-700 dark:text-white">${percentage}</p>
                </div>
            </div>

            <div class="space-y-3">
                <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider pl-1">Score Breakdown</p>
                <div class="space-y-2">
                    <div class="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-50 dark:border-slate-800">
                        <span class="text-xs font-semibold">Continuous Assessment</span>
                        <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${displayCa}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-50 dark:border-slate-800">
                        <span class="text-xs font-semibold">Mid-Term Exam</span>
                        <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${displayMid}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-50 dark:border-slate-800">
                        <span class="text-xs font-semibold">Final Examination</span>
                        <span class="text-xs font-bold text-primary dark:text-blue-400">${displayExam}</span>
                    </div>
                </div>
            </div>

            <div class="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/20">
                <p class="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider mb-2">Teacher Remark</p>
                <p class="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed">
                    "${displayRemarks || 'No remarks provided.'}"
                </p>
                <div class="flex items-center gap-2 mt-3 pt-3 border-t border-blue-100 dark:border-blue-800/50">
                    <div class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span class="material-icons-outlined text-xs text-primary">person</span>
                    </div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase">${teacher}</span>
                </div>
            </div>
        </div>
    `;
    showModal(`${subject} Results`, content);
}

function downloadReport() {
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = `
        <div class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Report...
        </div>
    `;

    setTimeout(() => {
        btn.innerHTML = `
            <div class="flex items-center justify-center gap-2">
                <span class="material-icons-outlined text-sm">check_circle</span>
                Downloaded Successfully
            </div>
        `;
        btn.classList.replace('bg-primary', 'bg-secondary');
        
        // Mock download notification
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.replace('bg-secondary', 'bg-primary');
            btn.disabled = false;
        }, 2000);
    }, 3000);
}

// Timetable Page Functions
function switchDay(day, element) {
    // Update button styles
    const buttons = element.parentElement.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('bg-secondary', 'text-white');
        btn.classList.add('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-100', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400', 'font-medium');
        btn.classList.remove('font-bold');
    });

    element.classList.remove('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-100', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400', 'font-medium');
    element.classList.add('bg-secondary', 'text-white', 'font-bold');

    // Update Day Info Card
    const dayLabel = document.getElementById('current-day-label');
    const classCount = document.getElementById('class-count');
    if (dayLabel) dayLabel.textContent = day;
    
    // Hide all schedule sections
    const sections = document.querySelectorAll('.schedule-section');
    sections.forEach(s => s.classList.add('hidden'));

    // Show selected day section
    const targetSection = document.getElementById(`${day.toLowerCase()}-schedule`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('animate-fadeIn');
    }

    // Class counts for mock UI
    const counts = typeof dynamicClassCounts !== 'undefined' ? dynamicClassCounts : { 'Monday': 5, 'Tuesday': 5, 'Wednesday': 5, 'Thursday': 5, 'Friday': 5 };
    if (classCount) classCount.textContent = `${counts[day] || 0} classes scheduled`;
}

// Assessment Page Functions
function filterAssessments(category, element) {
    // Update button styles
    const buttons = element.parentElement.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('bg-secondary', 'text-white', 'font-bold');
        btn.classList.add('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-100', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400', 'font-medium');
    });

    element.classList.remove('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-100', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400', 'font-medium');
    element.classList.add('bg-secondary', 'text-white', 'font-bold');

    // Filter items
    const sections = document.querySelectorAll('section.assessment-section');
    const items = document.querySelectorAll('.assessment-card');
    
    if (category === 'All') {
        items.forEach(item => item.classList.remove('hidden'));
        sections.forEach(section => section.classList.remove('hidden'));
    } else {
        items.forEach(item => {
            if (item.getAttribute('data-category') === category) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
        
        // Hide empty sections
        sections.forEach(section => {
            const visibleItems = section.querySelectorAll('.assessment-card:not(.hidden)');
            if (visibleItems.length === 0) {
                section.classList.add('hidden');
            } else {
                section.classList.remove('hidden');
            }
        });
    }
}

function showAssessmentDetails(title, subject, type, date, info) {
    showModal(title, `
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <span class="material-icons-outlined text-xl">${title.includes('Test') || title.includes('Quiz') ? 'quiz' : 'assignment'}</span>
                </div>
                <div>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">${subject}</p>
                    <p class="text-xs text-slate-400 font-medium">${type}</p>
                </div>
            </div>
            
            <div class="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                <div class="flex items-center gap-2 text-xs">
                    <span class="material-icons-outlined text-sm text-slate-400">calendar_today</span>
                    <span class="text-slate-700 dark:text-slate-300 font-medium">${date}</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                    <span class="material-icons-outlined text-sm text-slate-400">info</span>
                    <span class="text-slate-600 dark:text-slate-400">${info}</span>
                </div>
            </div>

            <div class="space-y-2">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Instructions</p>
                <div class="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <ul class="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4">
                        <li>Read all questions carefully before starting.</li>
                        <li>Ensure all requirements stated in the syllabus are met.</li>
                        <li>Submit strictly before the deadline to avoid penalties.</li>
                        <li>Contact your subject teacher for any clarifications.</li>
                    </ul>
                </div>
            </div>

            <button onclick="closeModal()" class="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Close Details
            </button>
        </div>
    `);
}

// Payment Page Functions
function showReceiptDetails(term, year, amount, date, method, id) {
    showModal('Transaction Receipt', `
        <div class="space-y-6">
            <div class="text-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-700">
                <div class="w-16 h-16 bg-primary/10 text-primary dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span class="material-icons-outlined text-3xl">check_circle</span>
                </div>
                <h4 class="text-lg font-bold">₦${amount}</h4>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Payment Successful</p>
            </div>
            
            <div class="space-y-3">
                <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-500 dark:text-slate-400">Description</span>
                    <span class="font-bold text-slate-900 dark:text-white">${term} (${year})</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-500 dark:text-slate-400">Transaction ID</span>
                    <span class="font-mono text-slate-700 dark:text-slate-300">${id}</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-500 dark:text-slate-400">Date &amp; Time</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-300">${date}</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-500 dark:text-slate-400">Payment Method</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-300">${method}</span>
                </div>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-center gap-3">
                <span class="material-icons-outlined text-primary dark:text-blue-400">info</span>
                <p class="text-[10px] text-primary dark:text-blue-400 font-medium leading-relaxed">
                    This receipt is automatically generated. You can download the PDF version for your official records.
                </p>
            </div>

            <div class="flex gap-3">
                <button onclick="closeModal()" class="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                    Close
                </button>
                <button onclick="downloadReceipt()" class="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Download PDF
                </button>
            </div>
        </div>
    `);
}

function downloadReceipt() {
    const originalBtn = event.target;
    // Handle the case where the clicked element is inside the button (like the icon or text)
    const btn = originalBtn.closest('button');
    if (!btn) return;

    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = `
        <div class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating...</span>
        </div>
    `;

    setTimeout(() => {
        btn.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="material-icons-outlined text-lg">check_circle</span>
                <span>Receipt Saved!</span>
            </div>
        `;
        btn.classList.remove('bg-primary', 'dark:bg-blue-600');
        btn.classList.add('bg-secondary');

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
            btn.classList.remove('bg-secondary');
            btn.classList.add('bg-primary', 'dark:bg-blue-600');
            if (document.getElementById('global-modal') && !document.getElementById('global-modal').classList.contains('hidden')) {
                closeModal();
            }
        }, 2000);
    }, 1500);
}

// Page Transition & Seamless Navigation Logic
document.addEventListener('DOMContentLoaded', () => {
    initSeamlessNavigation();
});

function initSeamlessNavigation() {
    // Intercept all internal links
    const links = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="javascript"])');
    links.forEach(link => {
        // Clone and replace to prevent multiple listeners
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', (e) => {
            const href = newLink.getAttribute('href');
            // Don't intercept if it's the same page or external
            if (href && !href.startsWith('#') && !window.location.href.endsWith(href)) {
                e.preventDefault();
                navigateToPage(href);
            }
        });
    });
}

async function navigateToPage(url) {
    try {
        // Fetch new content
        const response = await fetch(url);
        const html = await response.text();
        
        // Parse HTML
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        const newContent = newDoc.getElementById('page-container');
        
        if (newContent) {
            const currentContainer = document.getElementById('page-container');
            
            // Update URL
            window.history.pushState({}, '', url);
            
            // Smoothly replace content
            if (currentContainer) {
                // Fade out current content
                currentContainer.classList.add('opacity-0');
                
                setTimeout(() => {
                    // Update content
                    currentContainer.innerHTML = newContent.innerHTML;
                    
                    // Update title
                    document.title = newDoc.title;
                    
                    // Re-initialize navigation links in new content
                    initSeamlessNavigation();
                    
                    // Scroll to top
                    window.scrollTo(0, 0);
                    
                    // Fade in new content
                    currentContainer.classList.remove('opacity-0');
                    currentContainer.classList.add('opacity-100');
                    
                    // Update active nav states
                    updateActiveNav(url);
                }, 50);
            } else {
                // Fallback to normal navigation if container missing
                window.location.href = url;
            }
        } else {
            // Fallback for non-portal pages (like landing page if it exists)
            window.location.href = url;
        }
    } catch (error) {
        console.warn('Seamless navigation fetch unavailable, navigating directly:', error);
        window.location.href = url;
    }
}

function updateActiveNav(url) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && url.endsWith(href)) {
            // Mobile Nav & Desktop Nav
            link.classList.remove('text-slate-400', 'dark:text-slate-500', 'hover:bg-slate-50', 'dark:hover:bg-slate-800/50', 'hover:text-slate-700', 'dark:hover:text-slate-200');
            link.classList.add('text-secondary', 'dark:text-yellow-400');
            
            if (link.classList.contains('px-4')) {
                link.classList.remove('font-medium');
                link.classList.add('bg-secondary/10', 'font-bold');
            }
            // Find parent label if exists
            const label = link.querySelector('span:not(.material-icons-outlined)');
            if (label) label.classList.add('font-black');
        } else {
            // Inactive
            link.classList.add('text-slate-400', 'dark:text-slate-500');
            link.classList.remove('text-secondary', 'dark:text-yellow-400', 'font-bold', 'bg-secondary/10');
            
            if (link.classList.contains('px-4')) {
                link.classList.add('hover:bg-slate-50', 'dark:hover:bg-slate-800/50', 'hover:text-slate-700', 'dark:hover:text-slate-200', 'font-medium');
            }
            
            const label = link.querySelector('span:not(.material-icons-outlined)');
            if (label) label.classList.remove('font-black');
        }
    });
}

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    window.location.reload(); 
});

// ─────────────────────────────────────────────────────────────────────────────
// Delegated Student Profile Image Upload Handlers
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#edit-pic-btn');
  if (btn) {
    const fileInput = document.getElementById('profile-pic-input');
    if (fileInput) {
      fileInput.click();
    }
  }
});

document.addEventListener('change', async (e) => {
  if (e.target && e.target.id === 'profile-pic-input') {
    const fileInput = e.target;
    const file = fileInput.files[0];
    if (!file) return;

    const avatarImg = document.getElementById('profile-avatar');
    const spinner = document.getElementById('upload-spinner');

    // Basic client-side validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      if (window.showToast) {
        window.showToast('Invalid file type. Please select a JPG, JPEG, PNG, or WebP image.', 'error');
      } else {
        alert('Invalid file type. Only JPG, JPEG, PNG, and WebP are allowed.');
      }
      fileInput.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      if (window.showToast) {
        window.showToast('File is too large. Maximum size allowed is 5MB.', 'error');
      } else {
        alert('File is too large. Maximum size is 5MB.');
      }
      fileInput.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('profile_pic', file);

    try {
      // Show loading spinner and fade avatar
      if (spinner) spinner.classList.remove('opacity-0', 'pointer-events-none');
      if (avatarImg) avatarImg.classList.add('opacity-50');

      const csrfMeta = document.querySelector('meta[name="csrf-token"]');
      const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';

      const response = await fetch('/student/profile/upload-pic', {
        method: 'POST',
        headers: {
          'CSRF-Token': csrfToken
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Cache bust the newly loaded picture path
        const cacheBuster = '?t=' + new Date().getTime();
        const newSrc = result.filePath + cacheBuster;
        
        if (avatarImg) avatarImg.src = newSrc;
        
        // Synchronize layout-level elements (e.g. desktop sidebar profile pic)
        const sidebarAvatar = document.querySelector('aside img[alt="User Profile"]');
        if (sidebarAvatar) {
          sidebarAvatar.src = newSrc;
        }

        if (window.showToast) {
          window.showToast(result.message, 'success');
        }
      } else {
        throw new Error(result.message || 'Failed to upload profile picture.');
      }
    } catch (error) {
      console.error('[profileUpload]', error);
      if (window.showToast) {
        window.showToast(error.message, 'error');
      } else {
        alert(error.message);
      }
    } finally {
      // Hide loading spinner and reset avatar styling
      if (spinner) spinner.classList.add('opacity-0', 'pointer-events-none');
      if (avatarImg) avatarImg.classList.remove('opacity-50');
      fileInput.value = '';
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Settings Page Support Modals
// ─────────────────────────────────────────────────────────────────────────────
function showHelpCenterModal() {
    closeAllMenus();
    const content = `
        <div class="space-y-5">
            <!-- Header Icon & Badge -->
            <div class="text-center space-y-2">
                <div class="w-14 h-14 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <span class="material-icons-outlined text-3xl">account_balance</span>
                </div>
                <h4 class="text-base font-bold text-slate-900 dark:text-white">Administrative Office Support</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    For all official assistance, student inquiries, technical support, or fee-related matters, please visit the School Administrative Office in person.
                </p>
            </div>

            <!-- Details Cards -->
            <div class="space-y-2.5">
                <div class="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary dark:text-blue-400 shrink-0">
                        <span class="material-icons-outlined text-lg">location_on</span>
                    </div>
                    <div>
                        <p class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Office Location</p>
                        <p class="text-xs font-semibold text-slate-800 dark:text-slate-200">Ground Floor, Admin Building (Room 102)</p>
                    </div>
                </div>

                <div class="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <span class="material-icons-outlined text-lg">schedule</span>
                    </div>
                    <div>
                        <p class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Office Hours</p>
                        <p class="text-xs font-semibold text-slate-800 dark:text-slate-200">Monday – Friday: 8:00 AM – 4:00 PM</p>
                    </div>
                </div>

                <div class="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <div class="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <span class="material-icons-outlined text-lg">contact_phone</span>
                    </div>
                    <div>
                        <p class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Direct Contact</p>
                        <p class="text-xs font-semibold text-slate-800 dark:text-slate-200">+234 (0) 800 123 4567 • info@phronesis.edu</p>
                    </div>
                </div>
            </div>

            <!-- Important Note Banner -->
            <div class="p-3 bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl flex items-start gap-2.5">
                <span class="material-icons-outlined text-primary dark:text-blue-400 text-sm mt-0.5 shrink-0">info</span>
                <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    <span class="font-bold text-slate-800 dark:text-white">Note:</span> Please present your official Student ID card when visiting the administrative office for verification.
                </p>
            </div>

            <!-- Close Button -->
            <button onclick="closeModal()" class="w-full py-3 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                Understood
            </button>
        </div>
    `;
    showModal('Help & Support Center', content, 'max-w-md');
}

function showAboutPhronesisModal() {
    closeAllMenus();
    const content = `
        <div class="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            <!-- Hero Header -->
            <div class="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 p-0.5 mx-auto mb-3 shadow-md">
                    <div class="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                        <img src="images/school_logo.png" alt="Phronesis Sunesis Logo" class="h-10 w-auto object-contain" onerror="this.src='https://via.placeholder.com/40'">
                    </div>
                </div>
                <h4 class="text-base font-black text-slate-900 dark:text-white tracking-wide uppercase">PHRONESIS SUNESIS ACADEMY</h4>
                <p class="text-[11px] font-semibold text-primary dark:text-blue-400 tracking-wider uppercase mt-0.5">Knowledge • Wisdom • Excellence</p>
                <div class="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 mt-2">
                    Established 2012
                </div>
            </div>

            <!-- History Section -->
            <div class="space-y-1.5">
                <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400">Our History</h5>
                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Founded in 2012, Phronesis Sunesis Academy is a premier educational institution built on a foundation of intellectual rigor, moral integrity, and holistic student development. Over the past decade, we have nurtured thousands of scholars into leaders who excel academically and socially across various disciplines.
                </p>
            </div>

            <!-- Mission & Vision -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="p-3.5 bg-primary/5 dark:bg-blue-900/15 border border-primary/10 dark:border-blue-800/30 rounded-xl space-y-1">
                    <div class="flex items-center gap-1.5 text-primary dark:text-blue-400">
                        <span class="material-icons-outlined text-base">flag</span>
                        <h6 class="text-xs font-bold uppercase tracking-wide">Our Mission</h6>
                    </div>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        To empower students through transformative education, critical thinking, and character building in a supportive learning environment.
                    </p>
                </div>

                <div class="p-3.5 bg-secondary/10 dark:bg-amber-900/15 border border-secondary/20 dark:border-amber-800/30 rounded-xl space-y-1">
                    <div class="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <span class="material-icons-outlined text-base">visibility</span>
                        <h6 class="text-xs font-bold uppercase tracking-wide">Our Vision</h6>
                    </div>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        To be a beacon of educational excellence and innovation, producing compassionate leaders prepared for a globalized world.
                    </p>
                </div>
            </div>

            <!-- Core Values -->
            <div class="space-y-2">
                <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400">Core Values</h5>
                <div class="grid grid-cols-2 gap-2">
                    <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                        <span class="material-icons-outlined text-primary text-sm">stars</span>
                        <div>
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Excellence</p>
                            <p class="text-[9px] text-slate-400">High standards</p>
                        </div>
                    </div>
                    <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                        <span class="material-icons-outlined text-emerald-500 text-sm">psychology</span>
                        <div>
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Wisdom</p>
                            <p class="text-[9px] text-slate-400">Sound judgment</p>
                        </div>
                    </div>
                    <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                        <span class="material-icons-outlined text-amber-500 text-sm">verified</span>
                        <div>
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Integrity</p>
                            <p class="text-[9px] text-slate-400">Honesty & ethics</p>
                        </div>
                    </div>
                    <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                        <span class="material-icons-outlined text-purple-500 text-sm">lightbulb</span>
                        <div>
                            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Innovation</p>
                            <p class="text-[9px] text-slate-400">Creative growth</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Close Button -->
            <button onclick="closeModal()" class="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98] mt-2">
                Close Information
            </button>
        </div>
    `;
    showModal('About Phronesis Sunesis Academy', content, 'max-w-lg');
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme & Font Size Preferences Modals
// ─────────────────────────────────────────────────────────────────────────────
function showThemeModal() {
    closeAllMenus();
    const currentMode = localStorage.getItem('appTheme') || 'system';

    const content = `
        <div class="space-y-4">
            <p class="text-xs text-slate-500 dark:text-slate-400">Choose how Phronesis Sunesis Academy looks on your device.</p>

            <div class="space-y-2">
                <!-- Light Mode -->
                <button onclick="selectThemeOption('light')" class="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border ${currentMode === 'light' ? 'border-primary dark:border-blue-400 ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-700/60'} hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center shrink-0">
                            <span class="material-icons-outlined text-lg">light_mode</span>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-900 dark:text-white">Light Mode</p>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400">Clean, bright interface</p>
                        </div>
                    </div>
                    ${currentMode === 'light' ? '<span class="material-icons-outlined text-primary dark:text-blue-400 text-lg">check_circle</span>' : '<span class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"></span>'}
                </button>

                <!-- Dark Mode -->
                <button onclick="selectThemeOption('dark')" class="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border ${currentMode === 'dark' ? 'border-primary dark:border-blue-400 ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-700/60'} hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center shrink-0">
                            <span class="material-icons-outlined text-lg">dark_mode</span>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</p>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400">Dark slate aesthetic, gentle on the eyes</p>
                        </div>
                    </div>
                    ${currentMode === 'dark' ? '<span class="material-icons-outlined text-primary dark:text-blue-400 text-lg">check_circle</span>' : '<span class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"></span>'}
                </button>

                <!-- System Default -->
                <button onclick="selectThemeOption('system')" class="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border ${currentMode === 'system' ? 'border-primary dark:border-blue-400 ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-700/60'} hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 flex items-center justify-center shrink-0">
                            <span class="material-icons-outlined text-lg">settings_suggest</span>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-900 dark:text-white">System Default</p>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400">Match system settings automatically</p>
                        </div>
                    </div>
                    ${currentMode === 'system' ? '<span class="material-icons-outlined text-primary dark:text-blue-400 text-lg">check_circle</span>' : '<span class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"></span>'}
                </button>
            </div>

            <button onclick="closeModal()" class="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all mt-2">
                Cancel
            </button>
        </div>
    `;
    showModal('Theme Preference', content, 'max-w-md');
}

function selectThemeOption(mode) {
    applyAppTheme(mode);
    closeModal();
    if (window.showToast) {
        const names = { light: 'Light Mode', dark: 'Dark Mode', system: 'System Default' };
        showToast(`Theme set to ${names[mode] || mode}`, 'success');
    }
}

function showFontSizeModal() {
    closeAllMenus();
    const currentSize = localStorage.getItem('appFontSize') || 'medium';

    const content = `
        <div class="space-y-4">
            <p class="text-xs text-slate-500 dark:text-slate-400">Adjust the typography size across all screens in the application.</p>

            <div class="space-y-2">
                <!-- Small -->
                <button onclick="selectFontSizeOption('small')" class="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border ${currentSize === 'small' ? 'border-primary dark:border-blue-400 ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-700/60'} hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 shrink-0">
                            A-
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-900 dark:text-white">Small</p>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400">Compact typography view</p>
                        </div>
                    </div>
                    ${currentSize === 'small' ? '<span class="material-icons-outlined text-primary dark:text-blue-400 text-lg">check_circle</span>' : '<span class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"></span>'}
                </button>

                <!-- Medium (Default) -->
                <button onclick="selectFontSizeOption('medium')" class="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border ${currentSize === 'medium' ? 'border-primary dark:border-blue-400 ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-700/60'} hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                            A
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-900 dark:text-white">Medium (Default)</p>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400">Standard balanced typography</p>
                        </div>
                    </div>
                    ${currentSize === 'medium' ? '<span class="material-icons-outlined text-primary dark:text-blue-400 text-lg">check_circle</span>' : '<span class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"></span>'}
                </button>

                <!-- Large -->
                <button onclick="selectFontSizeOption('large')" class="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border ${currentSize === 'large' ? 'border-primary dark:border-blue-400 ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-700/60'} hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-base shrink-0">
                            A+
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-900 dark:text-white">Large</p>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400">Enlarged, high-legibility typography</p>
                        </div>
                    </div>
                    ${currentSize === 'large' ? '<span class="material-icons-outlined text-primary dark:text-blue-400 text-lg">check_circle</span>' : '<span class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"></span>'}
                </button>
            </div>

            <button onclick="closeModal()" class="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all mt-2">
                Cancel
            </button>
        </div>
    `;
    showModal('Font Size Preference', content, 'max-w-md');
}

function selectFontSizeOption(size) {
    applyAppFontSize(size);
    closeModal();
    if (window.showToast) {
        const names = { small: 'Small', medium: 'Medium (Default)', large: 'Large' };
        showToast(`Font size set to ${names[size] || size}`, 'success');
    }
}

function openChangePasswordModal() {
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';

    const content = `
        <form id="change-password-form" action="/student/change-password" method="POST" class="space-y-4 text-left" novalidate>
            <input type="hidden" name="_csrf" value="${csrfToken}">
            
            <!-- Current Password -->
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Current Password</label>
                <div class="relative group">
                    <span class="material-icons-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">lock</span>
                    <input type="password" id="currentPassword" name="currentPassword" required placeholder="••••••••" class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all">
                </div>
            </div>

            <!-- New Password -->
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">New Password</label>
                <div class="relative group">
                    <span class="material-icons-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">vpn_key</span>
                    <input type="password" id="newPassword" name="newPassword" required placeholder="••••••••" class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all">
                </div>
                
                <!-- Password Security Requirements Checklist -->
                <div id="password-requirements" class="mt-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-[11px]">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-[10px] uppercase tracking-wider text-slate-400">Password Requirements</span>
                        <span id="password-strength-badge" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 transition-all">Incomplete</span>
                    </div>
                    
                    <div id="req-length" class="flex items-center gap-2 text-slate-400 dark:text-slate-500 transition-colors duration-200">
                        <span class="material-icons-outlined text-sm status-icon text-slate-400 dark:text-slate-500">cancel</span>
                        <span class="status-label">At least 8 characters long</span>
                    </div>
                    <div id="req-uppercase" class="flex items-center gap-2 text-slate-400 dark:text-slate-500 transition-colors duration-200">
                        <span class="material-icons-outlined text-sm status-icon text-slate-400 dark:text-slate-500">cancel</span>
                        <span class="status-label">At least one uppercase letter (A-Z)</span>
                    </div>
                    <div id="req-lowercase" class="flex items-center gap-2 text-slate-400 dark:text-slate-500 transition-colors duration-200">
                        <span class="material-icons-outlined text-sm status-icon text-slate-400 dark:text-slate-500">cancel</span>
                        <span class="status-label">At least one lowercase letter (a-z)</span>
                    </div>
                    <div id="req-number" class="flex items-center gap-2 text-slate-400 dark:text-slate-500 transition-colors duration-200">
                        <span class="material-icons-outlined text-sm status-icon text-slate-400 dark:text-slate-500">cancel</span>
                        <span class="status-label">At least one number (0-9)</span>
                    </div>
                </div>
            </div>

            <!-- Confirm New Password -->
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Confirm New Password</label>
                <div class="relative group">
                    <span class="material-icons-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">check_circle_outline</span>
                    <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="••••••••" class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all">
                </div>
                <div id="req-match-container" class="mt-2 hidden">
                    <div id="req-match" class="flex items-center gap-1.5 text-[11px] font-medium transition-colors pl-1">
                        <span class="material-icons-outlined text-sm status-icon">cancel</span>
                        <span class="status-text">Passwords do not match</span>
                    </div>
                </div>
            </div>

            <!-- Inline Validation Alert (Fallback / Submit Block message) -->
            <div id="password-validation-alert" class="hidden p-3 rounded-xl text-xs font-medium text-amber-800 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2">
                <span class="material-icons-outlined text-base shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">warning</span>
                <span id="password-validation-alert-text">Please satisfy all password security criteria before updating.</span>
            </div>

            <div class="pt-3 flex gap-3">
                <button type="button" onclick="closeModal()" class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors">
                    Cancel
                </button>
                <button type="submit" id="submit-change-password" disabled class="flex-1 py-3 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:shadow-none">
                    Update Password
                </button>
            </div>
        </form>
    `;
    showModal('Change Password', content, 'max-w-md');

    // Attach real-time evaluation logic once elements are rendered in DOM
    setTimeout(() => {
        const currentInput = document.getElementById('currentPassword');
        const newInput = document.getElementById('newPassword');
        const confirmInput = document.getElementById('confirmPassword');
        const form = document.getElementById('change-password-form');
        const submitBtn = document.getElementById('submit-change-password');
        const alertBox = document.getElementById('password-validation-alert');
        const alertText = document.getElementById('password-validation-alert-text');

        const reqLength = document.getElementById('req-length');
        const reqUpper = document.getElementById('req-uppercase');
        const reqLower = document.getElementById('req-lowercase');
        const reqNumber = document.getElementById('req-number');
        const reqMatchContainer = document.getElementById('req-match-container');
        const reqMatch = document.getElementById('req-match');
        const strengthBadge = document.getElementById('password-strength-badge');

        if (!newInput || !confirmInput || !submitBtn) return;

        function setRequirementState(element, isMet) {
            if (!element) return;
            const icon = element.querySelector('.status-icon');
            if (isMet) {
                element.className = 'flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium transition-colors duration-200';
                if (icon) {
                    icon.textContent = 'check_circle';
                    icon.className = 'material-icons-outlined text-sm status-icon text-emerald-500 dark:text-emerald-400';
                }
            } else {
                element.className = 'flex items-center gap-2 text-slate-400 dark:text-slate-500 transition-colors duration-200';
                if (icon) {
                    icon.textContent = 'cancel';
                    icon.className = 'material-icons-outlined text-sm status-icon text-slate-400 dark:text-slate-500';
                }
            }
        }

        function validateForm() {
            const val = newInput.value;
            const confirmVal = confirmInput.value;
            const currentVal = currentInput ? currentInput.value : '';

            // 1. Evaluate complexity criteria according to backend passwordRegex
            const hasLength = val.length >= 8;
            const hasUpper = /[A-Z]/.test(val);
            const hasLower = /[a-z]/.test(val);
            const hasNumber = /\d/.test(val);

            setRequirementState(reqLength, hasLength);
            setRequirementState(reqUpper, hasUpper);
            setRequirementState(reqLower, hasLower);
            setRequirementState(reqNumber, hasNumber);

            const metCount = [hasLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;

            // Update password strength badge
            if (strengthBadge) {
                if (metCount === 4) {
                    strengthBadge.textContent = 'Strong';
                    strengthBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
                } else if (metCount >= 2) {
                    strengthBadge.textContent = 'Fair';
                    strengthBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
                } else {
                    strengthBadge.textContent = 'Incomplete';
                    strengthBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400';
                }
            }

            // 2. Evaluate confirm password matching
            let isMatch = false;
            if (confirmVal.length > 0) {
                if (reqMatchContainer) reqMatchContainer.classList.remove('hidden');
                const icon = reqMatch ? reqMatch.querySelector('.status-icon') : null;
                const text = reqMatch ? reqMatch.querySelector('.status-text') : null;

                if (val === confirmVal) {
                    isMatch = true;
                    if (reqMatch) reqMatch.className = 'flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 pl-1';
                    if (icon) icon.textContent = 'check_circle';
                    if (text) text.textContent = 'Passwords match';
                } else {
                    isMatch = false;
                    if (reqMatch) reqMatch.className = 'flex items-center gap-1.5 text-[11px] font-medium text-red-600 dark:text-red-400 pl-1';
                    if (icon) icon.textContent = 'cancel';
                    if (text) text.textContent = 'Passwords do not match';
                }
            } else {
                if (reqMatchContainer) reqMatchContainer.classList.add('hidden');
            }

            const allComplexityMet = hasLength && hasUpper && hasLower && hasNumber;
            const currentFilled = currentVal.trim().length > 0;
            const isFormValid = allComplexityMet && isMatch && currentFilled;

            if (isFormValid) {
                submitBtn.removeAttribute('disabled');
                if (alertBox) alertBox.classList.add('hidden');
            } else {
                submitBtn.setAttribute('disabled', 'disabled');
            }

            return { isFormValid, allComplexityMet, isMatch, currentFilled };
        }

        newInput.addEventListener('input', validateForm);
        confirmInput.addEventListener('input', validateForm);
        if (currentInput) currentInput.addEventListener('input', validateForm);

        if (form) {
            form.addEventListener('submit', function(e) {
                const { isFormValid, allComplexityMet, isMatch, currentFilled } = validateForm();
                if (!isFormValid) {
                    e.preventDefault();
                    if (alertBox && alertText) {
                        if (!currentFilled) {
                            alertText.textContent = 'Please enter your current password.';
                        } else if (!allComplexityMet) {
                            alertText.textContent = 'Please meet all password requirements before updating.';
                        } else if (!isMatch) {
                            alertText.textContent = 'New password and confirmation password do not match.';
                        }
                        alertBox.classList.remove('hidden');
                    }
                }
            });
        }

        // Initial validation run
        validateForm();
    }, 50);
}

