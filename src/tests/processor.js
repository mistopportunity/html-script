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
registerTest("Accumulation test",accumlationTest);
registerTest("Jump test",jumpTest);
registerTest("Input test",[
    OP_GEN.input(),
    OP_GEN.output()
]);
sendInput(12345567890);
