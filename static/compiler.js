function compileScript(name,callback=()=>{}) {
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.onload = () => {
        callback(compileScriptBody(
            iframe.contentWindow.document.body
        ));
    }
    iframe.src = name;
}

const nodeRoutingTable = {
    "FORM": compileFunction,
    "OL": compileArray,
    "UL": compileSingleList,
    "UL.switch": compileSwitch,
    "CITE": compileExecutor,
    "INPUT": compileDeclaration,
    "DATA": compileAccessor,
    "DIV.loop": compileLoop,
    "DIV.comparison": compileComparison,
    "OUTPUT": compileFunctionOutput,
    "MATH": compileMathSymbol
}

function compileFunction(element) {

}
function compileArray(element) {

}
function compileSingleList(element) {

}
function compileExecutor(element) {

}
function compileDeclaration(element) {

}
function compileAccessor(element) {

}
function compileSwitch(element) {

}
function compileLoop(element) {

}
function compileComparison(element) {

}
function compileFunctionOutput(element) {

}

function getElementRoutingName(element) {
    const nodeName = element.nodeName;
    const className = element.className;
    return `${nodeName}${className?"."+className:""}`;
}

function compileScriptBody(body) {
    const mainMethod = [];
    const children = body.children;
    for(let i = 0;i < children.length;i++) {
        const element = children[i];

        const routingName = getElementRoutingName(element);
        const route = nodeRoutingTable[routingName];

        if(route) {
            mainMethod.push(route(element));
        } else {
            console.error(`Unexpected element '${routingName}' at child #${i+1}`);
            return;
        }
    }
    return mainMethod;
}

compileScript("script.html");
