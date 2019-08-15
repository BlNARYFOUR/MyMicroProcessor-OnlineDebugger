"use strict";

let processorMain = null;

document.addEventListener("DOMContentLoaded", init);

function init(e) {
    let inputPins = document.querySelectorAll(".pin-in");

    inputPins.forEach((inputPin) => {
        inputPin.addEventListener("click", onInputPinClick);
    });
}

function onInputPinClick(e) {
    e.target.classList.toggle("active");
}

function startSimulation(e) {
    if(compiler.compiled) {
        processorMain = new Processor(compiler.code);
    }
}

function stepSimulation(processor) {
    if(processor === null) {
        return;
    }

    updateInputPins(processor);

    processor.executeCommand();

    updateOutputPins(processor);
    updateHaltedPin(processor);
}

function updateInputPins(processor) {

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

function updateHaltedPin(processor) {
    if(processor.halted) {
        document.querySelector(".pin.halted").classList.add("active");
    } else {
        document.querySelector(".pin.halted").classList.remove("active");
    }
}
