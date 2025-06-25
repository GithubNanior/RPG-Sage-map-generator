function parseHtml(text)
{
    let node = document.createElement("div");
    node.innerHTML = text;
    return node.childNodes[0];
}

export {
    parseHtml
};