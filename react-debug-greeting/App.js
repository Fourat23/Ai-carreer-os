"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
function App({ name = 'le monde' }) {
    return (0, jsx_runtime_1.jsxs)("h1", { children: ["Bonjour, ", name, " !"] });
}
