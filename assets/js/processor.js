"use strict";

function RAM(memSize) {
    this.memory = [];

    this.get = function (address) {
        if(address < 0 || this.memory.length < address) {
            throw new RangeException("address out of bounds");
        }

        return this.memory[address];
    };

    this.set = function (address, value) {
        if(address < 0 || this.memory.length < address) {
            throw new RangeException("address out of bounds");
        }

        this.memory[address] = value;
    };

    this.reset = function () {
        this.memory = [];

        for(let i = 0; i < memSize; i++) {
            this.memory.push(0);
        }
    };

    this.resetWithBaseData = function (data) {
        this.memory = [];
        if(memSize < data.length) {
            throw new RangeException("data exceeds max. memory size");
        } else {
            let str = '';
            data.forEach((val) => {
                this.memory.push(val);
            });
            console.log(str);
        }

        for(let i = this.memory.length; i < memSize; i++) {
            this.memory.push(0);
        }
    };

    this.size = function () {
        return this.memory.length;
    };

    this.reset();
}

function ALU(amountOfBits) {
    this.overflowVal = Math.pow(2, amountOfBits);
    this.buf = 0;
    this.wreg = 0;
    this.flags = {
        carry: false,
        zero: false,
        update: () => {
            this.flags.carry = this.overflowVal <= this.buf;
            this.flags.zero = this.wreg === 0;
        }
    };

    this.add = function (val) {
        this.buf = this.wreg + val;
        this.wreg = this.buf % this.overflowVal;
        this.flags.update();
    };

    this.subtract = function (val) {
        this.add((val ^ (this.overflowVal - 1)) + 1);
    };

    this.nor = function (val) {
        this.buf = this.wreg + val;
        this.wreg = ~(this.wreg | val);
        this.flags.update();
    };

    this.xor = function (val) {
        this.buf = this.wreg + val;
        this.wreg ^= val;
        this.flags.update();
    };

    this.nand = function (val) {
        this.buf = this.wreg + val;
        this.wreg = ~(this & val);
        this.flags.update();
    };
}

function JumpStack(memSize) {
    this.stack = [];
    this.push = function (address) {
        if(memSize <= this.stack.length) {
            this.stack.shift();
        }
        this.stack.push(address);
    };

    this.pop = function () {
        return this.stack.pop();
    };

    this.isEmpty = function () {
        return this.stack.length === 0;
    }
}

function Processor(bootData) {
    this.halted = false;
    this.RAM = new RAM(4096);
    this.ALU = new ALU(4);
    this.JS = new JumpStack(16);
    this.IC = {
        counter: 0,
        increase: () => {
            this.IC.counter = (this.IC.counter + 1) % this.RAM.size();
        }
    };

    this.RAM.resetWithBaseData(bootData);

    this.executeCommand = () => {
        if(this.halted) {
            return;
        }

        let buf = Object.values(instructions).filter((instruction) => {
            return instruction.code === this.RAM.get(this.IC.counter);
        });

        this.IC.increase();

        //console.log(buf);

        if(1 < buf.length) {
            buf = buf.filter((instruction) => {
                return instruction.subCode === this.RAM.get(this.IC.counter);
            });
            this.IC.increase();
        }

        //console.log(buf);

        let instructionObj = buf[0];

        if(instructionObj.param === params.jmpAddress || instructionObj.param === params.address) {
            let address = this.RAM.get(this.IC.counter) * 256;
            this.IC.increase();
            address += this.RAM.get(this.IC.counter) * 16;
            this.IC.increase();
            address += this.RAM.get(this.IC.counter);
            this.IC.increase();
            instructionObj.action(this, address);
        } else if(instructionObj.param === params.inAddress || instructionObj.param === params.outAddress) {
            let address = this.RAM.get(this.IC.counter);
            this.IC.increase();
            instructionObj.action(this, address);
        } else {
            instructionObj.action(this);
        }
    }
}