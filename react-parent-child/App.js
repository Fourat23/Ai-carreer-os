"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const Menu_1 = __importDefault(require("./Menu"));
function App({ items = [] }) {
    const handlePick = (label) => { console.log('pick', label); };
    return (0, jsx_runtime_1.jsx)(Menu_1.default, { items: items, onPick: handlePick });
}
