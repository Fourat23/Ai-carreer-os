"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluck = pluck;
function pluck(items, key) {
    return items.map((it) => it[key]);
}
