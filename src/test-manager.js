const tests = [];
function registerTest(name,code) {
    tests.push({
        name:name,
        code:code
    });
}
async function runTest(test) {
    if(typeof test.code === "function") {
        await test.code.call(null);
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

