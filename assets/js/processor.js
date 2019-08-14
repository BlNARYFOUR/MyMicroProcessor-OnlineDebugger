"use strict";

function RAM(memSize) {
    this.memory = new Array(memSize);

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

    this.setFromArray = function (data) {
        if(memSize < data.length) {
            throw new RangeException("data exceeds max. memory size");
        }
    }
}

function ALU(amountOfBits) {
    this.overflowVal = Math.pow(2, amountOfBits);
    this.buf = 0;
    this.wreg = 0;
    this.flags = {
        carry: false,
        zero: false,
        update: update
    };

    let update = () => {
        this.flags.carry = this.overflowVal <= this.buf;
        this.flags.zero = this.wreg === 0;
    };

    this.add = function (val) {
        this.buf = this.wreg + val;
        this.wreg = this.buf % this.overflowVal;
        this.flags.update();
    };

    this.subtract = function (val) {
        this.add(val ^ (this.overflowVal - 1) + 1);
    };

    this.nor = function (val) {
        this.buf = this.wreg + val;
        this.wreg = ~(this.wreg | val);
    }
}