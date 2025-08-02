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

function hexToRgba(hex)
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
        opacity: parseInt(result[4], 16)/255,
    } : null;
}

export {
    parseHtml,
    downloadTXT,
    isNullOrWhitespace,
    dequote,
    hexToRgba
};