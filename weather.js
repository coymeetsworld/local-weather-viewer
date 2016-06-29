$(document).ready(function () {


  function getWindStats(weatherObj) {
    var cardinalDirectionMap=["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    var roundedDegree = Math.round((weatherObj.deg/22.5)+.5);
    var cardinalDirection = cardinalDirectionMap[roundedDegree % 16];
    var cardinalDirectionIcon = $('<i>');
    cardinalDirectionIcon.addClass("wi");
    cardinalDirectionIcon.addClass("wi-wind");
    cardinalDirectionIcon.addClass("wi-towards-" + cardinalDirection.toLowerCase());

    var span = $('<span>');
    span.addClass("wind");
    span.text(weatherObj.speed + " MPH");

    cardinalDirectionIcon.prependTo(span);
    return span;

  }

  function getDayName(date) {

    /* Check if today. */
    var todaysDate = new Date();
    if (date.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)) {
      return "Today";
    }

    var tomorrowsDate = new Date();
    tomorrowsDate.setDate(todaysDate.getDate()+1);
    console.log("Tomorrows date: " + tomorrowsDate);
    if (date.setHours(0,0,0,0) == tomorrowsDate.setHours(0,0,0,0)) {
      return "Tomorrow";
    }

    /* Check if tomorrow.*/

    /* Else return day name */
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];

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

  function createTableHeader() {
    var head = $("<thead>");
    var row = $("<tr>");
    var header = $("<th>");
    header.html("Day");
    header.appendTo(row);
    header = $("<th>");
    header.html("High/Low");
    header.appendTo(row);
    header = $("<th>");
    header.html("Description");
    header.appendTo(row);
    header = $("<th>");
    header.html("Wind");
    header.appendTo(row);
    header = $("<th>");
    header.html("Humidity");
    header.appendTo(row);
    row.appendTo(head);
    return head;
  }

  /* Grabbed from getWeather(), but can be modified when clicking on the temperature to convert from F to C, and vice versa. */
  var temperature;

  //NEED a way to get current temperature

  function getWeather(lat_coord, long_coord, city, region, countryCode) {
    //console.log("Latitude: " + lat_coord);
    //console.log("Longitude: " + long_coord);
    $("#section_city").html("<h3>" + city + ", " + region + " " + countryCode + "</h3>");

    var api_call = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat_coord + "&lon=" + long_coord + "&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";
    api_call = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat_coord + "&lon=" + long_coord + "&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";
    api_call = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat_coord + "&lon=" + long_coord + "&cnt=10&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";

    console.log("Api: " + api_call);
    $.getJSON(api_call, function(data) {

      //console.log("Data");
      //console.log(data);
      //console.log("---------------------------------");


      var weather_table = $('<table class="weather_table">');

      $(createTableHeader()).appendTo(weather_table);

      var weatherObj, date, stringDate, dayName, wind_cardinal_direction;
      var weather_row, cell, weather_icon, weather_desc;
      for (var i = 0; i < 10; i++) {
        weatherObj = data.list[i];

        weather_row = $('<tr>');
        cell = $('<td>');


        console.log("Day: " + i);
        console.log(weatherObj);
        date = new Date(weatherObj.dt*1000);
        stringDate = convertUTCDateToLocalDate(date);

        dayName = getDayName(date);
        console.log("DayName: " + dayName);
        console.log("Date: " + stringDate);
        console.log("Date Locale: " + stringDate.toLocaleString());
        cell.html("<p>" + dayName + "</p><p>" + stringDate + "</p>");
        cell.appendTo(weather_row);

        cell = $('<td>');
        cell.html(weatherObj.temp.max + "/" + weatherObj.temp.min);
        cell.appendTo(weather_row);

        cell = $('<td>');
        weather_icon = $('<i>');
        weather_icon.addClass("wi");
        weather_icon.addClass("wi-owm-"+weatherObj.weather[0].id);
        weather_icon.appendTo(cell);
        weather_desc = $('<span>');
        weather_desc.html(weatherObj.weather[0].description);
        weather_desc.appendTo(cell);
        cell.appendTo(weather_row);

        cell = $('<td>');
        cell.html(getWindStats(weatherObj));
        cell.appendTo(weather_row);

        cell = $('<td>');
        cell.html(weatherObj.humidity + "%");
        cell.appendTo(weather_row);

        $(weather_row).appendTo(weather_table);
      }
      $(weather_table).prependTo("#weather_summary");


    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.log("Error: " + errorThrown);
      console.log("TextStatus: " + textStatus);
    });
  }


  $.getJSON("http://ip-api.com/json", function(data) {
    //console.log("Data lat: " + data.lat);
    //console.log("Data lon: " + data.lon);
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
