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
      let fileContent = "";
      file.on("data", (data: Buffer) => {
        fileContent += data.toString("base64"); // Store as base64
      });
      file.on("end", () => {
        if (!files[fieldname]) {
          files[fieldname] = [];
        }
        files[fieldname].push({ filename, mimetype, encoding, content: fileContent });
      });
    });

    busboy.on("field", (fieldname: string, val: string) => {
      fields[fieldname] = val;
    });

    busboy.on("finish", () => {
      console.log("Busboy finished parsing.");
      console.log("Fields:", fields);
      console.log("Files:", files);

      resolve({
        statusCode: 200,
        body: JSON.stringify({
          message: "Content received and parsed successfully!",
          fields,
          files: Object.keys(files).reduce((acc: { [key: string]: any }, key: string) => {
            acc[key] = files[key].map(f => ({ filename: f.filename, mimetype: f.mimetype, encoding: f.encoding, size: f.content.length }));
            return acc;
          }, {}),
        }),
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