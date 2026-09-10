"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const Row_1 = __importDefault(require("./Row"));
function App({ items = [], query = '' }) {
    const q = query.toLowerCase();
    return ((0, jsx_runtime_1.jsx)("ul", { children: items.filter((it) => it.toLowerCase().includes(q)).map((it) => ((0, jsx_runtime_1.jsx)(Row_1.default, { label: it }, it))) }));
}
