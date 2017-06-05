$(document).ready(function () {

  function getCurrentWeather(lat, lon) {
    console.log(`${lat},${lon}`);
    let apiCall = `https://api.apixu.com/v1/current.json?key=6dd018b75b9c4b698c2233231170406&q=${lat},${lon}`;
    $.getJSON(apiCall, function(data) {
      console.log("Current weather");
      console.log(data);
    });
  }

  if ("geolocation" in navigator) {
  /* geolocation is available */
    navigator.geolocation.getCurrentPosition(function(position) {
      getCurrentWeather(position.coords.latitude, position.coords.longitude);
    });
  } else {
  /* geolocation IS NOT available */
    console.log("Geolocation not available");
  }


});
