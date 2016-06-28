$(document).ready(function () {

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


  function convertUTCDateToLocalDate(date) {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      console.log("DATE: " + date);
      var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
      var offset = date.getTimezoneOffset() / 60;
      var hours = date.getHours();
      newDate.setHours(hours - offset);
      console.log(monthNames[newDate.getMonth()] + " " + newDate.getDate());
      return monthNames[newDate.getMonth()] + " " + newDate.getDate();
  }



  /* Grabbed from getWeather(), but can be modified when clicking on the temperature to convert from F to C, and vice versa. */
  var temperature;

  //NEED a way to get current temperature

  function getWeather(lat_coord, long_coord, city, region, countryCode) {
    console.log("Latitude: " + lat_coord);
    console.log("Longitude: " + long_coord);
    $("#section_city").html("<h3>" + city + ", " + region + " " + countryCode + "</h3>");

    var api_call = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat_coord + "&lon=" + long_coord + "&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";
    api_call = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat_coord + "&lon=" + long_coord + "&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";
    api_call = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat_coord + "&lon=" + long_coord + "&cnt=10&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";

    console.log("Api: " + api_call);
    $.getJSON(api_call, function(data) {

      console.log("Data");
      console.log(data);
      console.log("---------------------------------");


      var weather_table = $('<table class="weather_table">');

      var weatherObj, date, wind_cardinal_direction;
      var weather_row, cell_date;
      for (var i = 0; i < 10; i++) {
        weatherObj = data.list[i];

        weather_row = $('<tr>');
        cell_date = $('<td>');

        console.log("Day: " + i);
        console.log(weatherObj);
        date = convertUTCDateToLocalDate(new Date(weatherObj.dt*1000));
        console.log("Date: " + date);
        console.log("Date Locale: " + date.toLocaleString());
        cell_date.html(date);
        cell_date.appendTo(weather_row);


        //weatherObj.temp.max;
        //weatherObj.temp.low;
        //weatherObj.weather[0].description;
        var iconClass = "wi-owm-" + weatherObj.weather[0].id;
        wind_cardinal_direction = convertDegressToCompass(weatherObj.deg);
        var wind_cardinal_direction = convertDegressToCompass(weatherObj.deg);
        console.log("Wind direction: " + wind_cardinal_direction);
        //weatherObj.speed; //in MPH
        //weatherObj.humidity;

        $(weather_row).appendTo(weather_table);
      }
      $(weather_table).prependTo("#new_weather_summary");
  

    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.log("Error: " + errorThrown);
      console.log("TextStatus: " + textStatus);
    });
  }


  $.getJSON("http://ip-api.com/json", function(data) {
    console.log("Data lat: " + data.lat);
    console.log("Data lon: " + data.lon);
    getWeather(data.lat, data.lon, data.city, data.region, data.countryCode);
  });


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
