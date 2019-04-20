export default OwO_Compiler;
export { OwO_Compiler }

import OwO_Preprocessor from "/compilers/owo-lang/preprocess.js";
import OwO_Tokenizer from "/compilers/owo-lang/tokenizer.js";
import OwO_TokenCompiler from "/compilers/owo-lang/token-compiler.js";

function OwO_Compiler(advancedLogging=false) {
    if(typeof advancedLogging !== typeof true) {
        throw TypeError(`Parameter 'advancedLogging' must be of type '${typeof true}', not '${typeof advancedLogging}'`);
    }

    this.preprocessor = new OwO_Preprocessor();
    this.tokenizer = new OwO_Tokenizer();
    this.compiler = new OwO_TokenCompiler();

    this.compile = function(lines) {
        try {
            lines = this.preprocessor.preprocess(lines);
        } catch(error) {
            console.error(error)
            console.warn("Compiler failed during text pre-processing");
            return null;
        }
        if(advancedLogging) {
            console.log("Preprocessed lines:",lines);
        }
        let tokens;
        try {
            tokens = this.tokenizer.tokenize(lines);
        } catch(error) {
            if(advancedLogging) {
                console.error(error,error.metadata);
            } else {
                const formattedError = `${error.name}: ${error.message}\n`;
                console.error(formattedError,error.metadata);
            }
            console.warn("Compiler failed during the tokenization process");
            return null;
        }
        if(advancedLogging) {
            console.log("Compiled tokens:",tokens);
        }
        let assembly;
        try {
            assembly = this.compiler.compileTokens(tokens);
        } catch(error) {
            console.error(error);
            console.warn("Compiler failed during assembly generation");
            return null;
        }
        if(advancedLogging) {
            console.log("Assembly",assembly);
        }
        return assembly;
    }
    console.log("OwO compiler loaded");
}
