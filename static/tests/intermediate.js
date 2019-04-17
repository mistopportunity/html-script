const tests = [];
function registerTest(name,code) {
    tests.push({
        name:name,
        code:code
    });
}
function runTests() {
    let passed = 0;
    tests.forEach(test => {
        try {
            executeScript(test.code);
            console.log(`${test.name} passed :)`);
            passed++;
        } catch(exception) {
            console.error(exception);
            console.log(`${test.name} failed :(`);
        }
    });
    console.log(`${passed}/${tests.length} test${tests.length !== 1 ? "s" : ""} survived its execution (${(passed/tests.length*100).toFixed(1)}%)`);
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
        OP_GEN.returnByValue(true)
    ]),
    OP_GEN.conditionalJump()
]

registerTest("Accumulation test",accumlationTest);
runTests();
