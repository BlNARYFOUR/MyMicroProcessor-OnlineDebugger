"use strict";

document.addEventListener("DOMContentLoaded", init);

function init(e) {
    document.querySelector(".editor-type").addEventListener("input", processProgramInput);
    document.querySelector(".editor-type").addEventListener("scroll", onScroll);
}

function onScroll(e) {
    e.target.parentNode.children[0].scrollTop = e.target.scrollTop;
    e.target.parentNode.children[0].scrollLeft = e.target.scrollLeft;
    e.target.parentNode.parentNode.children[0].scrollTop = e.target.scrollTop;
}

function processProgramInput(e) {
    document.querySelector("#stepForwardBtn").disabled = "disabled";
    clearBuildTerminal();
    clearRegisteredVars();
    clearRegisteredLabels();

    let lines = e.target.innerText.split("\n");
    let lineCount = 1;
    let cmdIndex = 0;
    let instructionIndex = 0;

    let htmlStr = "";

    let lineCountHtml = "";

    for(let i = 0; i < lines.length; i++) {
        let line = lines[i];

        lineCountHtml += "<div>" + (lineCount) + "</div>";
        lineCount++;

        if(line === "") {
            htmlStr += "<br />";
            i++;
        } else {
            htmlStr += "<div>";

            // Search for whitespace
            let res = testAndProcessWhiteSpace(line);
            line = res.line;
            htmlStr += res.htmlRes;

            // Search for command
            res = testAndProcessCommand(line, cmdIndex, instructionIndex);
            cmdIndex = res.cmdIndex;
            instructionIndex = res.instructionIndex;
            line = res.line;
            htmlStr += res.htmlRes;

            if(!res.commandFound) {
                // Search for label, if command has xor yet been found
                res = testAndProcessLabel(line);
                line = res.line;
                htmlStr += res.htmlRes;
            } else {
                // Search for params, if command has been found
                res = processCommandParams(line, res.cmdObj, cmdIndex, instructionIndex);
                cmdIndex = res.cmdIndex;
                line = res.line;
                htmlStr += res.htmlRes;
            }

            // Search for comment
            res = testAndProcessComment(line);
            line = res.line;
            htmlStr += res.htmlRes;

            // Add everything left
            htmlStr += line;
            htmlStr += "</div>";
        }
    }

    lineCountHtml += "<div>&nbsp;</div>";
    document.querySelector(".lineCount").innerHTML = lineCountHtml;

    document.querySelector(".editor-code").innerHTML = htmlStr;

    finishProcess();
}

function finishProcess() {
    let labels = document.querySelectorAll('.jump');
    labels.forEach(label => {
        if(isLabelNotYetRegistered(label.innerText)) {
            label.classList.add("bad");
        }
    });

    let vars = document.querySelectorAll('.var');
    vars.forEach(v => {
        if(isVarNotYetRegistered(v.innerText)) {
            v.classList.add("bad");
        }
    });
}

function testAndProcessWhiteSpace(line) {
    let htmlRes = "";
    let whiteSpaceEndIndex = 0;

    for(let j = 0; j < line.length; j++) {
        let char = line[j];

        if(char !== " " && char !== "\xA0") {
            break;
        }

        htmlRes += char;
        whiteSpaceEndIndex++;
    }

    line = line.slice(whiteSpaceEndIndex);

    return {
        line: line,
        htmlRes: htmlRes
    };
}

function processCommandParams(line, cmdObj, cmdIndex, instructionIndex) {
    let htmlRes = "";
    let param = "";
    let paramEndIndex = 0;

    for(let j = 1; j < line.length; j++) {
        let char = line[j];

        if(char === " " || char === "\xA0" || char === "#") {
            break;
        }

        param += char;
        paramEndIndex++;
    }

    if(cmdObj.param.test(param.toUpperCase())) {
        let isGoodParam = true;
        let extra = "";

        if(0 <= Object.values(compilerCommands).indexOf(cmdObj)) {
            if(cmdObj.isGoodToGo(param)) {
                cmdObj.action(param);
            } else {
                isGoodParam = false;
            }

            if(cmdObj === compilerCommands.DEF) {
                let res = testAndProcessExtraDefParams01(line, paramEndIndex+2);
                if(res.succeeded) {
                    let extra = res.badParam ? " bad" : "";

                    param += '</span> <span class="param param-' + instructionIndex + extra + '">' + res.param;
                    paramEndIndex = res.index-1;
                }

                if(res.extraParam) {
                    res = testAndProcessExtraDefParams02(line, paramEndIndex+2, instructionIndex);
                    if(res.succeeded) {
                        param += '</span> <span class="param param-' + instructionIndex + ' jump">' + res.param;
                        paramEndIndex = res.index-1;
                    }
                }
            }
        } else {
            if(param.toUpperCase() === "NULL") {
                extra += " null";
            } else {
                extra += " cmd-" + cmdIndex;
                cmdIndex++;

                if (cmdObj.param === params.address) {
                    extra += ' var';
                    extra += ' cmd-' + cmdIndex;
                    cmdIndex++;
                    extra += ' cmd-' + cmdIndex;
                    cmdIndex++;
                } else if (cmdObj.param === params.jmpAddress) {
                    extra += ' jump';
                    extra += ' cmd-' + cmdIndex;
                    cmdIndex++;
                    extra += ' cmd-' + cmdIndex;
                    cmdIndex++;
                }
            }
        }

        if(isGoodParam) {
            htmlRes = ' <span class="param param-' + instructionIndex + extra + '">' + param + '</span>';
        } else {
            htmlRes = ' <span class="param param-' + instructionIndex + 'bad">' + param + '</span>';
        }

        line = line.slice(paramEndIndex+1);
    }

    return {
        line: line,
        htmlRes: htmlRes,
        cmdIndex: cmdIndex
    };
}

