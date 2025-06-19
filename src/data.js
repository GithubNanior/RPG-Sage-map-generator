import * as Preview from "./preview";
import { DataList } from "./dataList";

const terrainList = new DataList();

let name = "";
let mapURL = "";
let gridRows = 0;
let gridColumns = 0;
let spawnX = 0;
let spawnY = 0;

function setName(name)
{
    this.name = name;
}

function setMapURL(URL)
{
    this.mapURL = URL;

    Preview.setMap(URL);
}

function setGrid(columns, rows)
{
    this.gridColumns = columns;
    this.gridRows = rows;

    Preview.setGrid(columns, rows);
}

function setSpawn(x, y)
{
    this.spawnX = x;
    this.spawnY = y;

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