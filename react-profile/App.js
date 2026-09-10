"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const Avatar_1 = __importDefault(require("./Avatar"));
const Bio_1 = __importDefault(require("./Bio"));
function App({ name = 'Ada', bio = '' }) {
    return ((0, jsx_runtime_1.jsxs)("article", { className: "profile", children: [(0, jsx_runtime_1.jsx)(Avatar_1.default, { name: name }), (0, jsx_runtime_1.jsx)(Bio_1.default, { bio: bio })] }));
}
