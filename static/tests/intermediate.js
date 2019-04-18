const tests = [];
function registerTest(name,code) {
    tests.push({
        name:name,
        code:code
    });
}
function runTest(test) {
    if(typeof test.code === "function") {
        test.code.call(null);
    } else {
        executeScript(test.code);
    }
}
function runTests(raw=false) {
    if(raw) {
        tests.forEach(runTest);
        return;
    }
    let passed = 0;
    tests.forEach(test => {
        try {
            runTest(test);
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
registerTest("OwO com",() => {
    const compiler = new OwO_Compiler();
    compiler.compile([
        'decware persons list from allObjects#"people"',
        "decware animal list: objects#0, objects#1, objects#3, objects2D#0#0",
        "decware camel wif animals#2",
        "decware camel wif animals#index",
        "decware firstAnimal wif animals2D#index#0",
        "decware firstAnimal wif animals2D#0#index#index#0#49#index",
        "decware firstAnimal wif animals2D#0#index",
        "decware camel",
        "decware dog wif 278",
        'decware cat wif "meow"',
        "decware function selfDestruct",
        "decware animal list",
        "decware animal gwoup",
        "decware animal list: dog, cat, camel",
        "decware animal gwoup: dog, cat, camel",
        "decware favoriteNumbers list: 1, 2, 3, 4, 5",
        "decware animal list from animal",
        "decware animal gwoup from animal",
        "decware dogIsHappy wif true",
        "decware catIsHappy wif false"
    ]);
});
registerTest("Accumulation test",accumlationTest);
registerTest("Jump test",jumpTest);
runTests(raw=true);
