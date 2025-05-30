/**
 * Funções para realizar uploads assinados para o Cloudinary
 */

// Interface para a resposta da API de assinatura
export interface SignedUploadResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  resourceType: string;
}

// Interface para a resposta do upload do Cloudinary
export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  [key: string]: any;
}

export interface UploadOptions {
  resourceType?: 'image' | 'video' | 'auto' | 'raw';
  tags?: string | string[];
  context?: Record<string, any>;
  eager?: any[];
  eager_async?: boolean;
  uploadPreset?: string;
  publicId?: string; // Add publicId to the options interface
}

/**
 * Função para obter uma assinatura para upload no Cloudinary
 */
export async function getSignature(
  folder: string,
  publicId?: string,
  resourceType: 'image' | 'video' | 'auto' | 'raw' = 'auto'
): Promise<SignedUploadResponse> {
  try {
    const endpoint = '/api/cloudinary/sign';
    const payload = {
      folder,
      publicId,
      resourceType,
    };

    console.log('Solicitando assinatura para:', { folder, publicId, resourceType });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na resposta da API de assinatura:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(
        errorData.message || 
        `Falha ao obter assinatura: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    // Validar os dados recebidos
    if (!data.signature || !data.timestamp || !data.cloudName || !data.apiKey) {
      console.error('Dados de assinatura inválidos recebidos:', data);
      throw new Error('Dados de autenticação inválidos recebidos do servidor');
    }
    
    console.log('Assinatura obtida com sucesso para:', data.cloudName);
    return data;
  } catch (error) {
    console.error('Erro ao obter assinatura:', error);
    throw new Error(
      error instanceof Error ? 
      `Falha ao obter assinatura: ${error.message}` : 
      'Erro desconhecido ao obter assinatura'
    );
  }
}

/**
 * Função para realizar upload assinado para o Cloudinary
 */
export async function uploadSignedFile(
  file: File,
  folder: string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResponse> {
  try {
    const formData = new FormData();
    
    // Adicionar parâmetros obrigatórios
    formData.append('file', file);
    formData.append('upload_preset', options.uploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
    formData.append('folder', folder);
    
    // Adicionar public_id se fornecido
    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }

    // Definir o tipo de recurso
    const resourceType = options.resourceType || 'auto';
    formData.append('resource_type', resourceType);
    
    // Adicionar parâmetros opcionais
    if (options.tags) {
      const tagsString = Array.isArray(options.tags) ? options.tags.join(',') : options.tags;
      formData.append('tags', tagsString);
    }
    
    if (options.context) {
      formData.append('context', JSON.stringify(options.context));
    }
    
    // Adicionar transformações eager se fornecidas
    if (options.eager && options.eager.length > 0) {
      formData.append('eager', JSON.stringify(options.eager));
    }
    
    // Configurar eager_async se fornecido
    if (options.eager_async !== undefined) {
      formData.append('eager_async', options.eager_async.toString());
    }
    
    // 4. Fazer upload para o Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Cloudinary upload error:', error);
      throw new Error(error.error?.message || 'Upload failed');
    }

    return await response.json();
  } catch (error: unknown) {
    console.error('Upload error:', error);
    if (error instanceof Error) {
      throw new Error(`Falha ao fazer upload para o Cloudinary: ${error.message}`);
    }
    throw new Error('Falha ao fazer upload para o Cloudinary');
  }
}

/**
 * Criar arquivo JSON para metadados
 */
export function createJsonFile(data: any, filename = 'metadata.json'): File {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  return new File([blob], filename, { type: 'application/json' });
}

/**
 * Upload de arquivo JSON de metadados
 */
export async function uploadMetadata(
  data: any,
  folder: string,
  publicId: string,
  tags?: string | string[]
): Promise<CloudinaryUploadResponse> {
  const metadataFile = createJsonFile(data);
  const tagsToUse = Array.isArray(tags) ? tags.join(',') : tags;
  
  return uploadSignedFile(metadataFile, folder, {
    resourceType: 'raw',
    tags: tagsToUse
  });
}
