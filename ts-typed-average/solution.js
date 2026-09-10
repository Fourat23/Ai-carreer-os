"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.average = average;
function average(nums) {
    if (nums.length === 0)
        return 0;
    return nums.reduce((s, n) => s + n, 0) / nums.length;
}
