"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalValue = totalValue;
const catalog_1 = require("./catalog");
function totalValue(items = catalog_1.CATALOG) {
    return items.reduce((sum, it) => sum + it.price * it.qty, 0);
}
