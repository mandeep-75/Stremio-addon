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
    id: 'org.vidsrcaddon',
    version: '1.0.0',
    name: 'VidSrc strem made by Mandeep Singh',
    description: 'Streams movies and TV shows from Vidsrc API in an external player.',
    catalogs: [],
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt', 'tmdb']
});

builder.defineStreamHandler(async (args) => {
    console.log("Stream Handler Args:", args);

    let apiUrl;

    try {
        if (args.type === 'movie') {
            if (args.id.startsWith("tt")) {
                apiUrl = `https://vidsrc.xyz/embed/movie?imdb=${args.id}`;
            } else if (args.id.startsWith("tmdb")) {
                apiUrl = `https://vidsrc.xyz/embed/movie?tmdb=${args.id}`;
            } else {
                return { streams: [] };
            }
        } else if (args.type === 'series') {
            if (args.id.startsWith("tt")) {
                apiUrl = `https://vidsrc.xyz/embed/tv?imdb=${args.id}`;
            } else if (args.id.startsWith("tmdb")) {
                apiUrl = `https://vidsrc.xyz/embed/tv?tmdb=${args.id}`;
            } else {
                return { streams: [] };
            }

            if (args.season && args.episode) {
                apiUrl += `&season=${args.season}&episode=${args.episode}`;
            }
        } else {
            return { streams: [] };
        }

        console.log("Generated API URL:", apiUrl);

        const stream = {
            title: "Watch on VidSrc Player",
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
