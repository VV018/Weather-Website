/*
Name: Vimal Vinod
Course: CSE383
Section: A
Professor: Kurt Johnson
Assignment: Final Project
*/

// For storing latitude and longitude
var lat = "";
var lon = "";

// For storing Map Json
var mapJsonStr = {};
// For storing Weather Json
var weatherJsonStr = {};
// For user input 
var search = "";
// Day of week
var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// For a message if user enters bad info in history page
var divMsg = "";

// Gets the coordinates for that location user entered
function getcoords(location) {
	// Gets user input
	search = location;
	// replaces the whitespaces with "+" signs for a proper URL
	search = search.replace(/\s/g, '+');
	// Logs the user input
	console.log(search);
	// URL testing and logging
	var urlTest = 'https://api.tomtom.com/search/2/search/' + search + '.json?minFuzzyLevel=1&maxFuzzyLevel=2&limit=1&view=Unified&key=EUWThAThOw5iZeye6Cb9KiVUXMmuAJtR';
	console.log(urlTest);
	a=$.ajax({
		// URL for the call with the added parameters
        	url: 'https://api.tomtom.com/search/2/search/' + search + '.json?minFuzzyLevel=1&maxFuzzyLevel=2&limit=1&view=Unified&key=EUWThAThOw5iZeye6Cb9KiVUXMmuAJtR',
		// This is a getter method
                method: "GET"
        }).done(function(data) {
		// Logs the data.result
		mapJsonStr = JSON.stringify(data.results);
		console.log("Map Data: " + JSON.stringify(data));
		// Gets and sets the latitude and longitude to a variable
		lat = data.results[0].position.lat;
		lon = data.results[0].position.lon;
		console.log("Latitude: " + lat + ", Longitude: " + lon);
		forecast();
	}).fail(function(error) {
		// Displaying errors to console if there was a fail
         	console.log('Error - ' + error);
	});
}

// Gets the 5 day forecast for the location the user entered
function forecast() {
	console.log('https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=06112fb3ca37c0cc29e8369fd43b6701');
	a=$.ajax({
                // URL for the call with the added parameters
                url: 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=06112fb3ca37c0cc29e8369fd43b6701',
                // This is a getter method,
                method: "GET"
        }).done(function(data) {
                // Logs the data.list
                weatherJsonStr = JSON.stringify(data.list);
		console.log(weatherJsonStr);
		console.log("Weather Data: " + JSON.stringify(data));
		// Gets the image for forecast of that day 
		for (let i = 0; i < 40; i += 8) {
			$("#day" + i  + "img").attr('src', 'http://openweathermap.org/img/wn/' + data.list[i].weather[0].icon + '@4x.png');
	                // Gets the date for that day
	                $("#date" + i).html(new Date(data.list[i].dt_txt.split(" ")[0] + "T12:00:00").toLocaleDateString('en-US'));
	                // Gets the day from that date
                	$("#day" + i).html(daysOfWeek[(new Date(data.list[i].dt * 1000)).getDay()]);
                	// Gets the high for that day and fills it in
                	$("#high" + i).html(data.list[i].main.temp_max);
                	// Gets the low for that day and fills it in
                	$("#low" + i).html(data.list[i].main.temp_min);
                	// Gets the description of the weather that day
                	$("#forecastDes" + i).html(data.list[i].weather[0].description);
                	// Gets the visibility for that day
                	$("#vsblty" + i).html(data.list[i].visibility * 0.00062137);
                	// Gets the humidity for that day
                	$("#humdty" + i).html(data.list[i].main.humidity);
		}
		passData();
        }).fail(function(error) {
                // Displaying errors to console if there was a fail
                console.log('Error - ' + error);
        });
}

// Passes data into the php database
function passData() {
	$.ajax({
		// This is a POST because of how large it is
 		method: 'POST',
		// URL
    		url: 'http://localhost:8080/final.php?method=setWeather',
    		data: {
			// The data to add to the URL
			location: search,
                        mapJson: mapJsonStr,
                        weatherJson: weatherJsonStr
		},
		// Datatype is json
    		dataType: 'json',
	}).done(function(data) {
		// To check the JSON data 
     		console.log("Success: " + JSON.stringify(data));
    	}).fail(function(xhr, status, errorMessage) {
                // Displaying errors to console if there was a fail
                console.log(errorMessage);
	});
}

