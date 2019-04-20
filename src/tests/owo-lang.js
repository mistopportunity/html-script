import { registerTest } from "/test-manager.js";
import { OwO_Compiler } from "/compilers/owo-lang/main.js";

registerTest("OwO compiler",async function() {
    const advancedLogging = true;
    const compiler = new OwO_Compiler(advancedLogging);
    fetch("tests/script.ow").then(function(response) {
        return response.text();
    }).then(function(text) {
        compiler.compile(text.split("\n"));
    });
});
