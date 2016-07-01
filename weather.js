$(document).ready(function () {

  function getWindStats(weatherObj) {
    var cardinalDirectionMap=["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    var roundedDegree = Math.round((weatherObj.deg/22.5)+.5);
    var cardinalDirection = cardinalDirectionMap[roundedDegree % 16];
    var cardinalDirectionIcon = $('<i>');
    cardinalDirectionIcon.addClass("wi");
    cardinalDirectionIcon.addClass("wi-wind");
    cardinalDirectionIcon.addClass("wi-towards-" + cardinalDirection.toLowerCase());
    cardinalDirectionIcon.attr('data-toggle', 'tooltip');
    cardinalDirectionIcon.attr('title',cardinalDirection);

    var spanIcon = $('<span>');
    spanIcon.addClass("wind-icon");
    cardinalDirectionIcon.prependTo(spanIcon);

    var spanStats = $('<span>');
    spanStats.addClass("wind-stats");
    spanStats.text(weatherObj.speed + " MPH");

    return [spanIcon, spanStats];
  }

  function getDayName(date) {
    //console.log("Calling getDayName");
    //console.log("Date: " + date);

    /* Check if today. */
    var todaysDate = new Date();
    //console.log("Todays Date: " + todaysDate);
    //var utc = todaysDate.getTime() + (todaysDate.getTimezoneOffset() * 60000);
    //var todaysDateUTC = new Date(utc);
    //console.log("todaysDateUTC: " + todaysDateUTC);
    //if (date.setHours(0,0,0,0) == todaysDateUTC.setHours(0,0,0,0)) {
    if (date.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)) {
      return "Today";
    }

    /* Check if tomorrow.*/
    var tomorrowsDate = new Date();
    tomorrowsDate.setDate(todaysDate.getDate()+1);
    //console.log("Tomorrows date: " + tomorrowsDate);
    if (date.setHours(0,0,0,0) == tomorrowsDate.setHours(0,0,0,0)) {
      return "Tomorrow";
    }

    /* Else return day name */
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  }


  function convertUTCDateToLocalDate(date) {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
      var offset = date.getTimezoneOffset() / 60;
      var hours = date.getHours();
      newDate.setHours(hours - offset);
      //console.log(monthNames[newDate.getMonth()] + " " + newDate.getDate());
      return monthNames[newDate.getMonth()] + " " + newDate.getDate();
  }

  function createTableHeader() {
    var head = $("<thead>");
    var row = $("<tr>");
    var header = $("<th>");
    header.html("Day");
    header.appendTo(row);
    header = $("<th id=\"HighLowColumn\">");
    header.html("High/Low F&deg;");
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
  function getCurrentWeather(lat_coord, long_coord) {
    var api_call = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat_coord + "&lon=" + long_coord + "&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7"
    $.getJSON(api_call, function(data) {
      console.log("Current weather");
      console.log(data);
      var currentTemp = data.main.temp;
      var currentHumidity = data.main.humidity;
      var weatherIconId = data.weather[0].id;

      cell.addClass("highLows");
      cell.html("<span class=\"high\">" + weatherObj.temp.max + "</span> / <span class=\"low\">" + weatherObj.temp.min + "</span>");
      cell.appendTo(weather_row);


      $(weather_table).prependTo("#weather_summary");

    });
  }


  function getWeather(lat_coord, long_coord, city, region, countryCode) {
    //console.log("Latitude: " + lat_coord);
    //console.log("Longitude: " + long_coord);
    $("#section_city").html("<h3>" + city + ", " + region + " " + countryCode + "</h3>");

    var api_call = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat_coord + "&lon=" + long_coord + "&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";
    api_call = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat_coord + "&lon=" + long_coord + "&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";
    api_call = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat_coord + "&lon=" + long_coord + "&cnt=10&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";

    getCurrentWeather(lat_coord, long_coord);

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

        //dt:       1467230400
        //GMT: Wed, 29 Jun 2016 20:00:00 GMT
        //Your time zone: 6/29/2016, 1:00:00 PM GMT-7:00 DST
        //offset:   25200 seconds offset (-7 GMT hours)
        //subtract: 1467118800
        console.log(weatherObj);
        date = new Date((weatherObj.dt)*1000); //*1000 because value takes in millisecionds, dt is epoch seconds.
        //console.log("dt: " + weatherObj.dt);
        //console.log("DATE: " + date);
        stringDate = convertUTCDateToLocalDate(date);
        //console.log("Date: " + stringDate);
        dayName = getDayName(date);
        //console.log("DayName: " + dayName);

        //console.log("Date Locale: " + stringDate.toLocaleString());
        cell.html("<p class=\"dayName\">" + dayName + "</p><p>" + stringDate + "</p>");
        cell.appendTo(weather_row);

        cell = $('<td>');
        cell.addClass("highLows");
        cell.html("<span class=\"high\">" + weatherObj.temp.max + "</span> / <span class=\"low\">" + weatherObj.temp.min + "</span>");
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
        var windArray = getWindStats(weatherObj);
        windArray[0].appendTo(cell);
        windArray[1].appendTo(cell);
        cell.appendTo(weather_row);

        cell = $('<td>');
        cell.html(weatherObj.humidity + "%");
        cell.appendTo(weather_row);

        $(weather_row).appendTo(weather_table);
      }
      $(weather_table).prependTo("#weather_forecast");

      $('[data-toggle="tooltip"]').tooltip(); // enable tooltips by hovering over wind direction icon.

      /* Needs to be after weather_table added to weather_forecast*/
      $("th#HighLowColumn").click(function() {
        //console.log("HL clicked");
        convertTemperatures();
      });

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


  function convertTemperatures() {

    var currentUnit = $("#HighLowColumn").text().substr(-2,1); //High/Low Column reads "High/Low [F\C]&deg;";

    var convertFunction;
    if (currentUnit == 'F') {
      convertFunction = convertToC;
      $("#HighLowColumn").html($("#HighLowColumn").text().slice(0,-2) + "C&deg;");
    } else if (currentUnit == 'C') {
      convertFunction = convertToF;
      $("#HighLowColumn").html($("#HighLowColumn").text().slice(0,-2) + "F&deg;");
    } else {
      console.log("ERROR: Expected F or C but got " + currentUnit);
    }

    $(".highLows .high").each(function() {
      $(this).text(convertFunction($(this).text()));
    });
    $(".highLows .low").each(function() {
      $(this).text(convertFunction($(this).text()));
    });

    function convertToF(celsius) {
      return Math.round((celsius * 1.8 + 32)*100) /100;
    }
    function convertToC(fahrenheit) {
      return Math.round(((fahrenheit - 32) / 1.8)*100)/100;
    }
  }


});
