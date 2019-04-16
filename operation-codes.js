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
const RETURN_OP_CODE = "ret";

const STATIC_JUMP_TYPE = "stc";
const DYNAM_JUMP_TYPE = "dyn";

function getBasicJumpType(indexIsBaked) {
    return indexIsBaked ? STATIC_JUMP_TYPE : DYNAM_JUMP_TYPE;
}

const OP_GEN = new (function(){
    this.functionBlock = function functionBlockGenerator(name,code,...parameters) {
        return {
            op: DECLARE_OP_CODE,
            imp: {
                name: name,
                type: FUNCTION_TYPE_CODE,
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
    this.setFunctionParameterByValue = value => setFunctionParameterGenerator({
        value:value
    });
    this.setFunctionParameterByVariable = variableName => setFunctionParameterGenerator({
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
    this.arrayDeclaration = function arrayDeclarationGenerator(arrayName) {
        return {
            op: DECLARE_OP_CODE,
            imp: {
                type: ARRAY_TYPE_CODE,
                name: variableName
                //TODO
            }
        }
    };
    this.listDeclaration = function listDeclarationGenerator(listName) {
        return {
            op: DECLARE_OP_CODE,
            imp: {
                type: LIST_TYPE_CODE,
                name: variableName
                //TODO
            }
        }
    };
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
    this.setVariableByRegister = variableName => setVariableValueGenerator(variableName);
    this.setVariableByValue = (variableName,value) => setVariableValueGenerator(variableName,{value:value});

    function setRegisterGenerator(imp) {
        return {
            op: REGISTER_OP_CODE,
            imp:imp
        }
    }

    this.setRegisterByValue = value => setRegisterGenerator({value:value});
    this.setRegisterByVariable = variableName => setRegisterGenerator({name:variableName});

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

    this.modifyRegisterByVariable = (sign,variableName) => basicRegisterMathGenerator(sign,{name:variableName});
    this.modifyRegisterByValue = (sign,value) => basicRegisterMathGenerator(sign,{value:value});

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
    this.returnByValue = value => returnGenerator({value:value});
    this.returnByVariable = variableName => returnGenerator({variableName:variableName});

})();