// Displays weather data when clicked
function weatherTables(weatherData, index) {
	console.log("Testing: " + JSON.stringify(weatherData.result));
	console.log(index);
	// Remove old info
	$("#wthrHist tbody tr").remove();
	for (let i = 0; i < 40; i += 8) {
		let tbl = document.getElementById("wthrHist").getElementsByTagName('tbody')[0];
		let row = tbl.insertRow();
		let cell  = row.insertCell();
                let img = document.createElement("img");
		let weatherDat = {};
		weatherDat = JSON.parse(weatherData.result[index].WeatherJson)[i];
		console.log(weatherDat);
                img.setAttribute("src", 'http://openweathermap.org/img/wn/' + weatherDat.weather[0].icon + '@4x.png' );
                let dateH = document.createElement("div");
                dateH.innerHTML += "Date: " + new Date(weatherDat.dt_txt.split(" ")[0] +  "T12:00:00").toLocaleDateString('en-US');
                let dayH = document.createElement("div");
		console.log((new Date(weatherDat.dt * 1000)).toLocaleString("en-us", {weekday: "long"}));
                dayH.innerHTML += "Day: " + (new Date(weatherDat.dt * 1000)).toLocaleString("en-us", {weekday: "long"});
                let highH = document.createElement("div");
                highH.innerHTML += "High (F): " + weatherDat.main.temp_max;   
                let lowH = document.createElement("div");
                lowH.innerHTML += "Low (F): " +  (weatherDat.main.temp_min);
                let forecastH = document.createElement("div"); 
                forecastH.innerHTML += "Description: " + (weatherDat.weather[0].description);
                let vis = document.createElement("div");
                vis.innerHTML += "Visibility (mi): " + (weatherDat.visibility * 0.00062137);
                let hum = document.createElement("div");
                hum.innerHTML += "Humidity (%): " + (weatherDat.main.humidity);
        	cell.append(img, dateH, dayH, highH, lowH, forecastH, vis, hum);
	}
}

// For the history page to display old data
function getLookup(date, numLines) {
	// Remove old data
	$("#wthrHist tbody tr").remove();
	$("#histTable tbody tr").remove();	
	$.ajax({
		// This is a POST method
                method: 'POST',
		// URL
                url: 'http://localhost:8080/final.php?method=getWeather',
		data: {
			date: date
		},
		dataType: 'json',
        }).done(function(data) {
		// On success, do this
		console.log(JSON.stringify(data.result));
		// If bad input on date or number of lines, do this
		if (data.result.length < numLines) {
			let msg = document.getElementById("lookBox");
                        divMsg = document.createElement("div");
                        divMsg.innerHTML += "Enter fewer lines or check the date input!";
                        msg.append(divMsg);
			msg.append(document.createElement("br"));
		} else {
			$(document).ready(function() {
				// Creating table dynamically
				for (i = 0; i < numLines; i++) {
					// Table columns
	 	 			var td1, td2, td3, td4, td5 = document.createElement('td');
					// Table body
					var tableBody = document.getElementById("histTable").getElementsByTagName('tbody')[0];
					// Add a button to table
					var button = document.createElement("button");
					// Make the button this class
					button.className = "btn btn-outline-danger";
					// Give it a value
					button.value = i;
					// Give button an ID
					button.setAttribute("id", "bttn" + i);
					console.log(button.getAttribute("id"));
					// Adding cells to a row
					var newRow = tableBody.insertRow();
					var buttonCell = newRow.insertCell();
					var dateCell = newRow.insertCell();
					var timeCell = newRow.insertCell();
					var searchCell = newRow.insertCell();
					var latLonCell = newRow.insertCell();
					// Adding values to cells
					buttonCell.appendChild(button);
					var textDate = document.createTextNode(new Date(data.result[i].DateTime.split(" ")[0] + "T12:00:00").toLocaleDateString('en-US'));
					dateCell.appendChild(textDate);
					var textTime = document.createTextNode(data.result[i].DateTime.split(" ")[1]);
					timeCell.appendChild(textTime);
					var textSearch = document.createTextNode(data.result[i].Location.replace(/\+/g,' '));
					searchCell.appendChild(textSearch);
					var textLatLon = document.createTextNode(JSON.parse(data.result[i].MapJson)[0].position.lat + ", " + JSON.parse(data.result[i].MapJson)[0].position.lon);
					latLonCell.appendChild(textLatLon);
					$("body").on("click", "#bttn" + i, function() { 
                                	        let ind = this.value;
                                        	weatherTables(data, ind);					
                    			})	
				}
			})
		}
        }).fail(function(xhr, status, errorMessage) {
                // Displaying errors to console if there was a fail
                console.log(errorMessage);
        });
}
