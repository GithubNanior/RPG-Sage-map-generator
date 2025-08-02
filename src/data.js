import { isNullOrWhitespace, dequote } from "./utils";
import { Event } from "./event";
import { DataList } from "./dataList";
import { TokenTypes } from "./tokenUtils";

const terrainList = new DataList({
    name: "New TerrainFeature",
    type: TokenTypes.TERRAIN,
    url: "",
    x: 1,
    y: 1,
    width: 1,
    height: 1
});
const auraList = new DataList({
    name: "New Aura",
    type: TokenTypes.AURA,
    anchor: "",
    opacity: 0.5,
    url: "",
    x: 1,
    y: 1,
    width: 1,
    height: 1
});
const tokenList = new DataList({
    name: "New Token",
    type: TokenTypes.TOKEN,
    url: "",
    x: 1,
    y: 1,
    width: 1,
    height: 1,
    user: ""
});

let name = "";
let mapURL = "";
let gridRows = 0;
let gridColumns = 0;
let spawnX = 0;
let spawnY = 0;

const onNameSet = new Event();
const onMapSet = new Event();
const onGridSet = new Event();
const onSpawnSet = new Event();

function setName(newName)
{
    name = newName;
    onNameSet.invoke(newName);
}

function setMapURL(newURL)
{
    mapURL = newURL;
    onMapSet.invoke(newURL);
}

function setGrid(columns, rows)
{
    gridColumns = columns;
    gridRows = rows;
    onGridSet.invoke(columns, rows);
}

function setSpawn(x, y)
{
    spawnX = x;
    spawnY = y;
    onSpawnSet.invoke(x, y);
}

function serializeData()
{
    return [
        serializeMap(),
        ...terrainList.listElements.filter((terrain) => terrain).map((terrain) => serializeTerrain(terrain)),
        ...auraList.listElements.filter((aura) => aura).map((aura) => serializeAura(aura)),
        ...tokenList.listElements.filter((token) => token).map((token) => serializeToken(token))
    ].join("\n");
}

function serializeMap()
{
    return `[map]
url=${mapURL}
name=${name}
grid=${gridColumns}x${gridRows}
spawn=${spawnX},${spawnY}
`;
}

function serializeTerrain(token)
{
    return `[terrain]
url=${token.url}
name=${token.name}
size=${token.width}x${token.height}
position=${token.x},${token.y}
`;
}

function serializeAura(aura)
{
    return `[aura]
url=${aura.url}
name=${aura.name}
anchor=${aura.anchor}
opacity=${aura.opacity}
size=${aura.width}x${aura.height}
position=${aura.x},${aura.y}
`;
}

function serializeToken(token)
{
    return `[token]
url=${token.url}
name=${token.name}
size=${token.width}x${token.height}
position=${token.x},${token.y}
user=${token.user}
`;
}

/** 
 * Match a line and cleans it up for use, returns undefined if invalid.
 * @param {boolean} keepMatch - Whether or not to keep the part matching regex.
 * @param {number} valueCount - If above 0, interpret the value as a vector and split it by x & commas, returning them as an array of numbers with a length of valueCount.
 */
function matchLine(lines, regex, keepMatch = false, valueCount = 0)
{
    let line = lines.find((val) => regex.test(val));

	if (!line) return undefined;

    if (!keepMatch)
    {
        line = line.replace(regex, "");
    }
    line = dequote(line).trim();

    if (valueCount > 0)
    {
        const values = line.split(/[x,]/).map((val) => +val.trim());
        if (values.length != valueCount || values.find((val) => isNaN(val)))
        {
            return undefined;
        }
        return values;
    }
    return line;
}

function splitChunks(serializedData)
{
    const chunks = [];
    const chunkHeaderRegex = /^\s*\[(map|terrain|token|aura)\]\s*$/i;
    const lines = serializedData.split(/\r?\n\r?/).filter((value) => !isNullOrWhitespace(value));

    let isChunk = false;
    let chunkStart = 0;
    for (let i = 0; i < lines.length; i++)
    {       
        if (chunkHeaderRegex.test(lines[i]))
        {
            if (isChunk)
            {
                chunks.push(lines.slice(chunkStart, i));
            }
            chunkStart = i;
            isChunk = true;
        }
    }

    if (isChunk)
    {
        chunks.push(lines.slice(chunkStart, lines.length));
    }

    return chunks;
}

