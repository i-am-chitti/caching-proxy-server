#!/usr/bin/env node

import { program } from "commander";
import startServer from "./server.js";
import prisma from "./db.js";
import fs from "fs";

program.version('1.0.0').description('A caching proxy server');

// Add command to clear the cache
program.command('clear').description('Clear the cache').action(async () => {
    try {
        // Clear the database
        await prisma.path.deleteMany();

        // Remove the cache directory
        fs.rmSync('cache', { recursive: true, force: true });

        console.log('Cache cleared');
    } catch (error) {
        console.error('Error clearing cache');
    }
});

// Add command to start proxy server.
program.command('start').description('Start the proxy server')
    .requiredOption('-p, --port <port>', 'Port to run the server on', '3000')
    .requiredOption('-o, --origin <origin>', 'Origin server to which requests will be forwarded to' ).action((options) => {
        // Validate the port number
        const port = parseInt(options.port);
        if (isNaN(port) || port < 1 || port > 65535) {
            console.error('Invalid port number');
            return;
        }

        // Validate the origin URL
        try {
            new URL(options.origin);
        } catch (error) {
            console.error('Invalid origin URL');
            return;
        }

        startServer(options);
    });

program.parse(process.argv);
