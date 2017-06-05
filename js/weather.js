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
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
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

  const displayCurrentLocation = (location) => {
    $("#ws_location").text(`${location.name}, ${location.region} `);
  }

  /* Displays most recent update time to weather */
  const displayTime = (epochtime) => {
      let date = new Date(epochtime*1000); // javascript uses milliseconds, UNIX timestamps in seconds
      let timeString;
      if (date.getHours() < 12) timeString = pad(date.getHours()) + ":" + pad(date.getMinutes()) + " AM";
      else                      timeString = pad(date.getHours()-12) + ":" + pad(date.getMinutes()) + " PM";
      $("#ws_datetime").text(DAY_NAMES[date.getDay()] + " " + timeString);
  }

  const displayCurrentWeatherDescription = (weatherDesc) => {
    $("#wsd").text(weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1));
  }

  const displayCurrentWeatherIcon = (code) => {
    let wsIcon =  $('<i>');
    wsIcon.attr('id', 'ws_icon');
    wsIcon.addClass('wi');
    wsIcon.addClass("wi-owm-" + code); //TODO need to convert
    wsIcon.appendTo("#ws_details");
  }

  const displayHumidity = (humidity, detailsTable) => {

    let row = $('<tr>');
    let cell = $('<td>');
    cell.text('Humidity');
    cell.appendTo(row);
    cell = $('<td>');
    cell.attr('id', 'ws_humidity');
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
    span.attr('id', 'ws_wind_icon');
    windArray[0].appendTo(span);

    span.appendTo(cell);
    span = $('<span>');
    span.attr('id', 'ws_wind_stats');
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
      sunTime.attr('id','ws_sunrise_time');

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
      sunTime.attr('id','ws_sunset_time');

      sunIcon.appendTo(cell);
      sunTime.appendTo(cell);
      cell.appendTo(row);
      row.appendTo(detailsTable);
  }

  const createTemperatureToggle = () => {
    let outerDiv = $('<div>');

    let tempInF = $('<div>');
    tempInF.attr('id', 'ws_temp_f');
    tempInF.appendTo(outerDiv);

    let tempInC = $('<div>');
    tempInC.attr('id', 'ws_temp_c');
    tempInC.appendTo(outerDiv);

    let currentUnit = $('<div>');
    currentUnit.attr('id', 'ws_temp_unit');

    let fToggle = $('<span>');
    fToggle.attr('id','ws_temp_f_toggle');
    fToggle.html('&deg;F');

    let cToggle = $('<span>');
    cToggle.attr('id','ws_temp_c_toggle');
    cToggle.html('&deg;C');

    currentUnit.html('&nbsp;&nbsp;|&nbsp;&nbsp;');

    fToggle.prependTo(currentUnit);
    cToggle.appendTo(currentUnit);

    currentUnit.appendTo(outerDiv);
    outerDiv.appendTo("#ws_details");
  }

  //NEED a way to get current temperature
  function getCurrentWeather(lat, lon) {
    let apiCall = `https://api.apixu.com/v1/current.json?key=6dd018b75b9c4b698c2233231170406&q=${lat},${lon}`;

    $.getJSON(apiCall, function(data) {

      console.log("Current weather");
      console.log(data);

      /* Need to deal with this situation when API not responsive.
        Don't display humidity, wind, sunrise, sunset, F\C. Just say api not responsive, or something.
      */

      // Error format: {"error":{"code":1005,"message":"API URL is invalid."}}
      if (data.hasOwnProperty("error")) {
        console.log(`Error: ${data.error.code}: ${data.error.message}`);
        $("#ws_details").html(`<div><strong>Current weather data unavailable for location: ${data.error.code}: ${data.error.message} </strong></div>`);
        return;
      }
      displayCurrentLocation(data.location); // City, Region
      displayTime(data.location.localtime_epoch); // Day of week, Time
      displayCurrentWeatherDescription(data.current.condition.text); // Text description of weather
      displayCurrentWeatherIcon(data.current.condition.code); // Display weather icon
      createTemperatureToggle(); // Create C | F section to toggle weather measurement.

      var detailsDiv = $('<div>');
      detailsDiv.attr('id', 'ws_misc_details');
      var detailsTable = $('<table>');

      displayHumidity(data.current.humidity, detailsTable);
      displayWindStats(data.current.wind_dir, data.current.wind_mph, detailsTable);
      displaySunriseAndSunset(detailsTable);

      detailsTable.appendTo(detailsDiv);
      detailsDiv.appendTo("#ws_details");

      $("#ws_temp_f").text(Math.round(data.current.temp_f));
      $("#ws_temp_c").text(Math.round(data.current.temp_c));

      $("#ws_temp_f_toggle").click(function() {
        console.log("F click");
        $("#ws_temp_c").css('display','none');
        $("#ws_temp_f").css('display','inline');
        $("#ws_temp_f_toggle").css('font-weight', 'bold');
        $("#ws_temp_c_toggle").css('font-weight', 'normal');
      });
      $("#ws_temp_c_toggle").click(function() {
        console.log("C click");
        $("#ws_temp_c").css('display','inline');
        $("#ws_temp_f").css('display','none');
        $("#ws_temp_f_toggle").css('font-weight', 'normal');
        $("#ws_temp_c_toggle").css('font-weight', 'bold');
      });

    });
  }

  function getForecast(lat, lon) {

    let apiCall = `https://api.apixu.com/v1/forecast.json?key=6dd018b75b9c4b698c2233231170406&q=${lat},${lon}&days=10`;
    console.log(apiCall);
    $.getJSON(apiCall, function(data) {

      console.log("Data");
      console.log(data);

      // in main panel
      $("#ws_sunrise_time").text(data.forecast.forecastday[0].astro.sunrise);
      $("#ws_sunset_time").text(data.forecast.forecastday[0].astro.sunset);

      var weather_table = $('<table class="weather_table">');

      $(createTableHeader()).appendTo(weather_table);


      var weatherObj, date, stringDate, dayName, wind_cardinal_direction;
      var weather_row, cell, weather_icon, weather_desc;
      for (var i = 0; i < 10; i++) {
        weatherObj = data.forecast.forecastday[i];

        weather_row = $('<tr>');
        cell = $('<td>');

        console.log(weatherObj);
        date = new Date(weatherObj.date);
        //date = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

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
        cell.html("<span class=\"hlf\"><span class=\"high\">" + Math.round(weatherObj.day.maxtemp_f) + "</span><span class=\"slash\"></span><span class=\"low\">" + Math.round(weatherObj.day.mintemp_f) + "</span></span>");
        cell.append("<span class=\"hlc\"><span class=\"high\">" + Math.round(weatherObj.day.maxtemp_c) + "</span><span class=\"slash\"></span><span class=\"low\">" + Math.round(weatherObj.day.mintemp_c) + "</span></span>");


        cell.appendTo(weather_row);

        cell = $('<td>');
        weather_icon = $('<i>');
        weather_icon.addClass("wi");
        weather_icon.addClass("wi-owm-"+weatherObj.day.condition.code);
        weather_icon.appendTo(cell);

        weather_desc = $('<span>');
        weather_desc.html(weatherObj.day.condition.text);
        weather_desc.appendTo(cell);
        cell.appendTo(weather_row);

        cell = $('<td>');
        var windArray = getWindStats(weatherObj.hour[12].wind_dir, weatherObj.hour[12].wind_mph); //change it to same time of day?
        windArray[0].appendTo(cell);
        windArray[1].appendTo(cell);
        cell.appendTo(weather_row);

        cell = $('<td>');
        cell.html(weatherObj.day.avghumidity + "%");
        cell.appendTo(weather_row);

        $(weather_row).appendTo(weather_table);
      }
      $(weather_table).prependTo("#weather_forecast");

      $('[data-toggle="tooltip"]').tooltip(); // enable tooltips by hovering over wind direction icon.

      /* Needs to be after weather_table added to weather_forecast*/
      $("th#HighLowColumn").click(function() {
        var currentUnit = $("#HighLowColumn").text().substr(-2,1); //High/Low Column reads "High/Low [F\C]&deg;";
        if (currentUnit == 'F') {
          $(".hlc").css('display','inline');
          $(".hlf").css('display','none');
          $("#HighLowColumn").html($("#HighLowColumn").text().slice(0,-2) + "C&deg;");
        } else if (currentUnit == 'C') {
          $(".hlc").css('display','none');
          $(".hlf").css('display','inline');
          $("#HighLowColumn").html($("#HighLowColumn").text().slice(0,-2) + "F&deg;");
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
