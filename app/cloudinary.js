'use strict';

const CLOUD_NAME = 'jlyz9dxn';
const UPLOAD_PRESET = 'catapimbas-reboliço';

const uploadParaCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Erro no upload para o Cloudinary: ${response.status}`);
    }

    const data = await response.json();
    return data.secure_url;
};
