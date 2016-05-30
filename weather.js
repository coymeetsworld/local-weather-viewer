$(document).ready(function () {

  //http://ip-api.com/json
  function convertDegressToCompass(deg) {
    console.log("Degrees: " + deg);
    var cardinal_direction=["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    return cardinal_direction[(Math.round((deg/22.5)+.5) % 16)];
  }

  function getDateTime() {
    var d = new Date();
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var day = days[d.getDay()];
    var hours = d.getHours();
    var minutes = d.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    var cycle;
    if (hours >= 12) {
      cycle = "PM";
      hours -= 12;
    } else {
      cycle = "AM";
    }
    return days[d.getDay()] + " " + hours + ":" + minutes + " " + cycle;
  }

  /* Grabbed from getWeather(), but can be modified when clicking on the temperature to convert from F to C, and vice versa. */
  var temperature;

  function getWeather(lat_coord, long_coord) {
    console.log("Latitude: " + lat_coord);
    console.log("Longitude: " + long_coord);

    var api_call = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat_coord + "&lon=" + long_coord + "&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";
    console.log("Api: " + api_call);
    $.getJSON(api_call, function(data) {
      var city = data.name;
      console.log("City: " + data.name);
      $("#section_city").html("<h3>" + city + "</h3>");

      $("#current_time").html("<h4>" + getDateTime() + "</h4>");

      var weatherDesc = data.weather[0].description;
      //$("#section_weather_description").html("<h4>" + weatherDesc + "</h4>");

      var icon = data.weather[0].icon;
      var icon_url = "http://openweathermap.org/img/w/" + icon + ".png";
      console.log("icon_url: " + icon_url);
      //$("#section_weather_icon").html("<img src=\"" + icon_url + "\">");
      $("#section_weather_description").html("<img src=\"" + icon_url +"\">" + " " + weatherDesc);



      temperature = data.main.temp;
      console.log("Temperature (F): " + temperature);
      $("#section_temperature").html("<p>" + temperature + " F</p>");

      var wind_speed = data.wind.speed;
      console.log("Wind speed (MPH): " + wind_speed);

      console.log("Wind degrees: " + data.wind.deg);
      var wind_cardinal_direction = convertDegressToCompass(data.wind.deg);
      console.log("Wind direction: " + wind_cardinal_direction);

      $("#section_weather_wind").html("<p>" + wind_speed + " " + wind_cardinal_direction + "</p>");



    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.log("Error: " + errorThrown);
      console.log("TextStatus: " + textStatus);
    });
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;
      console.log("lat: " + latitude);
      getWeather(latitude, longitude);
    });
  }

  var temperature_measurement = "F";
  $("#section_temperature").click(function() {
    if (temperature_measurement == "F") {
      temperature_measurement = "C";
      temperature = (temperature - 32) / 1.8;
      $("#section_temperature").html("<p>" + Math.round(temperature*100)/100 + " C</p>");
    } else if (temperature_measurement == "C") {
      temperature_measurement = "F";
      temperature = temperature * 1.8 + 32;
      $("#section_temperature").html("<p>" + Math.round(temperature*100) /100 + " F</p>");
    } else {
      console.log("Error: measurement " + temperature_measurement + " not recognized. Please check script.");
    }
  });

});
