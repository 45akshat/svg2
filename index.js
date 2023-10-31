const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
let svgData = [];

app.get('/search', (req, res) => {
  svgData = []
  const searchQuery = req.query.query; // Get the search query from the URL parameter
  const tone = req.query.tone; // Get the tone from the URL parameter
  const page = req.query.page || 1; // Get the page from the URL parameter

  if (!searchQuery) {
    res.status(400).send('Missing search query');
    return;
  }

  // Modify the websiteURL to include the 'tone' and 'page' parameters if provided
  let websiteURL = `https://www.svgrepo.com/vectors/${searchQuery}/`;
  if (tone) {
    websiteURL = `https://www.svgrepo.com/vectors/${searchQuery}/${tone}/`;
  }
  if (page) {
    websiteURL += `/${page}/`; // Append the 'page' parameter to the URL
  }

  axios.get(websiteURL)
    .then(response => {
      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);


        $('img').each((index, element) => {
          const src = $(element).attr('src');
          if (src && src.startsWith('https://www.svgrepo.com/show/')) {
            const svgUrl = src;
            svgData.push({ svgUrl, svgCode: null });
          }
        });

        const fetchPromises = svgData.map(item => {
          return axios.get(item.svgUrl)
            .then(response => {
              if (response.status === 200) {
                let svgCode = response.data;

                // Remove the XML declaration and comment
                svgCode = svgCode.replace(/<\?xml[^>]*\?>\s*/i, ''); // Remove XML declaration
                svgCode = svgCode.replace(/<!--[\s\S]*?-->\s*/g, ''); // Remove comments

                item.svgCode = svgCode;
              }
            })
            .catch(error => {
              console.error(`Error fetching SVG: ${error.message}`);
            });
        });

        const filterMenuItems = [
          { tone: 'all', label: 'All' },
          { tone: 'monocolor', label: 'Monocolor' },
          { tone: 'multicolor', label: 'Multicolor' },
          { tone: 'duotone', label: 'Duotone' },
          { tone: 'outlined', label: 'Outlined' },
          { tone: 'filled', label: 'Filled' },
          { tone: 'icon', label: 'Icon' },
          { tone: 'glyph', label: 'Glyph' },
          { tone: 'rounded', label: 'Rounded' },
          { tone: 'sharp', label: 'Sharp' },
        ];


      
        // Create the filter menu
        const filterMenu = `
          <div class="filter-menu">
            ${filterMenuItems.map(item => `
              <a onclick="loadingAnimation()" href="/search?query=${searchQuery}&tone=${item.tone}" class="${(tone || 'All').toLowerCase() === item.tone.toLowerCase() ? 'active' : ''}">
                ${item.label}
              </a>
            `).join('')}
          </div>
        `;

        Promise.all(fetchPromises)
          .then(() => {
            let svgGrid = svgData
              .map((item, index) => `
                <div class="svg-container">
                  <div class="svg-code"><a href="/edit?svgIndex=${index}&query=${searchQuery}&tone=${tone}">${item.svgCode}</a></div>
                  <div id="cont1">
                    <svg id="copy_svg" class="copy-button" data-index="${index}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 11C6 8.17157 6 6.75736 6.87868 5.87868C7.75736 5 9.17157 5 12 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21 6.75736 21 8.17157 21 11V16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H12C9.17157 22 7.75736 22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V11Z" stroke="#1C274C" stroke-width="1.5"/>
                    <path opacity="0.5" d="M6 19C4.34315 19 3 17.6569 3 16V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H15C16.6569 2 18 3.34315 18 5" stroke="#1C274C" stroke-width="1.5"/>
                    </svg>
                    <svg id="download_svg" class="download-button" data-index="${index}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" download="image.svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                    

                  </div>

                </div>
              `)
              .join('');

              if(svgData.length == 0){
                svgGrid = `<h1>No Results Found</h1>`
              }

            res.send(`
            <html>
              <head>
                <link href="https://fonts.googleapis.com/css?family=Poppins&display=swap" rel="stylesheet">
                <style>
                body {
                  font-family: "poppins", Arial, sans-serif;
                  background-color: #ffffff;
                  margin: 0;
                  padding: 0;
                }
                
                h1 {
                  text-align: center;
                  margin-top: 20px;
                }
                
                svg {
                  width: auto;
                  height: 50px;
                }
                
                .container {
                  display: flex;
                  flex-wrap: wrap;
                  justify-content: center;
                  gap: 30px;
                  padding: 20px;
                }
                
                .svg-container {
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  padding: 10px;
                  text-align: center;
                  max-width: 300px;
                }
                
                .svg-code {
                  padding: 10px;
                  margin-top: 10px;
                  width: fit-content;
                  height: fit-content;
                  word-break: break-all;
                  padding: 0px 20px;
                }
                
                .copy-button, .download-button {
                  border: none;
                  margin-top: 5px;
                  border-radius: 8px;
                  cursor: pointer;
                }
                
                .copy-button:disabled, .download-button:disabled {
                  cursor: not-allowed;
                }
                
                #copy_svg:hover, #download_svg:hover {
                  width: 23px;
                }
                
                #copy_svg, #download_svg {
                  width: 20px;
                  height: auto;
                  transition: width 0.3s;
                }
                
                #cont1 {
                  display: flex;
                  flex-direction: row;
                  justify-content: space-evenly;
                  width: 100%;
                  height: 30px;
                  margin-top: 10px;
                }
                
                .filter-menu {
                  display: flex;
                  background-color: aliceblue;
                  justify-content: space-evenly;
                  padding: 20px;
                  border-right: 1px solid #ccc;
                }
                
                .filter-menu a {
                  text-decoration: none;
                  color: #333;
                }
                
                .filter-menu a.active {
                  font-weight: bold;
                  text-decoration: underline;
                  color: rgb(71 75 255);
                }
                
                
                
                .grid-container {
                  display: none;
                  grid-template-columns: auto auto auto auto auto auto auto auto auto auto ;
                  background-color: white;
                  gap: 30px;
                  margin: 0px 30px;
                  padding: 10px;
                }
                .grid-item {
                  background-color: rgba(200, 200, 200, 0.2); /* Light grey color */
                  padding: 20px;
                  width: auto;
                  height: 100px;
                  font-size: 30px;
                  text-align: center;
                  animation: shine 0.8s infinite alternate;
                }
                
                @keyframes shine {
                  0% {
                    background-color: rgba(200, 200, 200, 0.3); /* Light grey with lower opacity */
                  }
                  100% {
                    background-color: rgba(200, 200, 200, 0.7); /* Full opacity light grey */
                  }
                }
                
                #page_cont{
                  display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                }
                
                #page_svg{
                  cursor: pointer;
                }
                
                #s_query{
                  width: 100%;
                  height: 42px;
                  background-color: rgb(241, 242, 251);
                  border: 2px solid rgba(225, 225, 239, 0.5);
                  border-radius: 8px;
                  padding: 0px 40px;
                  transition: all 0.25s ease 0s;
                }
                
                #menu_cont{
                  display: flex;
                  margin-top: 20px;
                  flex-direction: row;
                  width: 100%;
                  align-items: center;
                  justify-content: space-evenly;
                }
                
                #search_cont{
                  display: flex;
                  flex-direction: row;
                  width: 30%;
                  align-items: center;
                }
                
                #search_svg{
                  width: 22px;
                  position: absolute;
                  margin-left: 10px;
                }
                
                
                </style>
              </head>
              <body>
                <div id="menu_cont">
                  <div id="search_cont">
                    <svg id="search_svg" width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <input type="text" id="s_query" placeholder="Search SVG...">
                  </div>
                
                </div>
                <h1>SVG Grid for "${searchQuery}"</h1>
                ${filterMenu}
                <div class="grid-container">
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                
                </div>
                <div class="container">
                  ${svgGrid}
                </div>
                <div id="page_cont"> 
                <a onclick="changePage('back')">
                <svg fill="#000000" width="16px" height="16px" viewBox="0 0 52 52" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg">
                <g data-name="Group 132" id="Group_132">
                <path d="M38,52a2,2,0,0,1-1.41-.59l-24-24a2,2,0,0,1,0-2.82l24-24a2,2,0,0,1,2.82,0,2,2,0,0,1,0,2.82L16.83,26,39.41,48.59A2,2,0,0,1,38,52Z"/>
                </g>
                </svg>
                </a>

                Page ${page} <a onclick="changePage('front')">

                <svg width="16px" height="16px" id="page_svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 7L15 12L10 17" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg></a></div>
                <script>
                const copyButtons = document.querySelectorAll('.copy-button');
                const svgData = ${JSON.stringify(svgData)};


                copyButtons.forEach(button => {
                  button.addEventListener('click', () => {
                    const index = button.getAttribute('data-index');
                    const svgCode = svgData[index].svgCode;
        
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
                    const index = button.getAttribute('data-index');
                    const svgCode = svgData[index].svgCode;
                
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

                function loadingAnimation(){
                  document.getElementsByClassName("container")[0].innerHTML = ""
                  document.getElementsByClassName("grid-container")[0].style.display = "grid"
                }
                
                function changePage(where){
                  var originalURL = location.href
                  console.log(originalURL)

                  // Use a regular expression to remove the &page=X parameter (where X is any number)
                  var updatedUrl = originalURL.replace(/&page=[^&]+/g, '');
                  console.log(updatedUrl)
                  if(where == "front"){
                    location.replace(updatedUrl+"&page="+${parseInt(page)+1}+"");
                  }else{
                    if(${parseInt(page)} != 1){
                      location.replace(updatedUrl+"&page="+${parseInt(page)-1}+"");
                    }
                  }
                }

                const searchInput = document.getElementById("s_query");
                if("${searchQuery}" != ""){
                  searchInput.value = "${searchQuery}"

                }

                searchInput.addEventListener("keydown", function (event) {
                  if (event.key === "Enter" || event.keyCode === 13) {
                    loadingAnimation()
                    const searchValue = searchInput.value;
                    if(${tone != "all"}){
                      location.replace("/search?query="+searchValue+"&tone=${tone}");
                      
                    }else{
                      location.replace("/search?query="+searchValue+"");

                    }
                    
                  }
                });

                </script>
              </body>
            </html>
          `);
          })
          .catch(error => {
            res.status(500).send(`Error fetching SVGs: ${error.message}`);
          });
      } else {
        res.status(500).send(`Failed to fetch the website. Status code: ${response.status}`);
      }
    })
    .catch(error => {
      res.status(500).send(`Error: ${error.message}`);
    });
});

