"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalPrice = finalPrice;
function finalPrice(price, discountPct) {
    return price * (1 - discountPct / 100);
}
