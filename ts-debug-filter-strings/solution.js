"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlyStrings = onlyStrings;
function onlyStrings(items) {
    return items.filter((x) => typeof x === 'string');
}
