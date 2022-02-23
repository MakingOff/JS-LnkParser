// Windows [MS-SHLLINK] Shell Link (.lnk) Binary File Format
// https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-shllink/16cb4ca1-9339-4d0c-a68d-bf1d6cc0f943

"use strict";
const fs = require("fs");
const path = require("path");
const { WINDOW_STATES } = require("./Enums/Window_States");
const { HOTKEYS, HOTKEYS_MODIFIERS } = require("./Enums/Hotkeys");
const { DRIVE_TYPES } = require("./Enums/Drives_Types");
const { NETWORK_PROVIDER_TYPE } = require("./Enums/Network_Provider_Type");

let fileInfos = {};
let outputPath = null;

// Gestion des arguments
let args = process.argv.slice(2);
if (args[0] === undefined || args[0].length < 1) {
    console.error("Missing first argument.");
    console.log("Usage: node index.js Absolute_path_to_link_file [Absolute path to JSON output folder]");
    return;
}
// C:\Users\thiba\WebstormProjects\lnkparser\TestFiles\sample.lnk
fileInfos["File Path"] = args[0];

if (args[1] !== undefined && args[1].length > 0) {
    // C:\Users\thiba\WebstormProjects\lnkparser\Output\
    outputPath = args[1];
}

fileInfos["File Name"] = path.basename(fileInfos["File Path"]);
let fileData = fs.readFileSync(fileInfos["File Path"]);
let offset = 0;

/**
 * Renvoie un Buffer qui contient le nombre d'octets spécifié en argument
 * @param nb Nombre d'octets à lire
 */
function GetBytes(nb) {
    let val = fileData.slice(offset, offset + nb);
    offset += nb;
    return val;
}

/**
 * Renvoie un entier non-signé sur 1 octet
 */
function GetByte() {
    let val = fileData.readUInt8(offset);
    offset += 1;
    return val;
}

/**
 * Renvoie un entier non-signé sur 2 octets
 */
function GetWord() {
    let val = fileData.readUInt16LE(offset);
    offset += 2;
    return val;
}

/**
 * Renvoie un entier signé sur 2 octets
 */
function GetInt16() {
    let val = fileData.readInt16LE(offset);
    offset += 2;
    return val;
}

/**
 * Renvoie un entier non-signé sur 4 octets
 */
function GetDWord() {
    let val = fileData.readUInt32LE(offset);
    offset += 4;
    return val;
}

/**
 * Renvoie un entier signé sur 4 octets
 */
function GetInt32() {
    let val = fileData.readInt32LE(offset);
    offset += 4;
    return val;
}

/**
 * Renvoie un float signé sur 4 octets (single-precision)
 */
function GetFloat() {
    let val = fileData.readFloatLE(offset);
    offset += 4;
    return val;
}

/**
 * Renvoie un entier non-signé sur 8 octets
 */
function GetQWord() {
    let val = fileData.readBigUInt64LE(offset);
    offset += 8;
    return val;
}

/**
 * Renvoie un entier signé sur 8 octets
 */
function GetInt64() {
    let val = fileData.readBigInt64LE(offset);
    offset += 8;
    return val;
}

/**
 * Renvoie un double signé sur 8 octets (double-precision)
 */
function GetDouble() {
    let val = fileData.readDoubleLE(offset);
    offset += 8;
    return val;
}

/**
 * Renvoie une chaîne de caractère qui se termine par un octet null
 */
function GetNullTerminatedString() {
    let char, str = "";
    while ((char = fileData.slice(offset, ++offset))[0] !== 0x00) {
        str += char;
    }
    return str;
}

/**
 * Renvoie une chaîne de caractère dont l'encodage est variable
 */
function GetCodePageString() {
    let size = GetDWord();
    // TODO
}

/**
 * Renvoie un Global Unique Identifier (GUID)
 */
