const tests = [];
function registerTest(name,code) {
    tests.push({
        name:name,
        code:code
    });
}
async function runTest(test) {
    if(typeof test.code === "function") {
        test.code.call(null);
    } else {
        await executeScript(test.code);
    }
}
async function runTests(raw=false) {
    if(raw) {
        for(let i = 0;i<tests.length;i++) {
            await runTest(tests[i]);
        }
        return;
    }
    let passed = 0;
    for(let i = 0;i<tests.length;i++) {
        const test = tests[i];
        try {
            await runTest(test);
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
    };
    if(tests.length !== 1) {
        console.log(`${passed}/${tests.length} tests survived their execution (${(passed/tests.length*100).toFixed(1)}%)`);
    }
}

const accumlationTest = [
    OP_GEN.functionBlock("my_function",[
        OP_GEN.setRegister_ByVariable("rdc"),
        OP_GEN.modifyRegister_ByValue("add","Hello, world! "),
        OP_GEN.output(),
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

    OP_GEN.output()
];
registerTest("OwO com",() => {
    const compiler = new OwO_Compiler(advancedLogging=true);
    compiler.compile([
        "dec function test_function",
        "dec function test_function_p: a,b,c",

        "dec animal list: objects#0, objects#1, objects#3, objects2D#0#0",

        "dec firstAnimal -> animals2D#0#index#index#0#49#index",
        'dec persons list -> allObjects#"people"',

        "dec camel -> animals#2",
        "dec camel -> animals#index",
        "dec firstAnimal -> animals2D#index#0",
        "dec firstAnimal -> animals2D#0#index",
        "dec camel",
        "dec dog -> 278",
        'dec cat -> "meow"',
        "dec function selfDestruct",
        "dec animal list",
        "dec animal group",
        "dec animal list: dog, cat, camel",
        "dec animal group: dog, cat, camel",
        "dec favoriteNumbers list: 1, 2, 3, 4, 5",
        "dec animal list -> animals",
        "dec animal group -> animals",
        "dec dogIsHappy -> true",
        "dec catIsHappy -> false"
    ]);
});
registerTest("Accumulation test",accumlationTest);
registerTest("Jump test",jumpTest);
runTests(raw=false);
