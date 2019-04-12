const compilerParams = {
    none: {
        id: 0,
        test: function () {
            return false;
        }
    },
    alphaName: {
        id: 1,
        test: function (param) {
            return /^[a-zA-Z][a-zA-Z0-9]*$/.test(param);
        }
    }
};

const registeredVars = [];
const registeredLabels = [];

const compilerCommands = {
    DEF: {
        param: compilerParams.alphaName,
        action: registerVar,
        isGoodToGo: isVarNotYetRegistered
    }
};

function registerVar(name) {
    if(name.toUpperCase() !== "NULL") {
        registeredVars.push(name);
    }
}

function isVarNotYetRegistered(name) {
    return registeredVars.indexOf(name) < 0 && name.toUpperCase() !== "NULL";
}

function clearRegisteredVars() {
    while(registeredVars.pop() !== undefined){}
}

function registerLabel(name) {
    if(name.toUpperCase() !== "NULL") {
        registeredLabels.push(name);
    }
}

function isLabelNotYetRegistered(name) {
    return registeredLabels.indexOf(name) < 0 && name.toUpperCase() !== "NULL";
}

function clearRegisteredLabels() {
    while(registeredLabels.pop() !== undefined){}
}