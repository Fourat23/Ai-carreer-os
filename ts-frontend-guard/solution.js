"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUser = isUser;
exports.userName = userName;
function isUser(v) {
    return typeof v === 'object' && v !== null
        && typeof v.id === 'number'
        && typeof v.name === 'string';
}
function userName(v) {
    return isUser(v) ? v.name : 'inconnu';
}
