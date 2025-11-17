import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary usando URL
// Formato: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL);
} else {
  throw new Error('CLOUDINARY_URL não configurada');
}

/**
 * Faz upload de uma imagem para o Cloudinary
 * @param file - Arquivo da imagem (File ou Buffer)
 * @returns URL da imagem no Cloudinary
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    // Converter o arquivo para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload para o Cloudinary usando Promise
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'mural-projetos', // Pasta no Cloudinary
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error('Erro ao fazer upload para Cloudinary:', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
}

export default cloudinary;
