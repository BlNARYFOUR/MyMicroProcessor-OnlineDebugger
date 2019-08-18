"use strict";

class Debugger {
    constructor() {
        this.i = -1;
    }

    static highLightInstruction(cmdIndex, isMainHighlight) {
        let ii = document.querySelectorAll(".cmd-" + cmdIndex);
        ii.forEach(i => {
            i.classList.add("highlight" + (isMainHighlight ? "-main" : ""));
        });
    }

    static stopHighlightingInstruction(cmdIndex) {
        let ii = document.querySelectorAll(".cmd-" + cmdIndex);

        ii.forEach(i => {
            i.classList.remove("highlight","highlight-main");
        });
    }

    singleDebugInc() {
        Debugger.stopHighlightingInstruction(this.i);
        this.i++;
        Debugger.highLightInstruction(this.i);
        outputToTerminal("------------");
        outputToTerminal("ADDRESS: " + this.i);
        outputToTerminal("CMD: " + Object.keys(instructions)[compiler.code[this.i]]);
        outputToTerminal("BINARY: " + (compiler.code[this.i] < 8 ? (compiler.code[this.i] < 4 ? (compiler.code[this.i] < 2 ? "000" : "00") : "0") : "") + compiler.code[this.i].toString(2));
    }
    singleDebugDec() {
        Debugger.stopHighlightingInstruction(this.i);
        this.i--;
        Debugger.highLightInstruction(this.i);
        outputToTerminal("------------");
        outputToTerminal("ADDRESS: " + this.i);
        outputToTerminal("CMD: " + Object.keys(instructions)[compiler.code[this.i]]);
        outputToTerminal("BINARY: " + (compiler.code[this.i] < 8 ? (compiler.code[this.i] < 4 ? (compiler.code[this.i] < 2 ? "000" : "00") : "0") : "") + compiler.code[this.i].toString(2));
    }

    resetSingleDebugInc() {
        Debugger.stopHighlightingInstruction(this.i);
        this.i = -1;
    }
}

let debug = new Debugger();

document.addEventListener("DOMContentLoaded", init);

function init(e) {
    document.querySelector("#stepForwardBtn").addEventListener("click", (e) => stepView(debug));
    document.querySelector("#stepBackBtn").addEventListener("click", (e) => redoView(debug));
    document.querySelector("#build").addEventListener("click", (e) => clearStepView(debug, e));
    document.querySelector(".editor-type").addEventListener("input", (e) => clearStepView(debug, e));
}

function stepView(debug, e) {
    debug.singleDebugInc();
}

function redoView(debug, e) {
    debug.singleDebugDec();
}

function clearStepView(debug, e) {
    debug.resetSingleDebugInc();
}