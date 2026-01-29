/**
 * Custom Confirmation Modal
 * Replaces native browser confirm dialogs with a styled modal
 */

export function showConfirm(title, message, confirmText = '확인', cancelText = '취소', type = 'danger') {
    return new Promise((resolve) => {
        const modal = createConfirmModal(title, message, confirmText, cancelText, type);
        document.getElementById('modal-container').appendChild(modal);

        // Setup close handlers
        const close = (result) => {
            modal.classList.add('fade-out'); // Add fade-out animation if you implement it
            setTimeout(() => {
                modal.remove();
                resolve(result);
            }, 200); // Wait for animation
        };

        // Confirm Button
        const confirmBtn = modal.querySelector('#confirm-yes-btn');
        confirmBtn.addEventListener('click', () => close(true));

        // Focus confirm button for safety/convenience (or cancel for safety)
        confirmBtn.focus();

        // Cancel Button
        const cancelBtn = modal.querySelector('#confirm-no-btn');
        cancelBtn.addEventListener('click', () => close(false));

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close(false);
        });

        // Close on Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', escHandler);
                close(false);
            }
        };
        document.addEventListener('keydown', escHandler);
    });
}

function createConfirmModal(title, message, confirmText, cancelText, type) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay fade-in';
    modal.style.zIndex = '200'; // Higher than regular modals

    const confirmBtnClass = type === 'danger' ? 'btn-danger' : 'btn-primary';
    const icon = type === 'danger' ? '⚠️' : 'ℹ️';

    modal.innerHTML = `
    <div class="modal confirm-modal" style="max-width: 400px; text-align: center;">
      <div class="modal-body">
        <div style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
        <h3 class="modal-title" style="margin-bottom: 0.5rem; justify-content: center;">${title}</h3>
        <p class="text-secondary" style="margin-bottom: 2rem;">${message.replace(/\n/g, '<br>')}</p>
        
        <div class="flex justify-center gap-md">
          <button class="btn btn-secondary" id="confirm-no-btn">${cancelText}</button>
          <button class="btn ${confirmBtnClass}" id="confirm-yes-btn">${confirmText}</button>
        </div>
      </div>
    </div>
  `;

    return modal;
}
