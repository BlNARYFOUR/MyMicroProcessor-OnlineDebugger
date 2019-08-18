"use strict";

let processorMain = null;
let prevCmd = 0;
let isSimMode = false;
let interval = null;

document.addEventListener("DOMContentLoaded", init);

function init(e) {
    document.querySelector("#toggleSim").addEventListener("click", toggleSimAndDebug);
    document.querySelector("#runSim").addEventListener("click", (event) => onToggleRunSimulation(processorMain, event));
    document.querySelector("#stepSim").addEventListener("click", (event) => stepSimulation(processorMain, event));
    let inputPins = document.querySelectorAll(".pin-in");

    inputPins.forEach((inputPin) => {
        inputPin.addEventListener("click", onInputPinClick);
    });
}

function toggleSimAndDebug(e) {
    if(isSimMode) {
        disableSim();
    } else {
        enableSim();
    }
}

function disableSim() {
    Debugger.stopHighlightingInstruction(prevCmd);
    disableSimButtons();
    enableDebugButtons();
    document.querySelector('#toggleSim').innerHTML = 'Enable Simulation';
    isSimMode = false;
}

function enableSim() {
    clearStepView(debug);
    startSimulation();
    disableDebugButtons();
    document.querySelector('#toggleSim').innerHTML = 'Disable Simulation';
    isSimMode = true;
}

function enableDebugButtons() {
    let buttons = document.querySelector("#buttons");

    Object.values(buttons.children).forEach((button) => {
        if(button.id !== 'toggleSim') {
            button.disabled = false;
        }
    });
}

function disableDebugButtons() {
    let buttons = document.querySelector("#buttons");

    Object.values(buttons.children).forEach((button) => {
        if(button.id !== 'toggleSim') {
            button.disabled = "disabled";
        }
    });
}

function enableSimButtons() {
    let simButtons = document.querySelector("#simButtons");

    Object.values(simButtons.children).forEach((button) => {
        button.disabled = false;
    });
}

function disableSimButtons() {
    let simButtons = document.querySelector("#simButtons");

    Object.values(simButtons.children).forEach((button) => {
        button.disabled = "disabled";
    });
}

function onInputPinClick(e) {
    e.target.classList.toggle("active");

    if(e.target.classList.contains("clock") && processorMain !== null) {
        if(e.target.classList.contains("active")) {
            processorMain.clock = true;
            stepSimulation(processorMain);
        } else {
            processorMain.clock = false;
        }
    }
}

function startSimulation() {
    if(compiler.compiled) {
        processorMain = new Processor(compiler.code);
    }

    Debugger.highLightInstruction(0);
    prevCmd = 0;
    enableSimButtons();
}

function onToggleRunSimulation(processor, e) {
    if(interval === null) {
        interval = setInterval(() => doHalfSimulation(processor), 250);
        document.querySelector("#runSim").innerHTML = 'Stop';
    } else {
        clearInterval(interval);
        interval = null;
        document.querySelector("#runSim").innerHTML = 'Run';
    }
}

function doHalfSimulation(processor) {
    processor.toggleClock();
    document.querySelector(".pin.clock").classList.toggle("active");

    if(processor.clock) {
        stepSimulation(processor);
    }
}

function stepSimulation(processor, e) {
    if(processor === null) {
        return;
    }

    updateInputPins(processor);

    processor.executeCommand();

    Debugger.stopHighlightingInstruction(prevCmd);
    Debugger.highLightInstruction(processor.IC.counter);
    prevCmd = processor.IC.counter;

    updateOutputPins(processor);
    updateOnHaltState(processor);
}

function updateInputPins(processor) {
    for(let i = 0; i < 8; i++) {
        let inputPins = document.querySelectorAll("[class*='in-" + i + "']");

        let val = 0;
        for(let j = 0; j < inputPins.length; j++) {
            val += inputPins[j].classList.contains("active") ? Math.pow(2, inputPins.length - j - 1) : 0;
        }

        processor.inputModule.set(i, val);
    }
}

function updateOutputPins(processor) {
    for(let i = 0; i < 8; i++) {
        let bitVal = processor.outputModule.get(i).toString(2);

        for(let j=0; j < 4; j++) {
            let ctr = j < bitVal.length ? parseInt(bitVal[bitVal.length - 1 - j]) : 0;
            let pin = document.querySelector(".pin.out-" + i + "-" + j);
            if(ctr) {
                pin.classList.add("active");
            } else {
                pin.classList.remove("active");
            }
        }
    }
}

function updateOnHaltState(processor) {
    if(processor.halted) {
        document.querySelector(".pin.halted").classList.add("active");
        disableSimButtons();
    } else {
        document.querySelector(".pin.halted").classList.remove("active");
    }
}
