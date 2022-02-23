# JS-LnkParser
Easy to use, right to the point, Windows Shortcut file (**LNK**) parser with Node JS

**JS-LnkParser** is a lightweight Node JS script that allows you to explore what's inside of a binary .lnk Windows file.
Based on the [Microsoft Shell Link](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-shllink/16cb4ca1-9339-4d0c-a68d-bf1d6cc0f943) specifications, the script will try to show you every bit of information it can find in the file.

For now, this project is at his very beginning and a lot of features are missing like :
- Reading [Shell Item ID](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-shllink/6ac3b286-6640-4cf3-85f2-4085c02e6a71) data
- Reading [Extra Data](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-shllink/c41e062d-f764-4f13-bd4f-ea812ab9a4d1)
- Reading malformed files
- Create / Modify files

Keep in mind that it's still an early version, but you can always give it a try :)

## Installation
Just get the **index.js** file and the **Enums** folder is the same directory, anywhere you want. No external dependency required.

## Usage
`node index.js FILE [OUTPUT_FOLDER]`

Where **FILE** is the absolute path to the .lnk file and **OUTPUT_FOLDER** (optional) is the absolute path to an output directory, where the JSON result will be saved.


For more information about LNK file forensics, you should look at the [Windows MS-SHLLINK specifications](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-shllink/16cb4ca1-9339-4d0c-a68d-bf1d6cc0f943) and the [forensicwiki](https://forensicswiki.xyz/page/LNK).
