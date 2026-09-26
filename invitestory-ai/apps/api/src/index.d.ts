import { Hono } from "hono";
interface Env {
    DB: D1Database;
    R2: R2Bucket;
    AI: any;
}
declare const app: Hono<{
    Bindings: Env;
}, import("hono/types").BlankSchema, "/">;
export default app;
//# sourceMappingURL=index.d.ts.map