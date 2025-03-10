import { test } from "./controller/test.controller";

export default function (app) {
    return app
        .post('/test', test)
}