function GetGUID() {
    let buf = GetBytes(16);

    let i = 0;
    let bth = []; // Map for number <-> hex string conversion
    for (let j = 0; j < 256; j++) {
        bth[j] = (j + 0x100).toString(16).substr(1);
    }

    return (bth[buf[i++]] + bth[buf[i++]] +
           bth[buf[i++]] + bth[buf[i++]] + '-' +
           bth[buf[i++]] + bth[buf[i++]] + '-' +
           bth[buf[i++]] + bth[buf[i++]] + '-' +
           bth[buf[i++]] + bth[buf[i++]] + '-' +
           bth[buf[i++]] + bth[buf[i++]] +
           bth[buf[i++]] + bth[buf[i++]] +
           bth[buf[i++]] + bth[buf[i++]]).toUpperCase();
}

/**
 * Permet de renseigner les LinkFlags présents pour ce fichier
 */
function GetLinkFlags() {
    let flagsDWord = GetDWord();

    fileInfos["Header"]["Link Flags"] = [];
    let flags = {};
    flags["HasTargetIDList"] = flagsDWord & 0x00000001;
    flags["HasLinkInfo"] = flagsDWord & 0x00000002;
    flags["HasName"] = flagsDWord & 0x00000004;
    flags["HasRelativePath"] = flagsDWord & 0x00000008;
    flags["HasWorkingDir"] = flagsDWord & 0x00000010;
    flags["HasArguments"] = flagsDWord & 0x00000020;
    flags["HasIconLocation"] = flagsDWord & 0x00000040;
    flags["IsUnicode"] = flagsDWord & 0x00000080;
    flags["ForceNoLinkInfo"] = flagsDWord & 0x00000100;
    flags["HasExpString"] = flagsDWord & 0x00000200;
    flags["RunInSeparateProcess"] = flagsDWord & 0x00000400;
    flags["Reserved0"] = flagsDWord & 0x00000800;
    flags["HasDarwinID"] = flagsDWord & 0x00001000;
    flags["RunAsUser"] = flagsDWord & 0x00002000;
    flags["HasExpIcon"] = flagsDWord & 0x00004000;
    flags["NoPidlAlias"] = flagsDWord & 0x00008000;
    flags["Reserved1"] = flagsDWord & 0x000100000;
    flags["RunWithShimLayer"] = flagsDWord & 0x00020000;
    flags["ForceNoLinkTrack"] = flagsDWord & 0x00040000;
    flags["EnableTargetMetadata"] = flagsDWord & 0x00080000;
    flags["DisableLinkPathTracking"] = flagsDWord & 0x00100000;
    flags["DisableKnownFolderTracking"] = flagsDWord & 0x00200000;
    flags["DisableKnownFolderAlias"] = flagsDWord & 0x00400000;
    flags["AllowLinkToLink"] = flagsDWord & 0x00800000;
    flags["UnaliasOnSave"] = flagsDWord & 0x01000000;
    flags["PreferEnvironmentPath"] = flagsDWord & 0x02000000;
    flags["KeepLocalIDListForUNCTarget"] = flagsDWord & 0x04000000;

    for (let flag of Object.keys(flags)) {
        if (flags[flag] !== 0) {
            fileInfos["Header"]["Link Flags"].push(flag);
        }
    }
}

/**
 * Permet de renseigner les attributs présent pour le fichier cible du lien
 */
function GetFileAttributesFlags() {
    let flagsDWord = GetDWord();

    fileInfos["Header"]["Targeted File Attributes Flags"] = [];
    let flags = {};
    flags["FILE_ATTRIBUTE_READONLY"] = flagsDWord & 0x00000001;
    flags["FILE_ATTRIBUTE_HIDDEN"] = flagsDWord & 0x00000002;
    flags["FILE_ATTRIBUTE_SYSTEM"] = flagsDWord & 0x00000004;
    flags["Reserved1"] = flagsDWord & 0x00000008;
    flags["FILE_ATTRIBUTE_DIRECTORY"] = flagsDWord & 0x00000010;
    flags["FILE_ATTRIBUTE_ARCHIVE"] = flagsDWord & 0x00000020;
    flags["Reserved2"] = flagsDWord & 0x00000040;
    flags["FILE_ATTRIBUTE_NORMAL"] = flagsDWord & 0x00000080;
    flags["FILE_ATTRIBUTE_TEMPORARY"] = flagsDWord & 0x00000100;
    flags["FILE_ATTRIBUTE_SPARSE_FILE"] = flagsDWord & 0x00000200;
    flags["FILE_ATTRIBUTE_REPARSE_POINT"] = flagsDWord & 0x00000400;
    flags["FILE_ATTRIBUTE_COMPRESSED"] = flagsDWord & 0x00000800;
    flags["FILE_ATTRIBUTE_OFFLINE"] = flagsDWord & 0x00001000;
    flags["FILE_ATTRIBUTE_NOT_CONTENT_INDEXED"] = flagsDWord & 0x00002000;
    flags["FILE_ATTRIBUTE_ENCRYPTED"] = flagsDWord & 0x00004000;

    for (let flag of Object.keys(flags)) {
        if (flags[flag] !== 0) {
            fileInfos["Header"]["Targeted File Attributes Flags"].push(flag);
        }
    }
}

