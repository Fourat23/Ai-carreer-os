"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUser = fetchUser;
const USERS = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Alan' },
];
function fetchUser(id) {
    return Promise.resolve(USERS.find((u) => u.id === id));
}
