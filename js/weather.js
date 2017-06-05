$(document).ready(function () {

  /*************************************************************************************************************/
    
  const DAY_NAMES   = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];



  /*************************************************************************************************************/

  function getWindStats(direction, speed) {
    var cardinalDirectionIcon = $('<i>');
    cardinalDirectionIcon.addClass("wi");
    cardinalDirectionIcon.addClass("wi-wind");
    cardinalDirectionIcon.addClass("wi-towards-" + direction.toLowerCase());
    cardinalDirectionIcon.attr('data-toggle', 'tooltip');
    cardinalDirectionIcon.attr('title', direction);

    var spanIcon = $('<span>');
    spanIcon.addClass("wind-icon");
    cardinalDirectionIcon.prependTo(spanIcon);

    var spanStats = $('<span>');
    spanStats.addClass("wind-stats");
    spanStats.text(speed + " MPH");

    return [spanIcon, spanStats];
  }

  function getDayName(date) {
    //console.log("Calling getDayName");
    //console.log("Date: " + date);

    /* Check if today. */
    var todaysDate = new Date();
    //console.log("Todays Date: " + todaysDate);
    //var utc = todaysDate.getTime() + (todaysDate.getTimezoneOffset() * 60000);
    todaysDate = new Date(todaysDate.getTime()+todaysDate.getTimezoneOffset()*60*1000);
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
    return DAY_NAMES[date.getDay()];
  }

  /* Put padded 0s in formatted time. */
  function pad(n) {
    return (n < 10) ? ("0" + n) : n;
  }

  function convertUTCDateToLocalDate(date) {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    //console.log(date.getTime());
    //console.log(date.getTimezoneOffset());
    var newDate = new Date(date.getTime());
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
    header = $("<th id=\"high-low-col\">");
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

  const displayCurrentLocation = (location) => {
    $("#ws-location").text(`${location.name}, ${location.region} `);
  }

  /* Displays most recent update time to weather */
  const displayTime = (epochtime) => {
      let date = new Date(epochtime*1000); // javascript uses milliseconds, UNIX timestamps in seconds
      let timeString;
      if (date.getHours() < 12) timeString = pad(date.getHours()) + ":" + pad(date.getMinutes()) + " AM";
      else                      timeString = pad(date.getHours()-12) + ":" + pad(date.getMinutes()) + " PM";
      $("#ws-datetime").text(DAY_NAMES[date.getDay()] + " " + timeString);
  }

  const displayCurrentWeatherDescription = (weatherDesc) => {
    $("#wsd").text(weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1));
  }

  /* Converts apixu's weather icon code */
  const convertWeatherCode = (code) => {

    switch (code) {
      case 1273: // Patchy light rain in area with thunder
        return 200; // thunderstorm with light rain
      case 1276: // Moderate or heavy rain in area with thunder
        return 201; // thunderstorm with rain
      case 1087: // Thundery outbreaks in nearby
        return 221; // ragged thunderstorm
      case 1279: // Patchy light snow in area with thunder
        return 230; // thunderstorm with light drizzle
      case 1282: // Moderate or heavy snow in area with thunder
        return 232; // thunderstorm with heavy drizzle

      case 1150: // Patchy light drizzle
        return 300; // light intensity drizzle
      case 1153: // Light drizzle
        return 301; // drizzle
      case 1168: // Freezing drizzle
      case 1171: // Heavy freezing drizzle
        return 302; // heavy intensity drizzle

      case 1180: // Patchy light rain
      case 1183: // Light rain
        return 500; // light rain
      case 1186: // Moderate rain at times
      case 1189: // Moderate rain
        return 501; // moderate rain
      case 1192: // Heavy rain at times
      case 1195: // Heavy rain
        return 502; // heavy rain
      case 1072: // Patchy freezing drizzle nearby
      case 1198: // Light freezing rain
      case 1201: // Moderate or heavy freezing rain
        return 511; // freezing rain
      case 1063: // Patchy rain nearby
      case 1240: // Light rain shower
        return 520; // light intensity shower rain
      case 1243: // Moderate or heavy rain shower
        return 522; // heavy intensity shower rain


      case 1066: // Patchy snow nearby
      case 1210: // Light snow
      case 1213: // Patchy light snow
        return 600; //light snow
      case 1216: // Patchy moderate snow
      case 1219: // Moderate snow
        return 601; // snow
      case 1114: // Blowing snow
      case 1117: // Blizzard
      case 1222: // Patchy heavy snow
      case 1225: // Heavy snow
        return 602; // heavy snow
      case 1069: // Patchy sleet nearby
      case 1204: // Light sleet
      case 1207: // Moderate or heavy sleet
        return 611; // sleet
      case 1249: // Light sleet showers
      case 1252: // Moderate or heavy sleet showers
        return 612; // shower sleet
      case 1255: // Light snow showers
        return 620; // light shower snow
      case 1258: // Moderate or heavy snow showers
        return 621; // shower snow

      case 1030: // Mist
        return 701; //mist
      case 1135: // Fog
      case 1147: // Freezing fog
        return 741; // fog

      case 1000: // Sunny (Clear)
        return 800; // clear
      case 1003: // Partly Cloudy
        return 801; // few clouds clouds
      case 1006: // Cloudy
      case 1009: // Overcast
        return 804; // overcast clouds

      case 1246: // Torrential rain shower
        return 901; // tropical storm
      case 1237: // Ice pellets
      case 1261: // Light showers of ice pellets
      case 1264: // Moderate or heavy showers of ice pellets
        return 906; // hail
      default:
        console.log("Code " + code);
    }
  }

  const displayCurrentWeatherIcon = (code) => {
    let wsIcon =  $('<i>');
    wsIcon.attr('id', 'ws-icon');
    wsIcon.addClass('wi');
    wsIcon.addClass("wi-owm-" + convertWeatherCode(code)); //TODO need to convert
    wsIcon.appendTo("#ws-details");
  }

  const displayHumidity = (humidity, detailsTable) => {

    let row = $('<tr>');
    let cell = $('<td>');
    cell.text('Humidity');
    cell.appendTo(row);
    cell = $('<td>');
    cell.attr('id', 'ws-humidity');
    cell.text(humidity + "%");
    cell.appendTo(row);
    row.appendTo(detailsTable);
  }

  const displayWindStats = (windDir, windSpeed, detailsTable) => {
    let windArray = getWindStats(windDir, windSpeed);

    row = $('<tr>');
    cell = $('<td>');
    cell.text('Wind');
    cell.appendTo(row);
    cell = $('<td>');
    var span = $('<span>');
    span.attr('id', 'ws-wind-icon');
    windArray[0].appendTo(span);

    span.appendTo(cell);
    span = $('<span>');
    span.attr('id', 'ws-wind-stats');
    span.appendTo(cell);
    cell.appendTo(row);
    row.appendTo(detailsTable);
    windArray[1].appendTo(span);
  }

  const displaySunriseAndSunset = (detailsTable) => {
      row = $('<tr>');
      cell = $('<td>');
      let sunIcon = $('<i>');
      sunIcon.addClass('wi');
      sunIcon.addClass('wi-sunrise');
      sunIcon.attr('data-toggle', 'tooltip');
      sunIcon.attr('data-original-title', 'Sunrise');
      let sunTime = $('<span>');
      sunTime.attr('id','ws-sunrise-time');

      sunIcon.appendTo(cell);
      sunTime.appendTo(cell);
      cell.appendTo(row);

      cell = $('<td>');
      sunIcon = $('<i>');
      sunIcon.addClass('wi');
      sunIcon.addClass('wi-sunset');
      sunIcon.attr('data-toggle', 'tooltip');
      sunIcon.attr('data-original-title', 'Sunset');

      sunTime = $('<span>');
      sunTime.attr('id','ws-sunset-time');

      sunIcon.appendTo(cell);
      sunTime.appendTo(cell);
      cell.appendTo(row);
      row.appendTo(detailsTable);
  }

  const createTemperatureToggle = () => {
    let outerDiv = $('<div>');

    let tempInF = $('<div>');
    tempInF.attr('id', 'ws-temp-f');
    tempInF.appendTo(outerDiv);

    let tempInC = $('<div>');
    tempInC.attr('id', 'ws-temp-c');
    tempInC.appendTo(outerDiv);

    let currentUnit = $('<div>');
    currentUnit.attr('id', 'ws-temp-unit');

    let fToggle = $('<span>');
    fToggle.attr('id','ws-temp-f-toggle');
    fToggle.html('&deg;F');

    let cToggle = $('<span>');
    cToggle.attr('id','ws-temp-c-toggle');
    cToggle.html('&deg;C');

    currentUnit.html('&nbsp;&nbsp;|&nbsp;&nbsp;');

    fToggle.prependTo(currentUnit);
    cToggle.appendTo(currentUnit);

    currentUnit.appendTo(outerDiv);
    outerDiv.appendTo("#ws-details");
  }

  //NEED a way to get current temperature
  function getCurrentWeather(lat, lon) {
    let apiCall = `https://api.apixu.com/v1/current.json?key=6dd018b75b9c4b698c2233231170406&q=${lat},${lon}`;

    $.getJSON(apiCall, function(data) {

      //console.log("Current weather");
      //console.log(data);

      /* Need to deal with this situation when API not responsive.
        Don't display humidity, wind, sunrise, sunset, F\C. Just say api not responsive, or something.
      */

      // Error format: {"error":{"code":1005,"message":"API URL is invalid."}}
      if (data.hasOwnProperty("error")) {
        console.log(`Error: ${data.error.code}: ${data.error.message}`);
        $("#ws-details").html(`<div><strong>Current weather data unavailable for location: ${data.error.code}: ${data.error.message} </strong></div>`);
        return;
      }
      displayCurrentLocation(data.location); // City, Region
      displayTime(data.location.localtime_epoch); // Day of week, Time
      displayCurrentWeatherDescription(data.current.condition.text); // Text description of weather
      displayCurrentWeatherIcon(data.current.condition.code); // Display weather icon
      createTemperatureToggle(); // Create C | F section to toggle weather measurement.

      var detailsDiv = $('<div>');
      detailsDiv.attr('id', 'ws-misc-details');
      var detailsTable = $('<table>');

      displayHumidity(data.current.humidity, detailsTable);
      displayWindStats(data.current.wind_dir, data.current.wind_mph, detailsTable);
      displaySunriseAndSunset(detailsTable);

      detailsTable.appendTo(detailsDiv);
      detailsDiv.appendTo("#ws-details");

      $("#ws-temp-f").text(Math.round(data.current.temp_f));
      $("#ws-temp-c").text(Math.round(data.current.temp_c));

      $("#ws-temp-f-toggle").click(function() {
        console.log("F click");
        $("#ws-temp-c").css('display','none');
        $("#ws-temp-f").css('display','inline');
        $("#ws-temp-f-toggle").css('font-weight', 'bold');
        $("#ws-temp-c-toggle").css('font-weight', 'normal');
      });
      $("#ws-temp-c-toggle").click(function() {
        $("#ws-temp-c").css('display','inline');
        $("#ws-temp-f").css('display','none');
        $("#ws-temp-f-toggle").css('font-weight', 'normal');
        $("#ws-temp-c-toggle").css('font-weight', 'bold');
      });

    });
  }

  const createDateCol = (date) => {
    let dateCol = $("<td>");
    date = new Date(date);
    stringDate = convertUTCDateToLocalDate(date);
    dayName = getDayName(date);
    dateCol.html("<p class=\"dayName\">" + dayName + "</p><p>" + stringDate + "</p>");
    return dateCol;
  }

  const createHighLowCol = (dayData) => {
    let hlCol = $("<td>");
    hlCol.addClass("high-lows");
    hlCol.html("<span class=\"hlf\"><span class=\"high\">" + Math.round(dayData.maxtemp_f) + "</span><span class=\"slash\"></span><span class=\"low\">" + Math.round(dayData.mintemp_f) + "</span></span>");
    hlCol.append("<span class=\"hlc\"><span class=\"high\">" + Math.round(dayData.maxtemp_c) + "</span><span class=\"slash\"></span><span class=\"low\">" + Math.round(dayData.mintemp_c) + "</span></span>");
    return hlCol;
  }

  const createDescriptionCol = (conditionData) => {
    let descCol = $("<td>");
    let weather_icon = $("<i>");
    weather_icon.addClass("wi");
    weather_icon.addClass("wi-owm-"+convertWeatherCode(conditionData.code));
    weather_icon.appendTo(descCol);

    let weather_desc = $("<span>");
    weather_desc.html(conditionData.text);
    weather_desc.appendTo(descCol);
    return descCol;
  }

  const createWindCol = (hourData) => {
    let windCol = $("<td>");
    let windArray = getWindStats(hourData.wind_dir, hourData.wind_mph); //change it to same time of day?
    windArray[0].appendTo(windCol);
    windArray[1].appendTo(windCol);
    return windCol;
  }

  const createHumidityCol = (humidity) => {
    let humidityCell = $('<td>');
    humidityCell.html(humidity + "%");
    return humidityCell;
  }

  const createWeatherRow = (forecastData) => {
    console.log(forecastData.day.condition);
    let weatherRow = $("<tr>");
    $(createDateCol(forecastData.date)).appendTo(weatherRow);
    $(createHighLowCol(forecastData.day)).appendTo(weatherRow);
    $(createDescriptionCol(forecastData.day.condition)).appendTo(weatherRow);
    $(createWindCol(forecastData.hour[12])).appendTo(weatherRow);
    $(createHumidityCol(forecastData.day.avghumidity)).appendTo(weatherRow);
    return weatherRow;

  }

  function getForecast(lat, lon) {

    let apiCall = `https://api.apixu.com/v1/forecast.json?key=6dd018b75b9c4b698c2233231170406&q=${lat},${lon}&days=10`;
    //console.log(apiCall);
    $.getJSON(apiCall, function(data) {

      //console.log("Data");
      //console.log(data);

      // in main panel, getting sunrise and sunset from forecast (not in other api call).
      $("#ws-sunrise-time").text(data.forecast.forecastday[0].astro.sunrise);
      $("#ws-sunset-time").text(data.forecast.forecastday[0].astro.sunset);

      var weather_table = $('<table class="weather-table">');

      $(createTableHeader()).appendTo(weather_table);

      data.forecast.forecastday.map((forecastData) => {
        $(createWeatherRow(forecastData)).appendTo(weather_table);;
      })

      $(weather_table).prependTo("#weather-forecast");

      $('[data-toggle="tooltip"]').tooltip(); // enable tooltips by hovering over wind direction icon.

      /* Needs to be after weather_table added to weather_forecast*/
      $("th#high-low-col").click(function() {
        var currentUnit = $("#high-low-col").text().substr(-2,1); //High/Low Column reads "High/Low [F\C]&deg;";
        if (currentUnit == 'F') {
          $(".hlc").css('display','inline');
          $(".hlf").css('display','none');
          $("#high-low-col").html($("#high-low-col").text().slice(0,-2) + "C&deg;");
        } else if (currentUnit == 'C') {
          $(".hlc").css('display','none');
          $(".hlf").css('display','inline');
          $("#high-low-col").html($("#high-low-col").text().slice(0,-2) + "F&deg;");
        } else {
          console.log("ERROR: Expected F or C but got " + currentUnit);
        }
      });

    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.log("Error: " + errorThrown);
      console.log("TextStatus: " + textStatus);
    });
  }


  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      getCurrentWeather(position.coords.latitude, position.coords.longitude);
      getForecast(position.coords.latitude, position.coords.longitude);
    });
  } else {
    console.log("Geolocation not available");
  }

});
