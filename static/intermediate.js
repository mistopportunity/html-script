const FUNCTION_TYPE_CODE = "fnc";
const LIST_TYPE_CODE = "lst";
const ARRAY_TYPE_CODE = "arr";
const VARIABLE_TYPE_CODE = "var";

const MATH_CODE_ADD = "add";
const MATH_CODE_SUBTRACT = "sub";
const MATH_CODE_MULTIPLY = "mtp";
const MATH_CODE_DIVIDE = "div";

const OUTPUT_FUNCTION_NAME = "output";
const JUMP_OP_CODE = "jmp";
const CON_JUMP_OP_CODE = "cjmp";
const BREAK_OP_CODE = "brk";

const DECLARE_OP_CODE = "dec";

const SET_OP_CODE = "set";
const SET_PARAMETER_OP_CODE = "prm";
const REGISTER_OP_CODE = "reg";

const EXECUTE_OP_CODE = "exe";

const outputElement = document.getElementById("output");
function output(text) {
    const paragraph = document.createElement("p");
    paragraph.appendChild(document.createTextNode(text));
    outputElement.appendChild(paragraph);
}

function reverseScopeSearch(name,scope) {
    let searchBlock = scope;
    let lookupValue = undefined;
    do {
        lookupValue = searchBlock[name];
        if(lookupValue !== undefined) {
            return {
                scope: searchBlock,
                value: lookupValue,
                found: true
            }
        } else {
            searchBlock = searchBlock.__internal__.parent;
        }
        if(!searchBlock) {
            return {
                scope: null,
                value: undefined,
                found: false
            }
        }
    } while(true);
}

function processDeclaration(statementOrBlock,blockScope) {
    const variableName = statementOrBlock.imp.name;
    switch(statementOrBlock.imp.type) {
        case VARIABLE_TYPE_CODE:
            blockScope[variableName] = null;
            break;
        case ARRAY_TYPE_CODE:
            blockScope[variableName] = [];
            break;
        case LIST_TYPE_CODE:
            blockScope[variableName] = {};
            break;
        case FUNCTION_TYPE_CODE:
            blockScope[variableName] = statementOrBlock;
            break;
    }
}
function processVariableSet(statementOrBlock,blockScope) {
    const variableName = statementOrBlock.imp.name;
    const scopeResult = reverseScopeSearch(
        variableName,blockScope
    );
    if(scopeResult.found) {
        if(statementOrBlock.type === SET_PARAMETER_OP_CODE) {
            blockScope.__internal__.functionRegister.push(
                blockScope.__internal__.valueRegister
            );
        } else { 
            scopeResult.scope[variableName] = blockScope.__internal__.valueRegister;
        }
    } else {
        throw ReferenceError(`Variable '${variableName}' not declared in any enclosing scopes`);
    }
}

function processRegisterSet(statementOrBlock,blockScope) {
    if(statementOrBlock.imp.value) {
        blockScope.__internal__.valueRegister = statementOrBlock.imp.value;
        return;
    }
    const variableName = statementOrBlock.imp.name;
    const scopeResult = reverseScopeSearch(
        variableName,blockScope
    );
    const variableResult = scopeResult.value;
    if(variableResult) {
        blockScope.__internal__.valueRegister = scopeResult.scope[variableName];
    } else if(scopeResult.found) {
        throw ReferenceError(`Variable '${variableName}' has no value`);
    }  else {
        throw ReferenceError(`Variable '${variableName}' not found in enclosing scopes`);
    }
}

function processFunctionCall(statementOrBlock,blockScope) {
    const functionName = statementOrBlock.imp.name;
    switch(functionName) {
        case OUTPUT_FUNCTION_NAME:
            output(blockScope.__internal__.valueRegister);
            break;
        default:
            const scopeResult = reverseScopeSearch(functionName,blockScope);
            let functionLookup = scopeResult.value;
            if(functionLookup) {
                if(functionLookup.imp.type === FUNCTION_TYPE_CODE) {
                    executeBlock(
                        functionLookup.imp.code,
                        blockScope,
                        function nextScopeParameterizer(nextScope) {
                            blockScope.__internal__.functionRegister.forEach((parameter,index) => {
                                const parameterName = functionLookup.imp.parameters[index];
                                nextScope[parameterName] = parameter;
                            });
                        }
                    );
                    blockScope.__internal__.functionRegister.splice(0);
                } else {
                    throw TypeError(`'${functionName}' is not of type '${FUNCTION_TYPE_CODE}'`);
                }
            } else if(scopeResult.found) {
                throw ReferenceError(`Function by the name '${functioName} was never declared`);
            } else {
                throw ReferenceError(`Function by the name '${functionName}' was not found`);
            }
            break;
    }
}
function modifyValueRegister(operation,registerScope,righthandData) {
    const internalContainer = registerScope.__internal__;
    switch(operation) {
        case MATH_CODE_MULTIPLY:
            internalContainer.valueRegister *= righthandData;
            break;
        case MATH_CODE_DIVIDE:
            internalContainer.valueRegister /= righthandData;
            break;
        case MATH_CODE_SUBTRACT:
            internalContainer.valueRegister -= righthandData;
            break;
        case MATH_CODE_ADD:
            internalContainer.valueRegister += righthandData;
            break;
    }
}
function processBasicArithmetic(statementOrBlock,blockScope) {
    if(statementOrBlock.imp.variableName) {
        const variableName = statementOrBlock.imp.name;
        const scopeResult = reverseScopeSearch(
            variableName,blockScope
        );
        const variableResult = scopeResult.value;
        if(variableResult) {
            const righthandData = scopeResult.scope[variableName];
            modifyValueRegister(statementOrBlock.op,blockScope,righthandData);
        } else if(scopeResult.found) {
            throw ReferenceError(`Variable '${variableName}' has no value`);
        } else {
            throw ReferenceError(`Variable '${variableName}' not found in enclosing scopes`);
        }
    } else if(statementOrBlock.imp.value) {
        const righthandData = statementOrBlock.imp.value;
        modifyValueRegister(statementOrBlock.op,blockScope,righthandData);
    } else {
        throw SyntaxError(`Invalid data for arithmetic operation '${statementOrBlock.op}'`);
    }
}

function executeBlock(data,parentScope,parameterizer) {
    const blockScope = {
        __internal__: {
            functionRegister: [],
            valueRegister: null,
            parent:parentScope
        }
    };
    if(parameterizer) {
        parameterizer.call(null,blockScope);
    }
    for(let i = 0;i<data.length;i++) {
        const statementOrBlock = data[i];
        switch(statementOrBlock.op) {
            case CON_JUMP_OP_CODE:
                break;
            case JUMP_OP_CODE:
                break;
            case BREAK_OP_CODE:
                break;
            case DECLARE_OP_CODE:
                processDeclaration(statementOrBlock,blockScope);
                break;
            case SET_OP_CODE:
            case SET_PARAMETER_OP_CODE:
                processVariableSet(statementOrBlock,blockScope);
                break;
            case REGISTER_OP_CODE:
                processRegisterSet(statementOrBlock,blockScope);
                break;
            case EXECUTE_OP_CODE:
                processFunctionCall(statementOrBlock,blockScope);
                break;
            case MATH_CODE_ADD:
            case MATH_CODE_SUBTRACT:
            case MATH_CODE_MULTIPLY:
            case MATH_CODE_DIVIDE:
                processBasicArithmetic(statementOrBlock,blockScope);
                break;
        }
    };
}
function executeScript(scriptData) {
    const globalScope = {
        __internal__: {
            parent: null
        }
    };
    executeBlock(scriptData,globalScope,null);
}
