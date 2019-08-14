"use strict";

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
        action: returnInstruction
    },
    HALT: {
        code: 15,
        subCode: 15,
        param: params.none,
        action: halt
    }
};



function nop(processor) {
    console.log("NOP");
}

function movrw(processor, address) {
    console.log("MOVRW", address);
    processor.ALU.wreg = processor.RAM.get(address);
}

function movwr(processor, address) {
    console.log("MOVWR", address);
    processor.RAM.set(address, processor.ALU.wreg);
}

function movwo(processor, address) {
    alert("OUT" + (address < 10 ? "0" + address : address) + ": " + processor.ALU.wreg);
}

function moviw(processor, address) {
    let input = prompt("IN" + (address < 10 ? "0" + address : address), '0');
    processor.ALU.wreg = parseInt(input);
}

function jump(processor, address) {
    console.log("JUMP", address);
    processor.IC.counter = address;
}

function jc(processor, address) {
    if(processor.ALU.flags.carry) {
        console.log("JC", address);
        processor.IC.counter = address;
    } else {
        console.log("JC skipped");
    }
}

function jnc(processor, address) {
    if(!processor.ALU.flags.carry) {
        console.log("JNC", address);
        processor.IC.counter = address;
    } else {
        console.log("JNC skipped");
    }
}

function jz(processor, address) {
    if(processor.ALU.flags.zero) {
        console.log("JZ", address);
        processor.IC.counter = address;
    } else {
        console.log("JZ skipped");
    }
}

function jnz(processor, address) {
    if(!processor.ALU.flags.zero) {
        console.log("JNZ", address);
        processor.IC.counter = address;
    } else {
        console.log("JNZ skipped");
    }
}

function add(processor, address) {
    console.log("ADD", address);
    processor.ALU.add(processor.RAM.get(address));
}

function sub(processor, address) {
    console.log("SUB", address);
    processor.ALU.subtract(processor.RAM.get(address));
}

function nor(processor, address) {
    console.log("NOR", address);
    processor.ALU.nor(processor.RAM.get(address));
}

function xor(processor, address) {
    console.log("XOR", address);
    processor.ALU.xor(processor.RAM.get(address));
}

function nand(processor, address) {
    console.log("NAND", address);
    processor.nand(processor.RAM.get(address));
}

function returnInstruction() {

}

function halt() {

}