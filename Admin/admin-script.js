/**
 * Phronesis Admin System - UI Interactions Script
 * Handles mobile menus, modals, image previews, and form submissions.
 */

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
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
        
        content.classList.remove('opacity-0', 'translate-y-4', 'sm:translate-y-0', 'sm:scale-95');
        content.classList.add('opacity-100', 'translate-y-0', 'sm:scale-100');
    });
}

function closeModal() {
    const modal = document.getElementById('details-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');
    
    // Reverse animations
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    
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
