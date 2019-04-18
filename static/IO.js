const outputElement = document.getElementById("output");
function output(text,color) {
    const paragraph = document.createElement("p");
    paragraph.appendChild(document.createTextNode(text));
    outputElement.appendChild(paragraph);
    if(color) {
        switch(color) {
            default:
                return;
            case "red":
                break;
            case "green":
                color = "rgb(0,255,24)";
                break;
        }
        paragraph.style.backgroundColor = "black";
        paragraph.style.color = color;
        paragraph.style.textDecoration = "underline";
    }
}
const inputStack = [];
let inputPromiseResolver = null;
function sendInput(value) {
    switch(typeof value) {
        case "string":
            value.split("").forEach(character => inputStack.push(character));
            break;
        case "boolean":
            inputStack.push(value);
            break;
        case "number":
            if(isNaN(value)) {
                console.error("Input number is NaN");
                return;
            }
            inputStack.push(value);
            break;
        default:
            console.error("Invalid input data type");
            return;
    }
    if(inputPromiseResolver) {
        inputPromiseResolver(inputStack.shift());
    }
}
function getInput() {
    if(inputStack.length) {
        return inputStack.shift();
    }
    const inputPromise = new Promise(resolve => {
        inputPromiseResolver = resolve;
    });
    return inputPromise;
}
