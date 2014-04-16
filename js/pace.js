/*
 * Core Pace
 */

gameData = {};

function goToScene(sceneId) {
    hideScenes();
    var scene = $("#" + sceneId + ".scene");
    if (scene.length) {
        scene.show();
        eval(gameData.scenes[sceneId].onEnterJSBody);
    } else {
        console.log("Invalid Scene ID: " + sceneId);
    }
}

function hideScenes() {
    var ids = visibleScenes();
    for (var i in ids) {
        eval(gameData.scenes[ids[i]].onExitJSBody);
    }
    $(".scene").hide();
}

function visibleScenes() {
    var ids = [];
    var scenes = $(".scene");
    scenes.each(function(i) {
        var scene = $(scenes[i]);
        if (scene.css("display") != "none")
            ids.push(scene.attr("id"));
    });
    return ids;
}

/*
 * Loading
 */

function setTitle(title) {
    $("title").text(title);
}

function setHeader(html) {
    $("#headerHTML").html(html);
}

function appendHeader(element) {
    $("#headerHTML").append(element);
}

function prependHeader(element) {
    $("#headerHTML").prepend(element);
}

function setFooter(html) {
    $("#footerHTML").html(html);
}

function appendFooter(element) {
    $("#footerHTML").append(element);
}

function prependFooter(element) {
    $("#footerHTML").prepend(element);
}

function setCSS(text) {
    $("#CSS").remove();
    $("head").append($('<style id="CSS">' + text + '</style>'));
}

function setJS(text) {
    $("#JS").remove();
    $("head").append($('<script id="JS">' + text + '<\/script>'));
}

function addScene(sceneId, html) {
    var scene = $("#scenes").find("#" + sceneId + ".scene");
    if (scene.length == 0) {
        $("#scenes").append($('<div id="' + sceneId + '" class="scene"></div>'));
        scene = $("#scenes").find('#' + sceneId + ".scene");
    }
    scene.html(html);
    return scene[0];
}

function clearScenes() {
    $("#scenes").empty();
}

function addHotSpot(sceneId, hotSpotId, html) {
    var scene = $("#" + sceneId + ".scene");
    var hotSpot = scene.find('#' + hotSpotId + ".hotSpot");
    if (hotSpot.length == 0) {
        scene.append($('<div id="' + hotSpotId + '" class="hotSpot"></div>'));
        hotSpot = scene.find('#' + hotSpotId + ".hotSpot");
    }
    hotSpot.html(html);
    return hotSpot;
}

function loadExternalCSS(href) {
    $("head").append('<link rel="stylesheet" type="text/css" href="'+href+'" class="externalCSS">');
}

function loadExternalJS(src) {
    $("head").append('<script type="text/javascript" src="'+src+'" class="externalJS>');
}

function loadJSON(json) {

    gameData = json;

    clearScenes();
    $(".externalCSS").empty();
    $(".externalJS").empty();

    var css = json.CSS;
    var js = json.JS;

    for (var i in json.scenes) {

        var scene = json.scenes[i];
        var sceneDiv = addScene(i, scene.HTML);

        css += scene.CSS;
        js += scene.JS;
        $(sceneDiv).mousemove(new Function(scene.onMouseMoveJSBody));

        for (var j in scene.hotSpots) {

            var hotSpot = scene.hotSpots[j];
            var hotSpotDiv = addHotSpot(i, j, hotSpot.HTML);
            $(hotSpotDiv).attr("style", hotSpot.attributeCSS);

            css += hotSpot.CSS;
            js += hotSpot.JS;
            $(hotSpotDiv).click(new Function(hotSpot.onClickJSBody));
            $(hotSpotDiv).dblclick(new Function(hotSpot.onDoubleClickJSBody));
            $(hotSpotDiv).hover(new Function(hotSpot.onHoverJSBody));

        }
    }

    hideScenes();
    setTitle(json.title);
    setHeader(json.headerHTML);
    setFooter(json.footerHTML);
    setJS(js);
    setCSS(css);

}

/*
 * Inventory
 */

function createInventory() {
    return '<div id="inventory"></div>';
}

function addItem(imgURL, count) {
    var inventory = $("#inventory");
    if (inventory.length == 0) {
        console.log("ERROR: addItem called with no inventory. Make sure the object returned by createInventory() is appended/prepended to the header or footer.");
        alert("ERROR: addItem called with no inventory. Make sure the object returned by createInventory() is appended/prepended to the header or footer.");
        return;
    }

    var item = inventory.find("[src='" + imgURL + "'].item");
    if (count == null) count = 1;

    if (item.length == 0) {
        item = $('<div>');
        item.attr("src", imgURL);
        item.css("background-image", "url(" + imgURL + ")");
        item.attr("count", count);
        item.addClass("item");
        inventory.append(item);
    } else {
        item.attr("count", parseFloat(item.attr("count")) + count);
    }


}

function removeItem(imgURL, count) {
    var inventory = $("#inventory");
    if (inventory.length == 0) {
        console.log("ERROR: removeItem called with no inventory. Make sure the object returned by createInventory() is appended/prepended to the header or footer.");
        alert("ERROR: removeItem called with no inventory. Make sure the object returned by createInventory() is appended/prepended to the header or footer.");
        return false;
    }

    var item = inventory.find("[src='" + imgURL + "'].item");
    if (count == null) count = 1;

    if (item.length != 0) {
        var itemCount = item.attr("count");
        if (itemCount - count <= 0) {
            item.remove();
            return true;
        }
    }
    return false;
}

function countItem(imgURL) {
    var inventory = $("#inventory");
    if (inventory.length == 0) {
        console.log("ERROR: countItem called with no inventory. Make sure the object returned by createInventory() is appended or prepended to the header or footer.");
        alert("ERROR: countItem called with no inventory. Make sure the object returned by createInventory() is appended or prepended to the header or footer.");
        return;
    }

    var item = inventory.find("[src='" + imgURL + "'].item");

    if (item.length == 0) {
        return 0;
    } else {
        return parseInt(item.attr("count"));
    }
}

/*
 * Sound
 */

function playSound(filename, channel, volume, loop) {

    var audio = $("audio#" + channel);

    if (audio.length == 0) {
        audio = $('<audio></audio>');
        audio.attr("id", channel);
        audio.attr("autoplay", true);
        $("body").append(audio);
    } else {
        audio.attr("paused", "true");
    }

    audio.attr("loop", loop ? "true" : "false");
    audio.attr("volume", volume != undefined ? volume : 1.0);
    audio.attr("src", filename);
    audio.attr("paused", "false");

}

function pauseSound(channel) {
    var audio = $("audio#" + channel);
    audio.attr("paused", "true");
}

function replaySound(channel) {
    var audio = $("audio#" + channel);
}

