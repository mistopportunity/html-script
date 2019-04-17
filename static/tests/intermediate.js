const tests = [];
function registerTest(name,code) {
    tests.push({
        name:name,
        code:code
    });
}
function runTests(raw=false) {
    if(raw) {
        tests.forEach(test=>executeScript(test.code));
        return;
    }
    let passed = 0;
    tests.forEach(test => {
        try {
            executeScript(test.code);
            const message = `${test.name} passed :)`;
            console.log(message);
            output(message,"green");
            passed++;
        } catch(exception) {
            console.error(exception);
            const message = `${test.name} failed :(`;
            console.log(message);
            output(message,"red");
        }
    });
    if(tests.length !== 1) {
        console.log(`${passed}/${tests.length} tests survived their execution (${(passed/tests.length*100).toFixed(1)}%)`);
    }
}

const accumlationTest = [
    OP_GEN.functionBlock("my_function",[
        OP_GEN.setRegister_ByVariable("rdc"),
        OP_GEN.modifyRegister_ByValue("add","Hello, world! "),
        OP_GEN.execute("output"),
        OP_GEN.return()
    ],"rdc"),

    OP_GEN.setFunctionParameter_ByValue(""),
    OP_GEN.execute("my_function"),

    OP_GEN.setFunctionParameter_ByRegister(),
    OP_GEN.execute("my_function"),

    OP_GEN.setFunctionParameter_ByRegister(),
    OP_GEN.execute("my_function"),

    OP_GEN.setFunctionParameter_ByRegister(),
    OP_GEN.execute("my_function")
];

const jumpTest = [
    OP_GEN.functionBlock("test_function",[
        OP_GEN.return_ByValue(false)
    ]),
    OP_GEN.execute("test_function"),
    OP_GEN.conditionalJump(1,3,false),

    //con-1
    OP_GEN.setRegister_ByValue("Test function returned true"),
    OP_GEN.jump(2,false),
    //con-2
    OP_GEN.setRegister_ByValue("Test function returned false"),

    OP_GEN.execute("output")
];

registerTest("Accumulation test",accumlationTest);
registerTest("Jump test",jumpTest);
runTests();
