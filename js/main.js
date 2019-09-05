"use strict";

let sheetId = "1Ifk-tlxehniw0rZ66jm7lf4bWb27jjfbiIXhHt2Lgbg";
let sheetNumber = 1;
let sheetUrl = `https://spreadsheets.google.com/feeds/list/${sheetId}/${sheetNumber}/public/full?alt=json`;
let animalList = [];
// console.log(sheetUrl);

fetch(sheetUrl)
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    console.log(json);
    appendAnimals(json.feed.entry);
    getSpecies(json.feed.entry);
  });

function appendAnimals(animals)
{
  let htmlTemplate = "";

  for (let animal of animals)
  {
    htmlTemplate += `
    <article>
      <img src="${animal["gsx$photo"]["$t"]}">
      <h2>${animal["gsx$name"]["$t"]}</h2>
      <p>Age: ${animal["gsx$age"]["$t"]}</p>
      <p>Location: ${animal["gsx$place"]["$t"]}
    </article>
    `;
  }

  document.querySelector("#animal-container").innerHTML = htmlTemplate;
}

function getSpecies(animals)
{
  let speciesArray = [];

  for (let animal of animals)
  {
    if (speciesArray.includes(animal["gsx$type"]["$t"].toLowerCase()) === false)
    {
      speciesArray.push(animal["gsx$type"]["$t"].toLowerCase())
    }
  }

  console.log(speciesArray);
}
