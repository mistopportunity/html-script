const OwO_Constants = new (function(){
    const enumerableSeperator = ":";

    this.FUNCTION = "function";
    this.DECLARE = "dec";
    this.SET = "set";
    this.IF = "if";
    this.ELSE = "else";
    this.LIST = "list";
    this.GROUP = "group";
    this.LIST_DEFINE = this.LIST + enumerableSeperator;
    this.GROUP_DEFINE = this.GROUP + enumerableSeperator;
    this.INPUT = "input";
    this.OUTPUT = "output";
    this.OUTPUT_LIST = this.OUTPUT + enumerableSeperator;
    this.DELETE = "del";
    this.RIGHT_ARROW = "->";
    this.LEFT_ARROW = "<-";
    this.EQUAL = "=";
    this.NOT_EQUAL = "!=";
    this.GREATER = ">";
    this.LESSER = "<";
    this.GREATER_OR_EQUAL = ">=";
    this.LESS_OR_EQUAL = "<=";
    this.TRUE = "true";
    this.FALSE = "false";
    this.DO = "call";
    this.ADD = "add";
    this.SUBTRACT = "sub";
    this.RETURN = "ret";
    this.WHILE = "while";
    this.LENGTH = "size";
    this.CONTAINS = "cont";

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
        send_output_many: "out_x",

        empty_line: "emp_ln",
        declareVariable_withFunctionCall: "vardef_fc",
        declareVariable_withFunctionCall_param: "vardef_fcp",

        delete_variable: "delvar",
        if_statement: "if",
        else_statement: "else",

        call_function: "callf",
        call_function_param: "callf_p",

        variable_operation: "varop",

        block_return: "blkrt",
        block_return_value: "blkrt_vl",
        while_statement: "loop",

        declareVariable_byLength: "vardef_sz",
        declareVariable_byContains: "vardef_cn",

        setVariable_byLength: "setvr_siz",
        setVariable_byContains: "setvr_cn"

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
export default OwO_Constants;
