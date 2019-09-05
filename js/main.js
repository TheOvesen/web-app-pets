"use strict";

let sheetId = "1Ifk-tlxehniw0rZ66jm7lf4bWb27jjfbiIXhHt2Lgbg";
let sheetNumber = 1;
let sheetUrl = `https://spreadsheets.google.com/feeds/list/${sheetId}/${sheetNumber}/public/full?alt=json`;
let petList = [];
// console.log(sheetUrl);

// Get the list of pets from our Google Sheet
fetch(sheetUrl)
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    petList = json.feed.entry;
    console.log(petList);
    appendPets(petList);
    getSpecies(petList);   // Don't need these here specifically, it's just to test them
    getLocations(petList); //
  });

// Appends the list of pets to the DOM
function appendPets(pets) {
  let htmlTemplate = "";

  // Basic DOM insertion to check if it works
  for (let pet of pets) {
    htmlTemplate += `
      <article>
        <img src="${pet["gsx$photo"]["$t"]}">
        <h2>${pet["gsx$name"]["$t"]}</h2>
        <p>Age: ${pet["gsx$age"]["$t"]}</p>
        <p>Location: ${pet["gsx$location"]["$t"]}
      </article>
    `;
  }

  document.querySelector("#pet-container").innerHTML = htmlTemplate;
}

// Gets the different species from the list of pets and puts them in an array; no duplicates
function getSpecies(pets) {
  let speciesArray = [];

  for (let pet of pets) {
    if (speciesArray.includes(pet["gsx$type"]["$t"].toLowerCase()) === false) {
      speciesArray.push(pet["gsx$type"]["$t"].toLowerCase())
    }
  }

  console.log(speciesArray);

  return speciesArray;
}

// Gets the available locations from the list and puts them in an array; no duplicates
function getLocations(pets) {
  let locationArray = [];

  for (let pet of pets) {
    if (locationArray.includes(pet["gsx$location"]["$t"].toLowerCase()) === false) {
      locationArray.push(pet["gsx$location"]["$t"].toLowerCase())
    }
  }

  console.log(locationArray);

  return locationArray;
}