/**
 * Global Premium Modal System
 * Replaces native alert() and confirm() with custom glassmorphism modals.
 */

const ModalSystem = {
    init() {
        if (document.getElementById('global-modal')) return;

        const modalHTML = `
            <div id="global-modal" class="modal-overlay">
                <div class="modal-box">
                    <h3 id="modal-title" class="modal-title">Confirmation</h3>
                    <p id="modal-message" class="modal-message">Are you sure you want to proceed?</p>
                    <div class="modal-actions">
                        <button id="modal-cancel" class="modal-btn modal-btn-cancel">Cancel</button>
                        <button id="modal-confirm" class="modal-btn modal-btn-confirm">Confirm</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hide();
        });
    },

    show(title, message, isConfirm = false) {
        return new Promise((resolve) => {
            this.init();
            const modal = document.getElementById('global-modal');
            const titleEl = document.getElementById('modal-title');
            const msgEl = document.getElementById('modal-message');
            const confirmBtn = document.getElementById('modal-confirm');
            const cancelBtn = document.getElementById('modal-cancel');

            titleEl.innerText = title;
            msgEl.innerText = message;
            cancelBtn.style.display = isConfirm ? 'block' : 'none';
            confirmBtn.innerText = isConfirm ? 'Confirm' : 'OK';

            modal.classList.add('active');

            const cleanup = () => {
                modal.classList.remove('active');
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
            };

            const onConfirm = () => { cleanup(); resolve(true); };
            const onCancel = () => { cleanup(); resolve(false); };

            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
        });
    },

    hide() {
        const modal = document.getElementById('global-modal');
        if (modal) modal.classList.remove('active');
    }
};

// Global helpers
window.showAlert = (message, title = 'Alert') => ModalSystem.show(title, message, false);
window.showConfirm = (message, title = 'Confirm Action') => ModalSystem.show(title, message, true);

// Initialize on load
document.addEventListener('DOMContentLoaded', () => ModalSystem.init());
