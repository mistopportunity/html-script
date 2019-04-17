const UNSET_VALUE_REGISTER = "The value register in this scope was never set before its use";
const INVALID_OPERATION_CODE = "Invalid operation code";
const MISSING_JUMP_PARAMETERS = "A jump operation is missing a type or a index in one of its jump blocks";
const IMPOSSIBLE_TRUTH = "Cannot evaluate the truth of an undefined value";
const MISSING_SCOPE_CODE = "Scope block operation is missing a code block";
const ARRAY_EMPTY_ERROR = "This operation is invalid because the enumerable type is empty";
const ARRAY_BOUNDS_ERROR = "The fabled index out of bounds error";
const MISSING_INDEX_PARAMETER = "This operation is missing an index parameter";
const GENERIC_ENUMERABLE_REF_ERROR = "An error occured in an enumerable element's operation. This error is likely internal.";

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

function lookupArray() {
    this.array = [];
    this.list = {};
    this.push = item => {
        this.array.push(item);
        processAddedItem(item);
        return item;
    }
    this.unshift = item => {
        this.array.unshift(item);
        processAddedItem(item);
        return item;
    }

    function processAddedItem(item) {
        if(this.list[item]) {
            this.list.count++;
        } else {
            this.list[item] = {
                count: 1,
            }
        }
        return item;
    }
    function processRemovedItem(item) {
        this.list[item].count--;
        if(this.list[item].count < 1) {
            delete this.list[item];
        }
        return item;
    }

    function genericSingleDeletion(operationType) {
        if(this.array.length > 0) {
            const removed = this.array[operationType]();
            processRemovedItem(removed);
            return removed;
        } else {
            throw Error(ARRAY_EMPTY_ERROR);
        }
    }

    this.pop = () => genericSingleDeletion("pop");
    this.shift = () => genericSingleDeletion("shift");

    this.insert = (item,index) => {
        this.array.splice(index,0,item);
        processAddedItem(item);
        return item;
    }
    this.delete = index => {
        if(index < 0) {
            throw Error(ARRAY_BOUNDS_ERROR);
        } else if(index >= this.array.length) {
            throw Error(ARRAY_BOUNDS_ERROR)
        } else {
            const removed = this.array.splice(index,1)[0];
            processRemovedItem(removed);
            return removed;
        }
    }
    this.get = index => {
        if(index < 0) {
            throw Error(ARRAY_BOUNDS_ERROR);
        } else if(index >= this.array.length) {
            throw Error(ARRAY_BOUNDS_ERROR)
        } else {
            return this.array[index];
        }
    }
    this.size = () => this.array.length;
    this.contains = value => this.list[value] ? true : false;
    this.countOf = value => {
        const lookup = this.list[value];
        if(lookup) {
            return lookup.count;
        } else {
            return 0;
        }
    }
}

