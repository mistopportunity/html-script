import { registerTest } from "/test-manager.js";
import { OwO_Compiler } from "/compilers/owo-lang/main.js";

registerTest("OwO compiler",async function() {
    const response = await fetch("tests/compile-test.ow");
    const text = await response.text();
    const advancedLogging = true;
    const compiler = new OwO_Compiler(advancedLogging);
    compiler.compile(text.split("\n"));
});