app.get('/edit', (req, res) => {
  const svgIndex = req.query.svgIndex;
  const searchQuery = req.query.query;
  const tone = req.query.tone;

  if (!svgData[svgIndex] || !searchQuery || !tone) {
    res.status(400).send('Invalid request parameters.');
    return;
  }

  const selectedSVG = svgData[svgIndex];
  const $ = cheerio.load(selectedSVG.svgCode);



  // Create a button to apply the changes
  const applyButton = `
    <button onclick="applyChanges()">Apply Changes</button>
  `;
  $('svg').attr('id', 'main-svg');
  $('svg').attr('width', '200px');
  $('svg').attr('height', '200px');


  res.send(`
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css?family=Poppins&display=swap" rel="stylesheet">
        
      </head>
      <body>
        <div id="menu_cont">
          <h1>Edit SVG</h1>
          <a href="/">Back to Search</a>
        </div>
        <div class="edit-container">
          <div class="svg-code">${$.html()}</div>
          <div class="options-container">
            <div class="fill_opts">Fill <div id="fill_cont"></div></div>
            
            <div class="fill_opts"><span>Icon Size </span><input id="icon_size" type="range" min="25" max="256" value="200" oninput="changeIconSize()"></div>
            <div class="fill_opts"><span>Padding </span><input id="icon_padding" type="range" min="0" max="70" value="0"  oninput="changeIconPadding()"></div>
            <div class="fill_opts"><span>Stroke Width </span><input id="icon_stroke" type="range" min="0.0"  step="0.1" max="5.0" value="0"  oninput="changeIconStrokeWidth()"></div>
            <div class="fill_opts"><span>Line Color</span><input type="color" id="line_color" name="line_color" value="#000"  oninput="changeIconLineColor()"></div>
          </div>
        </div>

        <div id="cont1">
        <div class="copy-button" >
          <svg id="copy_svg"  data-index="0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fff" >
          <path d="M6 11C6 8.17157 6 6.75736 6.87868 5.87868C7.75736 5 9.17157 5 12 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21 6.75736 21 8.17157 21 11V16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H12C9.17157 22 7.75736 22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V11Z" stroke="#fcfcfc" stroke-width="1.5" style="stroke: rgb(252, 252, 252);"></path>
          <path opacity="0.5" d="M6 19C4.34315 19 3 17.6569 3 16V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H15C16.6569 2 18 3.34315 18 5" stroke="#fcfcfc" stroke-width="1.5" style="stroke: rgb(252, 252, 252);"></path>
          </svg>
          Copy SVG
        </div>
        <div class="download-button">
          <svg id="download_svg"  data-index="0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" download="image.svg" stroke="#fff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
          Download SVG
        </div>
        </div>


      </body>
      <script src="script.js"></script>

    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});