"use strict";

const compiler = {
    code: [],
    register: {
        labels: [],
        vars: []
    }
};

document.addEventListener("DOMContentLoaded", init);

function init(e) {
    document.querySelector('#build').addEventListener("click", onBuildRequest);
}

function clearTerminal() {
    let terminal = document.querySelector('#terminal');
    terminal.innerHTML = "";
}

function outputToTerminal(message, isError) {
    let terminal = document.querySelector('#terminal');
    terminal.innerHTML += "<div class='" + (isError ? " error" : "") + "'>" + message + "</div>";
    document.getElementById('terminal').scrollTop = document.getElementById('terminal').scrollHeight;
}

function onBuildRequest(e) {
    clearTerminal();
    clearBuildTerminal();
    outputToTerminal("Build started...");
    outputToTerminal("Compiling code...");

    let lineNum = 0;
    let splittedCode = [];

    document.querySelector('.editor-type').innerText.split("\n").forEach(line => {
        lineNum += line === "" ? 0.5 : 1;
        line = lineNum + " " + line;

        let lineWithoutComment = line.split("#")[0];
        let spaceSplitted = lineWithoutComment.split(" ");
        let lineSplitted = [];
        spaceSplitted.forEach(ss => {
            ss.split("\xA0").forEach(s => {
                if(s !== "") {
                    lineSplitted.push(s);
                }
            });
        });

        if(2 <= lineSplitted.length) {
            splittedCode.push(lineSplitted);
        }
    });

    let err = checkCodeValidity(splittedCode);
    if(!err) {
        outputToTerminal("Compiling code finished!");
    } else {
        outputToTerminal(err, true);
        return;
    }

    outputToTerminal("Building code...");

    let codeGen = [];
    let address = 0;

    let registeredLabels = [];
    let registeredVars = [];

    for(let i = 0; i < splittedCode.length; i++) {
        let line = splittedCode[i];
        let lineNum = line[0];
        let command = line[1].toUpperCase();

        let index = Object.keys(instructions).indexOf(command);

        if(-1 < index) {
            let instruction = Object.values(instructions)[index];
            codeGen[address] = Object.keys(instructions)[index];

            if(instruction.param === params.address) {
                if(line[2].toUpperCase() !== "NULL") {
                    address++;
                    codeGen[address] = "VAR=" + line[2] + ".H";
                    address++;
                    codeGen[address] = "VAR=" + line[2] + ".M";
                    address++;
                    codeGen[address] = "VAR=" + line[2] + ".L";
                }
            } else if(instruction.param === params.jmpAddress) {
                if(line[2].toUpperCase() !== "NULL") {
                    address++;
                    codeGen[address] = "LABEL=" + line[2] + ".H";
                    address++;
                    codeGen[address] = "LABEL=" + line[2] + ".M";
                    address++;
                    codeGen[address] = "LABEL=" + line[2] + ".L";
                }
            } else if(instruction.param === params.outAddress) {
                if(line[2].toUpperCase() !== "NULL") {
                    address++;
                    codeGen[address] = parseInt(line[2].toUpperCase().split("OUT").join("")) - 1;
                }
            } else if(instruction.param === params.inAddress) {
                if(line[2].toUpperCase() !== "NULL") {
                    address++;
                    codeGen[address] = parseInt(line[2].toUpperCase().split("IN").join("")) - 1;
                }
            }

            if(instruction.subCode !== undefined) {
                address++;
                codeGen[address] = instruction.subCode;
            }
        }

        index = Object.keys(compilerCommands).indexOf(command);

        if(-1 < index) {
            if(Object.values(compilerCommands)[index] === compilerCommands.DEF) {
                registeredVars[line[2]] = address;

                let str = "DEF=" + line[2] + ",val=";

                if(/^AL$|^AM$|^AH$/.test(line[3])) {
                    str += "A:" + line[4] + "." + line[3][1];
                } else {
                    str += "D:"+ line[3];
                }

                codeGen[address] = str;
            }
        }

        if(/^[a-zA-Z][a-zA-Z0-9]*:$/.test(line[1])) {
            command = line[1];
            let label = command.slice(0, command.length - 1);
            registeredLabels[label] = address;
        } else {
            address++;
        }
    }

    if(4096 < codeGen.length) {
        outputToTerminal("Code length: " + codeGen.length / 2 + " bytes", true);
        outputToTerminal("FATAL: -- Max. code length of 2048 bytes has been exceeded --", true);
        return;
    }

    for(let i = 0; i < codeGen.length; i++) {
        if("string" === typeof codeGen[i]) {
            let cSplitted = codeGen[i].split("=");
            if(cSplitted[0] === "LABEL") {
                let buff = cSplitted[1].split(".");
                let lbl = buff[0];
                let addressPart = buff[1];
                let address = registeredLabels[lbl];
                let addressVal = 0;

                if(addressPart === "H") {
                    addressVal = Math.floor(address / 256);
                } else if(addressPart === "M") {
                    addressVal = Math.floor(address % 256 / 16);
                } else {
                    addressVal = Math.floor(address % 16);
                }

                codeGen[i] = addressVal;
            } else if(cSplitted[0] === "VAR") {
                let buff = cSplitted[1].split(".");
                let lbl = buff[0];
                let addressPart = buff[1];
                let address = registeredVars[lbl];
                let addressVal = 0;

                if(addressPart === "H") {
                    addressVal = Math.floor(address / 256);
                } else if(addressPart === "M") {
                    addressVal = Math.floor(address % 256 / 16);
                } else {
                    addressVal = Math.floor(address % 16);
                }

                codeGen[i] = addressVal;
            } else if(cSplitted[0] === "DEF") {
                let buff = cSplitted[2].split(":");
                let varType = buff[0];

                if(varType === "D") {
                    codeGen[i] = parseInt(buff[1]);
                } else {
                    buff = buff[1].split(".");
                    let lbl = buff[0];
                    let addressPart = buff[1];
                    let address = registeredLabels[lbl];
                    let addressVal = 0;

                    if(addressPart === "H") {
                        addressVal = Math.floor(address / 256);
                    } else if(addressPart === "M") {
                        addressVal = Math.floor(address % 256 / 16);
                    } else {
                        addressVal = Math.floor(address % 16);
                    }

                    codeGen[i] = addressVal;
                }
            } else {
                codeGen[i] = instructions[cSplitted[0]].code;
            }
        }
    }

    compiler.code = codeGen;
    compiler.register.labels = registeredLabels;
    compiler.register.vars = registeredVars;
    console.log(codeGen);

    outputToTerminal("Building code finished!");
    outputToTerminal("Outputting build...");
    showBuildCode(codeGen);
    outputToTerminal("Done!");
    outputToTerminal("Total code size: " + codeGen.length / 2 + " bytes.");

    document.querySelector("#stepForwardBtn").disabled = false;
}

