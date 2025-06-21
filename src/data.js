import * as Preview from "./preview";
import { DataList } from "./dataList";

const terrainList = new DataList();

terrainList.onAdd.subscribe((data) => Preview.showTerrainFeature(data));
terrainList.onModify.subscribe((data) => Preview.showTerrainFeature(data));
terrainList.onRemove.subscribe((id) => Preview.hideTerrainFeature(id));

let name = "";
let mapURL = "";
let gridRows = 0;
let gridColumns = 0;
let spawnX = 0;
let spawnY = 0;

function setName(newName)
{
    name = newName;
}

function setMapURL(newURL)
{
    mapURL = newURL;
    Preview.setMap(URL);
}

function setGrid(columns, rows)
{
    gridColumns = columns;
    gridRows = rows;

    Preview.setGrid(columns, rows);
}

function setSpawn(x, y)
{
    spawnX = x;
    spawnY = y;

    Preview.setSpawn(x, y);
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
    terrainList,
    setData,
    getData
};