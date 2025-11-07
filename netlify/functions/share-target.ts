import { Handler, HandlerResponse } from "@netlify/functions";
import Busboy from "busboy";
import { Readable } from "stream";

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  return new Promise<HandlerResponse>((resolve) => {
    const busboy = Busboy({
      headers: event.headers,
    });

    const fields: { [key: string]: any } = {};
    const files: { [key: string]: { filename: string; mimetype: string; encoding: string; content: string }[] } = {};

    busboy.on("file", (fieldname: string, file: Readable, filename: any, encoding: string, mimetype: string) => {
      // Extract mimetype from the filename object if it's an object
      const actualMimetype = typeof filename === 'object' && filename.mimeType ? filename.mimeType : mimetype;
      const actualFilename = typeof filename === 'object' && filename.filename ? filename.filename : filename;

      let fileContent = "";
      file.on("data", (data) => {
        fileContent += data.toString("base64"); // Store as base64
      });
      file.on("end", () => {
        if (!files[fieldname]) {
          files[fieldname] = [];
        }
        files[fieldname].push({ filename: actualFilename, mimetype: actualMimetype, encoding, content: fileContent });
      });
    });

    busboy.on("field", (fieldname: string, val: string) => {
      fields[fieldname] = val;
    });

    busboy.on("finish", () => {
      const sharedFile = files.photos && files.photos[0]; // Assuming 'photos' is the fieldname for shared files

      if (sharedFile && sharedFile.mimetype) {
        if (sharedFile.mimetype.startsWith("image/")) {
          const redirectUrl = `/share-redirect.html?base64=${encodeURIComponent(sharedFile.content)}&filename=${encodeURIComponent(sharedFile.filename)}&mimetype=${encodeURIComponent(sharedFile.mimetype)}&type=image`;
          resolve({
            statusCode: 302,
            headers: {
              Location: redirectUrl,
            },
            body: "",
          });
        } else if (sharedFile.mimetype.startsWith("audio/")) {
          const redirectUrl = `/share-redirect.html?base64=${encodeURIComponent(sharedFile.content)}&filename=${encodeURIComponent(sharedFile.filename)}&mimetype=${encodeURIComponent(sharedFile.mimetype)}&type=audio`;
          resolve({
            statusCode: 302,
            headers: {
              Location: redirectUrl,
            },
            body: "",
          });
        }
      }

      // If no image or audio file, redirect to home
      resolve({
        statusCode: 302,
        headers: {
          Location: "/",
        },
        body: "",
      });
    });

    busboy.on("error", (err: Error) => {
      console.error("Busboy error:", err);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to parse multipart form data", details: err.message }),
      });
    });

    // If the body is base64 encoded, decode it before piping to busboy
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