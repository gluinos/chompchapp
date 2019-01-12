var counter = 0;
var countMax = 6;
var index = 0;
var pause = false;
var len = words.length; // array stored in words.js

var data = { "words": [] }

function APICall(data) {
    var mainDiv = $("#main");
    var resultDiv = $("#result");
    console.log("passing "+String($("#data").val())+" as 'data'");
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
    $.getJSON(statusURL, function(data) {
        console.log("Update call");
        console.log(data);
        if (data.state === "SUCCESS" && data.hasOwnProperty("result")) {
            console.log("success!");
            resultDiv.append(`<p>${JSON.stringify(data.result)}</p>`);
        }
        else if (data.state === "FAILURE") {
            console.log("failure!");
        }
        else {
            console.log(data);
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
            $("#word").text(words[index]).removeClass("text-success");
        }

        if (counter >= countMax) {
            console.log(data);
            $('#result-modal').modal("show");
            break;
        }

        index = (index + 1) % len;

        await Sleep(500 - 375*(counter/countMax));
    }

    callback(data);
};


$(function() {
    // Initialize Result Modal
    $("#result-modal").modal({ show: false });
    // Handle keyup
    $(document).on("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 32 && counter !== countMax) {
            counter++;
            pause = false;
            $("#progress").attr("style", `width: ${Math.round(100*counter/countMax)}%`);
            data.words.push($("#word").text());
        }
    });
    // Handle keydown
    $(document).on("keydown", function(event) {
        event.preventDefault();
        if (event.keyCode === 32 && counter !== countMax) {
            pause = true;
            $("#word").addClass("text-success");
        }
    });
    // Start loop
    WordLoop(APICall);
});
