import fs from "fs";
import path from "path";
import mime from "mime-types";
import express from "express";
import prisma from "./db.js";

const app = express();

const startServer = async (options) => {
    // Check if the port is present.
    if ( ! options.port ) {
        console.error('Port is required');
        return;
    }

    // Check if the origin is present.
    if ( ! options.origin ) {
        console.error('Origin is required');
        return;
    }

    app.listen(options.port, () => {
        console.log(`Server is running on port ${options.port}`);
    });

    app.get("*", async (req, res) => {
        const requestPath = req.path;

        // Check if the file path is present in the database
        const pathData = await prisma.path.findUnique({
            where: {
                requestPath
            }
        });

        if (pathData) {
            const absolutePath = path.resolve(pathData.filePath);

            // Check if this path exists
            if ( fs.existsSync(absolutePath) ) {
                // Send headers
                const headers = JSON.parse(pathData.headers);
                Object.keys(headers).forEach(key => {
                    res.setHeader(key, headers[key]);
                });

                // Send the file to the client
                res.sendFile(absolutePath);
                return;
            }
        }

        // check if file extension is present
        const fileExtension = path.extname(requestPath);

        // File path.
        let filePath = `cache${requestPath}`;

        // Parse the request path with cache directory and append index.
        if ( ! fileExtension ) {
            filePath = path.join(filePath, 'index');
        }

        const urlPath = `${options.origin}${requestPath}`;
        
        const response = await fetch(urlPath);

        // Check if the response is successful
        if (!response.ok) {
            res.status(response.status).send(response.statusText);
            return;
        }

        // Initialize the headers object
        const headers = {};

        // Forward the headers from the origin server to the client
        response.headers.forEach((value, key) => {
            const lowerCaseKey = key.toLowerCase();

            // Skip the content-encoding header and headers containing the word cache
            if (lowerCaseKey !== 'content-encoding' && !lowerCaseKey.includes('x-cache')) {
                headers[key] = value;
                res.setHeader(key, value);
            }
        });

        // Add the x-cache header.
        headers['x-cache'] = 'HIT';

        // Convert the headers object to a string
        const headersString = JSON.stringify(headers);

        const contentType = response.headers.get('content-type');
        if ( ! fileExtension ) {

            // Get file extension from content type
            const ext = mime.extension(contentType);

            // Add file extension to the file path
            filePath = `${filePath}.${ext}`;
        }

        // Create the directory if it doesn't exist
        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        // Save the file to the cache
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        // Store the file path in the database
        try {
            await prisma.path.upsert({
                where: {
                    requestPath
                },
                update: {
                    filePath,
                    contentType,
                    headers: headersString
                },
                create: {
                    requestPath,
                    filePath,
                    contentType,
                    headers: headersString
                }
            });
        } catch (error) {
            res.send('Error');
            return;
        }

        // Send the file to the client
        res.setHeader('x-cache', 'MISS');
        res.sendFile(path.resolve(filePath));
    });
}

export default startServer;