function testAndProcessExtraDefParams01(line, index) {
    let param = "";
    let paramEndIndex = index;
    let succeeded = false;
    let extraParam = false;
    let badParam = false;

    for(let j = index; j < line.length; j++) {
        let char = line[j];

        if(char === " " || char === "\xA0" || char === "#") {
            break;
        }

        param += char;
        paramEndIndex++;
    }

    if(/^[0-9]+$|^AL$|^AM$|^AH$/.test(param)) {
        if(/^[0-9]+$/.test(param)) {
            badParam = 15 < parseInt(param);
        }

        line = line.slice(paramEndIndex+1);
        succeeded = true;

        if(param === "AL" || param === "AM" || param === "AH") {
            extraParam = true;
        }
    }

    return {
        index: paramEndIndex,
        param: param,
        succeeded: succeeded,
        extraParam: extraParam,
        badParam: badParam
    };
}

function testAndProcessExtraDefParams02(line, index, instructionIndex) {
    let htmlRes = "";
    let param = "";
    let paramEndIndex = index;
    let succeeded = false;

    for(let j = index; j < line.length; j++) {
        let char = line[j];

        if(char === " " || char === "\xA0" || char === "#") {
            break;
        }

        param += char;
        paramEndIndex++;
    }

    if(/^[a-zA-Z][a-zA-Z0-9]*$/.test(param)) {
        htmlRes = '<span class="param param-' + instructionIndex + ' jump">' + param + '</span>';
        line = line.slice(paramEndIndex);
        succeeded = true;
    }

    return {
        index: paramEndIndex,
        param: param,
        succeeded: true
    };
}

function testAndProcessLabel(line) {
    let htmlRes = "";
    let label = "";
    let isLabel = false;
    let labelEndIndex = 0;

    for(let j = 0; j < line.length; j++) {
        let char = line[j];

        if(char === " " || char === "\xA0" || char === "#") {
            break;
        }

        label += char;
        labelEndIndex++;

        if(char === ":") {
            isLabel = true;
            break;
        }
    }

    if(isLabel && /^[a-zA-Z][a-zA-Z0-9]*$/.test(label.slice(0, label.length-1))) {
        let extra = "";

        if(isLabelNotYetRegistered(label.slice(0, label.length-1))) {
            registerLabel(label.slice(0, label.length-1));
        } else {
            extra = " bad";
        }

        htmlRes = '<span class="label' + extra + '">' + label + '</span>';
        line = line.slice(labelEndIndex);
    }

    return {
        line: line,
        htmlRes: htmlRes
    };
}

function testAndProcessCommand(line, cmdIndex, instructionIndex) {
    let htmlRes = "";
    let command = "";
    let commandEndIndex = 0;
    let commandFound = false;
    let cmdObj = null;

    for(let j = 0; j < line.length; j++) {
        let char = line[j];

        if(char === " " || char === "\xA0" || char === "#") {
            break;
        }

        command += char;
        commandEndIndex++;
    }

    if(0 <= Object.keys(instructions).indexOf(command.toUpperCase())) {
        htmlRes = '<span class="instruction cmd-' + cmdIndex + ' instruction-' + instructionIndex + '">' + command + '</span>';
        cmdIndex++;
        instructionIndex++;
        commandFound = true;
        line = line.slice(commandEndIndex);
        cmdObj = instructions[command.toUpperCase()];
    } else if(0 <= Object.keys(compilerCommands).indexOf(command.toUpperCase())) {
        htmlRes = '<span class="instruction cmd-' + cmdIndex + ' instruction-' + instructionIndex + '">' + command + '</span>';
        commandFound = true;
        line = line.slice(commandEndIndex);
        cmdObj = compilerCommands[command.toUpperCase()];
        cmdIndex++;
        instructionIndex++;
    }

    return {
        line: line,
        htmlRes: htmlRes,
        commandFound: commandFound,
        cmdObj: cmdObj,
        cmdIndex: cmdIndex,
        instructionIndex: instructionIndex
    };
}

function testAndProcessComment(line) {
    let htmlRes = "";

    let index = line.indexOf("#");
    if(-1 < index) {
        htmlRes = line.slice(0, index) + '<span class="comment">' + line.slice(index) + '</span>';
        line = "";
    }

    return {
        line: line,
        htmlRes: htmlRes
    };
}
