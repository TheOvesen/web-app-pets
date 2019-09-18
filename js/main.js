"use strict";

// Variables for our Google Sheet
let sheetId = "1Ifk-tlxehniw0rZ66jm7lf4bWb27jjfbiIXhHt2Lgbg";
let sheetNumber = 1;
let sheetUrl = `https://spreadsheets.google.com/feeds/list/${sheetId}/${sheetNumber}/public/full?alt=json`;
let petList = [];

//jQuery anumation for landing page
setTimeout(function() {
  $("#landing").slideUp(4000).delay(6000);

});

// Initialize our various Materialize components
document.addEventListener('DOMContentLoaded', function() {
  let elems = document.querySelectorAll('.sidenav');
  let instances = M.Sidenav.init(elems);
  let tabs = document.querySelectorAll('.tabs');
  let instance = M.Tabs.init(tabs);
  let slides = document.querySelectorAll('.slider');
  let images = M.Slider.init(slides);
  let modals = document.querySelectorAll('.modal');
  let modalinstances = M.Modal.init(modals);
});

// google map

let map;
let map1;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10
  });

  // set position by device geolocation
  navigator.geolocation.getCurrentPosition(function(position) {
    let pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    map.setCenter(pos);
  });
  map1 = new google.maps.Map(document.getElementById('map1'), {
    zoom: 10
  });

  // set position by device geolocation
  navigator.geolocation.getCurrentPosition(function(position) {
    let pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    map1.setCenter(pos);
  });
}

let searchLat = 0;
let searchLng = 0;

// markers
function appendMarkers(places, mapId) {
  for (let place of places) {
    console.log(place);
    let latLng = new google.maps.LatLng(place["gsx$lat"]["$t"], place["gsx$lng"]["$t"]);
    let marker = new google.maps.Marker({
      position: latLng,
      map: mapId
    });
    marker.addListener('click', function() {
    //map.setZoom(12);
    //map.setCenter(marker.getPosition());
    searchLat = marker.getPosition().lat();
    searchLng = marker.getPosition().lng();
    console.log(searchLat);
    console.log(searchLng);
    //console.log(marker.position);
  });
  }
}
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
    initMap();
      appendMarkers(petList, map);
        appendMarkers(petList, map1);
  });

// Just a shorthand to more quickly fill the dropdowns
function fillSearchForm(list) {
  fillDropdown("type");
  fillDropdown("age");
  fillDropdown("breed");
  //fillDropdown("location");
  fillDropdown("size");
  fillDropdown("gender");
}

// Appends the list of pets to the DOM
function appendPets(pets) {
  let htmlTemplate = "";

  // Insert the pet elements to the HTML template
  for (let pet of pets) {
    htmlTemplate += `
      <article class="list_element">
        <div class="img_container"><img src="${pet["gsx$photo"]["$t"]}"></div>
        <h2>${pet["gsx$name"]["$t"]}</h2>
        <p>Age: ${pet["gsx$age"]["$t"]}</p>
        <p>Location: ${pet["gsx$location"]["$t"]}</p>
        <button class="waves-effect waves-light btn modal-trigger" href="#pet-modal" type="button" name="button" onclick="showPet('${pet["id"]["$t"]}')">Meet me!</button>
      </article>
    `;
  }

  document.querySelector("#pet-container").innerHTML = htmlTemplate;
}

// Puts the details of the selected pet into the modal
function showPet(petID) {
  let selectedPet = {};
  let htmlTemplate = "";
  let thumbnails = "";

  // Loop through the list of pets, stopping at the first match in ID
  for (let pet of petList) {
    if (pet["id"]["$t"].includes(petID)) {
      // Collect all images of pet in an array; separate links with a single space
      let images = [pet["gsx$photo"]["$t"]].concat(pet["gsx$moreimages"]["$t"].split(" "));

      // Loop through image array and make thumbnails; images have to be an HTTP URL at the moment
      for (let image of images) {
        if (image.includes("http") === true) {
          thumbnails += `<img src="${image}" class="modal_thumbnail" onclick="swapModalPhoto('${image}')">`;
        }
      }

      // Add all the details to the HTML template
      htmlTemplate += `
        <img src="${pet["gsx$photo"]["$t"]}" id="pet-modal-big-image">
        <div class="modal_thumbnail_container">${thumbnails}</div>
        <h5>Personality</h5>
        <p>${pet["gsx$personality"]["$t"]}</p>
        <h5>Life story</h5>
        <p>${pet["gsx$lifestory"]["$t"]}</p>
        <h5>Searches for</h5>
        <p>${pet["gsx$searchesfor"]["$t"]}</p>
        <h5>Health</h5>
        <p>${pet["gsx$health"]["$t"]}</p>
      `;

      break; // End the for-loop to save resources, no further matches will be made anyways
    }
  }

  // Fill the modal with the HTML template
  document.querySelector("#pet-modal-content").innerHTML = htmlTemplate;
}

