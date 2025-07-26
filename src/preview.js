import Konva from "konva";
import SpawnIcon from "./images/spawn.svg";
import * as Data from "./data";
import { TokenTypes } from "./tokenUtils";

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
    for (let i = 0; i < terrainFeatures.length; i++)
    {
        if (terrainFeatures[i])
        {
            showToken(terrainFeatures[i]);
        }
        else
        {
            hideToken(TokenTypes.TERRAIN, i);
        }
    }
    for (let i = 0; i < auras.length; i++)
    {
        if (auras[i])
        {
            showToken(auras[i]);
        }
        else
        {
            hideToken(TokenTypes.AURA, i);
        }
    }
    for (let i = 0; i < tokens.length; i++)
    {
        if (tokens[i])
        {
            showToken(tokens[i]);
        }
        else
        {
            hideToken(TokenTypes.TOKEN, i);
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

function showToken(data)
{
    const cacheList = getCacheListOfType(data.type);    
    const token = getOrCreateToken(data.type, data.id);
    cacheList[data.id] = data;
    
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

function hideToken(type, id)
{
    const cacheList = getCacheListOfType(type);
    const layer = getLayerOfType(type)
    cacheList[id] = undefined;
    layer.children[id].visible(false);
}

function getLayerOfType(type)
{
    switch (type)
    {
        case TokenTypes.TOKEN:
            return tokenLayer;
            
        case TokenTypes.TERRAIN:
            return terrainLayer;

        case TokenTypes.AURA:
            return auraLayer;
    }
    return undefined;
}

function getDataListOfType(type)
{
    switch (type)
    {
        case TokenTypes.TOKEN:
            return Data.tokenList;
            
        case TokenTypes.TERRAIN:
            return Data.terrainList;

        case TokenTypes.AURA:
            return Data.auraList;
    }
    return undefined;
}

function getCacheListOfType(type)
{
    switch (type)
    {
        case TokenTypes.TOKEN:
            return tokens;
            
        case TokenTypes.TERRAIN:
            return terrainFeatures;

        case TokenTypes.AURA:
            return auras;
    }
    return undefined;
}

function getOrCreateToken(type, id)
{
    const layer = getLayerOfType(type);
    const dataList = getDataListOfType(type);

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

    Data.terrainList.onAdd.subscribe((data) => showToken(data));
    Data.terrainList.onModify.subscribe((oldData, newData) => showToken(newData));
    Data.terrainList.onRemove.subscribe((data) => hideToken(data.type, data.id));

    Data.auraList.onAdd.subscribe((data) => showToken(data));
    Data.auraList.onModify.subscribe((oldData, newData) => showToken(newData));
    Data.auraList.onRemove.subscribe((data) => hideToken(data.type, data.id));

    Data.tokenList.onAdd.subscribe((data) => showToken(data));
    Data.tokenList.onModify.subscribe((oldData, newData) => showToken(newData));
    Data.tokenList.onRemove.subscribe((data) => hideToken(data.type, data.id));
}

window.addEventListener("resize", (event) => resizePreview());

export {
    link
};