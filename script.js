let colorsMap = new Map();

function rgbToHex(rgb) {
    var parts = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!parts) return rgb;
    
    var hexColor = "#";
    for (var i = 1; i <= 3; i++) {
        var hexPart = parseInt(parts[i]).toString(16);
        hexColor += hexPart.length == 1 ? "0" + hexPart : hexPart;
    }

    return hexColor;
}

function manageFillAndStroke(type) {
    let reducer = 0;
    if (type === "path") {
        reducer = 4;
    }
    for (let i = 0; i < document.getElementsByTagName(type).length - reducer; i++) {
        var element = document.getElementsByTagName(type)[i];

        var computedStyle = window.getComputedStyle(element);

        var fillColorRGB = computedStyle.getPropertyValue("fill");
        var strokeColorRGB = computedStyle.getPropertyValue("stroke");

        if (fillColorRGB == ""  || fillColorRGB == "none")  {
            fillColorRGB = element.style.fill;
        }
        if (strokeColorRGB == "" || strokeColorRGB == "none") {
            strokeColorRGB = element.style.stroke;
        }

        var fillColorHex = rgbToHex(fillColorRGB);
        var strokeColorHex = rgbToHex(strokeColorRGB);

        if (!colorsMap.has(fillColorHex)) {
            colorsMap.set(fillColorHex, []);
        }
        if (!colorsMap.has(strokeColorHex)) {
            colorsMap.set(strokeColorHex, []);
        }

        colorsMap.get(fillColorHex).push({ type, index: i, property: "fill" });
        colorsMap.get(strokeColorHex).push({ type, index: i, property: "stroke" });

        if (colorsMap.get(fillColorHex).length === 1) {
            document.getElementById("fill_cont").innerHTML += `<input type="color" id="favcolor_${fillColorHex}" name="favcolor" oninput="changeColor('${type}', '${fillColorHex}', 'fill')" value=${fillColorHex} >`;
        }
        if (colorsMap.get(strokeColorHex).length === 1) {
            document.getElementById("fill_cont").innerHTML += `<input type="color" id="favcolor_${strokeColorHex}" name="favcolor" oninput="changeColor('${type}', '${strokeColorHex}', 'stroke')" value=${strokeColorHex} >`;
        }
    }
}

function changeColor(type, colorHex, property) {
    let elements = document.getElementsByTagName(type);
    let indices = colorsMap.get(colorHex);
    console.log(indices)
    for (let i = 0; i < indices.length; i++) {
        let fillorstroke = indices[i].property
        if(fillorstroke == "fill"){
            document.getElementsByTagName(indices[i].type)[indices[i].index].style.fill =  document.getElementById("favcolor_" + colorHex).value

        }else{
            document.getElementsByTagName(indices[i].type)[indices[i].index].style.stroke =  document.getElementById("favcolor_" + colorHex).value

        }
        
    }
    // for (let entry of indices) {
    //     elements[entry.index].style[entry.property] = document.getElementById("favcolor_" + colorHex).value;
    // }
}

// Call manageFillAndStroke with the desired types
manageFillAndStroke("path");
manageFillAndStroke("polyline");
manageFillAndStroke("rect");
manageFillAndStroke("circle");


function changeIconSize() {
    document.getElementById("main-svg").style.width = document.getElementById("icon_size").value
    document.getElementById("main-svg").style.height = document.getElementById("icon_size").value
}


function changeIconPadding(){
    document.getElementById("main-svg").style.padding = document.getElementById("icon_padding").value
}

function changeIconStrokeWidth(){
    document.getElementById("main-svg").setAttribute("stroke", "#000")
    document.getElementById("main-svg").setAttribute("stroke-width", document.getElementById("icon_stroke").value)
}

function changeIconLineColor(){
    document.getElementById("main-svg").setAttribute("stroke", document.getElementById("line_color").value)
}



const copyButtons = document.querySelectorAll('.copy-button');


copyButtons.forEach(button => {
  button.addEventListener('click', () => {
    const svgCode = document.getElementById("main-svg").outerHTML

    if (navigator.clipboard) {
      navigator.clipboard.writeText(svgCode)
        .then(() => {
          button.innerText = 'SVG Copied';
          button.disabled = true;
        })
        .catch(error => {
          console.error('Error copying SVG: ' + error.message);
        });
    } else {
      console.error('Clipboard API not supported in this browser.');
    }
  });
});

const downloadButtons = document.querySelectorAll('.download-button');

downloadButtons.forEach(button => {
  button.addEventListener('click', () => {
    
    const svgCode = document.getElementById("main-svg").outerHTML

    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'image.svg';

    // Programmatically trigger the download
    a.click();

    window.URL.revokeObjectURL(url);
  });
});