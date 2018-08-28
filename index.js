var Twitter = require('twitter');
var request = require('request');
var fs = require('fs');
const svg2png = require('svg2png');

var high;
var low;
var current;
var description;



//Twitter App Information
var client = new Twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
});


//Tracks @ replies to user "@gn"
var stream = client.stream('statuses/filter', {track: '@gn'});
stream.on('data', function(event) {
    console.log(event);


    //Splits Tweet into an array on spaces and checks to see
    //if the indice contains a number that is 5 characters(theoretically the zip code)
    var tweet_array = event.text.split(" ");
    var zip;
    for(var i = 0; i < tweet_array.length; i++){
        if(tweet_array[i].length === 5 && !isNaN(tweet_array[i])){
            zip = tweet_array[i];
        }
    }
    //Response if zip code is undefined
    if(zip === undefined){
        client.post('statuses/update', {status: "@" + event.user.screen_name + " No Zip Code found in your Tweet, please try again.", in_reply_to_status_id:event.id_str} );
        return;
    }

    //Tweets weather information on the valid zip code
    request("https://api.openweathermap.org/data/2.5/weather?zip="+zip+",us&appid=ac556c8cded7b6d854bec724284cae55", function(error, response, data){
        //converts the request response from strings to relevant data types.
        console.log(data)
        data = JSON.parse(data);
        if(error){
            client.post('statuses/update', {status: "@" + event.user.screen_name + " The Zip Code provided cannot be found, please try again.", in_reply_to_status_id:event.id_str} );
            return;
        }

        //Function that converts from kelvin to fahrenheit
        function fahrenheit(temperature){
            var farh = (temperature - 273.15) * 9 / 5 + 32;
            farh = Math.round(farh);
            return farh;
        }

        //Temp calculation variables
        high = fahrenheit(data.main.temp_max);
        low = fahrenheit(data.main.temp_min);
        current = fahrenheit(data.main.temp);
        description = data.weather[0].description;


        var svg = "<?xml version=\"1.0\"?>\n" +
            "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" id=\"Shapes\" viewBox=\"0 0 469 296\">\n" +
            "    <defs>\n" +
            "        <style>\n" +
            "          @import url('https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i,900,900i');\n" +
            "          .cls-1,.cls-11,.cls-2,.cls-5,.cls-6,.cls-7,.cls-9{isolation:isolate;}.cls-2{font-size:16px;}.cls-2,.cls-5,.cls-6{fill:#dbecf9;}.cls-11,.cls-2,.cls-5,.cls-6,.cls-7,.cls-9{font-family:Roboto, Roboto;font-weight:700;}.cls-3{letter-spacing:-0.01em;}.cls-4{letter-spacing:0.02em;}.cls-11,.cls-5{font-size:30px;}.cls-6{font-size:48px;}.cls-7{font-size:14px;fill:#14171a;}.cls-8{letter-spacing:-0.01em;}.cls-9{font-size:18px;}.cls-11,.cls-9{fill:#344055;}.cls-10{letter-spacing:-0.02em;}.cls-12{letter-spacing:-0.03em;}.cls-13{letter-spacing:-0.03em;}</style>\n" +
            "    </defs>\n" +
            "    <title>tweather</title>\n" +
            "    <image id=\"Outer_Rectangles\" data-name=\"Outer Rectangles\" class=\"cls-1\" width=\"469\" height=\"296\" xlink:href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAdUAAAEoCAYAAAAOtWswAAAACXBIWXMAAAsSAAALEgHS3X78AAAF+UlEQVR4Xu3bMW4ndwGG4W//gLkCECqUGwBF4t51IliOgQUFUTgAipLKEpzCEQkl7t2BkKhDlygHgCaLkCl2QbtrL0OUt8vzSNPMfL/61Ugzj+7u7vay88ubs21vPbve2Pa9bWf3hgDw9fCPbZ9u+8u2j7b94fbq4snLo0cvR/X88ubtbe9ve/3lMQCwbftk2zu3Vxe/f/7mf6N6fnnzjW2/2far+2cBgAe8v+3Xt1cX/9q2bz73QFAB4Mv5Tzff2Z69qZ5f3vx02/WrzwAA/8Pj26uLDx+9+fM/nm3727bvH50AAB702bYfnLY9nqACwFfx2rafnfb0txkA4Kt567Ttx0crAODQj07bvnO0AgAOffe07dtHKwDg0NnpaAEA/H9EFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKABFRBYCIqAJARFQBICKqABARVQCIiCoAREQVACKiCgARUQWAiKgCQERUASAiqgAQEVUAiIgqAEREFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKABFRBYCIqAJARFQBICKqABARVQCIiCoAREQVACKiCgARUQWAiKgCQERUASAiqgAQEVUAiIgqAEREFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKABFRBYCIqAJARFQBICKqABARVQCIiCoAREQVACKiCgARUQWAiKgCQERUASAiqgAQEVUAiIgqAEREFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKABFRBYCIqAJARFQBICKqABARVQCIiCoAREQVACKiCgARUQWAiKgCQERUASAiqgAQEVUAiIgqAEREFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKABFRBYCIqAJARFQBICKqABARVQCIiCoAREQVACKiCgARUQWAiKgCQERUASAiqgAQEVUAiIgqAEREFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKABFRBYCIqAJARFQBICKqABARVQCIiCoAREQVACKiCgARUQWAiKgCQERUASAiqgAQEVUAiIgqAEREFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKABFRBYCIqAJARFQBICKqABARVQCIiCoAREQVACKiCgARUQWAiKgCQERUASAiqgAQEVUAiIgqAEREFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKABFRBYCIqAJARFQBICKqABARVQCIiCoAREQVACKiCgARUQWAiKgCQERUASAiqgAQEVUAiIgqAEREFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKABFRBYCIqAJARFQBICKqABARVQCIiCoAREQVACKiCgARUQWAiKgCQERUASAiqgAQEVUAiIgqAEREFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKABFRBYCIqAJARFQBICKqABARVQCIiCoAREQVACKiCgARUQWAiKgCQERUASAiqgAQEVUAiIgqAEREFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKABFRBYCIqAJARFQBICKqABARVQCIiCoAREQVACKiCgARUQWAiKgCQERUASAiqgAQEVUAiIgqAEREFQAiogoAEVEFgIioAkBEVAEgIqoAEBFVAIiIKgBERBUAIqIKAJHTtr8fjQCAQ09O2z4/WgEAhz4/bfvr0QoAOPSn07aPj1YAwKGPT9uut316tAQAXumzbden26uLJ9t+ebQGAF7pF7dXF1+ctu326uJ62wcHBwCA+z541tEX/lN9d9tvH94DAA/43Z72c9v26O7u7oWn55c3P9n23rbXBwA85JNt795eXXz4/M17Ud2288ubs22Pt7297YfbXtv2rXtDAPh6+Oeefoz0520fbbt+9k3SC/4NSqFcWHYSgZIAAAAASUVORK5CYII=\" />\n" +
            "    <image id=\"Middle_Box\" data-name=\"Middle Box\" class=\"cls-1\" width=\"469\" height=\"185\" transform=\"translate(0 61)\" xlink:href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAdUAAAC5CAIAAADxmjI1AAAACXBIWXMAAAsSAAALEgHS3X78AAACk0lEQVR4Xu3UMQHAIADAsDFNCMAE/q0gYdfok9y9O+baDwDXvV8BAL/wX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARr+C9DwX4CG/wI0/Beg4b8ADf8FaPgvQMN/ARoHhOsCO02mIDkAAAAASUVORK5CYII=\" />\n" +
            "    <image id=\"Down_Arrow\" data-name=\"Down Arrow\" class=\"cls-1\" width=\"11\" height=\"23\" transform=\"translate(180 196)\" xlink:href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAXCAYAAADduLXGAAAACXBIWXMAAAsSAAALEgHS3X78AAABCklEQVQ4T+XTrU4DURCG4WfbBgHlR7Bhw94Dt1FLgkf2AgqKKwAEwWGQGAwJgnARKCQSkiUbFkNCSMPfQeyWttumBsmn5su8J2fOzJkohGCgOEn3sIsPzGEfh0WeBWgZ1zJWEFV+qYoDNGrwV81/DkAm4br/npWcqX8HR4YDgTCY3jR4pv4Ev8/yrThJT9HHJVZrcBInaQebiKLVtfVbbCj/wRvaI/ArFpSPvmmgixdlSaOgykd4Rrc53158VNbWMV0BvSLPrqIQgjhJmzjH1hTwrMizbapuFHn2hR7ua/Cdcs38wtWBB+wYbktfef3TBFzpAidVfFzk2fVocmxhizwLcZIeKNt4pKYfZ+xNVlpiShEAAAAASUVORK5CYII=\" />\n" +
            "    <image id=\"Up_Arrow\" data-name=\"Up Arrow\" class=\"cls-1\" width=\"11\" height=\"23\" transform=\"translate(180 146)\" xlink:href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAXCAYAAADduLXGAAAACXBIWXMAAAsSAAALEgHS3X78AAAA9klEQVQ4T+3Tv0rDUBTH8U//oFjaLTEhWVzEVRHEyVVwFlzcdVJwFd9ABF/AR+jg2sndhxAkEIwgrTopxKFa0lSdHfzC5XL4fbkcDucqy1L1BFGyGETJZRAlaT1rm+UER2h83hMaZVlOijBOd9DHPN6xV+RZf0YO4zTCDVYqj91hq8ize2hWgvOaCEu4COO0OZHDOD3Avu/ZxTE0gihZxQDBDzIMsd3qdHvXWEaJV8xVpBe0sYCNVqfbW8ctzvCMzYp8hVOM8NAu8uzwKwnjdM00j0WeDYzbnJoG0y3M1HX5V/7lKn9Urv/J1m/hCE94M96LYTX8ALVtSWy+iWDIAAAAAElFTkSuQmCC\" />\n" +
            "    <image id=\"Partly_Cloudy\" data-name=\"Partly Cloudy\" class=\"cls-1\" width=\"67\" height=\"42\" transform=\"translate(342 133)\" xlink:href=\"data:image/png;base64,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\" />\n" +
            "    <g id=\"Partly_Cloudy-2\" data-name=\"Partly Cloudy-2\" class=\"cls-1\">\n" +
            "        <text class=\"cls-2\" transform=\"translate(324.79 196.71)\">\n" +
            "            <tspan class=\"cls-3\">" + description + "</tspan>\n" +
            "        </text>\n" +
            "    </g>\n" +
            "    <g id=\"_68_F\" data-name=\" 68 F\" class=\"cls-1\">\n" +
            "        <text class=\"cls-5\" transform=\"translate(197.91 217.33)\">" + low + "°F</text>\n" +
            "    </g>\n" +
            "    <g id=\"_92_F\" data-name=\" 92 F\" class=\"cls-1\">\n" +
            "        <text class=\"cls-5\" transform=\"translate(197.91 169)\">" + high + "°F</text>\n" +
            "    </g>\n" +
            "    <g id=\"_71_F\" data-name=\" 71 F\" class=\"cls-1\">\n" +
            "        <text class=\"cls-6\" transform=\"translate(34.53 196)\">" + current + "°F</text>\n" +
            "    </g>\n" +
            "    <g id=\"Current\" class=\"cls-1\">\n" +
            "        <text class=\"cls-7\" transform=\"translate(61.1 111.68)\">Cur<tspan class=\"cls-8\" x=\"22.1\" y=\"0\">r</tspan><tspan x=\"27.08\" y=\"0\">ent</tspan></text>\n" +
            "    </g>\n" +
            "    <g id=\"High_Low\" data-name=\"High Low\" class=\"cls-1\">\n" +
            "        <text class=\"cls-7\" transform=\"translate(197.91 111.68)\">High/Low</text>\n" +
            "    </g>\n" +
            "    <g id=\"_TweatheReport\" data-name=\" TweatheReport\" class=\"cls-1\">\n" +
            "        <text class=\"cls-9\" transform=\"translate(168.31 280.47)\">#<tspan class=\"cls-10\" x=\"10.72\" y=\"0\">T</tspan><tspan x=\"21.45\" y=\"0\">weatheRepo</tspan><tspan class=\"cls-4\" x=\"121.46\" y=\"0\">r</tspan><tspan x=\"128.47\" y=\"0\">t</tspan></text>\n" +
            "    </g>\n" +
            "    <g id=\"Your_Tweather_Report\" data-name=\"Your Tweather Report\" class=\"cls-1\">\n" +
            "        <text class=\"cls-11\" transform=\"translate(97.16 39)\">\n" +
            "            <tspan class=\"cls-12\">Y</tspan>\n" +
            "            <tspan x=\"17.59\" y=\"0\">our</tspan>\n" +
            "            <tspan class=\"cls-13\" x=\"62.29\" y=\"0\"></tspan>\n" +
            "            <tspan class=\"cls-10\" x=\"68.88\" y=\"0\">T</tspan>\n" +
            "            <tspan x=\"86.75\" y=\"0\">weather Repo</tspan>\n" +
            "            <tspan class=\"cls-4\" x=\"271.86\" y=\"0\">r</tspan>\n" +
            "            <tspan x=\"283.54\" y=\"0\">t</tspan>\n" +
            "        </text>\n" +
            "    </g>\n" +
            "</svg>\n";





        //Writes svg variable to an actual svg file
        fs.writeFile("/Users/gennaro/Desktop/test.svg", svg, (err) => {
            if (err) throw err;
            console.log("Wrote svg!");
        });

        svg2png(svg,{ width: 500, height: 300 })
            .then((buffer) => {fs.writeFile("/Users/gennaro/Desktop/test.png", buffer)})


        //Response to user with their temperature
        client.post('statuses/update', {status: "@" + event.user.screen_name + " The current temperature in " + data.name + " is " + fahrenheit(data.main.temp) + "°F with a high of " + fahrenheit(data.main.temp_max) + "°F and a low of " + fahrenheit(data.main.temp_min) + "°F.", in_reply_to_status_id:event.id_str} );
    });
});

stream.on('error', function(error) {
    throw error;
});