"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.area = area;
function area(s) {
    switch (s.kind) {
        case 'circle':
            return Math.PI * s.radius * s.radius;
        case 'rect':
            return s.width * s.height;
    }
}
