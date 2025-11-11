import Elysia, { redirect, status } from "elysia";
import { minify } from "html-minifier-terser";
import z from "zod";
import { MongoClient } from 'mongodb';

const html = await minify(await Bun.file('index.html').text(), {
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyURLs: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    keepClosingSlash: true,
});

const client = new MongoClient(process.env.MONGO!);
await client.connect();

const db = client.db('yup');
const links = db.collection('links');

new Elysia()
    .get('/', ({ set }) => {
        set.headers['content-type'] = 'text/html';
        return html;
    })
    .get('/:code', async ({ params: { code } }) => {
        const data = await links.findOne({ code });
        if (!data) {
            return status(404);
        } else {
            return redirect(data.link);
        }
    })
    .post('/v1/link', async ({ body }) => {
        if (body.url.startsWith('https://yup.lol')) return status(400, { success: false, error: "can't shorten a short link" });
        
        let code: string;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
            code = Array.from({length: 5}, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join('');
            attempts++;
        } while (await links.findOne({ code }) && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            return status(500, { success: false, error: "failed to generate unique code" });
        }

        await links.insertOne({
            code,
            link: body.url
        });
        return { success: true, code };
    }, {
        body: z.object({
            url: z.url()
        })
    })
    .listen(process.env.PORT ?? 8080, () => console.log(`Listening on http://localhost:8080`));