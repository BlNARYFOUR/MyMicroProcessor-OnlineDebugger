const params = {
    none: {
        id: 0,
        test: function (param) {
            return false;
        }
    },
    address: {
        id: 1,
        test: function (param) {
            return /^[a-zA-Z][a-zA-Z0-9]*$/.test(param);
        }
    },
    jmpAddress: {
        id: 2,
        test: function (param) {
            return /^[a-zA-Z][a-zA-Z0-9]*$/.test(param);
        }
    },
    inAddress: {
        id: 3,
        test: function (param) {
            return /^IN(0[1-9]|1[0-6])$|^NULL$/.test(param);
        }
    },
    outAddress: {
        id: 4,
        test: function (param) {
            return /^OUT(0[1-9]|1[0-6])$|^NULL$/.test(param);
        }
    }
};

const instructions = {
    NOP: {
        code: 0,
        param: params.none,
        action: nop
    },
    MOVRW: {
        code: 1,
        param: params.address,
        action: movrw
    },
    MOVWR: {
        code: 2,
        param: params.address,
        action: movwr
    },
    MOVWO: {
        code: 3,
        param: params.outAddress,
        action: movwo
    },
    MOVIW: {
        code: 4,
        param: params.inAddress,
        action: moviw
    },
    JUMP: {
        code: 5,
        param: params.jmpAddress,
        action: jump
    },
    JC: {
        code: 6,
        param: params.jmpAddress,
        action: jc
    },
    JNC: {
        code: 7,
        param: params.jmpAddress,
        action: jnc
    },
    JZ: {
        code: 8,
        param: params.jmpAddress,
        action: jz
    },
    JNZ: {
        code: 9,
        param: params.jmpAddress,
        action: jnz
    },
    ADD: {
        code: 10,
        param: params.address,
        action: add
    },
    SUB: {
        code: 11,
        param: params.address,
        action: sub
    },
    NOR: {
        code: 12,
        param: params.address,
        action: nor
    },
    XOR: {
        code: 13,
        param: params.address,
        action: xor
    },
    NAND: {
        code: 14,
        param: params.address,
        action: nand
    },
    RETURN: {
        code: 15,
        subCode: 0,
        param: params.none,
        action: returnAndHaltInstruction
    },
    HALT: {
        code: 15,
        subCode: 15,
        param: params.none,
        action: returnAndHaltInstruction
    }
};



function nop() {
    console.log("NO OPERATION");
}

function movrw() {

}

function movwr() {

}

function movwo() {

}

function moviw() {

}

function jump() {

}

function jc() {

}

function jnc() {

}

function jz() {

}

function jnz() {

}

function add() {

}

function sub() {

}

function nor() {

}

function xor() {

}

function nand() {

}

function returnAndHaltInstruction() {

}