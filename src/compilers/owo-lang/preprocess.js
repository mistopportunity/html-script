export default OwO_Preprocessor;
import CONSTANT from "/compilers/owo-lang/constants.js";

function OwO_Preprocessor() {
    this.preprocess = function(lines) {
        const newLines = [];
        for(let i = 0;i<lines.length;i++) {
            const line = lines[i];
            const commentIndex = line.indexOf(CONSTANT.SINGLE_LINE_COMMENT);
            if(commentIndex >= 0) {
                const adjustedLine = line.substring(0,commentIndex);
                if(adjustedLine.length >= 1) {
                    newLines.push(adjustedLine.trim());
                }
            } else {
                newLines.push(line.trim());
            }
        }
        return newLines;
    }
}
