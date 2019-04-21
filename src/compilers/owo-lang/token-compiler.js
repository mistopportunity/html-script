export default OwO_TokenCompiler;
import CONSTANT from "/compilers/owo-lang/constants.js";

function OwO_TokenCompiler() {
    this.compileTokens = function(tokens) {
        const tokenTypes = CONSTANT.tokenTypes;
        const tokenValues = Object.values(tokenTypes);
        const tokenRemainderList = {};
        tokenValues.forEach(tokenValue=>{
            tokenRemainderList[tokenValue] = true
        });
        tokens.forEach(token => {
            if(tokenRemainderList[token.type]) {
                delete tokenRemainderList[token.type];
            }
        });
        const remainingItemsString = Object.keys(tokenRemainderList).join(", ");
        console.log("Remaining token types to test:",remainingItemsString||"None");
        return tokens;
    }
}
