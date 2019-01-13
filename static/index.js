var counter;
var countMax;
var index;
var pause;
var len;

var data;
var coords;
var userCoords;

function InitMap() {
    var localCoords = coords || { lat: 34.412, lng: -119.86 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: localCoords.lat, lng: localCoords.lng },
        zoom: 15
    });
    var marker = new google.maps.Marker({ position: { lat: localCoords.lat, lng: localCoords.lng }, map: map });
}

function APICall(data) {
    var mainDiv = $("#main");
    var resultDiv = $("#result");
    $.ajax({
        type: 'POST',
        url: '/query',
        data: JSON.stringify(data),
        contentType: 'application/json;charset=UTF-8',
        success: function(data, status, request) {
            statusURL = request.getResponseHeader('Location');
            Update(statusURL, mainDiv, resultDiv);
        },
        error: function() {
            alert('Unexpected error');
        }
    });
}

function Update(statusURL, mainDiv, resultDiv) {
    $.getJSON(statusURL, function(response) {
        if (response.state === "SUCCESS" && response.hasOwnProperty("result")) {
            coords = response.result.coords;
            console.log("success!");
            resultDiv.html(`<p>You should try ${response.result.name}!</p>`);
            InitMap();
        }
        else if (response.state === "FAILURE") {
            console.log("failure!");
        }
        else {
            setTimeout(function() {
                Update(statusURL, mainDiv, resultDiv);
            }, 250);
        }
    });
}

function Sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function WordLoop(callback) {
    while(1) {
        if (!pause) {
            $("#word").text(words[index]).removeClass("text-info");
            // $("#image").attr("src", "data:image/jpeg;base64,"+images[index]);
        }

        if (counter >= countMax) {
            $('#result-modal').modal("show");
            break;
        }

        index = (index + 1) % len;

        await Sleep(500 - 375*(counter/countMax));
    }

    callback(data);
};

function Reset() {
    $("#progress").attr("style", "width: 0%");
    counter = 0;
    countMax = 6;
    index = 0;
    pause = false;
    // len = images.length; // array stored in images.js
    len = words.length; // array stored in words.js


    data = { "words": [], "coords": userCoords };
    coords = { lat: 34.412, lng: -119.86 };

    WordLoop(APICall);
}

$(function() {
    navigator.geolocation.getCurrentPosition(
        // Success callback
        function(position) {
            userCoords = { lat: position.coords["latitude"], lng: position.coords["longitude"] };
            data.coords = userCoords;
        }
    );
    // Handle modal hide
    $(document).on("hidden.bs.modal", function(event) { Reset() });
    // Handle keyup
    $(document).on("keyup", function(event) {
        if (event.keyCode === 32 && counter !== countMax) {
            event.preventDefault();
            counter++;
            pause = false;
            $("#progress").attr("style", `width: ${ Math.round(100*counter/countMax) }%`);
            data.words.push($("#word").text());
        }
    });
    // Handle keydown
    $(document).on("keydown", function(event) {
        if (event.keyCode === 32 && counter !== countMax) {
            event.preventDefault();
            pause = true;
            $("#word").addClass("text-info");
        }
    });
    Reset();
});
