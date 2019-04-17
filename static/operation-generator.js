const OP_GEN = new (function(){
    function getBasicJumpType(indexIsBaked) {
        return indexIsBaked ? STATIC_JUMP_TYPE : DYNAM_JUMP_TYPE;
    }
    this.functionBlock = function functionBlockGenerator(name,code,...parameters) {
        return {
            op: DECLARE_OP_CODE,
            imp: {
                name:name,
                type:FUNCTION_TYPE_CODE,
                code:code,
                parameters:parameters
            }
        }
    };
    this.conditionalJump = function conditionalJumpGenerator(trueIndex,falseIndex,indexIsBaked) {
        const jumpType = getBasicJumpType(indexIsBaked);
        const trueJumpBlock = {
            index: trueIndex,
            type: jumpType
        };
        const falseJumpBlock = {
            index: falseIndex,
            type: jumpType
        };
        return {
            op: CON_JUMP_OP_CODE,
            imp: {
                true:trueJumpBlock,
                false:falseJumpBlock
            }
        }
    };
    this.jump = function jumpGenerator(index,indexIsBaked) {
        return {
            op: JUMP_OP_CODE,
            imp: {
                index:index,
                type: getBasicJumpType(indexIsBaked)
            }
        }
    };
    this.break = function breakGenerator() {
        return {
            op: BREAK_OP_CODE
        }
    };
    this.execute = function executeGenerator(functionName) {
        return {
            op: EXECUTE_OP_CODE,
            imp: {
                name: functionName
            }
        }
    };
    function setFunctionParameterGenerator(imp) {
        const operation = {
            op: SET_PARAMETER_OP_CODE
        }
        if(imp) {
            operation.imp = imp;
        }
        return operation;
    }
    this.setFunctionParameterByRegister = setFunctionParameterGenerator;
    this.setFunctionParameter_ByValue = value => setFunctionParameterGenerator({
        value:value
    });
    this.setFunctionParameter_ByVariable = variableName => setFunctionParameterGenerator({
        name:variableName
    });
    this.variableDeclaration = function variableDeclarationGenerator(variableName) {
        return {
            op: DECLARE_OP_CODE,
            imp: {
                type: VARIABLE_TYPE_CODE,
                name: variableName
            }
        }
    };
    function arrayDeclarationGenerator(variableName,values) {
        const operation = {
            op: DECLARE_OP_CODE,
            imp: {
                type: ARRAY_TYPE_CODE,
                name: variableName,
            }
        }
        if(values) {
            operation.imp.values = values;
        }
        return operation;
    };
    this.enumerableDeclaration_Empty = variableName => arrayDeclarationGenerator(variableName,[]);
    this.enumerableDeclaration_FromRegister = variableName => arrayDeclarationGenerator(variableName,null);
    this.enumerableDeclaration_FromValues = arrayDeclarationGenerator;

    function setVariableValueGenerator(variableName,imp) {
        const operation = {
            op: SET_OP_CODE
        }
        if(imp) {
            operation.imp = imp;
        } else {
            operation.imp = {};
        }
        operation.imp.name = variableName;
        return operation;
    }
    this.setVariable_ByRegister = variableName => setVariableValueGenerator(variableName);
    this.setVariable_ByValue = (variableName,value) => setVariableValueGenerator(variableName,{value:value});

    function setRegisterGenerator(imp) {
        return {
            op: REGISTER_OP_CODE,
            imp:imp
        }
    }

    this.setRegister_ByValue = value => setRegisterGenerator({value:value});
    this.setRegister_ByVariable = variableName => setRegisterGenerator({name:variableName});

    function basicRegisterMathGenerator(sign,imp) {
        let operationCode;
        switch(sign) {
            case "+":
            case "plus":
            case "add":
            case "sum":
            case MATH_CODE_ADD:
                operationCode = MATH_CODE_ADD;
                break;
            case "-":
            case "minus":
            case "subtract":
            case MATH_CODE_SUBTRACT:
                operationCode = MATH_CODE_SUBTRACT;
                break;
            case "/":
            case "divide":
            case MATH_CODE_DIVIDE:
                operationCode = MATH_CODE_DIVIDE;
                break;
            case "*":
            case "x":
            case "by":
            case "multiply":
            case "for":
            case MATH_CODE_MULTIPLY:
                operationCode = MATH_CODE_MULTIPLY;
                break;
            default:
                throw SyntaxError(`Unrecognized math operation sign '${sign}'`);
        }
        const operation = {
            op: operationCode,
            imp: imp
        }
        return operation;
    }

    this.modifyRegister_ByVariable = (sign,variableName) => basicRegisterMathGenerator(sign,{name:variableName});
    this.modifyRegister_ByValue = (sign,value) => basicRegisterMathGenerator(sign,{value:value});

    function returnGenerator(imp) {
        const operation = {
            op: RETURN_OP_CODE
        }
        if(imp) {
            operation.imp = imp;
        }
        return operation;
    }

    this.return = returnGenerator;
    this.return_ByValue = value => returnGenerator({value:value});
    this.return_ByVariable = variableName => returnGenerator({variableName:variableName});

    function comparisonGenerator(type,leftName,rightName) {
        const operation = {
            op: OP_GEN,
            imp: {
                type: type
            }
        }
        if(leftName) {
            operation.left = leftName;
        }
        if(rightRight) {
            operation.right = rightName;
        }
        return operation;
    }
    this.compareRegister_ToVariable = (type,rightVariableName) => comparisonGenerator(type,null,rightVariableName);
    this.compareRegister_ToRegister = type => comparisonGenerator(type,null,null);
    this.compareVariable_ToVariable = (type,leftVariableName,rightVariableName) => comparisonGenerator(type,leftVariableName,rightVariableName);
    this.compareVariable_ToRegister = (type,leftVariableName) => (type,leftVariableName,null);

    this.enumerableSizeToRegister = function enumerableSizeGenerator(variableName) {
        return {
            op: GET_SIZE_OP_CODE,
            imp: {
                name: variableName
            }
        }
    };

    function enumerableAtIndexGenerator(variableName,imp) {
        const operation = {
            op: GET_INDEX_OP_CODE
        }
        if(imp) {
            operation.imp = imp;
        } else {
            imp = {};
        }
        imp.name = variableName;
        return operation;
    }

    function enumerableContainsGenerator(variableName,imp) {
        const operation = {
            op: CONTAINS_OP_CODE
        }
        if(imp) {
            operation.imp = imp;
        } else {
            imp = {};
        }
        imp.name = variableName;
        return operation;
    }

    this.enumerableAtIndexToRegister_FromRegister = variableName => enumerableAtIndexGenerator(variableName);
    this.enumerableContainsToRegister_FromRegister = variableName => enumerableContainsGenerator(variableName); 
    this.enumerableAtIndexToRegister_FromValue = (variableName,value) => enumerableAtIndexGenerator(variableName,{
        value:value
    });
    this.enumerableContainsToRegister_FromValue = (variableName,value) => enumerableContainsGenerator(variableName,{
        value:value
    });
    this.enumerableAtIndexToRegister_FromVariable = (variableName,sourceName) => enumerableAtIndexGenerator(variableName,{
        src:sourceName
    });
    this.enumerableContainsToRegister_FromVariable = (variableName,sourceName) => enumerableContainsGenerator(variableName,{
        src:sourceName
    });

    function enumerableChangeGenerator(variableName,imp) {
        const operation = {
            op: ENM_CHANGE_OP_CODE
        }
        if(imp) {
            operation.imp = imp;
        } else {
            operation.imp = {};
        }
        operation.imp.name = variableName;
        return operation;
    }

    this.enumerableDeleteStart = variableName => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_DEL_START
    });
    this.enumerableDeleteEnd = variableName => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_DEL_END
    });
    this.enumerableDeleteAtIndex = (variableName,index) => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_DEL_IDX,
        index: index
    });

    this.enumerableAddStart_FromValue = (variableName,value) => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_ADD_START,
        value: value
    });
    this.enumerableAddEnd_FromValue = (variableName,value) => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_ADD_END,
        value: value
    });
    this.enumerableAddAt_FromValue = (variableName,value,index) => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_ADD_IDX,
        value: value,
        index: index
    });

    this.enumerableAddStart_FromRegister = variableName => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_ADD_START
    });
    this.enumerableAddEnd_FromRegister = variableName => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_ADD_END
    });
    this.enumerableAddAt_FromRegister = (variableName,index) => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_ADD_IDX,
        index: index
    });

    this.enumerableAddStart_FromVariable = (variableName,sourceName) => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_ADD_START,
        src: sourceName
    });
    this.enumerableAddEnd_FromVariable = (variableName,sourceName) => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_ADD_END,
        src: sourceName
    });
    this.enumerableAddAt_FromVariable = (variableName,sourceName,index) => enumerableChangeGenerator(variableName,{
        type: ENM_CHANGE_ADD_IDX,
        index: index,
        src: sourceName
    });
    this.enumerableDeleteByName_FromValue = (variableName,value) => enumerableChangeGenerator(variableName,{
        type: ENUM_CHANGE_DEL_VAL,
        value: value
    });
    this.enumerableDeleteByName_FromRegister = variableName => enumerableChangeGenerator(variableName,{
        type: ENUM_CHANGE_DEL_VAL
    });
    this.enumerableDeleteByName_FromVariable = (variableName,sourceName) => enumerableChangeGenerator(variableName,{
        type: ENUM_CHANGE_DEL_VAL,
        src: sourceName
    });

    this.enumerableValueCount = function enumerableValueCountGenerator(variableName,valueName) {
        return {
            op: GET_ENM_VALUE_COUNT,
            imp: {
                name: variableName,
                value: valueName
            }
        }
    }

    this.scopeBlock = function scopeBlockGenerator(code) {
        return {
            op: BLOCK_OP_CODE,
            imp: {
                code: code
            }
        }
    }
})();
