const OP_GEN = new (function(){
//================================================================================
// These four functions define the root data structure of all operations.
// They exist for easy modifiations to the IL that would otherwise be hell to do.
//================================================================================
    function basicOperation(op,imp) {
        return {
            op:op,
            imp:imp
        }
    }
    function operationOnly(op) {
        return {
            op:op
        }
    }
    function setImp(op,imp) {
        op.imp = imp;
    }
    function getImp(op) {
        return op.imp;
    }
//================================================================================
//================================================================================
    function getMathOPCodeForSign(sign) {
        switch(sign) {
            case "+":
            case "plus":
            case "add":
            case "sum":
            case MATH_CODE_ADD:
                return MATH_CODE_ADD;
            case "-":
            case "minus":
            case "subtract":
            case MATH_CODE_SUBTRACT:
                return MATH_CODE_SUBTRACT;
            case "/":
            case "divide":
            case MATH_CODE_DIVIDE:
                return  MATH_CODE_DIVIDE;
            case "*":
            case "x":
            case "by":
            case "multiply":
            case "for":
            case MATH_CODE_MULTIPLY:
                return MATH_CODE_MULTIPLY;
            default:
                throw SyntaxError(unrecognizedMathSign(sign));
        }
    }
    function unrecognizedMathSign(sign) {
        return `Unrecognized math operation sign '${sign}'`;
    }
    function namedImpOperation(operationName,variableName,imp) {
        const operation = operationOnly(operationName);
        if(imp) {
            setImp(operation,imp);
        } else {
            setImp(operation,{});
        }
        getImp(operation).name = variableName;
        return operation;
    }
    function operationWithOptionalImp(operationName,imp) {
        const operation = operationOnly(operationName);
        if(imp) {
            setImp(operation,imp);
        }
        return operation;
    }

    const returnGenerator = imp => operationWithOptionalImp(RETURN_OP_CODE,imp);
    const setFunctionParameterGenerator = imp => operationWithOptionalImp(SET_PARAMETER_OP_CODE,imp);

    function getBasicJumpType(indexIsBaked) {
        return indexIsBaked ? STATIC_JUMP_TYPE : DYNAM_JUMP_TYPE;
    }

    this.functionBlock = function functionBlockGenerator(name,code,...parameters) {
        return basicOperation(DECLARE_OP_CODE,{
            name:name,
            type:FUNCTION_TYPE_CODE,
            code:code,
            parameters:parameters
        });
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
        return basicOperation(CON_JUMP_OP_CODE,{
            true:trueJumpBlock,
            false:falseJumpBlock
        });
    };
    this.jump = function jumpGenerator(index,indexIsBaked) {
        return basicOperation(JUMP_OP_CODE,{
            index:index,
            type: getBasicJumpType(indexIsBaked)
        });
    };
    this.break = function breakGenerator() {
        return operationOnly(BREAK_OP_CODE);
    };
    this.execute = function executeGenerator(functionName) {
        return basicOperation(EXECUTE_OP_CODE,{
            name: functionName
        });
    };
    this.setFunctionParameter_ByRegister = () => setFunctionParameterGenerator();
    this.setFunctionParameter_ByValue = value => setFunctionParameterGenerator({
        value:value
    });
    this.setFunctionParameter_ByVariable = variableName => setFunctionParameterGenerator({
        name:variableName
    });
    this.variableDeclaration = function variableDeclarationGenerator(variableName) {
        return basicOperation(DECLARE_OP_CODE,{
            type: VARIABLE_TYPE_CODE,
            name: variableName
        });
    };
    function arrayDeclarationGenerator(variableName,values) {
        const operation = basicOperation(DECLARE_OP_CODE,{
            type: ENUMERABLE_TYPE_CODE,
            name: variableName
        });
        if(values) {
            getImp(operation).values = values;
        }
        return operation;
    };

    this.enumerableDeclaration_Empty = variableName => arrayDeclarationGenerator(variableName,[]);
    this.enumerableDeclaration_FromRegister = variableName => arrayDeclarationGenerator(variableName,null);
    this.enumerableDeclaration_FromValues = arrayDeclarationGenerator;

    const setVariableValueGenerator = (variableName,imp) => namedImpOperation(SET_OP_CODE,variableName,imp);
    const enumerableAtIndexGenerator = (variableName,imp) => namedImpOperation(GET_INDEX_OP_CODE,variableName,imp);
    const enumerableContainsGenerator = (variableName,imp) => namedImpOperation(CONTAINS_OP_CODE,variableName,imp);
    const enumerableChangeGenerator = (variableName,imp) => namedImpOperation(ENM_CHANGE_OP_COD,variableName,imp);

    this.setVariable_ByRegister = variableName => setVariableValueGenerator(variableName);
    this.setVariable_ByValue = (variableName,value) => setVariableValueGenerator(variableName,{value:value});
    this.setVariable_ByVariable = (variableName,sourceName) => setVariableValueGenerator(variableName,{src:sourceName});

    function setRegisterGenerator(imp) {
        return basicOperation(REGISTER_OP_CODE,imp);
    }

    this.setRegister_ByValue = value => setRegisterGenerator({value:value});
    this.setRegister_ByVariable = variableName => setRegisterGenerator({name:variableName});

    function basicRegisterMathGenerator(sign,imp) {
        const operationCode = getMathOPCodeForSign(sign);
        const operation = basicOperation(operationCode,imp);
        return operation;
    }

    this.modifyRegister_ByVariable = (sign,variableName) => basicRegisterMathGenerator(sign,{name:variableName});
    this.modifyRegister_ByValue = (sign,value) => basicRegisterMathGenerator(sign,{value:value});

    this.return = () => returnGenerator();
    this.return_ByValue = value => returnGenerator({value:value});
    this.return_ByVariable = variableName => returnGenerator({variableName:variableName});

    function comparisonGenerator(type,leftName,rightName) {
        const operation = basicOperation(COMPARE_OP_CODE,{
            type: type
        });
        if(leftName) {
            getImp(operation).left = leftName;
        }
        if(rightRight) {
            getImp(operation).right = rightName;
        }
        return operation;
    }
    this.compareRegister_ToVariable = (type,rightVariableName) => comparisonGenerator(type,null,rightVariableName);
    this.compareRegister_ToRegister = type => comparisonGenerator(type,null,null);
    this.compareVariable_ToVariable = (type,leftVariableName,rightVariableName) => comparisonGenerator(type,leftVariableName,rightVariableName);
    this.compareVariable_ToRegister = (type,leftVariableName) => (type,leftVariableName,null);

    this.enumerableSizeToRegister = function enumerableSizeGenerator(variableName) {
        return basicOperation(GET_SIZE_OP_CODE,{
            name: variableName
        });
    };

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

    this.enumerableValueCount = function enumerableValueCountGenerator(variableName,valueName) {
        return basicOperation(GET_ENM_VALUE_COUNT,{
            name: variableName,
            value: valueName
        });
    }

    this.scopeBlock = function scopeBlockGenerator(code) {
        return basicOperation(BLOCK_OP_CODE,{
            code: code
        });
    }

    this.delete = function deleteGenerator(variableName) {
        return basicOperation(DELETE_OP_CODE,{
            name: variableName
        });
    }
    this.input = function inputGenerator() {
        return this.execute(INPUT_FUNCTION_NAME);
    }
    this.output = function outputGenerator() {
        return this.execute(OUTPUT_FUNCTION_NAME);
    }
})();
export default OP_GEN;
export { OP_GEN }
