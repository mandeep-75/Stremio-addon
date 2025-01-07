const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const cors = require('cors');
const express = require('express');

const app = express();
app.use(cors());

app.use((req, res, next) => {
    console.log("Received request:", req.method, req.url);
    next();
});

const builder = new addonBuilder({
    id: 'org.anyembedaddon',
    version: '1.0.0',
    name: 'Autoembed Strem',
    description: 'Streams movies and TV shows from Autoembed API in an external Autoembed player. Only tested on Android.',
    catalogs: [],
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt', 'tmdb'],
    background: "https://i.ibb.co/8j8rPmt/george-xistris-TSS45gy5e-Qw-unsplash.jpg",
    logo: "https://i.ibb.co/YtFbyJH/streamio-app-logo.webp"
});

builder.defineStreamHandler(async (args) => {
    console.log("Stream Handler Args:", args);

    let apiUrl;

    try {
        if (args.type === 'movie') {
            if (args.id.startsWith("tt")) {
                apiUrl = `https://player.autoembed.cc/embed/movie/${args.id}`;
            } else if (args.id.startsWith("tmdb")) {
                apiUrl = `https://player.autoembed.cc/embed/movie/${args.id}`;
            } else {
                return { streams: [] };
            }
        } else if (args.type === 'series') {
            if (args.id.startsWith("tt")) {
                apiUrl = `https://player.autoembed.cc/embed/tv/${args.id}`;
            } else if (args.id.startsWith("tmdb")) {
                apiUrl = `https://player.autoembed.cc/embed/tv/${args.id}`;
            } else {
                return { streams: [] };
            }

            if (args.season && args.episode) {
                apiUrl += `/${args.season}/${args.episode}`;
            }
        } else {
            return { streams: [] };
        }

        // Adding optional server parameter
        if (args.server) {
            apiUrl += `?server=${args.server}`;
        }

        console.log("Generated API URL:", apiUrl);

        const stream = {
            title: `Watch in an External Player. (Made by Mandeep Singh)`,
            url: apiUrl,
            externalUrl: apiUrl,
            behaviorHints: {
                notWebReady: true,
                proxyHeaders: { externalPlayer: true }
            }
        };

        return { streams: [stream] };
    } catch (error) {
        console.error("Error in Stream Handler:", error);
        return { streams: [] }; // Return an empty stream list on error
    }
});

const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { app }); // No need for app.listen(), serveHTTP already serves the app

console.log(`Addon is running on http://localhost:${PORT}`);
