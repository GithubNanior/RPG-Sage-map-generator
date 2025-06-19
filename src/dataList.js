import { Event } from "./event";

class DataList
{
    constructor()
    {
        this.emptyIndices = [];
        this.listElements = [];
        this.onAdd = new Event();
        this.onModify = new Event();
        this.onRemove = new Event();
    }

    add(name = "Element", url = "", x = 1, y = 1, width = 1, height = 1)
    {
        const id = this.emptyIndices.pop() ?? this.listElements.length;
        const element = {
          id,
          name,
          url,
          x,
          y,
          width,
          height  
        };

        this.listElements[id] = element;
        this.onAdd.invoke(element);
        return element;
    }

    set(id, values)
    {
        const data = this.listElements[id];
        if (data != undefined)
        {
            Object.assign(data, values);
            this.onModify.invoke(data);
        }
        
    }

    remove(id)
    {
        const element = this.listElements[id];
        if (element != undefined)
        {
            this.listElements[id] = undefined;
            this.emptyIndices.push(id);
            this.onRemove.invoke(id);
        }

        return element;
    }
}

export {
    DataList
};