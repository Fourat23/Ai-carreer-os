"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countPositives = countPositives;
function countPositives(nums) {
    let count = 0;
    for (const n of nums) {
        if (n > 0)
            count++;
    }
    return count;
}
