import { Handler, HandlerResponse } from "@netlify/functions";
import Busboy from "busboy";
import { Readable } from "stream";

/**
 * Share Target Handler (Netlify Function)
 * 
 * This function handles Web Share Target API POST requests as a FALLBACK
 * when the service worker isn't installed yet (first-time users).
 * 
 * Flow:
 * 1. Receive POST with multipart form data (shared file)
 * 2. Parse the file and encode as base64
 * 3. Return an HTML page that:
 *    - Stores the file data in sessionStorage (avoids URL length limits)
 *    - Redirects to the main app
 * 4. Main app reads from sessionStorage and processes the file
 */

// Generate HTML page that stores file in sessionStorage and redirects
function generateShareRedirectPage(fileData: {
  base64: string;
  filename: string;
  mimetype: string;
  type: 'image' | 'audio';
}): string {
  // Escape the base64 string for safe embedding in JavaScript
  const escapedBase64 = fileData.base64.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Processing Shared Content...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .loading {
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e0e0e0;
      border-top-color: #333;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p>Processing shared content...</p>
  </div>
  <script>
    // Store shared file data in sessionStorage
    // This avoids URL length limits that occur with base64 in query params
    try {
      const sharedData = {
        base64: '${escapedBase64}',
        filename: '${fileData.filename.replace(/'/g, "\\'")}',
        mimetype: '${fileData.mimetype.replace(/'/g, "\\'")}',
        type: '${fileData.type}',
        timestamp: Date.now()
      };
      sessionStorage.setItem('sharedContent', JSON.stringify(sharedData));
      console.log('[Share Target] File stored in sessionStorage:', sharedData.filename);
    } catch (e) {
      console.error('[Share Target] Failed to store in sessionStorage:', e);
    }
    
    // Redirect to main app with flag indicating shared content is available
    window.location.replace('/?shared=true');
  </script>
</body>
</html>`;
}

const handler: Handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "text/plain" },
      body: "Method Not Allowed - Share Target only accepts POST requests",
    };
  }

  console.warn("[Share Target] Received POST request");

  return new Promise<HandlerResponse>((resolve) => {
    const busboy = Busboy({
      headers: event.headers,
    });

    const fields: { [key: string]: string } = {};
    const files: { [key: string]: { filename: string; mimetype: string; encoding: string; content: string }[] } = {};

    busboy.on("file", (fieldname: string, file: Readable, filename: string | { filename?: string; mimeType?: string }, encoding: string, mimetype: string) => {
      // Extract mimetype from the filename object if it's an object (busboy v1.x)
      const actualMimetype = typeof filename === 'object' && filename.mimeType ? filename.mimeType : mimetype;
      const actualFilename: string = typeof filename === 'object' && filename.filename ? filename.filename : (typeof filename === 'string' ? filename : 'unknown');

      console.warn(`[Share Target] Receiving file: ${actualFilename} (${actualMimetype})`);

      let fileContent = "";
      file.on("data", (data) => {
        fileContent += data.toString("base64");
      });
      file.on("end", () => {
        if (!files[fieldname]) {
          files[fieldname] = [];
        }
        files[fieldname].push({ 
          filename: actualFilename, 
          mimetype: actualMimetype, 
          encoding, 
          content: fileContent 
        });
        console.warn(`[Share Target] File received: ${actualFilename} (${fileContent.length} bytes base64)`);
      });
    });

    busboy.on("field", (fieldname: string, val: string) => {
      fields[fieldname] = val;
      console.warn(`[Share Target] Field received: ${fieldname}`);
    });

    busboy.on("finish", () => {
      // 'photos' is the field name defined in manifest.json share_target.params.files[0].name
      const sharedFile = files.photos && files.photos[0];

      if (sharedFile && sharedFile.mimetype) {
        let fileType: 'image' | 'audio' | null = null;
        
        if (sharedFile.mimetype.startsWith("image/")) {
          fileType = 'image';
        } else if (sharedFile.mimetype.startsWith("audio/")) {
          fileType = 'audio';
        }

        if (fileType) {
          console.warn(`[Share Target] Generating redirect page for ${fileType}: ${sharedFile.filename}`);
          
          // Return HTML page that stores file in sessionStorage and redirects
          // This avoids URL length limits that would occur with base64 in query params
          const html = generateShareRedirectPage({
            base64: sharedFile.content,
            filename: sharedFile.filename,
            mimetype: sharedFile.mimetype,
            type: fileType
          });

          resolve({
            statusCode: 200,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
            },
            body: html,
          });
          return;
        }
      }

      // If no supported file type, redirect to home
      console.warn("[Share Target] No supported file found, redirecting to home");
      resolve({
        statusCode: 302,
        headers: {
          Location: "/",
        },
        body: "",
      });
    });

    busboy.on("error", (err: Error) => {
      console.error("[Share Target] Busboy error:", err);
      resolve({
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: "Failed to parse multipart form data", 
          details: err.message 
        }),
      });
    });

    // Decode base64 body if needed (Netlify encodes binary data)
    if (event.isBase64Encoded && event.body) {
      busboy.end(Buffer.from(event.body, "base64"));
    } else if (event.body) {
      busboy.end(event.body);
    } else {
      busboy.end();
    }
  });
};

export { handler };