// ================
// = EXTRA BLOCKS = TODO: Move to another file
// ================
const EXTRA_BLOCKS = {
    0xA0000001: GetEnvironmentVariableDataBlock,
    0xA0000002: GetConsoleDataBlock,
    0xA0000003: GetTrackerDataBlock,
    0xA0000004: GetConsoleFEDataBlock,
    0xA0000005: GetSpecialFolderDataBlock,
    0xA0000006: GetDarwinDataBlock,
    0xA0000007: GetIconEnvironmentDataBlock,
    0xA0000008: GetShimDataBlock,
    0xA0000009: GetPropertyStoreDataBlock,
    0xA000000B: GetKnownFolderDataBlock,
    0xA000000C: GetVistaAndAboveIDListDataBlock
};
const PROPERTY_TYPES = {
    0x0000: "",
    0x0001: "",
    0x0002: GetInt16,
    0x0003: GetInt32,
    0x0004: GetFloat,
    0x0005: GetDouble,
    0x0006: GetInt64,
    0x0007: "",
    0x0008: GetCodePageString,
    0x000A: GetDWord,
    0x000B: GetDWord,
    0x000E: GetDWord,
    0x0010: GetDWord,
    0x0011: GetDWord,
    0x0012: GetDWord,
    0x0013: GetDWord,
    0x0014: GetDWord,
    0x0015: GetDWord,
    0x0016: GetDWord,
    0x0017: GetDWord,
    0x001E: GetDWord,
    0x001F: GetDWord,
    0x0040: GetDWord,
    0x0041: GetDWord,
    0x0042: GetDWord,
    0x0043: GetDWord,
    0x0044: GetDWord,
    0x0045: GetDWord,
    0x0046: GetDWord,
    0x0047: GetDWord,
    0x0048: GetDWord,
    0x0049: GetDWord,
    0x1002: GetDWord,
    0x1003: GetDWord,
    0x1004: GetDWord,
    0x1005: GetDWord,
    0x1006: GetDWord,
    0x1007: GetDWord,
    0x1008: GetDWord,
    0x100A: GetDWord,
    0x100B: GetDWord,
    0x100C: GetDWord,
    0x1010: GetDWord,
    0x1011: GetDWord,
    0x1012: GetDWord,
    0x1013: GetDWord,
    0x1014: GetDWord,
    0x1015: GetDWord,
    0x101E: GetDWord,
    0x101F: GetDWord,
    0x1040: GetDWord,
    0x1047: GetDWord,
    0x1048: GetDWord,
    0x2002: GetDWord,
    0x2003: GetDWord,
    0x2004: GetDWord,
    0x2005: GetDWord,
    0x2006: GetDWord,
    0x2007: GetDWord,
    0x2008: GetDWord,
    0x200A: GetDWord,
    0x200B: GetDWord,
    0x200C: GetDWord,
    0x200E: GetDWord,
    0x2010: GetDWord,
    0x2011: GetDWord,
    0x2012: GetDWord,
    0x2013: GetDWord,
    0x2016: GetDWord,
    0x2017: GetDWord
};
function GetEnvironmentVariableDataBlock(size) {
    let a = 0;
}
function GetConsoleDataBlock(size) {

}
function GetTrackerDataBlock(size) {
    fileInfos["Extra Data"]["Tracker Data"] = {};

    fileInfos["Extra Data"]["Tracker Data"]["Length"] = GetDWord();
    fileInfos["Extra Data"]["Tracker Data"]["Version"] = GetDWord();
    fileInfos["Extra Data"]["Tracker Data"]["Machine ID"] = GetBytes(16).toString();
    fileInfos["Extra Data"]["Tracker Data"]["Droid"] = GetGUID() + " --- " + GetGUID();
    fileInfos["Extra Data"]["Tracker Data"]["Droid Birth"] = GetGUID() + " --- " + GetGUID();
}
function GetConsoleFEDataBlock(size) {

}
function GetSpecialFolderDataBlock(size) {

}
function GetDarwinDataBlock(size) {

}
function GetIconEnvironmentDataBlock(size) {

}
function GetShimDataBlock(size) {

}
function GetPropertyStoreDataBlock(size) {
    fileInfos["Extra Data"]["Property Store"] = {};

    fileInfos["Extra Data"]["Property Store"]["Size"] = GetDWord();
    fileInfos["Extra Data"]["Property Store"]["Version"] = GetDWord();
    fileInfos["Extra Data"]["Property Store"]["Format ID"] = GetGUID();

    fileInfos["Extra Data"]["Property Store"]["Values"] = [];
    let over = false;
    while (!over) {
        if (fileInfos["Extra Data"]["Property Store"]["Format ID"] === "D5CDD505-2E9C-101B-9397-08002B2CF9AE") {
            // Serialized Property Value (String Name)
        } else {
            // Serialized Property Value (Integer Name)
            let size = GetDWord();
            if (size === 0) {
                over = true;
            }

            let id = GetDWord();
            offset++; // Reserved
            let type = GetWord(); // TODO 31 (String unicode)
            offset += 2; // Useless (Padding)

        }
    }
}
function GetKnownFolderDataBlock(size) {

}
function GetVistaAndAboveIDListDataBlock(size) {

}

