const code = [
    {
        op: "dec",
        imp: {
            name: "my_function",
            type: "fnc",
            parameters: [],
            code: [
                {
                    op: "reg",
                    imp: {
                        value: "Hello, world!"
                    }
                },
                {
                    op: "exe",
                    imp: {
                        name: "output"
                    }
                }
            ]
        }
    },
    {
        op: "exe",
        imp: {
            name: "my_function"
        }
    }
];
executeScript(code);