import listElementHTML from "./listElement.html";
import { parseHtml } from "./utils";
import { Event } from "./event";

class ElementList
{
    constructor(listContainer, editFormHTML)
    {
        this.listContainer = listContainer;
        this.listElements = [];
        this.editForm = parseHtml(editFormHTML);
        this.onUpdateEdit = new Event();
    }

    add(data)
    {
        const element = parseHtml(listElementHTML);
        element.querySelector("[name=\"edit\"]").addEventListener("click", () => {
            if (this.currentEdit != element)
            {
                this.startEdit(data.id);
            }
            else
            {
                this.stopEdit();
            }
        });
        element.querySelector("[name=\"duplicate\"]").addEventListener("click", () => {
            this.dataList.add(this.dataList.listElements[data.id]);
        });
        element.querySelector("[name=\"delete\"]").addEventListener("click", () => {
            this.dataList.remove(data.id);
        });
        this.listContainer.prepend(element);
        this.listElements[data.id] = element;

        this.update(data);
    }

    update(data)
    {
        const element = this.listElements[data.id];
        const name = element.querySelector(".list-element-header > span");
        name.innerText = data.name;

        const icon = element.querySelector(".list-element-header > img");
        icon.src = data.url;

        if (this.currentEdit == element)
        {
            this.updateEdit(data);
        }
    }

    remove(id)
    {
        this.listContainer.removeChild(this.listElements[id]);
        this.listElements[id] = undefined;
    }

    startEdit(id)
    {
        const element = this.listElements[id];
        if (this.currentEdit != undefined)
        {
            this.stopEdit();
        }

        if (element != undefined)
        {
            this.currentEdit = element;
            this.currentEdit.appendChild(this.editForm);
            this.updateEdit(this.dataList.listElements[id]);
        }
    }

    stopEdit()
    {
        this.currentEdit.removeChild(this.editForm);
        this.currentEdit = undefined;
    }

    updateEdit(data)
    {
        const element = this.listElements[data.id];
        const inputs = element.querySelectorAll("input");
        for (const input of inputs)
        {
            input.value = data[input.name];
            input.onchange = () => {
                this.dataList.set(data.id, {
                    [input.name]: input.value
                });
            };
        }

        const selects = element.querySelectorAll("select");
        for (const select of selects)
        {
            select.value = data[select.name];
            select.onchange = () => {
                this.dataList.set(data.id, {
                    [select.name]: select.value
                });
            };
        }

        this.onUpdateEdit.invoke(data);
    }

    bindDataList(dataList)
    {
        this.dataList = dataList;
        this.dataList.onAdd.subscribe((data) => this.add(data));
        this.dataList.onModify.subscribe((data) => this.update(data));
        this.dataList.onRemove.subscribe((id) => this.remove(id));
    }
}

export {
    ElementList
};