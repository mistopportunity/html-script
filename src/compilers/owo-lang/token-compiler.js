export default OwO_TokenCompiler;
import CONSTANT from "/compilers/owo-lang/constants.js";
import OP_GEN from "/operation-generator.js";

function OwO_TokenCompiler() {

    const tp = {};
    const tt = CONSTANT.tokenTypes;

    function eval_value_to_register(value) {
        //process the by_ref/by_val chain
        return {TODO:"eval_value_to_register"};
    }
    function setToVariableAtPotentialIndex(tokenValueChain,...valueRetrievalCode) {
        console.log(token);
        return [...valueRetrievalCode,{TODO:"set_variable_at_pot_idx"}];
    }

    tp[tt.variableDeclaration] = token => {
        return OP_GEN.variableDeclaration(token.name);
    };
    tp[tt.variableDeclaration_byValue] = token => {
        console.log(token);
        return [
            OP_GEN.variableDeclaration(token.name),
            OP_GEN.setVariable_ByValue(token.name,token.src.value)
        ];
    };
    tp[tt.variableDeclaration_byVariable] = token => {
        const codes = [
            OP_GEN.variableDeclaration(token.name),
            eval_value_to_register(token.src),
            OP_GEN.setVariable_ByRegister(token.name)
        ];
        return codes;
    };

    function makeFunction(token,compilerState,parameters) {
        const originalBlock = compilerState.writingBlock
        const writingBlock = getChildBlock(originalBlock);
        compilerState.writingBlock = writingBlock;
        const operation = OP_GEN.functionBlock(token.name,[],parameters);
        compilerState.writingBlock.post_process = () => {
            operation.code.push(writingBlock.code);
            originalBlock.push(operation);
        }
        return;
    }
    tp[tt.empty_line] = (token,compilerState) => {
        compilerState.writingBlock.endBlock();
        return;
    }

    tp[tt.declareVariable_withInput] = token => {
        const codes = [
            OP_GEN.variableDeclaration(token.name),
            OP_GEN.input(),
            OP_GEN.setVariable_ByRegister(token.name)
        ];
        return codes;
    };

    tp[tt.functionDeclaration_WithParameters] = (token,compilerState) => makeFunction(token,compilerState,token.values.map(t=>t.value));
    tp[tt.functionDeclaration] = (token,compilerState) => makeFunction(token,compilerState,[]);

    tp[tt.listDeclaration_empty] = null;
    tp[tt.groupDeclaration_empty] = null;
    tp[tt.listDeclaration_fromOther] = null;
    tp[tt.groupDeclaration_fromOther] = null;
    tp[tt.listDeclaration_fromValues] = null;
    tp[tt.groupDeclaration_fromValues] = null;
    tp[tt.declareVariable_withFunctionCall] = null;
    tp[tt.declareVariable_withFunctionCall_param] = null;

    tp[tt.setVariable] = token => {
        const valueCode = eval_value_to_register(token.src);
        const codes = setToVariableAtPotentialIndex(token.name,valueCode);
        return codes;
    };

    tp[tt.setVariable_toInput] = token => {
        const valueCode = OP_GEN.input();
        const codes = setToVariableAtPotentialIndex(token.name,valueCode);
        return codes;
    };
    tp[tt.setVariable_byLength] = null;
    tp[tt.setVariable_byContains] = null;

    tp[tt.declareVariable_byLength] = null;
    tp[tt.declareVariable_byContains] = null;
    tp[tt.send_output] = null;
    tp[tt.send_output_many] = null;
    tp[tt.delete_variable] = null;
    tp[tt.if_statement] = null;
    tp[tt.else_statement] = null
    tp[tt.call_function] = null;
    tp[tt.call_function_param] = null;
    tp[tt.variable_operation] = null;
    tp[tt.block_return] = null;
    tp[tt.block_return_value] = null;
    tp[tt.while_statement] = null;

    function getEntryBlock(compilerState) {
        return {
            parent: null,
            code: [],
            endBlock: function() {
                if(compilerState.endedMain) {
                    throw Error("Main block already terminated, cannot de-scope");
                }
                if(compilerState.writingBlock.post_process) {
                    compilerState.writingBlock.post_process();
                }
                compilerState.endedMain = true;
            }
        }
    }
    function getChildBlock(parent,compilerState) {
        return {
            parent: parent,
            code: [],
            endBlock: function() {
                if(compilerState.writingBlock.post_process) {
                    compilerState.writingBlock.post_process();
                }
                compilerState.writingBlock = parent;
            }
        }
    }

    function processToken(token,compilerState) {
        const processor = tp[token.type];
        if(!processor) {
            return;
        }
        const operations = processor(token,compilerState);
        if(operations) {
            if(operations.length) {
                compilerState.writingBlock.code.push(...operations);
            } else {
                compilerState.writingBlock.code.push(operations);
            }
        }
    }

    this.compileTokens = function(tokens) {
        let compilerState = {};
        compilerState.writingBlock = getEntryBlock(compilerState);
        for(let i = 0;i<tokens.length;i++) {
            const token = tokens[i];
            try {
                processToken(token,compilerState);
            } catch(error) {
                console.error(error,token.metadata,token);
                return;
            }
        }
        while(compilerState.writingBlock.parent !== null) {
            compilerState.writingBlock.endBlock();
        }
        if(!compilerState.writingBlock.endedMain) {
            compilerState.writingBlock.endBlock();
        }
        return compilerState.writingBlock.code;
    }
}
