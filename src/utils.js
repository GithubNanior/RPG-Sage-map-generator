function parseHtml(text)
{
    let node = document.createElement("div");
    node.innerHTML = text;
    return node.childNodes[0];
}

function isNullOrWhitespace(string){
    return string == null || string.match(/^ *$/) != null;
}

export {
    parseHtml,
    isNullOrWhitespace
};