function matchChunk(chunks, headerRegex)
{
    return chunks.find((chunk) => headerRegex.test(chunk[0]))
}

function matchChunks(chunks, headerRegex)
{
    return chunks.filter((chunk) => headerRegex.test(chunk[0]))
}

function load(serializedData)
{
    auraList.clear();
    tokenList.clear();
    terrainList.clear();


    const chunks = splitChunks(serializedData);

    const mapChunk = matchChunk(chunks, /^\s*\[map\]\s*$/i);
    if (mapChunk)
    {
        const map = deserializeMap(mapChunk);
        setName(map.name);
        setMapURL(map.mapURL);
        setGrid(map.gridColumns, map.gridRows);
        setSpawn(map.spawnX, map.spawnY);
    }

    matchChunks(chunks, /^\s*\[token\]\s*$/i).forEach((chunk) => tokenList.add(deserializeToken(chunk)));

    matchChunks(chunks, /^\s*\[terrain\]\s*$/i).forEach((chunk) => terrainList.add(deserializeTerrain(chunk)));

    matchChunks(chunks, /^\s*\[aura\]\s*$/i).forEach((chunk) => auraList.add(deserializeAura(chunk)));
}

function deserializeMap(lines)
{
    const [gridColumns, gridRows] = matchLine(lines, /^grid=/i, false, 2) ?? Array(2);
    const [spawnX, spawnY] = matchLine(lines, /^spawn=/i, false, 2) ?? Array(2);

    return {
        name: matchLine(lines, /^name=/i),
        mapURL: matchLine(lines, /^url=/i) ?? matchLine(lines, /^https?\:\/\//i, true),
        gridColumns, gridRows,
        spawnX, spawnY
    };
}

function deserializeTerrain(lines)
{
    const [x, y] = matchLine(lines, /^pos(ition)?=/i, false, 2)
        ?? [+matchLine(lines, /^col=/i), +matchLine(lines, /^row=/i)]
        ?? Array(2);
    
    const [width, height] = matchLine(lines, /^size=/i, false, 2)
		?? [+matchLine(lines, /^cols=/i), +matchLine(lines, /^rows=/i)]
        ?? Array(2);

    return {
        name: matchLine(lines, /^name=/i),
        url: matchLine(lines, /^url=/i) ?? matchLine(lines, /^https?\:\/\//i, true),
        x, y,
        width, height
    };
}

function deserializeAura(lines)
{
    const [x, y] = matchLine(lines, /^pos(ition)?=/i, false, 2)
        ?? [+matchLine(lines, /^col=/i), +matchLine(lines, /^row=/i)]
        ?? Array(2);
    
    const [width, height] = matchLine(lines, /^size=/i, false, 2)
		?? [+matchLine(lines, /^cols=/i), +matchLine(lines, /^rows=/i)]
        ?? Array(2);

    return {
        name: matchLine(lines, /^name=/i),
        url: matchLine(lines, /^url=/i) ?? matchLine(lines, /^https?\:\/\//i, true),
        anchor: matchLine(lines, /^anchor=/i),
        x, y,
        width, height
    };
}

function deserializeToken(lines)
{
    const [x, y] = matchLine(lines, /^pos(ition)?=/i, false, 2)
        ?? [+matchLine(lines, /^col=/i), +matchLine(lines, /^row=/i)]
        ?? Array(2);
    
    const [width, height] = matchLine(lines, /^size=/i, false, 2)
		?? [+matchLine(lines, /^cols=/i), +matchLine(lines, /^rows=/i)]
        ?? Array(2);

    return {
        name: matchLine(lines, /^name=/i),
        url: matchLine(lines, /^url=/i) ?? matchLine(lines, /^https?\:\/\//i, true),
        user: matchLine(lines, /^user=/i),
        x, y,
        width, height
    };
}

export {
    name as mapName,
    setName,
    setMapURL,
    setGrid,
    setSpawn,
    onNameSet,
    onMapSet,
    onGridSet,
    onSpawnSet,
    name,
    mapURL,
    gridColumns,
    gridRows,
    spawnX,
    spawnY,
    terrainList,
    auraList,
    tokenList,
    serializeData,
    load
};