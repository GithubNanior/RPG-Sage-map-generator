import { Event } from "./event";
import { DataList } from "./dataList";

const terrainList = new DataList();

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
    console.log(`set spawn to (${x}, ${y})`)
    spawnX = x;
    spawnY = y;
    onSpawnSet.invoke(x, y);
}

function setData()
{
    
}

function getData()
{

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
    setData,
    getData
};