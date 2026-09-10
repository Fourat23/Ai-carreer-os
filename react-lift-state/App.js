"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Display_1 = __importDefault(require("./Display"));
function App({ initial = '', options = [] }) {
    const [selected, setSelected] = (0, react_1.useState)(initial);
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Display_1.default, { value: selected }), options.map((o) => ((0, jsx_runtime_1.jsx)("button", { className: "opt", onClick: () => setSelected(o), children: o }, o)))] }));
}
