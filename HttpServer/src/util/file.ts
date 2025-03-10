import fs from "fs";

export function readJsonConfig(name: string): any {
    return JSON.parse(fs.readFileSync(`./${name}.json`, 'utf-8'));
}
