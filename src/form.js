import * as Data from "./data";
import * as Save from "./save";
import { LogError } from "./logger";
import { parseHtml, downloadTXT, isNullOrWhitespace } from "./utils";
import { getAnchorTag } from "./anchorUtils";
import { ElementList } from "./elementList";
import editTerrainFeatureHTML from "./editForm-TerrainFeature.html";
import editAuraHTML from "./editForm-Aura.html";
import editTokenHTML from "./editForm-Token.html";
import loadOptionHTML from "./loadOption.html";

const terrainList = new ElementList(document.querySelector("#terrain-list"), editTerrainFeatureHTML);
const auraList = new ElementList(document.querySelector("#aura-list"), editAuraHTML);
/** @type { ElementList } */
const tokenList = new ElementList(document.querySelector("#token-list"), editTokenHTML);

//Fetching fields
const nameField = document.querySelector("#name-field");
const mapURLField = document.querySelector("#map-url-field");
const gridColumnsField = document.querySelector("#grid-columns-field");
const gridRowsField = document.querySelector("#grid-rows-field");
const spawnXField = document.querySelector("#spawn-x-field");
const spawnYField = document.querySelector("#spawn-y-field");

/** @type HTMLSelectElement */
const auraAnchorField = auraList.editForm.querySelector("#aura-anchor-field");

const outputArea = document.querySelector("#output-area");
const loadTab = document.querySelector("#load");
const loadOptionContainer = loadTab.querySelector("ul");

//Binding input events
nameField.addEventListener("change", () => {
    Data.setName(nameField.value);
});
mapURLField.addEventListener("change", () => {
    Data.setMapURL(mapURLField.value);
});

gridColumnsField.addEventListener("change", () => {
    Data.setGrid(gridColumnsField.value, gridRowsField.value);
});
gridRowsField.addEventListener("change", () => {
    Data.setGrid(gridColumnsField.value, gridRowsField.value);
});

spawnXField.addEventListener("change", () => {
    Data.setSpawn(spawnXField.value, spawnYField.value);
});
spawnYField.addEventListener("change", () => {
    Data.setSpawn(spawnXField.value, spawnYField.value);
});

document.querySelector("#terrain-add").addEventListener("click", (event) => {
    Data.terrainList.add();
});

document.querySelector("#aura-add").addEventListener("click", (event) => {
    Data.auraList.add();
});

document.querySelector("#token-add").addEventListener("click", (event) => {
    Data.tokenList.add();
});

document.querySelector("#output-generate").addEventListener("click", (event) => {
    outputArea.value = Data.serializeData();
});

document.querySelector("#output-load").addEventListener("click", (event) => {
    Data.load(Data.deserializeData(outputArea.value));
});

document.querySelector("#output-download").addEventListener("click", (event) => {
    downloadTXT(Data.mapName.replaceAll(" ", "_"), Data.serializeData());
});

document.querySelector("#save").addEventListener("click", () => {
    if (isNullOrWhitespace(Data.mapName))
    {
        LogError("Map name may not be blank!");
    }
    else if (!Save.canSave())
    {
        LogError("Unable to save locally!");
    }
    else
    {
        Save.save(Data.mapName, Data.serializeData());
    }
});

let dropdownOpen = false;
loadTab.addEventListener("pointerenter", () => {
    if (dropdownOpen == false)
    {
        for (let i = 0; i < Save.saveCount(); i++)
        {
            loadOptionContainer.appendChild(createLoadOption(Save.getKey(i)));
        }
        dropdownOpen = true;
    }
});

loadTab.addEventListener("pointerleave", () => {
    loadOptionContainer.innerHTML = "";
    dropdownOpen = false;
});

function createOptionElement(name)
{
    const option = document.createElement("option");
    option.setAttribute("value", isNullOrWhitespace(name) ? "None" : name);
    option.innerText = name;
    return option;
}

function createLoadOption(name)
{
    const loadOption = parseHtml(loadOptionHTML);

    const loadButton = loadOption.querySelector("button[name='load']");
    loadButton.innerText = name;
    loadButton.addEventListener("click", () => {
        const data = Data.deserializeData(Save.getValue(name));

        if (data)
        {
            Data.load(data);
        }
        else
        {
            LogError(`No local save by the name of ${name}!`);
        }
    });

    const deleteButton = loadOption.querySelector("button[name='delete']")
    deleteButton.addEventListener("click", () => {
        Save.deleteSave(name);
        loadOption.remove();
    });

    return loadOption;
}

/**
 * @param { ("token" | "terrain") } type
 * @param { Number } id 
 */
function clearAnchors(type, id)
{
    const anchorTag = getAnchorTag(type, id);
    for (let i = 0; i < auraList.dataList.listElements.length; i++)
    {
        if (auraList.dataList.listElements[i]?.anchor == anchorTag)
        {
            auraList.dataList.set(i, { anchor: "" });
        }
    }
}

function updateAnchorField()
{
    const originalValue = auraAnchorField.value;
    auraAnchorField.innerHTML = "";

    auraAnchorField.appendChild(createOptionElement("None"));

    for (let i = 0; i < terrainList.dataList.listElements.length; i++)
    {
        if (terrainList.dataList.listElements[i])
        {
            const option = document.createElement("option");
            option.setAttribute("value", "terrain " + i);
            option.innerText = terrainList.dataList.listElements[i].name;
            auraAnchorField.appendChild(option);
        }
    }
    for (let i = 0; i < tokenList.dataList.listElements.length; i++)
    {
        if (tokenList.dataList.listElements[i])
        {
            const option = document.createElement("option");
            option.setAttribute("value", "token " + i);
            option.innerText = tokenList.dataList.listElements[i].name;
            auraAnchorField.appendChild(option);
        }
    }

    auraAnchorField.selectedIndex = Math.max(0, Array.from(auraAnchorField.children).findIndex((option) => option.value == originalValue));
}

function link()
{
    terrainList.bindDataList(Data.terrainList);
    auraList.bindDataList(Data.auraList);
    tokenList.bindDataList(Data.tokenList);

    Data.onNameSet.subscribe((name) => {
        nameField.value = name;
    });
    Data.onMapSet.subscribe((url) => {
        mapURLField.value = url;
    });
    Data.onGridSet.subscribe((columns, rows) => {
        gridColumnsField.value = columns;
        gridRowsField.value = rows;
    });
    Data.onSpawnSet.subscribe((x, y) => {
        spawnXField.value = x;
        spawnYField.value = y;
    });

    // Refresh anchor selection if edit form is opened or modified
    auraList.onUpdateEdit.subscribe((data) => {
        auraAnchorField.value = data.anchor;
        updateAnchorField();
    });
    tokenList.dataList.onAdd.subscribe((data) => updateAnchorField());
    tokenList.dataList.onModify.subscribe((oldData, newData) => updateAnchorField());
    tokenList.dataList.onRemove.subscribe((data) => clearAnchors("token", id));
    terrainList.dataList.onAdd.subscribe((data) => updateAnchorField());
    terrainList.dataList.onModify.subscribe((oldData, newData) => updateAnchorField());
    terrainList.dataList.onRemove.subscribe((data) => clearAnchors("terrain", id));
}

function start()
{
    Data.setName(nameField.value);
    Data.setMapURL(mapURLField.value);
    Data.setGrid(gridColumnsField.value, gridRowsField.value);
    Data.setSpawn(spawnXField.value, spawnYField.value);
}

export {
    link,
    start,
    terrainList,
    auraList,
    tokenList
};