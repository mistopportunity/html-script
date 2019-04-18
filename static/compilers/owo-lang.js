function OwO_Compiler() {
    
    const tokenSeperator = " ";
    const stringQuoteCharacter = '"';
    const legalVariableLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
    const legalNumbers = "1234567890";
    const enumerableSeperator = ":";
    const enumerableItemSeperator = ",";

    const DECLARE = "decware";
    const WRITE = "wite";
    const READ = "wead";
    const RETURN = "weturn";
    const WHILE = "while";
    const OPEN_BRACE = "OwO";
    const END_BRACE = "UwO";
    const IF = "if";
    const ELSE = "else";

    const FUNCTION = "function";

    const LIST = "list";
    const GROUP = "gwoup";
    const LIST_DEFINE = LIST + enumerableSeperator;
    const GROUP_DEFINE = GROUP + enumerableSeperator;

    const INDEXER = "number";
    const SET = "set";
    const TO = "to";
    const DO = "do";
    const OF = "of";
    const LENGTH = "wength";

    const EQUAL = "=";
    const NOT_EQUAL = "!=";
    const GREATER = ">";
    const LESSER = "<";
    const GREATER_OR_EQUAL = ">=";
    const LESS_OR_EQUAL = "<=";

    const WITH = "wif";

    const TRUE = "true";
    const FALSE = "false";

    const ADD = "add";
    const SUBTRACT = "subtract";
    const FROM = "from";

    const legalNumbersLookup = {};
    [...legalNumbers].forEach(number => {
        legalNumbersLookup[number] = true;
    })

    const legalVariableLettersLookup = {};
    [...legalVariableLetters].forEach(letter => {
        legalVariableLettersLookup[letter] = true
    });
    const keyWords = [
        DECLARE,
        WRITE,
        READ,
        RETURN,
        WHILE,
        OPEN_BRACE,
        END_BRACE,
        LIST,
        GROUP,
        LIST_DEFINE,
        GROUP_DEFINE,
        INDEXER,
        SET,
        TO,
        DO,
        EQUAL,
        NOT_EQUAL,
        GREATER,
        LESSER,
        GREATER_OR_EQUAL,
        LESS_OR_EQUAL,
        IF,
        ELSE,
        WITH,
        OF,
        LENGTH,
        TRUE,
        FALSE,
        ADD,
        SUBTRACT,
        FROM
    ];
    const keyWordsLookup = {};
    keyWords.forEach(keyWord => {
        if(keyWordsLookup[keyWord]) {
            console.warn(duplicateKeyWord(keyWord));
        }
        keyWordsLookup[keyWord] = true;
    });

    function formatLineNumber(lineNumber) {
        return `@ line #${lineNumber+1}`;
    }

    function duplicateKeyWord(keyWord) {
        //This is an internal error for the compiler
        return `Key word '${keyWord}' is defined more than once!`;
    }
    function requiredBlockStart(lineNumber) {
        return `Expected '${OPEN_BRACE}' ${formatLineNumber(lineNumber)}`;
    }
    function requiredBlockEnd(lineNumber) {
        return `Expected '${END_BRACE}' but reached end of parent block ${formatLineNumber(lineNumber)}`;
    }

    const INVALID_VALUE_REPORT_TYPE = "Invalid value report type";

    function invalidDeclaration(lineNumber){};
    function expectedWithInFuncDef(lineNumber){};
    function unexpectedToken(lineNumber){};
    function unexpectedValue(lineNumber){};
    function expectedStringQuote(lineNumber){};
    function invalidCharacterInNumber(lineNumber){};
    function invalidNumber(lineNumber){};
    function invalidVariableName(lineNumber,type){
        switch(type) {
            default:
                break;
            case 0://uses key word
                break;
            case 1://starts with a number
                break;
            case 2://contains invalid characters
                break;
        }
    };

    function createWhileLoop() {

    }
    function createIfBlock() {

    }
    function createIfElseBlock() {

    }
    function declareVariable() {

    }
    function declareVariableWithValue() {

    }
    
    function setVariable_ByVariable() {

    }

    function setVariable_ByValue() {

    }
    
    function compileBlock() {

    }

    const tokenTypes = {
        blockStart: "blockStart",
        blockEnd: "blockEnd",
        functionDeclaration_WithParameters: "funcdef_p",
        functionDeclaration: "funcdef",

        listDeclaration_empty: "listdef",
        groupDeclaration_empty: "groupdef",

        listDeclaration_fromOther: "listdef_cp",
        groupDeclaration_fromOther: "groupdef_cp",

        listDeclaration_fromValues: "listdef_x",
        groupDeclaration_fromValues: "groupdef_x",

        variableDeclaration: "vardef",
        variableDeclaration_byValue: "vardef_vl",
        variableDeclaration_byVariable: "vardef_vr"
    };

    const valueReportTypes = {
        byReference: "by_ref",
        byValue: "by_val"
    };
    const valueTypes = {
        boolean: "bool",
        number: "num",
        string: "string"
    }
    function getValue(value,typeName) {
        return {
            value: value,
            typeName: valueTypes[typeName]
        }
    }

    function compileTokens(tokens) {
        console.log(tokens);
    }

    function validateVariableName(name,lineNumber) {
        if(keyWordsLookup[name]) {
            throw SyntaxError(invalidVariableName(lineNumber,0));
        }
        if(legalNumbersLookup[name[0]]) {
            throw SyntaxError(invalidVariableName(lineNumber,1));
        }
        for(const character of name) {
            if(!legalVariableLettersLookup[character]) {
                throw SyntaxError(invalidVariableName(lineNumber,2));
            }
        }
        return name;
    }

    function validateListItems(text,lineNumber) {
        const valuesString = text.join("");
        const items = valuesString.split(enumerableItemSeperator);
        for(let i = 0;i<items.length;i++) {
            const item = items[i];
            const report = valueReport(item,lineNumber);
            items[i] = report;
        }
        return items;
    }

    function validateValue(text,lineNumber) {
        switch(text) {
            case TRUE:
            case FALSE:
                return getValue(text===TRUE,"boolean");
            default:
                if(text[0] === stringQuoteCharacter) {
                    let string = "";
                    let didBreak = false;
                    for(let i = 1;i<text.length;i++) {
                        const character = text[i];
                        if(character === stringQuoteCharacter) {
                            didBreak = true;
                            break;
                        }
                        string += character;
                    }
                    if(!didBreak) {
                        throw SyntaxError(expectedStringQuote(lineNumber));
                    }
                    return getValue(string,"string");
                } else {
                    let number = "";
                    for(let i = 0;i<text.length;i++) {
                        const character = text[i];
                        if(!legalNumbersLookup[character]) {
                            throw SyntaxError(invalidCharacterInNumber(lineNumber));
                        }
                        number += character;
                    }
                    const parsedNumber = Number(number);
                    if(isNaN(parsedNumber)) {
                        throw SyntaxError(invalidNumber(lineNumber));
                    }
                    return getValue(parsedNumber,"number");
                }
        }
    }
    function valueReport(text,lineNumber) {
        try {
            const name = validateVariableName(text,lineNumber);
            return {
                type: valueReportTypes.byReference,
                value: name
            };
        } catch(error) {
            try {
                const value = validateValue(text,lineNumber);
                return {
                    type: valueReportTypes.byValue,
                    value: value
                };
            } catch {
                throw SyntaxError(unexpectedValue(lineNumber));
            }
        }
    }

    function getTokenObject(type,values) {
        values.type = type;
        return values;
    }

    function getLineSchema(line,lineNumber) {
        line = line.trim();
        if(!line) {
            return null;
        }
        line = line.split(tokenSeperator);
        if(!line.length) {
            return null;
        }
        switch(line[0]) {
            case DECLARE:
                if(line[1] === FUNCTION) {
                    if(line.length < 2) {
                        throw SyntaxError(invalidDeclaration(lineNumber));
                    }
                    const functionName = validateVariableName(line[2],lineNumber);
                    switch(line.length) {
                        case 3:
                            return getTokenObject(tokenTypes.functionDeclaration,{
                                name: functionName
                            });
                        default:
                            if(line[3] === WITH) {
                                if(line.length < 4) {
                                    throw SyntaxError(invalidDeclaration(lineNumber));
                                }
                                const listItems = validateListItems(line.slice(4),lineNumber);
                                return getTokenObject(tokenTypes.functionDeclaration_WithParameters,{
                                    name: functionName,
                                    values: listItems
                                });
                            } else {
                                throw SyntaxError(expectedWithInFuncDef(lineNumber));
                            }
                    }
                } else {
                    if(line.length < 2) {
                        throw SyntaxError(invalidDeclaration(lineNumber));
                    }
                    const variableName = validateVariableName(line[1],lineNumber);
                    switch(line[2]) {
                        case LIST:
                        case GROUP:
                            if(line.length === 3) {
                                const tokenType = line[2] === LIST ?
                                    tokenTypes.listDeclaration_empty:
                                    tokenTypes.groupDeclaration_empty;
                                return getTokenObject(tokenType,{
                                    name: variableName
                                });
                            } else if(line.length === 5) {
                                if(line[3] === FROM) {
                                    const sourceName = validateVariableName(line[4],lineNumber);
                                    const tokenType = line[2] === LIST ?
                                        tokenTypes.listDeclaration_fromOther:
                                        tokenTypes.groupDeclaration_fromOther;

                                    return getTokenObject(tokenType,{
                                        name: variableName,
                                        src: sourceName
                                    });
                                } else {
                                    throw SyntaxError(invalidDeclaration(lineNumber));
                                }
                            } else {
                                throw SyntaxError(invalidDeclaration(lineNumber));
                            }
                        case LIST_DEFINE:
                        case GROUP_DEFINE:
                            if(line.length <= 3) {
                                throw SyntaxError(invalidDeclaration(lineNumber));
                            }
                            const listItems = validateListItems(line.slice(3),lineNumber);
                            const tokenType = line[2] === LIST_DEFINE ?
                                tokenTypes.listDeclaration_fromValues:
                                tokenTypes.groupDeclaration_fromValues;

                            return getTokenObject(tokenType,{
                                name: variableName,
                                values: listItems
                            });
                        case WITH:
                            if(line.length !== 4) {
                                throw SyntaxError(invalidDeclaration(lineNumber));
                            }
                            const sourceValue = valueReport(line[3],lineNumber);
                            switch(sourceValue.type) {
                                case valueReportTypes.byReference:
                                    return getTokenObject(tokenTypes.variableDeclaration_byVariable,{
                                        name: variableName,
                                        src: sourceValue.value
                                    });
                                case valueReportTypes.byValue:
                                    return getTokenObject(tokenTypes.variableDeclaration_byValue,{
                                        name: variableName,
                                        value: sourceValue.value
                                    });
                                default:
                                    throw Error(INVALID_VALUE_REPORT_TYPE);
                            }
                        default:
                            if(line.length === 2) {
                                return getTokenObject(tokenTypes.variableDeclaration,{
                                    name: variableName
                                });
                            } else {
                                throw SyntaxError(unexpectedToken(lineNumber));
                            }
                    }
                }
                break;
            case WRITE:
                break;
            case READ:
                break;
            case SET:
                break;
            case RETURN:
                break;
            case WHILE:
                break;
            case OPEN_BRACE:
                break;
            case END_BRACE:
                break;
            case IF:
                break;
            case ELSE:
                break;
            case ADD:
                break;
            case SUBTRACT:
                break;
        }

    }

    function tokenize(lines) {
        const preprocessed = [];
        let lineNumber = 0;
        while(lineNumber < lines.length) {
            const line = lines[lineNumber];
            const schema = getLineSchema(line);
            if(schema !== null) {
                schema.metadata = {
                    lineNumber: lineNumber,
                    originalLine: line
                }
                preprocessed.push(schema);
            }
            lineNumber++;
        }
        return preprocessed;
    }

    this.compile = function(lines) {
        const tokens = tokenize(lines);
        const assembly = compileTokens(tokens);
        return assembly;
    }

    console.log("OwO compiler loaded");
}
