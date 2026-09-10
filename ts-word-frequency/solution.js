"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frequency = frequency;
function frequency(words) {
    const out = {};
    for (const w of words) {
        out[w] = (out[w] ?? 0) + 1;
    }
    return out;
}
