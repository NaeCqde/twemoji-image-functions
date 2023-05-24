import { Hono } from "hono";
import { cache } from "hono/cache";
import { parse } from "twemoji-parser";

import { AppType, FileExtType } from "./types.d.js";

const app: AppType = new Hono();

const Root = () => {
    return (
        <html>
            <body>
                <a href="https://github.com/NaeCqde/twemoji-image-functions">
                    https://github.com/NaeCqde/twemoji-image-functions
                </a>
            </body>
        </html>
    );
};

app.get("/", (c) => c.html(<Root />));

app.get(
    "/twemoji/:emoji{.+.\\w{3}$}",
    cache({ cacheName: "twemoji", cacheControl: "public, max-age=1209600, s-maxage=5184000" }),
    async (c) => {
        const text = c.req.param("emoji");

        const svgIndex = text.lastIndexOf(".svg");

        const index = svgIndex === -1 ? text.lastIndexOf(".png") : svgIndex;

        if (!index) return c.text("Bad Request", 400);

        const fileExt: FileExtType = text.slice(index + 1) as FileExtType;

        if (Object.values(FileExtType).indexOf(fileExt) >= 0) {
            const codePoints = parse(text.slice(0, index), { assetType: fileExt });

            if (!codePoints.length) return c.text("Bad Request", 400);

            const codePoint = codePoints[0].url;

            let url: string = codePoint;

            if (fileExt === FileExtType.PNG) {
                const size = c.req.query("size") || "72x72";

                if (!size.match(/\d+x\d+/)) return c.text("Bad Request", 400);

                url = url.replace("72x72", size);
            }

            const binary = await fetch(url)
                .then((res) => res.arrayBuffer())
                .catch(async () => null);

            if (binary) {
                const contentType = fileExt === FileExtType.SVG ? "image/svg+xml" : "image/png";

                return c.body(binary, 200, { "content-type": contentType });
            } else {
                return c.text("Internal Server Error", 500);
            }
        } else {
            return c.text("Bad Request", 400);
        }
    }
);

export default app;
