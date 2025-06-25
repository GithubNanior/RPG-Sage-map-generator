import { Event } from "./event";
import { DataList } from "./dataList";

const terrainList = new DataList();
const auraList = new DataList();
const tokenList = new DataList();

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

export {
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
    serializeData
};