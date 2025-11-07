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

    busboy.on("file", (fieldname: string, file: Readable, filename: string, encoding: string, mimetype: string) => {
      console.log("Busboy 'file' event:", { fieldname, filename, mimetype, encoding }); // Add this log
      let fileContent = "";
      file.on("data", (data) => {
        fileContent += data.toString("base64"); // Store as base64
      });
      file.on("end", () => {
        if (!files[fieldname]) {
          files[fieldname] = [];
        }
        files[fieldname].push({ filename, mimetype, encoding, content: fileContent });
        console.log("File processed:", files[fieldname]); // Add this log
      });
    });

    busboy.on("field", (fieldname: string, val: string) => {
      fields[fieldname] = val;
    });

    busboy.on("finish", () => {
      console.log("Busboy finished parsing.");
      console.log("Fields:", fields);
      console.log("Files object before processing:", files); // Add this log

      const sharedFile = files.photos && files.photos[0]; // Assuming 'photos' is the fieldname for shared files
      console.log("Shared file after extraction:", sharedFile); // Add this log

      if (sharedFile && sharedFile.mimetype) {
        console.log("Shared file mimetype:", sharedFile.mimetype); // Add this log
        if (sharedFile.mimetype.startsWith("image/")) {
          const redirectUrl = `/?sharedImage=${encodeURIComponent(sharedFile.content)}&filename=${encodeURIComponent(sharedFile.filename)}&mimetype=${encodeURIComponent(sharedFile.mimetype)}`;
          resolve({
            statusCode: 302,
            headers: {
              Location: redirectUrl,
            },
            body: "",
          });
        } else if (sharedFile.mimetype.startsWith("audio/")) {
          const redirectUrl = `/?sharedAudio=${encodeURIComponent(sharedFile.content)}&filename=${encodeURIComponent(sharedFile.filename)}&mimetype=${encodeURIComponent(sharedFile.mimetype)}`;
          resolve({
            statusCode: 302,
            headers: {
              Location: redirectUrl,
            },
            body: "",
          });
        }
      } else {
        console.log("Shared file or mimetype is undefined. Redirecting to home."); // Add this log
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