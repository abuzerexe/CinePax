"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const bcrypt = require('bcrypt');
function testCompare() {
    return __awaiter(this, void 0, void 0, function* () {
        const plain = 'Password123';
        const hash = '$2b$10$ZQ35cDNnh3dttQemfmCGOevV17Qp9U8EEVK7bXJLTq4GL.VY4HOQS'; // your stored hash
        const result = yield bcrypt.compare(plain, hash);
        console.log('Password match?', result);
    });
}
testCompare();
