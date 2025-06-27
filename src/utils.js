function parseHtml(text)
{
    let node = document.createElement("div");
    node.innerHTML = text;
    return node.childNodes[0];
}

function downloadTXT(fileName, fileContent)
{
    const element = document.createElement('a');
    element.setAttribute('href','data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent));
    element.setAttribute('download', `${fileName}.map.txt`);
    element.click();
}

function isNullOrWhitespace(string){
    return string == null || string.match(/^ *$/) != null;
}

function dequote(value)
{
    const regex = /^(?:“[^”]*”|„[^“]*“|„[^”]*”|"[^"]*"|'[^']*'|‘[^’]*’)$/i;
	return regex.test(value) ? value.slice(1, -1) : value;
}

export {
    parseHtml,
    downloadTXT,
    isNullOrWhitespace,
    dequote
};