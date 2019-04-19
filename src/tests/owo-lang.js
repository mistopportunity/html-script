registerTest("OwO compiler",async function() {
    const compiler = new OwO_Compiler(advancedLogging=true);
    fetch("tests/script.ow").then(function(response) {
        return response.text();
    }).then(function(text) {
        compiler.compile(text.split("\n"));
    });
});
