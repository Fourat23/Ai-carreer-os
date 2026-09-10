"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Menu;
const jsx_runtime_1 = require("react/jsx-runtime");
const MenuItem_1 = __importDefault(require("./MenuItem"));
function Menu({ items, onPick }) {
    return ((0, jsx_runtime_1.jsx)("ul", { children: items.map((it) => ((0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)(MenuItem_1.default, { label: it, onSelect: onPick }) }, it))) }));
}
