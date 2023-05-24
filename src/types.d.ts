import { Context, Hono } from "hono";

export type AppType = Hono<{}, any, "">;

export enum FileExtType {
    SVG = "svg",
    PNG = "png",
}