// Swaps the big photo of the modal with the one on the clicked thumbnail
function swapModalPhoto(photo) {
  document.querySelector("#pet-modal-big-image").src = photo;
}

// Fills a dropdown menu with the specified category
function fillDropdown(category) {
  let htmlTemplate = `<option value="">---</option>`;
  let containerArray = [];

  // Loop through all pets in the list
  for (let pet of petList) {
    if (pet[`gsx$${category}`]["$t"].includes("---")) {
      continue; // If the current option of the current pet includes "---", ignore it and continue to next pet in line
    }

    // If the container array doesn't yet include the option that this pet is displaying...
    if (containerArray.includes(pet[`gsx$${category}`]["$t"]) === false) {
      containerArray.push(pet[`gsx$${category}`]["$t"]) // Add to the container array for future comparison
      htmlTemplate += `
        <option value="${pet[`gsx$${category}`]["$t"]}">${pet[`gsx$${category}`]["$t"]}</option>
      `; // Add the option to the HTML template
    }
  }

  // console.log(containerArray);

  // Grab all dropdowns of the given category, and add the elements to it
  let dropdowns = document.querySelectorAll(`.input_${category}`);
  for (let dropdown of dropdowns) {
    dropdown.innerHTML += htmlTemplate;
  }

  // Initialize the dropdowns; they're Materialize
  let elems = document.querySelectorAll('select');
  let instances = M.FormSelect.init(elems);
}

// Search the list for pets that match the given criteria
function searchList(formID) {
  // These are the properties we need to compare in the search
  let propertyArray = [
    "gsx$type",
    "gsx$age",
    "gsx$breed",
    "gsx$gender",
    "gsx$size",
    "gsx$lat",
    "gsx$lng"
  ];

  // These are all the values of the searches we need to compare the properties to
  let searchPromptArray = [
    document.querySelector(`#${formID} .input_type`).value,
    document.querySelector(`#${formID} .input_age`).value,
    document.querySelector(`#${formID} .input_breed`).value,
    document.querySelector(`#${formID} .input_gender`).value,
    document.querySelector(`#${formID} .input_size`).value,
    searchLat,
    searchLng
  ];

  // Calls the actual search function, which returns an array of pet objects
  appendPets(searchListSpecificMulti(petList, propertyArray, searchPromptArray));

  hideSearch();

  // Simulate a click on the "view all" tab so we change page
  document.querySelector("#view_all_button").click();
}

// Searches through a given list of objects for objects that match all given properties with all given search prompts
function searchListSpecificMulti(list, propertyArray, searchPromptArray) {
  // If the two arrays aren't equally long, it won't work, so throw an error instead and return an empty array
  if (propertyArray.length != searchPromptArray.length) {
    console.log("Error: Arrays aren't equally long, fill out with blank strings if you have to");
    return [];
  }
  let filteredList = [];

  // Loop through all objects in the list
  for (let object of list) {
    let matches = 0;

    // For all properties in the array, compare to the search prompt at the same index
    for (let i = 0; i < propertyArray.length; i++) {
      let property = object[`${propertyArray[i]}`]["$t"];
      let searchPrompt = searchPromptArray[i];
      if (Number.isNaN(searchPrompt) === false)
      {
        searchPrompt = searchPrompt.toString();
      }

      if (Number.isNaN(property) === false)
      {
        property = property.toString();
      }
      if (property.includes(searchPrompt.trim())) {
        matches++;
      }
    }

    // If every property matched, push the object to the filtered list
    if (matches === propertyArray.length) {
      filteredList.push(object);
    }
  }

  //console.log(`Objects where "${propertyArray}" respectively match "${searchPromptArray}":`);
  console.log(filteredList);
  return filteredList; // Return the filtered list
}

// Shows the search form and "hide search" button on the "View all" page, hides "New search" button
function showSearch() {
  let showButton = document.querySelector("#show-search");
  let hideButton = document.querySelector("#hide-search");
  let search = document.querySelector("#new-search");
  showButton.classList.add("hide");
  hideButton.classList.remove("hide");
  search.classList.remove("hide");
}

// Hides the search form and "hide search" button on the "View all" page, shows "New search" button
function hideSearch() {
  let showButton = document.querySelector("#show-search");
  let hideButton = document.querySelector("#hide-search");
  let search = document.querySelector("#new-search");
  showButton.classList.remove("hide");
  hideButton.classList.add("hide");
  search.classList.add("hide");
}

// $(window).load(function() {
//   $('.flexslider').flexslider({
//     animation: "slide",
//     controlNav: "thumbnails"
//   });
// });
