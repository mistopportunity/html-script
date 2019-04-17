const UNSET_VALUE_REGISTER = "The value register in this scope was never set before its use";
const INVALID_OPERATION_CODE = "Invalid operation code";
const MISSING_JUMP_PARAMETERS = "A jump operation is missing a type or a index in one of its jump blocks";
const IMPOSSIBLE_TRUTH = "Cannot evaluate the truth of an undefined value";
const MISSING_SCOPE_CODE = "Scope block operation is missing a code block";

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
    const typeCode = statementOrBlock.imp.type;
    switch(typeCode) {
        case VARIABLE_TYPE_CODE:
            blockScope[variableName] = null;
            break;
        case ENUMERABLE_TYPE_CODE:
            blockScope[variableName] = {
                type: ENUMERABLE_TYPE_CODE,
                array: [],
                list: {},
                lifetimeEntityCount: 0
            };
            if(statementOrBlock.imp.values === undefined) {

            } else {

            }
            //TODO, load start values or values from register enumerable into list
            break;
        case FUNCTION_TYPE_CODE:
            blockScope[variableName] = statementOrBlock.imp;
            break;
        default:
            throw SyntaxError(`'${statementOrBlock.imp.type}' is not a valid declaration type code`);
    }
}
function processVariableSet(statementOrBlock,blockScope) {
    const hasCustomImp = statementOrBlock.imp ? true : false;
    const variableName = hasCustomImp ? statementOrBlock.imp.name : undefined;
    if(variableName === undefined) {
        if(statementOrBlock.op === SET_PARAMETER_OP_CODE) {
            if(hasCustomImp && statementOrBlock.imp.value !== undefined) {
                blockScope.__internal__.functionRegister.push(
                    statementOrBlock.imp.value
                );
            } else if(blockScope.__internal__.valueRegister !== undefined) {
                blockScope.__internal__.functionRegister.push(
                    blockScope.__internal__.valueRegister
                );
            } else {
                throw ReferenceError(UNSET_VALUE_REGISTER);
            }
        } else {
            throw SyntaxError(INVALID_OPERATION_CODE);
        }
        return;
    }
    const scopeResult = reverseScopeSearch(
        variableName,blockScope
    );
    if(scopeResult.found) {
        if(statementOrBlock.op === SET_PARAMETER_OP_CODE) {
            if(scopeResult.value !== undefined) {
                blockScope.__internal__.functionRegister.push(
                    scopeResult.value
                );
            } else {
                throw ReferenceError(`Variable '${variableName}' is declared but it has no value`);
            }
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
    if(variableResult !== undefined) {
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
            if(functionLookup !== undefined) {
                if(functionLookup.type === FUNCTION_TYPE_CODE) {
                    executeBlock(
                        functionLookup.code,
                        blockScope,
                        function nextScopeParameterizer(nextScope) {
                            blockScope.__internal__.functionRegister.forEach((parameter,index) => {
                                const parameterName = functionLookup.parameters[index];
                                nextScope[parameterName] = parameter;
                            });
                        }
                    );
                } else {
                    throw TypeError(`'${functionName}' is not of type '${FUNCTION_TYPE_CODE}'`);
                }
            } else if(scopeResult.found) {
                throw ReferenceError(`Function by the name '${functionName} was never declared`);
            } else {
                throw ReferenceError(`Function by the name '${functionName}' was not found`);
            }
            break;
    }
    blockScope.__internal__.functionRegister.splice(0);
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
        if(variableResult !== undefined) {
            const righthandData = scopeResult.scope[variableName];
            modifyValueRegister(statementOrBlock.op,blockScope,righthandData);
        } else if(scopeResult.found) {
            throw ReferenceError(`Variable '${variableName}' has no value`);
        } else {
            throw ReferenceError(`Variable '${variableName}' not found in enclosing scopes`);
        }
    } else if(statementOrBlock.imp.value !== undefined) {
        const righthandData = statementOrBlock.imp.value;
        modifyValueRegister(statementOrBlock.op,blockScope,righthandData);
    } else {
        throw SyntaxError(`Invalid data for arithmetic operation '${statementOrBlock.op}'`);
    }
}
function truthEvaluation(value) {
    if(value === undefined) {
        throw ReferenceError(IMPOSSIBLE_TRUTH);
    }
    const type = typeof value;
    switch(typeof value) {
        case "string":
            return true;
        case "number":
            return !isNaN(value);
        case "boolean":
            return value;
        case "object":
            return value !== null;
        default:
            console.warn(`Unknown type (${type}) for '${value}'`);
            return false;
    }
}
function processJumpBlock(block,index) {
    if(block.index !== undefined && block.type !== undefined) {
        switch(block.type) {
            case STATIC_JUMP_TYPE:
                return block.index - 1;
            case DYNAM_JUMP_TYPE:
                return index - 1 + block.index;
            default:
                throw SyntaxError(`Jump type '${block.type}' is invalid for jump blocks`);
        }
    } else {
        throw SyntaxError(MISSING_JUMP_PARAMETERS);
    }
}
function processComparisonValue(value,blockScope) {
    if(value === undefined) {
        return blockScope.__internal__.valueRegister;
    } else {
        const searchResult = reverseScopeSearch(value,blockScope);
        if(searchResult.found) {
            if(searchResult.value !== undefined) {
                return searchResult.value;
            } else {
                throw ReferenceError(`Variable '${value}' has no value`);
            }
        } else {
            throw ReferenceError(`Variable '${value}' not found in enclosing scopes`);
        }
    }
}
function comparisonEvaluation(type,leftValue,rightValue) {
    //TODO: Implement type checking or eh?
    switch(type) {
        case CMP_EQUAL:
            return truthEvaluation(leftValue) === truthEvaluation(rightValue);
        case CMP_NOT_EQUAL:
            return truthEvaluation(leftValue) !== truthEvaluation(rightValue);
        case CMP_GREATER_THAN:
            return leftValue > rightValue;
        case CMP_LESS_THAN:
            return leftValue < rightValue;
        case CMP_GREATER_OR_EQUAL:
            return leftValue >= rightValue;
        case CMP_LESS_OR_EQUAL:
            return leftValue <= rightValue;
        case CMP_OR:
            return truthEvaluation(leftValue) | truthEvaluation(rightValue);
        case CMP_AND:
            return truthEvaluation(leftValue) & truthEvaluation(rightValue);
        default:
            throw SyntaxError(`Comparison type '${statementOrBlock.imp.type}' is not recognized`);
    }
}
function processComparison(statementOrBlock,blockScope) {
    let leftValue = processComparisonValue(statementOrBlock.imp.left,blockScope);
    let rightValue = processComparisonValue(statementOrBlock.imp.right,blockScope);
    blockScope.__internal__.valueRegister = comparisonEvaluation(statementOrBlock.imp.type,leftValue,rightValue);
}
function processScopeBlock(statementOrBlock,blockScope) {
    if(statementOrBlock.imp && statementOrBlock.imp.code) {
        executeBlock(statementOrBlock.imp.code,blockScope,null);
    } else {
        throw SyntaxError(MISSING_SCOPE_CODE);
    }
}
//TODO all of these bad boys
function processEnumerableChange(statementOrBlock,blockScope) {
}
function processGetEnumerableIndex(statementOrBlock,blockScope) {
}
function processGetEnumerableSize(statementOrBlock,blockScope) {
}
function processEnumerableContains(statementOrBlock,blockScope) {
}
function processGetEnumerableValueCount(statementOrBlock,blockScope) {
}
function executeBlock(data,parentScope,parameterizer) {
    const scopeLevel = parentScope ? parentScope.__internal__.level + 1 : 0;
    const blockScope = {
        __internal__: {
            functionRegister: [],
            valueRegister: undefined,
            parent:parentScope,
            level: scopeLevel
        }
    };
    if(parameterizer) {
        parameterizer.call(null,blockScope);
    }
    for(let i = 0;i<data.length;i++) {
        const statementOrBlock = data[i];
        switch(statementOrBlock.op) {
            case RETURN_OP_CODE:
                let value = blockScope.__internal__.valueRegister;
                if(statementOrBlock.imp) {
                    if(statementOrBlock.imp.value !== undefined) {
                        value = statementOrBlock.imp.value;
                    } else if(statementOrBlock.imp.name !== undefined) {
                        processRegisterSet(statementOrBlock,blockScope);
                        value = blockScope.__internal__.valueRegister;
                    }
                }
                if(parentScope) {
                    parentScope.__internal__.valueRegister = value;
                }
                return;
            case CON_JUMP_OP_CODE:
                const valueRegister = blockScope.__internal__.valueRegister;
                if(valueRegister !== undefined) {
                    const conditionIsTrue = truthEvaluation(valueRegister);
                    let jumpBlock;
                    if(conditionIsTrue) {
                        jumpBlock = statementOrBlock.imp.true;
                    } else {
                        jumpBlock = statementOrBlock.imp.false;
                    }
                    i = processJumpBlock(jumpBlock,i);
                } else {
                    throw ReferenceError(UNSET_VALUE_REGISTER);
                }
                break;
            case JUMP_OP_CODE:
                i = processJumpBlock(statementOrBlock.imp,i);
                break;
            case BREAK_OP_CODE:
                return;
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
            case GET_ENM_VALUE_COUNT:
                processGetEnumerableValueCount(statementOrBlock,blockScope);
                break;
            case COMPARE_OP_CODE:
                processComparison(statementOrBlock,blockScope);
                break;
            case GET_INDEX_OP_CODE:
                processGetEnumerableIndex(statementOrBlock,blockScope);
                break;
            case CONTAINS_OP_CODE:
                processEnumerableContains(statementOrBlock,blockScope);
                break;
            case GET_SIZE_OP_CODE:
                processGetEnumerableSize(statementOrBlock,blockScope);
                break;
            case BLOCK_OP_CODE:
                processScopeBlock(statementOrBlock,blockScope);
                break;
            case ENM_CHANGE_OP_CODE:
                processEnumerableChange(statementOrBlock,blockScope);
                break;
        }
    };
    console.log(blockScope);
}
function executeScript(scriptData) {
    executeBlock(scriptData,null,null);
}
