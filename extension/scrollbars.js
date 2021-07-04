const css = `
::-webkit-scrollbar {
  background: linear-gradient(to right, #ccc, #fff 20%, #ddd);
  cursor: default;
}

::-webkit-scrollbar {
  background: linear-gradient(to bottom, #ccc, #fff 20%, #ddd);
  cursor: default;
}

::-webkit-scrollbar-track:vertical {
  background: linear-gradient(to right, #eee, #fff);
  border-left: 1px solid #ccc;
  border-top: 1px solid #bbb;
  border-bottom: 1px solid #ddd;
  width: 16px;
  border-radius: 100px;
  box-shadow: inset 2px 0 3px #0002, inset 0 -2px 3px #0003, inset 0 2px 3px #0003;
}

::-webkit-scrollbar-track:vertical:window-inactive {
  box-shadow: inset 2px 0 3px #0041, inset 0 -2px 3px #0041, inset 0 2px 3px #0041;
}

::-webkit-scrollbar-track:horizontal {
  background: linear-gradient(to bottom, #eee, #fff);
  border-top: 1px solid #ccc;
  border-left: 1px solid #bbb;
  border-right: 1px solid #ddd;
  width: 16px;
  border-radius: 100px;
  box-shadow: inset 0 2px 3px #0002, inset -2px 0 3px #0003, inset 2px 0 3px #0003;
}

::-webkit-scrollbar-track:horizontal:window-inactive {
  box-shadow: inset 0 2px 3px #0081, inset -2px 0 3px #0061, inset 2px 0 3px #0081;
}

::-webkit-scrollbar-thumb:vertical {
  background:
    linear-gradient(to bottom, #0000, #0001 5px, #0000 10px),
    linear-gradient(to right, #6af 10%, #fff4 20%, #6af 30%, #9ef),
    linear-gradient(to bottom, #6af 5px, #6af0 10px),
    linear-gradient(to top, #6af 5px, #6af0 10px);
  background-size: 100% 10px, 100% 100%, 100% 100%, 100% 100%;
  background-repeat: repeat, no-repeat, no-repeat, no-repeat;
  border: 1px solid #ccc;
  box-sizing: border-box;
  box-shadow: inset 0 0 4px #004;
  min-height: 30px;
  -webkit-border-radius: 100px;
}

::-webkit-scrollbar-thumb:vertical:window-inactive {
  background:
    linear-gradient(to bottom, #eee 5px, #eee0 10px),
    linear-gradient(to top, #eee 5px, #eee0 10px),
    linear-gradient(to right, #ddd 10%, #fff 20%, #eee 30%, #fff);
  box-shadow: inset 0 0 4px #0044;
}

::-webkit-scrollbar-thumb:horizontal {
  background:
    linear-gradient(to bottom, #6af 10%, #fff4 20%, #6af 30%, #9ef),
    linear-gradient(to right, #6af 5px, #6af0 10px),
    linear-gradient(to left, #6af 5px, #6af0 10px);
  border: 1px solid #ccc;
  box-sizing: border-box;
  box-shadow: inset 0 0 4px #004;
  min-width: 30px;
  -webkit-border-radius: 100px;
}

::-webkit-scrollbar-thumb:horizontal:window-inactive {
  background:
    linear-gradient(to right, #eee 5px, #eee0 10px),
    linear-gradient(to left, #eee 5px, #eee0 10px),
    linear-gradient(to bottom, #ddd 10%, #fff 20%, #eee 30%, #fff);
  box-shadow: inset 0 0 4px #0044;
}

::-webkit-scrollbar-thumb:active {
  box-shadow: inset 0 0 7px #004;
}

::-webkit-scrollbar-corner {
  background: linear-gradient(to right, #ccc, #fff 20%, #ddd);
}`

const newStyleElement = document.createElement("style")
newStyleElement.innerText = css
document.head.insertAdjacentElement("beforeEnd", newStyleElement)
