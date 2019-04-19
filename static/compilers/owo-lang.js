function OwO_Compiler(advancedLogging=false) {
    if(typeof advancedLogging !== typeof true) {
        throw TypeError(`Parameter 'advancedLogging' must be of type '${typeof true}', not '${typeof advancedLogging}'`);
    }
    const indexingCharacter = "#";
    const tokenSeperator = " ";
    const stringQuoteCharacter = '"';
    const legalVariableLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_";
    const legalNumbers = "1234567890";
    const enumerableSeperator = ":";
    const enumerableItemSeperator = ",";

    const DECLARE = "dec";
    const WRITE = "write";
    const READ = "read";
    const RETURN = "return";
    const WHILE = "while";
    const OPEN_BRACE = "OwO";
    const END_BRACE = "UwO";
    const IF = "if";
    const ELSE = "else";

    const FUNCTION = "function";

    const LIST = "list";
    const GROUP = "group";
    const LIST_DEFINE = LIST + enumerableSeperator;
    const GROUP_DEFINE = GROUP + enumerableSeperator;

    const SET = "set";
    const DO = "do";
    const LENGTH = "size";

    const EQUAL = "=";
    const NOT_EQUAL = "!=";
    const GREATER = ">";
    const LESSER = "<";
    const GREATER_OR_EQUAL = ">=";
    const LESS_OR_EQUAL = "<=";

    const TRUE = "true";
    const FALSE = "false";

    const ADD = "add";
    const SUBTRACT = "subtract";
    const FROM = "->";

    const keyWords = [
        DECLARE,
        WRITE,
        READ,
        RETURN,
        WHILE,
        OPEN_BRACE,
        END_BRACE,
        IF,
        ELSE,
    
        FUNCTION ,
    
        LIST,
        GROUP,
        LIST_DEFINE,
        GROUP_DEFINE,
    
        SET,
        DO,
        LENGTH,
    
        EQUAL,
        NOT_EQUAL,
        GREATER,
        LESSER,
        GREATER_OR_EQUAL,
        LESS_OR_EQUAL,
    
        TRUE,
        FALSE,
    
        ADD,
        SUBTRACT,
        FROM
    ];
    
    const legalNumbersLookup = {};
    [...legalNumbers].forEach(number => {
        legalNumbersLookup[number] = true;
    });
    const legalVariableLettersLookup = {};
    [...legalVariableLetters].forEach(letter => {
        legalVariableLettersLookup[letter] = true
    });
    const keyWordsLookup = {};
    keyWords.forEach(keyWord => {
        if(keyWordsLookup[keyWord]) {
            console.warn(duplicateKeyWord(keyWord));
        }
        keyWordsLookup[keyWord] = true;
    });

    function formatLineNumber(lineNumber) {
        return `${lineNumber+1}`;
    }

    function duplicateKeyWord(keyWord) {
        //This is an internal error for the compiler
        return `Key word '${keyWord}' is defined more than once!`;
    }
    function requiredBlockStart() {
        return `Expected '${OPEN_BRACE}'`;
    }
    function requiredBlockEnd() {
        return `Expected '${END_BRACE}' but reached end of parent block`;
    }

    function invalidDeclaration(){
        return "Invalid declaration";
    }
    function expectedFunctionParameters() {
        return "Expected function parameters but there are none";
    }
    function unexpectedToken(){
        return "Unexpected token";
    }
    function unexpectedValue(){
        return "Unexpected value";
    }
    function expectedStringQuote(){
        return "Expected a string end quote";
    }
    function invalidCharacterInNumber(){
        return "Number contains a non-number character";
    }
    function invalidNumber(){
        return "Invalid static number";
    }
    function invalidSet() {
        return "Invalid variable set";
    }
    function invalidVariableName(type){
        switch(type) {
            default:
                return "Invalid variable name";
            case 0:
                return "Invalid variable name uses a reserved key word";
            case 1:
                return "Invalid variable name starts with a number";
            case 2:
                return "Invalid variable name uses non-allowed characters";
            case 3:
                return "Use of indexing is malformed";
        }
    }

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
        variableDeclaration_byVariable: "vardef_vr",

        setVariable: "setvr"
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

    }

    function validateVariableName(name) {
        for(let i = 1;i<name.length;i++) {
            const lastCharacter = name[i-1];
            const currentCharacter = name[i];
            if(lastCharacter === indexingCharacter && currentCharacter === indexingCharacter) {
                throw SyntaxError(invalidVariableName(3));
            }
        }
        const lookupName = name.split(indexingCharacter);
        const lookupNameStart = lookupName[0];
        if(keyWordsLookup[lookupNameStart]) {
            throw SyntaxError(invalidVariableName(0));
        }
        if(legalNumbersLookup[lookupNameStart[0]]) {
            throw SyntaxError(invalidVariableName(1));
        }
        for(const character of lookupNameStart) {
            if(!legalVariableLettersLookup[character]) {
                throw SyntaxError(invalidVariableName(2));
            }
        }
        if(lookupName.length > 1) {
            const errorWithReturnValues = Error();
            errorWithReturnValues.valueReportData = {
                rootName: lookupNameStart,
                remainingIndexers: lookupName.slice(1)
            };
            throw errorWithReturnValues;
        }
        return name;
    }

    function validateListItems(text) {
        const valuesString = text.join("");
        const items = valuesString.split(enumerableItemSeperator);
        for(let i = 0;i<items.length;i++) {
            const item = items[i];
            const report = valueReport(item);
            items[i] = report;
        }
        return items;
    }

    function validateValue(text) {
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
                        throw SyntaxError(expectedStringQuote());
                    }
                    return getValue(string,"string");
                } else {
                    let number = "";
                    for(let i = 0;i<text.length;i++) {
                        const character = text[i];
                        if(!legalNumbersLookup[character]) {
                            throw SyntaxError(invalidCharacterInNumber());
                        }
                        number += character;
                    }
                    const parsedNumber = Number(number);
                    if(isNaN(parsedNumber)) {
                        throw SyntaxError(invalidNumber());
                    }
                    return getValue(parsedNumber,"number");
                }
        }
    }
    function valueReport(text) {
        try {
            const name = validateVariableName(text);
            return {
                type: valueReportTypes.byReference,
                value: name
            };
        } catch(error) {
            if(error.valueReportData) {
                const rootListName = error.valueReportData.rootName;
                const remainingIndexers = error.valueReportData.remainingIndexers;
                const firstValueReport = valueReport(rootListName);

                let currentIndex = {};
                const rootElement = {
                    type: firstValueReport.type,
                    value: firstValueReport,
                    index: currentIndex
                }
                let lastIndex = rootElement;

                do {
                    const indexer = remainingIndexers.shift();
                    const report = valueReport(indexer);

                    currentIndex.type = report.type;
                    currentIndex.value = report.value;
                    currentIndex.index = {index:null};

                    lastIndex = currentIndex;
                    currentIndex = currentIndex.index;
                } while(remainingIndexers.length);
                delete lastIndex.index;

                return rootElement;
            }
            try {
                const value = validateValue(text);
                return {
                    type: valueReportTypes.byValue,
                    value: value
                };
            } catch {
                throw SyntaxError(unexpectedValue());
            }
        }
    }

    function getTokenObject(type,values) {
        values.type = type;
        return values;
    }

    function insertPotentialSpaces(line) {
        //TODO
        return line;
    }

    function getLineSchema(line) {
        line = line.trim();
        if(!line) {
            return null;
        }
        line = insertPotentialSpaces(line);
        line = line.split(tokenSeperator);
        if(!line.length) {
            return null;
        }
        switch(line[0]) {
            case DECLARE:
                if(line[1] === FUNCTION) {
                    if(line.length < 2) {
                        throw SyntaxError(invalidDeclaration());
                    }
                    if(line[2].endsWith(enumerableSeperator)) {
                        const functionName = validateVariableName(line[2].substring(0,line[2].length-1));
                        if(line.length > 3) {
                            const listItems = validateListItems(line.slice(3));
                            listItems.forEach(listItem => {
                                if(listItem.type === valueTypes.byValue || listItem.index) {
                                    throw SyntaxError(invalidDeclaration());
                                }
                            });
                            return getTokenObject(tokenTypes.functionDeclaration_WithParameters,{
                                name: functionName,
                                values: listItems
                            });
                        } else {
                            throw SyntaxError(expectedFunctionParameters());
                        }
                    } else {
                        const functionName = validateVariableName(line[2]);
                        if(line.length !== 3) {
                            throw SyntaxError(invalidDeclaration());
                        }
                        return getTokenObject(tokenTypes.functionDeclaration,{
                            name: functionName
                        });
                    }
                } else {
                    if(line.length < 2) {
                        throw SyntaxError(invalidDeclaration());
                    }
                    const variableName = validateVariableName(line[1]);
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
                                    const listValueReport = valueReport(line[4]);
                                    const tokenType = line[2] === LIST ?
                                        tokenTypes.listDeclaration_fromOther:
                                        tokenTypes.groupDeclaration_fromOther;

                                    return getTokenObject(tokenType,{
                                        name: variableName,
                                        src: listValueReport
                                    });
                                } else {
                                    throw SyntaxError(invalidDeclaration());
                                }
                            } else {
                                throw SyntaxError(invalidDeclaration());
                            }
                        case LIST_DEFINE:
                        case GROUP_DEFINE:
                            if(line.length <= 3) {
                                throw SyntaxError(invalidDeclaration());
                            }
                            const listItems = validateListItems(line.slice(3));
                            const tokenType = line[2] === LIST_DEFINE ?
                                tokenTypes.listDeclaration_fromValues:
                                tokenTypes.groupDeclaration_fromValues;

                            return getTokenObject(tokenType,{
                                name: variableName,
                                values: listItems
                            });
                        case FROM:
                            if(line.length !== 4) {
                                throw SyntaxError(invalidDeclaration());
                            }
                            const sourceValue = valueReport(line[3]);

                            const variableTokenType = sourceValue.type === valueReportTypes.byReference ?
                                tokenTypes.variableDeclaration_byVariable:
                                tokenTypes.variableDeclaration_byValue;
                            
                            const tokenObject = getTokenObject(variableTokenType,{
                                name: variableName,
                                src: sourceValue.value
                            });

                            if(sourceValue.index) {
                                tokenObject.src.index = sourceValue.index;
                            }
                            return tokenObject;
                        default:
                            if(line.length === 2) {
                                return getTokenObject(tokenTypes.variableDeclaration,{
                                    name: variableName
                                });
                            } else {
                                throw SyntaxError(unexpectedToken());
                            }
                    }
                }
            case SET:
                if(line.length < 2) {
                    throw SyntaxError(invalidSet());
                }
                const targetVariable = valueReport(line[1]);
                if(line.length < 3) {
                    throw SyntaxError(invalidSet());
                }
                if(line[2] !== FROM) {
                    throw SyntaxError(unexpectedToken());
                } else if(line.length !== 4) {
                    throw SyntaxError(invalidSet());
                }
                if(line.length < 4) {
                    throw SyntaxError(invalidSet());
                }
                const sourceVariable = valueReport(line[3]);
                if(line.length > 4) {
                    throw SyntaxError(invalidSet());          
                }
                const tokenObject = getTokenObject(tokenTypes.setVariable,{
                    name: targetVariable,
                    src: sourceVariable
                });
                return tokenObject;
        }

    }

    function tokenize(lines) {
        const preprocessed = [];
        let lineNumber = 0;
        while(lineNumber < lines.length) {
            const line = lines[lineNumber];
            const metadata = {
                lineNumber: lineNumber,
                originalLine: line
            };
            let schema;
            try {
                schema = getLineSchema(line);
            } catch(error) {
                error.metadata = metadata;
                throw error;
            }
            if(schema !== null) {
                schema.metadata = metadata;
                preprocessed.push(schema);
            }
            lineNumber++;
        }
        return preprocessed;
    }

    this.compile = function(lines) {
        let tokens;
        try {
            tokens = tokenize(lines);
        } catch(error) {
            if(advancedLogging===true) {
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
            assembly = compileTokens(tokens);
        } catch(error) {
            console.error(error,"Compiler failed during assembly generation");
            return;
        }
        return assembly;
    }

    console.log("OwO compiler loaded");
}
