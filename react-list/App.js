"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const Item_1 = __importDefault(require("./Item"));
function App({ items = [] }) {
    return ((0, jsx_runtime_1.jsx)("ul", { children: items.map((label) => ((0, jsx_runtime_1.jsx)(Item_1.default, { label: label }, label))) }));
}
