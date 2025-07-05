import { isNullOrWhitespace, dequote } from "./utils";
import { Event } from "./event";
import { DataList } from "./dataList";

const terrainList = new DataList({
    name: "New TerrainFeature",
    url: "",
    x: 1,
    y: 1,
    width: 1,
    height: 1
});
const auraList = new DataList({
    name: "New Aura",
    url: "",
    x: 1,
    y: 1,
    width: 1,
    height: 1
});
const tokenList = new DataList({
    name: "New Token",
    url: "",
    x: 1,
    y: 1,
    width: 1,
    height: 1
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
${mapURL}
name=${name}
grid=${gridColumns}x${gridRows}
spawn=${spawnX},${spawnY}
`;
}

function serializeTerrain(token)
{
    return `[terrain]
${token.url}
name=${token.name}
size=${token.width}x${token.height}
position=${token.x},${token.y}
`;
}

function serializeAura(aura)
{
    return `[aura]
${aura.url}
name=${aura.name}
size=${aura.width}x${aura.height}
position=${aura.x},${aura.y}
`;
}

function serializeToken(token)
{
    return `[token]
${token.url}
name=${token.name}
size=${token.width}x${token.height}
position=${token.x},${token.y}
`;
}

const sectionsTypes = [
    {
        test: /^\s*\[map\]\s*$/i,
        use: deserializeMap,
        category: ""
    },
    {
        test: /^\s*\[terrain\]\s*$/i,
        use: deserializeTerrain,
        category: "terrainFeatures"
    },
    {
        test: /^\s*\[aura\]\s*$/i,
        use: deserializeAura,
        category: "auras"
    },
    {
        test: /^\s*\[token\]\s*$/i,
        use: deserializeToken,
        category: "tokens"
    }
];

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

function assignOutput(data, output, category)
{
    if (category)
    {
        data[category].push(output);
    }
    else
    {
        Object.assign(data, output);
    }
}

// Yes I'm fully aware that this way would pick the last map instead of the first, though I just wanna try suggest writing something like this?
// If not... Well, it's mostly a matter of copying the bot's code and modifying it to output in this format.
function deserializeData(serializedData)
{
    const data = {
        terrainFeatures: [],
        auras: [],
        tokens: []
    };

    const lines = serializedData.split(/\r?\n\r?/).filter((value) => !isNullOrWhitespace(value));
    let chunkType = undefined;
    let chunkStart = 0;
    for (let i = 0; i < lines.length; i++)
    {
        const newType = sectionsTypes.find((type) => type.test.test(lines[i]));
        
        if (newType)
        {
            if (chunkType)
            {
                assignOutput(data, chunkType?.use(lines.slice(chunkStart, i)), chunkType.category);
            }
            chunkStart = i+1;
            chunkType = newType;
        }
    }

    if (chunkType)
    {
        assignOutput(data, chunkType?.use(lines.slice(chunkStart, lines.length)), chunkType.category);
    }
    return data;
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
        x, y,
        width, height
    };
}

function load(data)
{
    terrainList.clear();
    auraList.clear();
    tokenList.clear();

    setName(data.name);
    setMapURL(data.mapURL);
    setGrid(data.gridColumns, data.gridRows);
    setSpawn(data.spawnX, data.spawnY);

    for (const terrainFeature of data.terrainFeatures)
    {
        terrainList.add(terrainFeature);
    }

    for (const aura of data.auras)
    {
        auraList.add(aura);
    }

    for (const token of data.tokens)
    {
        tokenList.add(token);
    }
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
    terrainList,
    auraList,
    tokenList,
    serializeData,
    deserializeData,
    load
};