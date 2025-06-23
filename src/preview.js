import Konva from "konva";
import SpawnIcon from "./images/spawn.svg";
import * as Form from "./form";
import * as Data from "./data";

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

const terrainFeatures = [];
const auras = [];
const tokens = [];

const mapLayer = new Konva.Layer();
stage.add(mapLayer);

const terrainLayer = new Konva.Layer();
stage.add(terrainLayer);

const auraLayer = new Konva.Layer();
stage.add(auraLayer);

const tokenLayer = new Konva.Layer();
stage.add(tokenLayer);

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
    for (const terrainFeature of terrainFeatures)
    {
        if (terrainFeature)
        {
            showToken(terrainLayer, terrainFeatures, Data.terrainList, terrainFeature);
        }
        else
        {
            hideToken(terrainLayer, terrainFeatures, terrainFeature.id);
        }
    }
    for (const aura of auras)
    {
        if (aura)
        {
            showToken(auraLayer, auras, Data.auraList, aura);
        }
        else
        {
            hideToken(auraLayer, auras, aura.id);
        }
    }
    for (const token of tokens)
    {
        if (token)
        {
            showToken(tokenLayer, tokens, Data.tokenList, token);
        }
        else
        {
            hideToken(tokenLayer, token, token.id);
        }
    }
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

        Data.setSpawn(tilePos.x, tilePos.y);
    });

    spawnLayer.add(spawnMarker);
}

function showToken(layer, cacheList, dataList, data)
{
    cacheList[data.id] = data;
    const token = getOrCreateToken(layer, dataList, data.id);
    token.setAttrs({
        ...tileToCanvasPos(data.x, data.y),
        width: data.width * tileWidth,
        height: data.height * tileHeight,
        visible: false
    });

    const image = new Image();
    image.onload = () => {
        token.image(image);
        token.visible(true);
    };
    image.src = data.url;
}

function hideToken(layer, cacheList, id)
{
    cacheList[id] = undefined;
    layer.children[id].visible(false);
}

function getOrCreateToken(layer, dataList, id)
{
    while (id >= layer.children.length)
    {
        const token = new Konva.Image({
            draggable: true,
            visible: false
        });

        token.on("dragend", () => {
            let tilePos = canvasToTilePos(token.x(), token.y());
            tilePos = {
                x: Math.round(tilePos.x * 100) / 100,
                y: Math.round(tilePos.y * 100) / 100
            };

            dataList.set(id, {
                x: tilePos.x,
                y: tilePos.y
            });
        });

        layer.add(token);
    }

    return layer.children[id];
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

function link()
{
    Data.onMapSet.subscribe((url) => setMap(url));
    Data.onGridSet.subscribe((columns, rows) => setGrid(columns, rows));
    Data.onSpawnSet.subscribe((x, y) => setSpawn(x, y));

    Data.terrainList.onAdd.subscribe((data) => showToken(terrainLayer, terrainFeatures, Data.terrainList, data));
    Data.terrainList.onModify.subscribe((data) => showToken(terrainLayer, terrainFeatures, Data.terrainList, data));
    Data.terrainList.onRemove.subscribe((id) => hideToken(terrainLayer, terrainFeatures, id));

    Data.auraList.onAdd.subscribe((data) => showToken(auraLayer, auras, Data.auraList, data));
    Data.auraList.onModify.subscribe((data) => showToken(auraLayer, auras, Data.auraList, data));
    Data.auraList.onRemove.subscribe((id) => hideToken(auraLayer, auras, id));

    Data.tokenList.onAdd.subscribe((data) => showToken(tokenLayer, tokens, Data.tokenList, data));
    Data.tokenList.onModify.subscribe((data) => showToken(tokenLayer, tokens, Data.tokenList, data));
    Data.tokenList.onRemove.subscribe((id) => hideToken(tokenLayer, tokens, id));
}

window.addEventListener("resize", (event) => resizePreview());

export {
    link
};