function compileScript(name,callback) {
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.onload = function iframeCallbackHandler() {
        const compilationResult = compileScriptBody(
            iframe.contentWindow.document.body
        );
        if(callback) {
            callback(compilationResult);
        } else {
            console.log(compilationResult);
            console.log("Script compilation done!");
        }
    }
    iframe.src = name;
}

function formatGenericScopeName(name) {
    return `<${name}>`
}
function formatFunctionScopeName(name) {
    return `[${name}]`;
}

const tagRoutingTable = {
    "FORM": compileFunction,
    "OL": compileArray,
    "UL": compileSingleList,
    "UL.switch": compileSwitch,
    "LI": compileListItem,
    "CITE": compileExecutor,
    "INPUT": compileDeclaration,
    "DATA": compileAccessor,
    "DIV": compileGenericBlock,
    "DIV.loop": compileLoop,
    "DIV.comparison": compileComparison,
    "OUTPUT": compileFunctionOutput,
    "MATH": compileMathSymbol
}
const listItemRoutingTable = {
    "OL": compileArrayItem,
    "UL": compileSingleListItem,
    "UL.switch": compileSwitchBlock
}

function compileFunction(element,scope) {
    const functionName = element.title;
    const functionCode = [];
    const functionScope = {
        __internal__: {
            name: formatFunctionScopeName(functionName),
            parent: scope
        }
    };

}
function compileArray(element,scope) {

}
function compileSingleList(element,scope) {

}
function compileExecutor(element,scope) {

}
function compileDeclaration(element,scope) {

}
function compileAccessor(element,scope) {

}
function compileSwitch(element,scope) {

}
function compileLoop(element,scope) {

}
function compileComparison(element,scope) {

}
function compileFunctionOutput(element,scope) {

}
function compileMathSymbol(element,scope) {

}
function compileListItem(element,scope) {
    const routingName = getElementRoutingName(element.parentElement);
    const route = listItemRoutingTable[routingName]
    if(route) {
        return route(element,scope);
    } else {
        console.error(`Unexpected parent element '${routingName}' for list item of '${scope.__internal__.name}'`);
    }
}
function compileArrayItem(element,scope) {

}
function compileSingleListItem(element,scope) {

}

function compileSwitchBlock(element,scope) {
    const switchCode = [];
    const switchScope = {
        __internal__: {
            name: formatGenericScopeName("switch"),
            parent: scope
        }
    };
}

function compileGenericBlock(element,scope) {
    const blockCode = [];
    const blockScope = {
        __internal__: {
            name: formatGenericScopeName("block"),
            parent: scope
        }
    }
}

function getElementRoutingName(element,scope) {
    const tagName = element.tagName;
    const className = element.className;
    return `${tagName}${className?"."+className:""}`;
}

function compileScriptBody(body) {
    const scope = {
        __internal__: {
            name: formatFunctionScopeName("main")
        }
    };
    const mainCode = [];

    const children = body.children;
    for(let i = 0;i < children.length;i++) {
        const element = children[i];

        const routingName = getElementRoutingName(element);
        const route = tagRoutingTable[routingName];

        if(route) {
            mainCode.push(route(element,scope));
        } else {
            console.error(`Unexpected element '${routingName}' at child #${i+1} of '${scope.__internal__.name}'`);
            return;
        }
    }
    return mainCode;
}

//compileScript("script.html");
