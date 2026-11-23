export function fecharModalAoClicarFora(dialog, onClose) {
    if (!dialog) return;
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.close();
            if (onClose) onClose();
        }
    });
}