function processDeclaration(statementOrBlock,blockScope) {
    const variableName = statementOrBlock.imp.name;
    const typeCode = statementOrBlock.imp.type;
    switch(typeCode) {
        case VARIABLE_TYPE_CODE:
            blockScope[variableName] = null;
            break;
        case ENUMERABLE_TYPE_CODE:
            const container = new lookupArray()
            blockScope[variableName] = {
                type: ENUMERABLE_TYPE_CODE,
                container:container
            };
            if(statementOrBlock.imp.values === undefined) {
                statementOrBlock.imp.values.forEach(value => {
                    container.push(value);
                });
            } else {
                if(blockScope.__internal__.valueRegister.type === ENUMERABLE_TYPE_CODE) {
                    blockScope.__internal__.valueRegister.forEach(value => {
                        container.push(value);
                    });
                }
            }
            break;
        case FUNCTION_TYPE_CODE:
            blockScope[variableName] = statementOrBlock.imp;
            break;
        default:
            throw SyntaxError(`'${statementOrBlock.imp.type}' is not a valid declaration type code`);
    }
}
function processVariableSet(statementOrBlock,blockScope) {
    let variableName = undefined;
    const hasImp = statementOrBlock.imp ? true : false;
    if(hasImp) {
        variableName = statementOrBlock.imp.name;
    } 
    if(variableName === undefined) {
        if(statementOrBlock.op === SET_PARAMETER_OP_CODE) {
            if(hasImp && statementOrBlock.imp.value !== undefined) {
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
        } else if(statementOrBlock.imp.src !== undefined) {
            const sourceScopeResult = reverseScopeSearch(
                statementOrBlock.imp.src,blockScope
            );
            if(sourceScopeResult.value !== undefined) {
                scopeResult.scope[statementOrBlock.imp.src] = sourceScopeResult.value;
            } else {
                throw ReferenceError(`Variable '${statementOrBlock.imp.src}' is declared but it has no value`);
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
                    throw TypeError(`'${functionName}' with type '${functionLookup.type}' is not of valid type '${FUNCTION_TYPE_CODE}'`);
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
    switch(type) {
        case CMP_EQUAL:
            return leftValue === rightValue;
        case CMP_NOT_EQUAL:
            return leftValue !== rightValue;
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
function processVariableDeletion(statementOrBlock,blockScope) {
    const scopeResult = reverseScopeSearch(statementOrBlock.imp.name,blockScope);
    if(scopeResult.found) {
        delete scopeResult.scope[statementOrBlock.imp.name];
    } else {
        throw ReferenceError(`Variable or function '${statementOrBlock.imp.name}' not found in enclosing scopes`);
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
function processEnumerableChange(statementOrBlock,blockScope) {
    switch(statementOrBlock.imp.type) {
        case ENM_CHANGE_ADD_START: {
                const value = processVariableForEnumerable(statementOrBlock,blockScope);
                processGenericEnumerableProperty(statementOrBlock,blockScope,"unshift",value);
            }
            break;
        case ENM_CHANGE_DEL_START:
            processGenericEnumerableProperty(statementOrBlock,blockScope,"shift",null);
            break;
        case ENM_CHANGE_ADD_END: {
                const value = processVariableForEnumerable(statementOrBlock,blockScope);
                processGenericEnumerableProperty(statementOrBlock,blockScope,"push",value);
            }
            break;
        case ENM_CHANGE_DEL_END:
            processGenericEnumerableProperty(statementOrBlock,blockScope,"pop",null);
            break;
        case ENM_CHANGE_ADD_IDX:
            if(statementOrBlock.imp.index !== undefined) {
                const value = processVariableForEnumerable(statementOrBlock,blockScope);
                processGenericEnumerableProperty(
                    statementOrBlock,
                    blockScope,
                    "insert",
                    value,
                    statementOrBlock.imp.index
                );
            } else {
                throw SyntaxError(MISSING_INDEX_PARAMETER);
            }
            break;
        case ENM_CHANGE_DEL_IDX:
            if(statementOrBlock.imp.index !== undefined) {
                processGenericEnumerableProperty(
                    statementOrBlock,
                    blockScope,
                    "delete",
                    statementOrBlock.imp.index
                );
            } else {
                throw SyntaxError(MISSING_INDEX_PARAMETER);
            }
            break;
    }
}
function processGetEnumerableIndex(statementOrBlock,blockScope) {
    if(statementOrBlock.imp.index !== undefined) {
        processGenericEnumerableProperty(
            statementOrBlock,
            blockScope,
            "get",
            statementOrBlock.imp.index
        );
    } else {
        throw SyntaxError(MISSING_INDEX_PARAMETER);
    }
}

function processGenericEnumerableProperty(statementOrBlock,blockScope,method,...parameters) {
    if(parameters[0] === undefined) {
        throw ReferenceError(GENERIC_ENUMERABLE_REF_ERROR);
    }
    const variableName = statementOrBlock.imp.name;
    const searchResult = reverseScopeSearch(variableName,blockScope);
    if(searchResult.found) {
        if(searchResult.value !== undefined) {
            if(searchResult.value.type === ENUMERABLE_TYPE_CODE) {
                blockScope.__internal__.valueRegister = searchResult.value.container[method](...parameters);
            } else {
                throw TypeError(`Variable '${variableName}' with type '${searchResult.value.type}' is not of valid type '${ENUMERABLE_TYPE_CODE}'`)
            }
        } else {
            throw ReferenceError(`Variable '${variableName}' is declared but it has no value`);
        }
    } else {
        throw ReferenceError(`Variable '${variableName}' not found in any enclosing scopes`);
    }
}
function processVariableForEnumerable(statementOrBlock,blockScope) {
    let value;
    if(statementOrBlock.imp.src !== undefined) {
        const variableSearch = reverseScopeSearch(statementOrBlock.imp.src,blockScope);
        if(variableSearch.found) {
            if(variableSearch.value !== undefined) {
                value = variableSearch.value;
            } else {
                throw ReferenceError(`Variable '${variableName}' is declared but it has no value`);
            }
        } else {
            throw ReferenceError(`Variable '${variableName}' not found in any enclosing scopes`);
        }
    } else if(statementOrBlock.imp.value !== undefined) {
        value = statementOrBlock.imp.value;
    } else {
        if(blockScope.__internal__.valueRegister !== undefined) {
            value = blockScope.__internal__.valueRegister;
        } else {
            throw ReferenceError("The value register has no value");
        }
    }
    return value;
}
function processGetEnumerableSize(statementOrBlock,blockScope) {
    processGenericEnumerableProperty(statementOrBlock,blockScope,"size",null);
}
function processEnumerableContains(statementOrBlock,blockScope) {
    const value = processVariableForEnumerable(statementOrBlock,blockScope);
    processGenericEnumerableProperty(statementOrBlock,blockScope,"contains",value);
}
function processGetEnumerableValueCount(statementOrBlock,blockScope) {
    const value = processVariableForEnumerable(statementOrBlock,blockScope);
    processGenericEnumerableProperty(statementOrBlock,blockScope,"countOf",value);
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
            case DELETE_OP_CODE:
                processVariableDeletion(statementOrBlock,blockScope);
                break;
        }
    };
}
function executeScript(scriptData) {
    executeBlock(scriptData,null,null);
}
