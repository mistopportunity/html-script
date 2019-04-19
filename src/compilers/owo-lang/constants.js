const OwO_Constants = new (function(){

    const enumerableSeperator = ":";

    this.DECLARE = "dec";
    this.WRITE = "write";
    this.READ = "read";
    this.RETURN = "return";
    this.WHILE = "while";
    this.OPEN_BRACE = "OwO";
    this.END_BRACE = "UwO";
    this.IF = "if";
    this.ELSE = "else";

    this.FUNCTION = "function";

    this.LIST = "list";
    this.GROUP = "group";
    this.LIST_DEFINE = this.LIST + enumerableSeperator;
    this.GROUP_DEFINE = this.GROUP + enumerableSeperator;

    this.SET = "set";
    this.DO = "call";
    this.LENGTH = "size";

    this.INPUT = "input";
    this.OUTPUT = "output";
    this.OUTPUT_LIST = this.OUTPUT + enumerableSeperator;

    this.EQUAL = "=";
    this.NOT_EQUAL = "!=";
    this.GREATER = ">";
    this.LESSER = "<";
    this.GREATER_OR_EQUAL = ">=";
    this.LESS_OR_EQUAL = "<=";

    this.TRUE = "true";
    this.FALSE = "false";

    this.ADD = "add";
    this.SUBTRACT = "subtract";
    this.RIGHT_ARROW = "->";
    this.LEFT_ARROW = "<-";

    this.keyWords = Object.values(this);

    this.indexingCharacter = "#";
    this.tokenSeperator = " ";
    this.stringQuoteCharacter = '"';
    this.legalVariableLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_";
    this.legalNumbers = "1234567890";
    this.enumerableSeperator = enumerableSeperator;
    this.enumerableItemSeperator = ",";
    
    this.legalNumbersLookup = {};
    this.legalNumbers.split("").forEach(number => {
        this.legalNumbersLookup[number] = true;
    });
    this.legalVariableLettersLookup = {};
    this.legalVariableLetters.split("").forEach(letter => {
        this.legalVariableLettersLookup[letter] = true
    });
    this.keyWordsLookup = {};
    this.keyWords.forEach(keyWord => {
        if(this.keyWordsLookup[keyWord]) {
            throw Error(`Keyword text '${keyWord}' is repeated`);
        }
        this.keyWordsLookup[keyWord] = true;
    });

    this.tokenTypes = {
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

        setVariable: "setvr",
        setVariable_toInput: "setvr_in",

        declareVariable_withInput: "vardef_in",

        send_output: "out",
        send_output_many: "out_x"
    };

    this.valueReportTypes = {
        byReference: "by_ref",
        byValue: "by_val"
    };
    this.valueTypes = {
        boolean: "bool",
        number: "num",
        string: "string"
    }

    this.SINGLE_LINE_COMMENT = "//";
})();
