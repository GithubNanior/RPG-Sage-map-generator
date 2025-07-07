import { terrainList, tokenList } from "./data";
import { isNullOrWhitespace } from "./utils";

/**
 * @param { ("token" | "terrain") } type
 * @param { Number } id 
 */
function getAnchorTag(type, id)
{
    return `${type} ${id}`;
}

function splitAnchorTag(anchorTag)
{
    const [type, index] = anchorTag.split(" ");
    return {
        type,
        id: +index
    };
}

/**
 * Shouldn't be used before the Start phase.
 * @param { String } anchorTag
 * @returns { String }
 */
function anchorTagToName(anchorTag)
{
    const {type, id} = splitAnchorTag(anchorTag)
    if (!isNaN(id))
    {
        if (type === "token")
        {
            return tokenList.listElements[id].name;
        }
        else if (type === "terrain")
        {
            return terrainList.listElements[id].name;
        }
    }
    return "None";
}

/**
 * Shouldn't be used before the Start phase.
 * @param { String } anchorName
 * @returns { String }
 */
function anchorNameToTag(anchorName)
{
    if (!isNullOrWhitespace(anchorName) && anchorName !== "None")
    {
        for (let i = 0; i < tokenList.listElements.length; i++)
        {
            if (tokenList.listElements[i]?.name === anchorName)
            {
                return getAnchorTag("token", i);
            }
        }

        for (let i = 0; i < terrainList.listElements.length; i++)
        {
            if (terrainList.listElements[i]?.name === anchorName)
            {
                return getAnchorTag("terrain", i);
            }
        }
    }

    return "";
}

export {
    anchorTagToName,
    anchorNameToTag,
    getAnchorTag,
    splitAnchorTag
}