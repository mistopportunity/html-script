export default OwO_Tokenizer;
import CONSTANT from "/compilers/owo-lang/constants.js";

function OwO_Tokenizer() {
    const INVALID_DECLARATION = "Invalid declaration";
    const REQUIRES_FUNCTION_PARAMETERS = "Expected function parameters but there are none";
    const UNKNOWN_OPERATION = "Unknown operation";
    const UNEXPECTED_TOKEN = "Unexpected token";
    const UNEXPECTED_VALUE = "Unexpected value";
    const EXPECTED_STRING_QUOTE = "Expected a string end quote";
    const INVALID_NUMBER_CHARACTER = "Number contains a non-number character";
    const INVALID_NUMBER = "Invalid static number";
    const INVALID_VARIABLE_SET = "Invalid variable set";
    const INVALID_OUTPUT_STATEMENT = "Invalid output statement";

    const INVALID_VARIABLE_NAME_KEYWORD = "Invalid variable name uses a reserved key word";
    const INVALID_VARIABLE_NAME_NUMBER = "Invalid variable name starts with a number";
    const INVALID_VARIABLE_NAME_ILLEGAL_CHAR = "Invalid variable name uses non-allowed characters";;
    const INVALID_VARIABLE_NAME_BAD_IDX = "Use of indexing is malformed";
    const INVALID_VARIABLE_NAME_ILLEGAL_IDX = "Use of indexing is not allowed";

    function getValueStub(value,typeName) {
        return {
            value: value,
            typeName: CONSTANT.valueTypes[typeName]
        }
    }
    function splitWithPotentialStrings(line,splitCharacter) {
        const newLine = [];
        let newLineBuffer = "";
        let makingString = false;
        for(let i = 0;i<line.length;i++) {
            const currentCharacter = line[i];
            switch(currentCharacter) {
                case CONSTANT.stringQuoteCharacter:
                    if(makingString) {
                        makingString = false;
                    } else {
                        makingString = true;
                    }
                    newLineBuffer += currentCharacter;
                    break;
                case splitCharacter:
                    if(makingString) {
                        newLineBuffer += currentCharacter;
                    } else {
                        if(newLineBuffer.trim().length) {
                            newLine.push(newLineBuffer);
                            newLineBuffer = "";
                        }
                    }
                    break;
                default:
                    newLineBuffer += currentCharacter;
                    break;
            }
        }
        if(newLineBuffer.trim().length) {
            newLine.push(newLineBuffer);
        }
        return newLine;
    }
    function validateVariableName(name) {
        for(let i = 1;i<name.length;i++) {
            const lastCharacter = name[i-1];
            const currentCharacter = name[i];
            if(lastCharacter === CONSTANT.indexingCharacter && currentCharacter === lastCharacter) {
                throw SyntaxError(INVALID_VARIABLE_NAME_BAD_IDX);
            }
        }
        const lookupName = name.split(CONSTANT.indexingCharacter);
        const lookupNameStart = lookupName[0];
        if(CONSTANT.keyWordsLookup[lookupNameStart]) {
            throw SyntaxError(INVALID_VARIABLE_NAME_KEYWORD);
        }
        if(CONSTANT.legalNumbersLookup[lookupNameStart[0]]) {
            throw SyntaxError(INVALID_VARIABLE_NAME_NUMBER);
        }
        for(const character of lookupNameStart) {
            if(!CONSTANT.legalVariableLettersLookup[character]) {
                throw SyntaxError(INVALID_VARIABLE_NAME_ILLEGAL_CHAR);
            }
        }
        if(lookupName.length > 1) {
            const errorWithReturnValues = SyntaxError(INVALID_VARIABLE_NAME_ILLEGAL_IDX);
            errorWithReturnValues.valueReportData = {
                rootName: lookupNameStart,
                remainingIndexers: lookupName.slice(1)
            };
            throw errorWithReturnValues;
        }
        return name;
    }
    function valueReport(text) {
        try {
            const name = validateVariableName(text);
            return {
                type: CONSTANT.valueReportTypes.byReference,
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
                    type: CONSTANT.valueReportTypes.byValue,
                    value: value
                };
            } catch {
                throw SyntaxError(UNEXPECTED_VALUE);
            }
        }
    }
    function validateListItems(text) {
        const valuesString = text.join("");
        const items = valuesString.split(CONSTANT.enumerableItemSeperator);
        for(let i = 0;i<items.length;i++) {
            const item = items[i];
            const report = valueReport(item);
            items[i] = report;
        }
        return items;
    }
    function validateValue(text) {
        switch(text) {
            case CONSTANT.TRUE:
            case CONSTANT.FALSE:
                return getValueStub(text===CONSTANT.TRUE,"boolean");
            default:
                if(text[0] === CONSTANT.stringQuoteCharacter) {
                    let string = "";
                    let didBreak = false;
                    for(let i = 1;i<text.length;i++) {
                        const character = text[i];
                        if(character === CONSTANT.stringQuoteCharacter) {
                            didBreak = true;
                            break;
                        }
                        string += character;
                    }
                    if(!didBreak) {
                        throw SyntaxError(EXPECTED_STRING_QUOTE);
                    }
                    return getValueStub(string,"string");
                } else {
                    let number = "";
                    for(let i = 0;i<text.length;i++) {
                        const character = text[i];
                        if(!CONSTANT.legalNumbersLookup[character]) {
                            throw SyntaxError(INVALID_NUMBER_CHARACTER);
                        }
                        number += character;
                    }
                    const parsedNumber = Number(number);
                    if(isNaN(parsedNumber)) {
                        throw SyntaxError(INVALID_NUMBER);
                    }
                    return getValueStub(parsedNumber,"number");
                }
        }
    }
    function getTokenObject(type,values) {
        values.type = type;
        return values;
    }
    function processDeclarationLine(line) {
        if(line[1] === CONSTANT.FUNCTION) {
            if(line.length < 2) {
                throw SyntaxError(INVALID_DECLARATION);
            }
            if(line[2].endsWith(CONSTANT.enumerableSeperator)) {
                const functionName = validateVariableName(line[2].substring(0,line[2].length-1));
                if(line.length > 3) {
                    const listItems = validateListItems(line.slice(3));
                    listItems.forEach(listItem => {
                        if(listItem.type === CONSTANT.valueTypes.byValue || listItem.index) {
                            throw SyntaxError(INVALID_DECLARATION);
                        }
                    });
                    return getTokenObject(CONSTANT.tokenTypes.functionDeclaration_WithParameters,{
                        name: functionName,
                        values: listItems
                    });
                } else {
                    throw SyntaxError(REQUIRES_FUNCTION_PARAMETERS);
                }
            } else {
                const functionName = validateVariableName(line[2]);
                if(line.length !== 3) {
                    throw SyntaxError(INVALID_DECLARATION);
                }
                return getTokenObject(CONSTANT.tokenTypes.functionDeclaration,{
                    name: functionName
                });
            }
        } else {
            if(line.length < 2) {
                throw SyntaxError(INVALID_DECLARATION);
            }
            const variableName = validateVariableName(line[1]);
            switch(line[2]) {
                case CONSTANT.LIST:
                case CONSTANT.GROUP:
                    if(line.length === 3) {
                        const tokenType = line[2] === CONSTANT.LIST ?
                            CONSTANT.tokenTypes.listDeclaration_empty:
                            CONSTANT.tokenTypes.groupDeclaration_empty;
                        return getTokenObject(tokenType,{
                            name: variableName
                        });
                    } else if(line.length === 5) {
                        if(line[3] === CONSTANT.RIGHT_ARROW) {
                            const listValueReport = valueReport(line[4]);
                            const tokenType = line[2] === CONSTANT.LIST ?
                                CONSTANT.tokenTypes.listDeclaration_fromOther:
                                CONSTANT.tokenTypes.groupDeclaration_fromOther;

                            return getTokenObject(tokenType,{
                                name: variableName,
                                src: listValueReport
                            });
                        } else {
                            throw SyntaxError(INVALID_DECLARATION);
                        }
                    } else {
                        throw SyntaxError(INVALID_DECLARATION);
                    }
                case CONSTANT.LIST_DEFINE:
                case CONSTANT.GROUP_DEFINE:
                    if(line.length <= 3) {
                        throw SyntaxError(INVALID_DECLARATION);
                    }
                    const listItems = validateListItems(line.slice(3));
                    const tokenType = line[2] === CONSTANT.LIST_DEFINE ?
                        CONSTANT.tokenTypes.listDeclaration_fromValues:
                        CONSTANT.tokenTypes.groupDeclaration_fromValues;

                    return getTokenObject(tokenType,{
                        name: variableName,
                        values: listItems
                    });
                case CONSTANT.LEFT_ARROW:
                    if(line.length !== 4) {
                        throw SyntaxError(INVALID_DECLARATION);
                    }
                    if(line[3] === CONSTANT.INPUT) {
                        return getTokenObject(CONSTANT.tokenTypes.declareVariable_withInput,{
                            name: variableName
                        });
                    } else {
                        throw SyntaxError(INVALID_DECLARATION);
                    }
                case CONSTANT.RIGHT_ARROW:
                    if(line.length !== 4) {
                        throw SyntaxError(INVALID_DECLARATION);
                    }
                    const sourceValue = valueReport(line[3]);

                    const variableTokenType = sourceValue.type === CONSTANT.valueReportTypes.byReference ?
                        CONSTANT.tokenTypes.variableDeclaration_byVariable:
                        CONSTANT.tokenTypes.variableDeclaration_byValue;
                    
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
                        return getTokenObject(CONSTANT.tokenTypes.variableDeclaration,{
                            name: variableName
                        });
                    } else {
                        throw SyntaxError(UNEXPECTED_TOKEN);
                    }
            }
        }
    }
    function processSetLine(line) {
        if(line.length < 2) {
            throw SyntaxError(INVALID_VARIABLE_SET);
        }
        const targetVariable = valueReport(line[1]);
        if(line.length < 3) {
            throw SyntaxError(INVALID_VARIABLE_SET);
        }
        switch(line[2]) {
            case CONSTANT.RIGHT_ARROW:
                break;
            case CONSTANT.LEFT_ARROW:
                if(line.length !== 4) {
                    throw SyntaxError(INVALID_VARIABLE_SET);
                }
                if(line[3] === CONSTANT.INPUT) {
                    return getTokenObject(CONSTANT.tokenTypes.setVariable_toInput,{
                        name: targetVariable
                    });
                } else {
                    throw SyntaxError(INVALID_VARIABLE_SET);
                }
            default:
                throw SyntaxError(INVALID_VARIABLE_SET);
        }
        if(line.length !== 4) {
            throw SyntaxError(INVALID_VARIABLE_SET);
        }
        if(line.length < 4) {
            throw SyntaxError(INVALID_VARIABLE_SET);
        }
        const sourceVariable = valueReport(line[3]);
        if(line.length > 4) {
            throw SyntaxError(INVALID_VARIABLE_SET);          
        }
        const tokenObject = getTokenObject(CONSTANT.tokenTypes.setVariable,{
            name: targetVariable,
            src: sourceVariable
        });
        return tokenObject;
    }
    function getLineSchema(line) {
        if(!line) {
            return null;
        }
        line = splitWithPotentialStrings(line,CONSTANT.tokenSeperator);
        if(!line.length) {
            return null;
        }
        switch(line[0]) {
            default:
                throw SyntaxError(UNKNOWN_OPERATION);
            case CONSTANT.OUTPUT_LIST:
                const outputItems = validateListItems(line.slice(1));
                return getTokenObject(CONSTANT.tokenTypes.send_output_many,{
                    values: outputItems
                });
            case CONSTANT.OUTPUT:
                if(line.length === 2) {
                    const value = valueReport(line[1]);
                    return getTokenObject(CONSTANT.tokenTypes.send_output,{
                        value:value
                    });
                } else {
                    throw SyntaxError(INVALID_OUTPUT_STATEMENT);
                }
            case CONSTANT.DECLARE:
                return processDeclarationLine(line);
            case CONSTANT.SET:
                return processSetLine(line);
        }
    }
    this.tokenize = function(lines) {
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
};
