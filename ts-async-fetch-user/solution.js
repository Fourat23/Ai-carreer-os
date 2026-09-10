"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userName = userName;
const store_1 = require("./store");
async function userName(id) {
    const user = await (0, store_1.fetchUser)(id);
    return user ? user.name : 'inconnu';
}
