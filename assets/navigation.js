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

// Modal Management
function showModal(title, contentHtml) {
    const modal = document.getElementById('global-modal');
    const overlay = document.getElementById('menu-overlay');
    const modalTitle = modal.querySelector('#modal-title');
    const modalContent = modal.querySelector('#modal-body');
    const modalContainer = modal.querySelector('.bg-white');

    modalTitle.textContent = title;
    modalContent.innerHTML = contentHtml;

    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    overlay.classList.add('animate-fadeIn');
    modalContainer.classList.add('animate-scaleIn');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('global-modal');
    const overlay = document.getElementById('menu-overlay');
    const modalContainer = modal.querySelector('.bg-white');
    
    modal.classList.add('hidden');
    if (modalContainer) modalContainer.classList.remove('animate-scaleIn');

    if (document.getElementById('notification-panel').classList.contains('translate-x-full') && 
        document.getElementById('profile-dropdown').classList.contains('hidden') &&
        (!document.getElementById('timetable-action-menu') || document.getElementById('timetable-action-menu').classList.contains('hidden'))) {
        overlay.classList.add('hidden');
        overlay.classList.remove('animate-fadeIn');
        document.body.style.overflow = '';
    }
}

// Timetable Actions
function showSubjectDetails(subject) {
    closeAllMenus();
    const details = {
        'Mathematics': { teacher: 'Mr. Thompson', room: 'Room 204', syllabus: 'Algebra & Calculus', time: '8:00 AM - 9:30 AM' },
        'Biology': { teacher: 'Mrs. Phronesis', room: 'Lab 1', syllabus: 'Cell Structure & Genetics', time: '11:00 AM - 12:30 PM' },
        'English': { teacher: 'Ms. Sunesis', room: 'Room 102', syllabus: 'Creative Writing', time: '1:00 PM - 2:00 PM' },
        'English Language': { teacher: 'Mrs. Johnson', room: 'Room 105', syllabus: 'Grammar & Literature', time: '9:30 AM - 10:30 AM' },
        'Chemistry': { teacher: 'Dr. Williams', room: 'Lab 2', syllabus: 'Chemical Reactions', time: '1:15 PM - 2:15 PM' },
        'Physics': { teacher: 'Mr. Anderson', room: 'Room 301', syllabus: 'Quantum Mechanics', time: '2:30 PM - 3:30 PM' }
    };

    const data = details[subject] || { teacher: 'TBD', room: 'TBD', syllabus: 'TBD', time: 'TBD' };
    
    const content = `
        <div class="space-y-4">
            <div class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <span class="material-icons-outlined text-primary">person</span>
                <div>
                    <p class="text-[10px] text-slate-500 uppercase">Teacher</p>
                    <p class="text-sm font-bold">${data.teacher}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <span class="material-icons-outlined text-orange-500">place</span>
                <div>
                    <p class="text-[10px] text-slate-500 uppercase">Location</p>
                    <p class="text-sm font-bold">${data.room}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <span class="material-icons-outlined text-green-500">schedule</span>
                <div>
                    <p class="text-[10px] text-slate-500 uppercase">Schedule</p>
                    <p class="text-sm font-bold">${data.time}</p>
                </div>
            </div>
            <div class="p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                <p class="text-[10px] text-slate-500 uppercase mb-1">Topics</p>
                <p class="text-sm">${data.syllabus}</p>
            </div>
        </div>
    `;
    showModal(`${subject} Details`, content);
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
        alert(`Note saved for ${subject}!`);
        closeModal();
    } else {
        alert('Please enter a note');
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
                    <span class="material-icons-outlined text-blue-500">description</span>
                    <span class="text-sm">Practice Exercises.docx</span>
                </div>
                <span class="material-icons-outlined text-slate-400 text-sm">download</span>
            </a>
            <a href="#" class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary transition-colors">
                <div class="flex items-center gap-3">
                    <span class="material-icons-outlined text-orange-500">slideshow</span>
                    <span class="text-sm">Introduction Slides.pptx</span>
                </div>
                <span class="material-icons-outlined text-slate-400 text-sm">download</span>
            </a>
        </div>
    `;
    showModal(`${subject} Materials`, content);
}

function closeAllMenus() {
    const panel = document.getElementById('notification-panel');
    const dropdown = document.getElementById('profile-dropdown');
    const timetableMenu = document.getElementById('timetable-action-menu');
    const modal = document.getElementById('global-modal');
    const overlay = document.getElementById('menu-overlay');

    if (panel) panel.classList.add('translate-x-full');
    if (dropdown) dropdown.classList.add('hidden');
    if (timetableMenu) {
        timetableMenu.classList.add('hidden');
        timetableMenu.classList.remove('animate-scaleIn');
    }
    if (modal) {
        modal.classList.add('hidden');
        const modalContainer = modal.querySelector('.bg-white');
        if (modalContainer) modalContainer.classList.remove('animate-scaleIn');
    }
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('animate-fadeIn');
    }
    document.body.style.overflow = '';
}

// Close menus on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllMenus();
});

function logout() {
    closeAllMenus();
    const content = `
        <div class="text-center space-y-4">
            <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2 text-red-500">
                <span class="material-icons-outlined text-3xl">logout</span>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to log out of your student portal?</p>
            <div class="flex flex-col gap-2 pt-2">
                <button onclick="confirmLogout()" class="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-900/10">Confirm Logout</button>
                <button onclick="closeModal()" class="w-full py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            </div>
        </div>
    `;
    showModal('Logout Confirmation', content);
}

function confirmLogout() {
    window.location.href = 'index.html';
}

// Results Page Functions
function switchTerm(termNumber, element) {
    // Update button styles
    const buttons = element.parentElement.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-100', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400', 'font-medium');
        btn.classList.remove('font-bold');
    });

    element.classList.remove('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-100', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400', 'font-medium');
    element.classList.add('bg-primary', 'text-white', 'font-bold');

    // In a real app, this would trigger a data fetch/filter
    console.log(`Switching to Term ${termNumber}`);
}

function showSubjectResults(subject, grade, percentage, teacher) {
    closeAllMenus();
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
                        <span class="text-xs font-bold text-green-500">28/30</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-50 dark:border-slate-800">
                        <span class="text-xs font-semibold">Mid-Term Exam</span>
                        <span class="text-xs font-bold text-green-500">18/20</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-50 dark:border-slate-800">
                        <span class="text-xs font-semibold">Final Examination</span>
                        <span class="text-xs font-bold text-primary dark:text-blue-400">46/50</span>
                    </div>
                </div>
            </div>

            <div class="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/20">
                <p class="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider mb-2">Teacher Remark</p>
                <p class="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed">
                    "John has shown exceptional understanding of ${subject} concepts this term. His participation in class discussions is commendable."
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
        btn.classList.replace('bg-primary', 'bg-green-500');
        
        // Mock download notification
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.replace('bg-green-500', 'bg-primary');
            btn.disabled = false;
        }, 2000);
    }, 3000);
}

// Timetable Page Functions
function switchDay(day, element) {
    // Update button styles
    const buttons = element.parentElement.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-100', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400', 'font-medium');
        btn.classList.remove('font-bold');
    });

    element.classList.remove('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-100', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400', 'font-medium');
    element.classList.add('bg-primary', 'text-white', 'font-bold');

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
    const counts = { 'Monday': 5, 'Tuesday': 4, 'Wednesday': 5, 'Thursday': 4, 'Friday': 3 };
    if (classCount) classCount.textContent = `${counts[day] || 0} classes scheduled`;
}

// Assessment Page Functions
function filterAssessments(category, element) {
    // Update button styles
    const buttons = element.parentElement.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white', 'font-bold');
        btn.classList.add('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-100', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400', 'font-medium');
    });

    element.classList.remove('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-100', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400', 'font-medium');
    element.classList.add('bg-primary', 'text-white', 'font-bold');

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
    const modal = document.getElementById('global-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = title;
    
    let typeColor = 'blue';
    if (type === 'Upcoming') typeColor = 'orange';
    if (type === 'Completed') typeColor = 'green';
    if (type === 'Overdue' || title.includes('Mid-Term')) typeColor = 'red';

    modalBody.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-${typeColor}-50 dark:bg-${typeColor}-900/20 text-${typeColor}-600 dark:text-${typeColor}-400 rounded-lg flex items-center justify-center">
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
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Payment Page Functions
function showReceiptDetails(term, year, amount, date, method, id) {
    const modal = document.getElementById('global-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = 'Transaction Receipt';
    
    modalBody.innerHTML = `
        <div class="space-y-6">
            <div class="text-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-700">
                <div class="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
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
                    <span class="text-slate-500 dark:text-slate-400">Date & Time</span>
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
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
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
        btn.classList.add('bg-green-600');

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
            btn.classList.remove('bg-green-600');
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
        console.error('Seamless navigation failed:', error);
        window.location.href = url;
    }
}

function updateActiveNav(url) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && url.endsWith(href)) {
            // Mobile Nav (text/icons)
            link.classList.remove('text-slate-400', 'dark:text-slate-500');
            link.classList.add('text-primary', 'dark:text-blue-400');
            
            // Find parent label if exists
            const label = link.querySelector('span:not(.material-icons-outlined)');
            if (label) label.classList.add('font-black');
        } else {
            link.classList.add('text-slate-400', 'dark:text-slate-500');
            link.classList.remove('text-primary', 'dark:text-blue-400', 'font-bold');
            
            const label = link.querySelector('span:not(.material-icons-outlined)');
            if (label) label.classList.remove('font-black');
        }
    });
}

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    window.location.reload(); 
});