function showBuildCode(code) {
    let html = "";

    code.forEach((c, index) => {
        html += "<span class='cmd-" + index + "'>" + (c < 8 ? (c < 4 ? (c < 2 ? "000" : "00") : "0") : "") + c.toString(2) + "</span> ";
    });

    document.querySelector('#codeBuild').innerHTML = html;
}

function clearBuildTerminal() {
    document.querySelector("#codeBuild").innerHTML = "";
}

function checkCodeValidity(code) {
    let registeredVars = [];
    let registeredLabels = [];

    for(let i = 0; i < code.length; i++) {
        let line = code[i];
        let lineNum = line[0];
        let command = line[1].toUpperCase();

        let index = 0;

        if(-1 < (index = Object.keys(compilerCommands).indexOf(command))) {
            if(Object.values(compilerCommands)[index] === compilerCommands.DEF) {
                if(line[2] !== undefined) {
                    let param1 = line[2];
                    if(/^[a-zA-Z][a-zA-Z0-9]*$/.test(param1) && param1.toUpperCase() !== "NULL") {
                        if(line[3] !== undefined) {
                            let param2 = line[3];
                            if(/^[0-9]+$/.test(param2)) {
                                if(parseInt(param2) <= 15) {
                                    if(line[4] !== undefined) {
                                        let param3 = line[4];
                                        return "On line " + lineNum + ": parameter '" + param3 + "' not expected.";
                                    } else {
                                        if(-1 < registeredVars.indexOf(param1)) {
                                            return "On line " + lineNum + ": duplicate variable: '" + param1 + "'.";
                                        } else {
                                            registeredVars.push(param1);
                                        }
                                    }
                                } else {
                                    return "On line " + lineNum + ": variable: '" + param1 + "' must get a value lower than or equal to 15.";
                                }
                            } else if(/^AL$|^AM$|^AH$/.test(param2)) {
                                if(line[4] !== undefined) {
                                    let param3 = line[4];
                                    if(/^[a-zA-Z][a-zA-Z0-9]*$/.test(param3)) {
                                        if(line[5] !== undefined) {
                                            let param4 = line[5];
                                            return "On line " + lineNum + ": parameter '" + param4 + "' not expected.";
                                        } else {
                                            if(-1 < registeredVars.indexOf(param1)) {
                                                return "On line " + lineNum + ": duplicate variable: '" + param1 + "'.";
                                            } else {
                                                registeredVars.push(param1);
                                            }
                                        }
                                    } else {
                                        return "On line " + lineNum + ": parameter '" + param3 + "' is not a valid label.";
                                    }
                                } else {
                                    return "On line " + lineNum + ": expected a label reference.";
                                }
                            } else {
                                return "On line " + lineNum + ": parameter '" + param2 + "' not of valid value.";
                            }
                        }
                    } else {
                        return "On line " + lineNum + ": '" + param1 + "' is not a valid parameter.";
                    }
                } else {
                    return "On line " + lineNum + ": expected a variable name.";
                }
            }
        } else if(-1 < (index = Object.keys(instructions).indexOf(command))) {
            let commandObj = Object.values(instructions)[index];
            if(commandObj.param === params.address) {
                if(line[2] !== undefined) {
                    let param1 = line[2];
                    if(/^[a-zA-Z][a-zA-Z0-9]*$/.test(param1)) {
                        if(line[3] !== undefined) {
                            let param2 = line[3];
                            return "On line " + lineNum + ": parameter '" + param2 + "' not expected.";
                        }
                    } else {
                        return "On line " + lineNum + ": parameter '" + param1 + "' is not a valid variable name.";
                    }
                } else {
                    return "On line " + lineNum + ": expected a variable name.";
                }
            } else if(commandObj.param === params.jmpAddress) {
                if(line[2] !== undefined) {
                    let param1 = line[2];
                    if(/^[a-zA-Z][a-zA-Z0-9]*$/.test(param1)) {
                        if(line[3] !== undefined) {
                            let param2 = line[3];
                            return "On line " + lineNum + ": parameter '" + param2 + "' not expected.";
                        }
                    } else {
                        return "On line " + lineNum + ": parameter '" + param1 + "' is not a valid label name.";
                    }
                } else {
                    return "On line " + lineNum + ": expected a label name.";
                }
            } else if(commandObj.param === params.none) {
                if(line[2] !== undefined) {
                    let param1 = line[2];
                    return "On line " + lineNum + ": parameter '" + param1 + "' not expected.";
                }
            } else if(commandObj.param === params.inAddress) {
                if(line[2] !== undefined) {
                    let param1 = line[2].toUpperCase();
                    if(/^IN(0[1-9]|1[0-6])$|^NULL$/.test(param1)) {
                        if(line[3] !== undefined) {
                            let param2 = line[3];
                            return "On line " + lineNum + ": parameter '" + param2 + "' not expected.";
                        }
                    } else {
                        return "On line " + lineNum + ": parameter '" + param1 + "' is not a valid input name.";
                    }
                } else {
                    return "On line " + lineNum + ": expected a input name.";
                }
            } else if(commandObj.param === params.outAddress) {
                if(line[2] !== undefined) {
                    let param1 = line[2].toUpperCase();
                    if(/^OUT(0[1-9]|1[0-6])$|^NULL$/.test(param1)) {
                        if(line[3] !== undefined) {
                            let param2 = line[3];
                            return "On line " + lineNum + ": parameter '" + param2 + "' not expected.";
                        }
                    } else {
                        return "On line " + lineNum + ": parameter '" + param1 + "' is not a valid output name.";
                    }
                } else {
                    return "On line " + lineNum + ": expected a output name.";
                }
            }

        } else if(/^.+:+$/.test(line[1])) {
            command = line[1];

            if(/^[a-zA-Z][a-zA-Z0-9]*:$/.test(command)) {
                let label = command.split(':').join("");
                if(-1 < registeredLabels.indexOf(label)) {
                    return "On line " + lineNum + ": duplicate label: '" + label + "'.";
                } else {
                    registeredLabels.push(label);
                }
            } else {
                return "On line " + lineNum + ": parameter '" + command.slice(0, command.length-1) + "' is not a valid label name.";
            }

        } else {
            return "On line " + lineNum + ": '" + command + "' is not a valid command.";
        }
    }

    for(let i = 0; i < code.length; i++) {
        let line = code[i];
        let lineNum = line[0];
        let command = line[1].toUpperCase();

        let index = 0;

        if(-1 < (index = Object.keys(instructions).indexOf(command))) {
            if(Object.values(instructions)[index].param === params.address) {
                if(registeredVars.indexOf(line[2]) < 0 && line[2].toUpperCase() !== "NULL") {
                    return "On line " + lineNum + ": undefined variable: '" + line[2] + "'.";
                }
            } else if(Object.values(instructions)[index].param === params.jmpAddress) {
                if(registeredLabels.indexOf(line[2]) < 0 && line[2].toUpperCase() !== "NULL") {
                    return "On line " + lineNum + ": undefined label: '" + line[2] + "'.";
                }
            }
        }
    }

    return false;
}

