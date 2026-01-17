import { Handler } from '@netlify/functions';
import sharp from 'sharp';

export const resizeImage = async (imageBuffer: Buffer, targetWidth?: number): Promise<Buffer> => {
  try {
    console.warn(`Resizing image. Original size: ${imageBuffer.length} bytes`);
    const resizeOptions: { withoutEnlargement: boolean; width?: number } = { withoutEnlargement: true };
    if (targetWidth && typeof targetWidth === 'number') {
      resizeOptions.width = targetWidth;
    } else {
      // Fallback to 1024 if no target width provided
      resizeOptions.width = 1024;
    }

    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(resizeOptions)
      .jpeg() // Force output to JPEG
      .toBuffer();
    console.warn(`Resized image. New size: ${resizedImageBuffer.length} bytes`);
    return resizedImageBuffer;
  } catch (error) {
    console.error("Error resizing image:", error);
    throw error;
  }
};

export const handler: Handler = async (event) => {
  console.warn("Resize image handler started.");
  if (!event.body) {
    console.warn("No event body found.");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No image data provided' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  let imageBuffer: Buffer;
  let originalSize: number;

  try {
    const contentType = event.headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      console.warn("Content-Type is application/json. Parsing JSON body.");
      let body = event.body;
      if (body.charCodeAt(0) === 0xFEFF) { // Handle BOM
        console.warn("BOM found, removing it.");
        body = body.slice(1);
      }
      const parsedBody = JSON.parse(body);
      const { data } = parsedBody;
      imageBuffer = Buffer.from(data, 'base64');
      originalSize = imageBuffer.length;
    } else if (contentType.startsWith('image/')) {
      console.warn(`Content-Type is image type: ${contentType}. Treating body as binary.`);
      if (event.isBase64Encoded) {
        imageBuffer = Buffer.from(event.body, 'base64');
      } else {
        imageBuffer = Buffer.from(event.body, 'binary');
      }
      originalSize = imageBuffer.length;
    } else {
      console.warn(`Unsupported Content-Type: ${contentType}`);
      return {
        statusCode: 415, // Unsupported Media Type
        body: JSON.stringify({ error: `Unsupported Content-Type: ${contentType}` }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    // Get original image metadata
    const originalMetadata = await sharp(imageBuffer).metadata();
    const originalWidth = originalMetadata.width;
    const originalHeight = originalMetadata.height;
    const originalAspectRatio = originalWidth && originalHeight ? originalWidth / originalHeight : undefined;

  console.warn("Calling resizeImage function.");
  // Determine target width as 50% of original width when available
  const targetWidth = originalWidth ? Math.max(1, Math.floor(originalWidth * 0.5)) : undefined;
  const resizedImageBuffer = await resizeImage(imageBuffer, targetWidth);
    console.warn("Resize successful, returning response.");

    // Get resized image metadata
    const resizedMetadata = await sharp(resizedImageBuffer).metadata();
    const resizedWidth = resizedMetadata.width;
    const resizedHeight = resizedMetadata.height;
    const resizedAspectRatio = resizedWidth && resizedHeight ? resizedWidth / resizedHeight : undefined;

    return {
      statusCode: 200,
      body: JSON.stringify({
        resizedImage: resizedImageBuffer.toString('base64'),
        imageStats: {
          originalSize: originalSize,
          resizedSize: resizedImageBuffer.length,
          originalWidth: originalWidth,
          originalHeight: originalHeight,
          originalAspectRatio: originalAspectRatio,
          resizedWidth: resizedWidth,
          resizedHeight: resizedHeight,
          resizedAspectRatio: resizedAspectRatio,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error("Error in resize image handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error resizing image' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};
