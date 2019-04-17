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
    {
        op: DECLARE_OP_CODE,
        imp: {
            name: "my_function",
            type: FUNCTION_TYPE_CODE,
            parameters: ["rdc"],
            code: [
                {
                    op: REGISTER_OP_CODE,
                    imp: {
                        name: "rdc"
                    }
                },
                {
                    op: MATH_CODE_ADD,
                    imp: {
                        value: "Hello, world! "
                    }
                },
                {
                    op: SET_OP_CODE,
                    imp: {
                        name: "rdc"
                    }
                },
                {
                    op: EXECUTE_OP_CODE,
                    imp: {
                        name: "output"
                    }
                },
                {
                    op: RETURN_OP_CODE,
                    imp: {
                        name: "rdc"
                    }
                }
            ]
        }
    },
    {
        op: SET_PARAMETER_OP_CODE,
        imp: {
            value: ""
        }
    },
    {
        op: EXECUTE_OP_CODE,
        imp: {
            name: "my_function"
        }
    },
    {
        op: SET_PARAMETER_OP_CODE
    },
    {
        op: EXECUTE_OP_CODE,
        imp: {
            name: "my_function"
        }
    },
    {
        op: SET_PARAMETER_OP_CODE
    },
    {
        op: EXECUTE_OP_CODE,
        imp: {
            name: "my_function"
        }
    },
    {
        op: SET_PARAMETER_OP_CODE
    },
    {
        op: EXECUTE_OP_CODE,
        imp: {
            name: "my_function"
        }
    },
    {
        op: SET_PARAMETER_OP_CODE
    },
    {
        op: EXECUTE_OP_CODE,
        imp: {
            name: "my_function"
        }
    },
    {
        op: SET_PARAMETER_OP_CODE
    },
    {
        op: EXECUTE_OP_CODE,
        imp: {
            name: "my_function"
        }
    }
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
