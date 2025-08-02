import * as Preview from "./preview";
import * as Data from "./data";
import * as Save from "./save";
import { LogError } from "./logger";
import { parseHtml, downloadTXT, isNullOrWhitespace } from "./utils";
import { ElementList } from "./elementList";
import editTerrainFeatureHTML from "./editForm-TerrainFeature.html";
import editAuraHTML from "./editForm-Aura.html";
import editTokenHTML from "./editForm-Token.html";
import loadOptionHTML from "./loadOption.html";
import Spectrum from "spectrum-vanilla";

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
const snapStepField = document.querySelector("#snapstep-field");
const gizmoColorField = Spectrum.create("#gizmocolor-field", {
    type: "color",
    showPalette: false,
    allowEmpty: false
});

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

snapStepField.addEventListener("change", () => {
    Preview.setSnapStep(snapStepField.value);
});
gizmoColorField.on("move", () => {
    Preview.setGizmoColor(gizmoColorField.get().toHex8String());
});

document.querySelector("#terrain-add").addEventListener("click", () => {
    Data.terrainList.add();
});

document.querySelector("#aura-add").addEventListener("click", () => {
    Data.auraList.add();
});

document.querySelector("#token-add").addEventListener("click", () => {
    Data.tokenList.add();
});

document.querySelector("#output-generate").addEventListener("click", () => {
    outputArea.value = Data.serializeData();
});

document.querySelector("#output-load").addEventListener("click", () => {
    Data.load(outputArea.value);
});

document.querySelector("#output-download").addEventListener("click", () => {
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

function createOptionElement(value)
{
    const option = document.createElement("option");
    option.setAttribute("value", value);
    option.innerText = isNullOrWhitespace(value) ? "None" : value;
    return option;
}

function createLoadOption(name)
{
    const loadOption = parseHtml(loadOptionHTML);

    const loadButton = loadOption.querySelector("button[name='load']");
    loadButton.innerText = name;
    loadButton.addEventListener("click", () => {
        const serializedData = Save.getValue(name);
        if (serializedData)
        {
            Data.load(serializedData);
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

function onAnchorRename(oldName, newName)
{
    if (oldName === newName) return;

    for (let i = 0; i < auraList.dataList.listElements.length; i++)
    {
        if (auraList.dataList.listElements[i]?.anchor === oldName)
        {
            auraList.dataList.set(i, { anchor: newName });
        }
    }
}

function updateAnchorField(newAnchor = undefined)
{
    const originalValue = newAnchor === undefined ? auraAnchorField.value : newAnchor;
    auraAnchorField.innerHTML = "";

    auraAnchorField.appendChild(createOptionElement("None"));

    for (let i = 0; i < terrainList.dataList.listElements.length; i++)
    {
        if (terrainList.dataList.listElements[i])
        {
            auraAnchorField.appendChild(createOptionElement(terrainList.dataList.listElements[i].name));
        }
    }
    for (let i = 0; i < tokenList.dataList.listElements.length; i++)
    {
        if (tokenList.dataList.listElements[i])
        {
            auraAnchorField.appendChild(createOptionElement(tokenList.dataList.listElements[i].name));
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
    auraList.onUpdateEdit.subscribe((data) => updateAnchorField(data.anchor));
    tokenList.dataList.onAdd.subscribe((data) => updateAnchorField());
    tokenList.dataList.onModify.subscribe((oldData, newData) => onAnchorRename(oldData.name, newData.name));
    tokenList.dataList.onRemove.subscribe((data) => onAnchorRename(data.name, ""));
    terrainList.dataList.onAdd.subscribe((data) => updateAnchorField());
    terrainList.dataList.onModify.subscribe((oldData, newData) => onAnchorRename(oldData.name, newData.name));
    terrainList.dataList.onRemove.subscribe((data) => onAnchorRename(data.name, ""));
}

function start()
{
    Data.setName(nameField.value);
    Data.setMapURL(mapURLField.value);
    Data.setGrid(gridColumnsField.value, gridRowsField.value);
    Data.setSpawn(spawnXField.value, spawnYField.value);
    Preview.setSnapStep(snapStepField.value);
    Preview.setGizmoColor(gizmoColorField.get().toHex8String());
}

export {
    link,
    start,
    terrainList,
    auraList,
    tokenList
};