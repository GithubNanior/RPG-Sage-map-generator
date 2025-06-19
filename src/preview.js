import Konva from "konva";
import SpawnIcon from "./images/spawn.svg";
import * as Form from "./form";

const container = document.querySelector("#preview");

const stage = new Konva.Stage({
    container: "preview",
    width: 0,
    height: 0
});

let mapWidth = 0;
let mapHeight = 0;

let tileWidth = 0;
let tileHeight = 0;

let gridColumns = 1;
let gridRows = 1;

let spawnX = 1;
let spawnY = 1;

const mapLayer = new Konva.Layer();
stage.add(mapLayer);

const gridLayer = new Konva.Layer();
stage.add(gridLayer);

const spawnLayer = new Konva.Layer();
stage.add(spawnLayer);

function setMap(mapURL)
{
    stage.setSize({
        width: 0, 
        height: 0
    });
    mapLayer.destroyChildren();

    const image = new Image();
    image.onload = () => {
        mapWidth = image.width;
        mapHeight = image.height;
        resizePreview();
        
        mapLayer.add(new Konva.Image({
            width: mapWidth,
            height: mapHeight,
            image
        }));

        setGrid(gridColumns, gridRows);
    };
    image.src = mapURL;
}

function resizePreview()
{
    const scale = container.offsetWidth / mapWidth;
    
    stage.width(mapWidth * scale);
    stage.height(mapHeight * scale);
    stage.scale({ x: scale, y: scale });
}

function setGrid(columns, rows)
{
    gridLayer.destroyChildren();

    gridColumns = columns;
    gridRows = rows;

    tileWidth = mapWidth / gridColumns;
    tileHeight = mapHeight / gridRows;

    for (let column = 1; column < gridColumns; column++)
    {
        const x = column * tileWidth;
        gridLayer.add(new Konva.Line({
            points: [x, 0, x, mapHeight],
            stroke: "black",
            opacity: 0.4,
            strokeWidth: 1
        }));
    }

    for (let row = 1; row < gridRows; row++) 
    {
        const y = row * tileHeight;
        gridLayer.add(new Konva.Line({
            points: [0, y, mapWidth, y],
            stroke: "black",
            opacity: 0.4,
            strokeWidth: 1
        }));
    }

    setSpawn(spawnX, spawnY);
}

function setSpawn(x, y)
{
    spawnLayer.destroyChildren();

    spawnX = x;
    spawnY = y;

    const image = new Image();
    image.src = SpawnIcon;

    image.width = 50;
    image.height = 50;

    const spawnMarker = new Konva.Image({
        ...tileToCanvasPos(spawnX, spawnY),
        offsetX: image.width / 2,
        offsetY: image.height / 2,
        width: image.width,
        height: image.height,
        image: image,
        draggable: true
    });

    spawnMarker.on("dragend", () => {
        let tilePos = canvasToTilePos(spawnMarker.x(), spawnMarker.y());
        tilePos = {
            x: Math.round(tilePos.x * 100) / 100,
            y: Math.round(tilePos.y * 100) / 100
        };

        Form.setSpawn(tilePos.x, tilePos.y);
    });

    spawnLayer.add(spawnMarker);
}

function canvasToTilePos(x, y)
{
    return {
        x: x / tileWidth + 1,
        y: y / tileHeight + 1
    };
}

function tileToCanvasPos(x, y)
{
    return {
        x: (x - 1) * tileWidth,
        y: (y - 1) * tileHeight
    };
}

window.addEventListener("resize", (event) => resizePreview());

export {
    setMap,
    setGrid,
    setSpawn
};