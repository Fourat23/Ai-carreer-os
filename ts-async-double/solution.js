"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doubleLater = doubleLater;
async function doubleLater(n) {
    const value = await Promise.resolve(n * 2);
    return value;
}
