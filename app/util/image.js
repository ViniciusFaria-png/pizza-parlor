const IMAGEM_FALLBACK =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
            '<rect width="400" height="300" fill="#efe9e2"/>' +
            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
            'fill="#6b645c" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="600">' +
            'Sem imagem</text></svg>'
    );

export function ehUrlImagemValida(url) {
    if (typeof url !== 'string') return false;
    const limpa = url.trim();
    return limpa.startsWith('http://') || limpa.startsWith('https://');
}

export function obterUrlImagem(url) {
    return ehUrlImagemValida(url) ? url.trim() : IMAGEM_FALLBACK;
}

export function configurarImagem(imgElement, url, altText) {
    imgElement.src = obterUrlImagem(url);
    imgElement.alt = altText || 'Pizza';
    imgElement.onerror = () => {
        imgElement.onerror = null;
        imgElement.src = IMAGEM_FALLBACK;
    };
}

export function configurarPreviewArquivo(fileInput, previewImg) {
    if (!fileInput || !previewImg) return;
    fileInput.addEventListener('change', ({ target }) => {
        const file = target.files && target.files[0];
        if (file) {
            previewImg.src = URL.createObjectURL(file);
            previewImg.classList.remove('hidden');
        } else {
            previewImg.classList.add('hidden');
            previewImg.removeAttribute('src');
        }
    });
}

export async function resolverImagemPizza(fileInput, urlInput) {
    const file = fileInput.files && fileInput.files[0];
    if (file) {
        return uploadParaCloudinary(file);
    }
    return urlInput.value.trim();
}
