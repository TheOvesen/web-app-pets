"use strict";

let sheetId = "1Ifk-tlxehniw0rZ66jm7lf4bWb27jjfbiIXhHt2Lgbg";
let sheetNumber = 1;
let sheetUrl = `https://spreadsheets.google.com/feeds/list/${sheetId}/${sheetNumber}/public/full?alt=json`;
let petList = [];
// console.log(sheetUrl);

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems);
});

// Get the list of pets from our Google Sheet
fetch(sheetUrl)
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    petList = json.feed.entry;
    console.log(petList);
    appendPets(petList);
    fillSearchForm(petList);
  });

function fillSearchForm(list)
{
  fillDropdown("type");
  fillDropdown("age");
  fillDropdown("breed");
  fillDropdown("location");
  fillDropdown("size");
  fillDropdown("gender");
}

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

function fillDropdown(category)
{
  let htmlTemplate = `<option value="">---</option>`;
  let containerArray = [];

  for (let pet of petList) {
    if (containerArray.includes(pet[`gsx$${category}`]["$t"].toLowerCase()) === false) {
      containerArray.push(pet[`gsx$${category}`]["$t"].toLowerCase())
      htmlTemplate += `
        <option value="${pet[`gsx$${category}`]["$t"].toLowerCase()}">${pet[`gsx$${category}`]["$t"]}</option>
      `;
    }
  }

  console.log(containerArray);
  document.querySelector(`#input_${category}`).innerHTML += htmlTemplate;

  let elems = document.querySelectorAll('select');
  let instances = M.FormSelect.init(elems);
}

function searchList()
{
  let propertyArray = [
    "gsx$type",
    "gsx$age",
    "gsx$breed",
    "gsx$location",
    "gsx$gender",
    "gsx$size"
  ];

  let searchPromptArray = [
    document.querySelector("#input_type").value,
    document.querySelector("#input_age").value,
    document.querySelector("#input_breed").value,
    document.querySelector("#input_location").value,
    document.querySelector("#input_gender").value,
    document.querySelector("#input_size").value
  ];

  appendPets(searchListSpecificMulti(petList, propertyArray, searchPromptArray));
}

function searchListSpecificMulti(list, propertyArray, searchPromptArray) {
  if (propertyArray.length != searchPromptArray.length) {
    console.log("Error: Arrays aren't equally long, fill out with blank strings if you have to");
    return [];
  }
  let filteredList = [];

  for (let object of list) {
    let matches = 0;

    for (let i = 0; i < propertyArray.length; i++) {
      if (object[`${propertyArray[i]}`]["$t"].toLowerCase().includes(searchPromptArray[i].trim().toLowerCase())) {
        matches++;
      }
    }

    if (matches === propertyArray.length) {
      filteredList.push(object);
    }
  }

  //console.log(`Objects where "${propertyArray}" respectively match "${searchPromptArray}":`);
  console.log(filteredList);
  return filteredList;
}
