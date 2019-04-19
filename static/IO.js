const outputElement = document.getElementById("output");
const awaitingInputElement = document.getElementById("awaiting-input");
const awaitingInputText = "Awaiting input via 'sendInput'...";
const awaitingInputLogStyle = "background-color: black; color: white;padding: 4px";
awaitingInputElement.textContent = awaitingInputText;
awaitingInputElement.classList.add("hidden");

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
        awaitingInputElement.classList.add("hidden");
        inputPromiseResolver(inputStack.shift());
    }
}
function getInput() {
    if(inputStack.length) {
        return inputStack.shift();
    }
    const inputPromise = new Promise(resolve => {
        awaitingInputElement.classList.remove("hidden");
        console.log(`%c${awaitingInputText}`,awaitingInputLogStyle);
        inputPromiseResolver = resolve;
    });
    return inputPromise;
}
