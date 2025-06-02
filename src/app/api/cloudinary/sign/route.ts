import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Função para criar a assinatura do Cloudinary
function generateSignature(params: Record<string, any>, apiSecret: string) {
  // Ordenar os parâmetros por chave
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  // Criar a string para assinatura
  const signString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(',') : value}`)
    .join('&');

  // Criar a assinatura SHA-1
  return crypto
    .createHash('sha1')
    .update(signString + apiSecret)
    .digest('hex');
}

export async function POST(request: Request) {
  try {
    // Obter os dados do request
    const { folder, publicId, type = 'upload', resourceType = 'auto' } = await request.json();
    
    // Verificar se as variáveis de ambiente estão configuradas
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
    if (!apiSecret || !apiKey || !cloudName) {
      return NextResponse.json(
        { error: 'Cloudinary configuration is missing' },
        { status: 500 }
      );
    }
    
    // Criar timestamp para a assinatura
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Parâmetros para a assinatura
    const params: Record<string, any> = {
      timestamp,
      folder,
      resource_type: resourceType
    };
    
    // Adicionar publicId se fornecido
    if (publicId) {
      params.public_id = publicId;
    }
    
    // Gerar a assinatura
    const signature = generateSignature(params, apiSecret);
    
    // Retornar os dados necessários para o upload
    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
      resourceType
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
