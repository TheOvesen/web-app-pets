"use strict";

let sheetId = "1Ifk-tlxehniw0rZ66jm7lf4bWb27jjfbiIXhHt2Lgbg";
let sheetNumber = 1;
let sheetUrl = `https://spreadsheets.google.com/feeds/list/${sheetId}/${sheetNumber}/public/full?alt=json`;
let petList = [];
// console.log(sheetUrl);

//jQuesry anumation for landing page
setTimeout(function() {
   $( "#landing" ).slideUp( 4000 ).delay( 3000 );

});

document.addEventListener('DOMContentLoaded', function() {
  let elems = document.querySelectorAll('.sidenav');
  let instances = M.Sidenav.init(elems);
  let tabs = document.querySelectorAll('.tabs');
  let instance = M.Tabs.init(tabs);
  let slides = document.querySelectorAll('.slider');
  let images = M.Slider.init(slides);
  let modals = document.querySelectorAll('.modal');
  let modalinstances = M.Modal.init(modals);
  let carousels = document.querySelectorAll('.carousel');
  let carouselinstances = M.Carousel.init(carousels);
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

  // Basic DOM insertion to check if it works
  for (let pet of pets) {
    htmlTemplate += `
      <article class="list_element">
        <div class="img_container"><img src="${pet["gsx$photo"]["$t"]}"></div>
        <h2>${pet["gsx$name"]["$t"]}</h2>
        <p>Age: ${pet["gsx$age"]["$t"]}</p>
        <p>Location: ${pet["gsx$location"]["$t"]}</p>
        <button class="waves-effect waves-light btn" type="button" name="button" onclick="showPet('${pet["id"]["$t"]}')">Meet me!</button>
      </article>
    `;
  }

  document.querySelector("#pet-container").innerHTML = htmlTemplate;
}

function showPet(petID)
{
  let selectedPet = {};
  let htmlTemplate = "";

  for (let pet of petList)
  {
    if (pet["id"]["$t"].includes(petID))
    {
      selectedPet = pet;
      break;
    }
  }

  console.log(selectedPet);
}

function fillDropdown(category) {
  let htmlTemplate = `<option value="">---</option>`;
  let containerArray = [];

  for (let pet of petList) {
    if (pet[`gsx$${category}`]["$t"].includes("---"))
    {
      continue;
    }

    if (containerArray.includes(pet[`gsx$${category}`]["$t"]) === false) {
      containerArray.push(pet[`gsx$${category}`]["$t"])
      htmlTemplate += `
        <option value="${pet[`gsx$${category}`]["$t"]}">${pet[`gsx$${category}`]["$t"]}</option>
      `;
    }
  }

  console.log(containerArray);
  let dropdowns = document.querySelectorAll(`.input_${category}`);
  for (let dropdown of dropdowns)
  {
    dropdown.innerHTML += htmlTemplate;
  }

  let elems = document.querySelectorAll('select');
  let instances = M.FormSelect.init(elems);
}

function searchList(formID) {
  let propertyArray = [
    "gsx$type",
    "gsx$age",
    "gsx$breed",
    "gsx$gender",
    "gsx$size",
    "gsx$lat",
    "gsx$lng"
  ];

  let searchPromptArray = [
    document.querySelector(`#${formID} .input_type`).value,
    document.querySelector(`#${formID} .input_age`).value,
    document.querySelector(`#${formID} .input_breed`).value,
    document.querySelector(`#${formID} .input_gender`).value,
    document.querySelector(`#${formID} .input_size`).value,
    searchLat,
    searchLng
  ];

  appendPets(searchListSpecificMulti(petList, propertyArray, searchPromptArray));

  hideSearch();
  document.querySelector("#view_all_button").click();
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

    if (matches === propertyArray.length) {
      filteredList.push(object);
    }
  }

  //console.log(`Objects where "${propertyArray}" respectively match "${searchPromptArray}":`);
  console.log(filteredList);
  return filteredList;
}

function showSearch()
{
  let showButton = document.querySelector("#show-search");
  let hideButton = document.querySelector("#hide-search");
  let search = document.querySelector("#new-search");
  showButton.classList.add("hide");
  hideButton.classList.remove("hide");
  search.classList.remove("hide");
}

function hideSearch()
{
  let showButton = document.querySelector("#show-search");
  let hideButton = document.querySelector("#hide-search");
  let search = document.querySelector("#new-search");
  showButton.classList.remove("hide");
  hideButton.classList.add("hide");
  search.classList.add("hide");
}

$(window).load(function() {
  $('.flexslider').flexslider({
    animation: "slide",
    controlNav: "thumbnails"
  });
});
