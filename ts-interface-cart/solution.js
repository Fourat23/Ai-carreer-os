"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalWithTax = totalWithTax;
function totalWithTax(items, taxRate) {
    const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    return Math.round(subtotal * (1 + taxRate) * 100) / 100;
}