/**
 * Renvoie une combinaison de touche, spécifiée sur 2 octets
 */
function GetHotKeys() {
    let buff = GetBytes(2);

    return buff[0] !== 0x00 || buff[1] !== 0x00 ?
        (HOTKEYS_MODIFIERS[buff[1]] || "") + (HOTKEYS[buff[0]] || "") :
        "";
}

/**
 * Décode et renvoie une chaîne de caractère lisible
 */
function GetStringData() {
    let length = fileInfos["Header"]["Link Flags"].includes("IsUnicode") ? GetWord() * 2 : GetDWord();
    return GetBytes(length).toString("utf16le");
}

/**
 * Renvoie une taille de fichier facilement lisible
 * @param size Taille en octets
 */
function SizeToHumanReadable(size) {
    if (size === 0) {
        return "0 Bytes";
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(size) / Math.log(k));

    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// =============
// === START ===
// =============

// Check de la signature du fichier (0x4C000000)
let sig = GetBytes(4);
if (sig.length !== 4 || sig[0] !== 0x4C || sig[1] !== 0x00 || sig[2] !== 0x00 || sig[3] !== 0x00) {
    console.error("Not a valid LNK file (Wrong signature)");
}

// Check du GUID du fichier (01140200-0000-0000-C000-000000000046)
let guid = GetGUID();
if (guid !== "01140200-0000-0000-C000-000000000046") {
    console.error("Not a valid LNK file (Wrong CLSID)")
}

// ===== HEADER =====
fileInfos["Header"] = {};

GetLinkFlags();
GetFileAttributesFlags();

fileInfos["Header"]["Creation Time"] = new Date((Number(GetQWord()) / 10000000 - 11644473600) * 1000).toLocaleString();
fileInfos["Header"]["Access Time"] = new Date((Number(GetQWord()) / 10000000 - 11644473600) * 1000).toLocaleString();
fileInfos["Header"]["Write Time"] = new Date((Number(GetQWord()) / 10000000 - 11644473600) * 1000).toLocaleString();

fileInfos["Header"]["Size"] = SizeToHumanReadable(GetDWord());
fileInfos["Header"]["Icon Index"] = GetInt32();
fileInfos["Header"]["Window State"] = WINDOW_STATES[GetDWord()] || "SW_SHOWNORMAL";
fileInfos["Header"]["Hotkey"] = GetHotKeys();

// On skip des bytes réservés
offset += 10;

// ===== LinkTargetIDList =====
if (fileInfos["Header"]["Link Flags"].includes("HasTargetIDList")) {
    fileInfos["IDList"] = {};

    let maxOffset = GetWord();
    fileInfos["IDList"]["Size"] = SizeToHumanReadable(maxOffset);
    fileInfos["IDList"]["List"] = [];

    // Le 'maxOffset - 2', c'est pour le TerminalID (2 bytes) qui indique juste la fin du dernier élément de la liste
    while (offset < maxOffset - 2) {
        let size = GetWord();
        let itemID = {
            "Size": size,
            "Data": GetBytes(size - 2).toString("hex")
        }

        fileInfos["IDList"]["List"].push(itemID);
    }
    offset += 2; // On rajoute le TerminalID
}

// ===== LinkInfos =====
if (fileInfos["Header"]["Link Flags"].includes("HasLinkInfo")) {
    let startOffset = offset;
    fileInfos["Link Infos"] = {};

    fileInfos["Link Infos"]["Size"] = GetDWord();
    fileInfos["Link Infos"]["Header Size"] = GetDWord();
    fileInfos["Link Infos"]["Flags"] = GetDWord();
    fileInfos["Link Infos"]["VolumeIDOffset"] = GetDWord();
    fileInfos["Link Infos"]["LocalBasePathOffset"] = GetDWord();
    fileInfos["Link Infos"]["CommonNetworkRelativeLinkOffset"] = GetDWord();
    fileInfos["Link Infos"]["CommonPathSuffixOffset"] = GetDWord();

    if (fileInfos["Link Infos"]["Header Size"] >= 0x00000024) {
        fileInfos["Link Infos"]["LocalBasePathOffsetUnicode"] = GetDWord();
        fileInfos["Link Infos"]["CommonPathSuffixOffsetUnicode"] = GetDWord();
    }

    // Si le fichier cible est sur un disque
    if (fileInfos["Link Infos"]["Flags"] & 0x00000001) {
        offset = startOffset + fileInfos["Link Infos"]["VolumeIDOffset"];
        let volumeIdOffset = offset;

        fileInfos["Link Infos"]["Volume"] = {};
        fileInfos["Link Infos"]["Volume"]["SectionSize"] = GetDWord();
        fileInfos["Link Infos"]["Volume"]["Drive Type"] = DRIVE_TYPES[GetDWord()];
        fileInfos["Link Infos"]["Volume"]["Serial Number"] = GetDWord();
        fileInfos["Link Infos"]["Volume"]["LabelOffset"] = GetDWord();

        if (fileInfos["Link Infos"]["Volume"]["LabelOffset"] === 0x00000014) {
            fileInfos["Link Infos"]["Volume"]["LabelOffsetUnicode"] = GetDWord();
            offset = volumeIdOffset + fileInfos["Link Infos"]["Volume"]["LabelOffsetUnicode"];
        } else {
            offset = volumeIdOffset + fileInfos["Link Infos"]["Volume"]["LabelOffset"];
        }

        fileInfos["Link Infos"]["Volume"]["Label"] = GetNullTerminatedString();
        fileInfos["Link Infos"]["Volume"]["Local Base Path"] = GetNullTerminatedString();
    } else if (fileInfos["Link Infos"]["Flags"] & 0x00000002) {
        // si le fichier cible est sur un emplacement réseau
        offset = startOffset + fileInfos["Link Infos"]["CommonNetworkRelativeLinkOffset"]
        let networkOffset = offset;

        fileInfos["Link Infos"]["Network"] = {};
        fileInfos["Link Infos"]["Network"]["Section Size"] = GetDWord();
        fileInfos["Link Infos"]["Network"]["Flags"] = GetDWord();
        fileInfos["Link Infos"]["Network"]["NetNameOffset"] = GetDWord();
        fileInfos["Link Infos"]["Network"]["DeviceNameOffset"] = GetDWord();

        if (fileInfos["Link Infos"]["Network"]["Flags"] & 0x00000002) {
            fileInfos["Link Infos"]["Network"]["Provider Type"] = NETWORK_PROVIDER_TYPE[GetDWord()];
        } else {
            offset += 4;
        }

        if (fileInfos["Link Infos"]["Network"]["NetNameOffset"] > 0x00000014) {
            fileInfos["Link Infos"]["Network"]["NetNameOffsetUnicode"] = GetDWord();
            fileInfos["Link Infos"]["Network"]["DeviceNameOffsetUnicode"] = GetDWord();
        }

        offset = networkOffset + fileInfos["Link Infos"]["Network"]["NetNameOffset"];
        fileInfos["Link Infos"]["Network"]["Net Name"] = GetNullTerminatedString();
        if (fileInfos["Link Infos"]["Network"]["Flags"] & 0x00000001) {
            offset = networkOffset + fileInfos["Link Infos"]["Network"]["DeviceNameOffset"];
            fileInfos["Link Infos"]["Network"]["Device Name"] = GetNullTerminatedString();
        }

        if (fileInfos["Link Infos"]["Network"]["NetNameOffset"] > 0x00000014) {
            offset = networkOffset + fileInfos["Link Infos"]["Network"]["NetNameOffsetUnicode"];
            fileInfos["Link Infos"]["Network"]["Net Name Unicode"] = GetNullTerminatedString();
            offset = networkOffset + fileInfos["Link Infos"]["Network"]["DeviceNameOffsetUnicode"];
            fileInfos["Link Infos"]["Network"]["Device Name Unicode"] = GetNullTerminatedString();
        }
    }

    offset = startOffset + fileInfos["Link Infos"]["CommonPathSuffixOffset"];
    fileInfos["Link Infos"]["Common Path Suffix"] = GetNullTerminatedString();

    if (fileInfos["Link Infos"]["Flags"] & 0x00000001 && fileInfos["Link Infos"]["Header Size"] >= 0x00000024) {
        offset = startOffset + fileInfos["Link Infos"]["LocalBasePathOffsetUnicode"];
        fileInfos["Link Infos"]["Local Base Path Unicode"] = GetNullTerminatedString();
    }
    if (fileInfos["Link Infos"]["Header Size"] >= 0x00000024) {
        offset = startOffset + fileInfos["Link Infos"]["CommonPathSuffixOffsetUnicode"];
        fileInfos["Link Infos"]["Common Path Suffix Unicode"] = GetNullTerminatedString();
    }
}

// ===== String Data =====
fileInfos["String Data"] = {};
// ===== String Data - Name =====
if (fileInfos["Header"]["Link Flags"].includes("HasName")) {
    fileInfos["String Data"]["Description"] = GetStringData();
}

// ===== String Data - Relative Path =====
if (fileInfos["Header"]["Link Flags"].includes("HasRelativePath")) {
    fileInfos["String Data"]["Relative Path"] = GetStringData();
}

// ===== String Data - Working Directory =====
if (fileInfos["Header"]["Link Flags"].includes("HasWorkingDir")) {
    fileInfos["String Data"]["Working Directory"] = GetStringData();
}

// ===== String Data - Command Line Arguments =====
if (fileInfos["Header"]["Link Flags"].includes("HasArguments")) {
    fileInfos["String Data"]["Command Line Arguments"] = GetStringData();
}

// ===== String Data - Icon Location =====
if (fileInfos["Header"]["Link Flags"].includes("HasIconLocation")) {
    fileInfos["String Data"]["Icon Location"] = GetStringData();
}

// ===== Extra Data =====
fileInfos["Extra Data"] = {};
fileInfos["Extra Data"]["CAUTION"] = "Last block may be incorrect";
while (offset < fileData.length - 4) {
    let blockSize = GetDWord();
    let blockSignature = GetDWord();

    // TODO: Implémenter les méthodes pour traiter chaque type possible de l'enum PROPERTY_TYPES
    if (EXTRA_BLOCKS[blockSignature] !== undefined) {
        EXTRA_BLOCKS[blockSignature](blockSize);
    } else {
        // Si c'est pas encore implémenté, on aura un décalage et des valeurs qui ne correspondent plus à rien, on crash pas, on termine juste le traitement
        break;
    }
}


console.log(fileInfos);

// Export JSON
if (outputPath !== null) {
    let outputName = path.basename(fileInfos["File Name"], path.extname(fileInfos["File Name"])) + ".json";
    fs.writeFile(outputPath + outputName, JSON.stringify(fileInfos, null, 4), 'utf8', () => {
        console.log("JSON generated to " + outputPath + outputName);
    });
}