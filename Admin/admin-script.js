/**
 * Phronesis Admin System - UI Interactions Script
 * Handles mobile menus, modals, image previews, and form submissions.
 */

// --- Shared Notification Panel Injection ---
document.addEventListener('DOMContentLoaded', () => {
    // Only inject if it doesn't already exist (in case of double execution)
    if (!document.getElementById('notification-panel')) {
        const container = document.getElementById('page-container');
        if (container) {
            // Create Global Menu Overlay
            const overlay = document.createElement('div');
            overlay.id = 'menu-overlay';
            overlay.className = 'fixed inset-0 bg-black/50 z-40 hidden backdrop-blur-sm transition-opacity opacity-0';
            overlay.onclick = closeAllMenus;
            container.appendChild(overlay);

            // Create Notification Panel (Matching Student Dashboard styles)
            const panel = document.createElement('div');
            panel.id = 'notification-panel';
            panel.className = 'fixed top-0 right-0 h-full w-[320px] bg-white dark:bg-slate-900 shadow-2xl z-50 transform translate-x-full transition-transform duration-300 ease-in-out border-l border-slate-200 dark:border-slate-800';
            panel.innerHTML = `
              <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <h3 class="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="material-icons-outlined text-primary dark:text-blue-400">notifications</span>
                  Notifications
                </h3>
                <button onclick="toggleNotifications()" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <span class="material-icons-outlined text-slate-500">close</span>
                </button>
              </div>
              <div class="p-4 space-y-4 overflow-y-auto h-[calc(100%-70px)] hide-scrollbar">
                <!-- Registration Alert -->
                <div class="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                  <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/30">
                    <span class="material-icons-outlined text-white text-sm">person_add</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs font-bold text-slate-900 dark:text-white">New Registration Alert</p>
                    <p class="text-[10px] text-slate-600 dark:text-slate-400 mt-1">A new student application (REG-045) has been submitted and is pending review.</p>
                    <span class="text-[9px] text-slate-400 font-medium mt-2 block">10 mins ago</span>
                  </div>
                </div>
                <!-- Payment Update -->
                <div class="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/50">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-500/30">
                    <span class="material-icons-outlined text-white text-sm">payments</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs font-bold text-slate-900 dark:text-white">Payment Confirmed</p>
                    <p class="text-[10px] text-slate-600 dark:text-slate-400 mt-1">₦45,000 tuition fee successfully cleared for Michael (JSS 2).</p>
                    <span class="text-[9px] text-slate-400 font-medium mt-2 block">2 hours ago</span>
                  </div>
                </div>
                <!-- System Maintenance -->
                <div class="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <div class="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-slate-500/30">
                    <span class="material-icons-outlined text-white text-sm">build</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs font-bold text-slate-900 dark:text-white">System Maintenance</p>
                    <p class="text-[10px] text-slate-600 dark:text-slate-400 mt-1">Scheduled database backup will commence at midnight. Minor lag expected.</p>
                    <span class="text-[9px] text-slate-400 font-medium mt-2 block">Yesterday</span>
                  </div>
                </div>
              </div>
            `;
            container.appendChild(panel);
        }
    }
});

// --- Menu Toggles ---
function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    const overlay = document.getElementById('menu-overlay');
    if (!panel || !overlay) return;

    if (panel.classList.contains('translate-x-full')) {
        // Open
        overlay.classList.remove('hidden');
        requestAnimationFrame(() => {
            overlay.classList.remove('opacity-0');
            panel.classList.remove('translate-x-full');
        });
    } else {
        // Close
        panel.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function closeAllMenus() {
    // Close Notifications
    const notifPanel = document.getElementById('notification-panel');
    const overlay = document.getElementById('menu-overlay');
    if (notifPanel && !notifPanel.classList.contains('translate-x-full')) {
        notifPanel.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
    
    // Close Profile (if it exists and is open via this shared script)
    // The profile dropdown toggle is currently handled mostly inline in the HTML files
}

// --- Mobile Navigation ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
    } else {
        menu.classList.add('hidden');
    }
}

// --- View Details Modal ---
function openModal(regId) {
    const modal = document.getElementById('details-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');
    
    if (regId) {
        document.getElementById('modal-reg-id').innerText = '#' + regId;
    }

    // Show modal container
    modal.classList.remove('hidden');
    
    // Trigger animations (slight delay for smooth transition)
    requestAnimationFrame(() => {
        if(backdrop) {
            backdrop.classList.remove('opacity-0');
            backdrop.classList.add('opacity-100');
        }
        
        content.classList.remove('opacity-0', 'translate-y-4', 'sm:translate-y-0', 'sm:scale-95');
        content.classList.add('opacity-100', 'translate-y-0', 'sm:scale-100');
    });
}

function closeModal() {
    const modal = document.getElementById('details-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');
    
    // Reverse animations
    if(backdrop) {
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
    }
    
    content.classList.remove('opacity-100', 'translate-y-0', 'sm:scale-100');
    content.classList.add('opacity-0', 'translate-y-4', 'sm:scale-95');
    
    // Hide modal container after transition finishes (300ms)
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Dummy Delete Action inside Modal
function deleteReg() {
    if (confirm("Are you sure you want to delete this registration record? This action cannot be undone.")) {
        alert("Registration deleted successfully (UI Only).");
        closeModal();
    }
}

// --- Registration Form Scripts ---

// Image Preview for Passport Upload
function previewImage(event) {
    const reader = new FileReader();
    const imageField = document.getElementById("preview-img");
    const placeholder = document.getElementById("preview-placeholder");

    reader.onload = function() {
        if(reader.readyState === 2) {
            imageField.src = reader.result;
            imageField.classList.remove("hidden");
            placeholder.classList.add("hidden");
        }
    }
    
    if (event.target.files[0]) {
        reader.readAsDataURL(event.target.files[0]);
    }
}

// Reset Image Preview when form is reset
function resetImagePreview() {
    const imageField = document.getElementById("preview-img");
    const placeholder = document.getElementById("preview-placeholder");

    imageField.src = "";
    imageField.classList.add("hidden");
    placeholder.classList.remove("hidden");
}

// Handle Form Submission (Dummy logic)
function submitRegistration(event) {
    event.preventDefault(); // Prevent page reload
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<span class="material-icons-outlined animate-spin text-sm">refresh</span> Processing...';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    
    // Simulate network request
    setTimeout(() => {
        alert("Registration submitted successfully! Registration ID: REG-" + Math.floor(Math.random() * 900 + 100));
        
        // Reset form completely
        event.target.reset();
        resetImagePreview();
        
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        
        // Optionally, redirect to dashboard
        // window.location.href = "admin-dashboard.html"; 
    }, 1500);
}
