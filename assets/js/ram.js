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
}