/**
 * Created by samuel on 17/11/13.
 */

function saveLocal() {
    localStorage.pace = JSON.stringify(data);
}

paceData = null;

function createPace() {
    return {
        "title": "",
        "openingSceneId": null,
        "CSS": ".scene {\n}\n",
        "JS": "",
        "headerHTML": "",
        "footerHTML": "",
        "scenes": {}
    };
}

function loadGlobal(data) {
    paceData = data;
    setAceData("#configEditor #CSSEditor", data.CSS);
    setAceData("#configEditor #JSEditor", data.JS);
    setAceData("#configEditor #headerHTMLEditor", data.headerHTML);
    setAceData("#configEditor #footerHTMLEditor", data.footerHTML);
    loadSceneList();

    $("#globalCSS").text(data.CSS);
    $("#scenes").empty();
    for (var i in data.scenes) {
        var scene = data.scenes[i];
        var sceneDiv = $("<div></div>");
        sceneDiv.attr("id", i);
        sceneDiv.addClass("scene");
        $("#scenes").append(sceneDiv);

        for (var j in scene.hotSpots) {
            sceneDiv.append(createHotSpotDiv(j, scene.hotSpots[j]));
        }

    }

    loadScene($("#sceneSelect").val());
}

function loadScene(sceneId) {

    $("#hotSpotOptions").hide();
    $("#sceneOptions").show();

    var scene = paceData.scenes[sceneId];
    var sceneDiv = $("#" + sceneId + ".scene");
    setAceData("#sceneOptions #CSSEditor", scene.CSS);
    setAceData("#sceneOptions #JSEditor", scene.JS);
    setAceData("#sceneOptions #onEnterJSBody", scene.onEnterJSBody);
    setAceData("#sceneOptions #onExitJSBody", scene.onExitJSBody);
    setAceData("#sceneOptions #onMouseMoveJSBody", scene.onMouseMoveJSBody);

    $("#sceneSelect").val(sceneId);
    $("#sceneCSS").text(scene.CSS);
    $(".scene").hide();
    sceneDiv.show();
    $("#sceneOptions .label").val(sceneId);

    loadHotSpotList();

    var hotSpotCSS = "";
    for (var i in scene.hotSpots) {
        hotSpotCSS += scene.hotSpots[i].CSS;
    }
    $("#hotSpotCSS").text(hotSpotCSS);


}

function newScene() {
    // find the highest XXX in 'untitledXXX' labels
    var x = 0;
    sceneIds().forEach(function (id) {
        var m = id.match(/untitled(\d+)/);
        if (m && m.length == 2) {
            var y = parseInt(m[1]);
            if (y > x)
                x = y;
        }
    });
    x += 1;
    var id = "untitled" + x;
    paceData.scenes[id] = {
        CSS: "#" + id + ".scene {\n}\n",
        JS: "",
        HTML: "",
        onEnterJSBody: "",
        onExitJSBody: "",
        onMouseMoveJSBody: "",
        hotSpots: {}
    };

    var sceneDiv = $("<div></div>");
    sceneDiv.attr("id", id);
    sceneDiv.addClass("scene");
    sceneDiv.hide();
    $("#scenes").append(sceneDiv);

    if (paceData.openingSceneId == null) {
        paceData.openingSceneId = id;
    }

    loadSceneList();
    loadScene(id);
    return id;
}

function removeScene(sceneId) {
    delete paceData.scenes[sceneId];
    $("#" + sceneId + ".scene").remove();
    if (paceData.openingSceneId == sceneId) {
        paceData.openingSceneId = null;
    }

    if (sceneId == selectedSceneId() && sceneIds().length) loadScene(sceneIds()[0]);
    loadSceneList();
}

function renameScene(oldId, newId){

    newId = newId.replace(/ |\t|\.|#|:/g, "");
    if (oldId == newId) return;

    var prevSelected = selectedSceneId() == oldId ? newId : selectedSceneId();
    var scene = paceData.scenes[newId] = paceData.scenes[oldId];
    delete paceData.scenes[oldId];
    if (paceData.openingSceneId == oldId) paceData.openingSceneId = newId;

    $("#" + oldId + ".scene").attr("id", newId);

    scene.CSS = scene.CSS.replace(
        RegExp("#" + oldId + ".scene" + (/\s*{/).source, "g"), "#" + newId + ".scene {"
    );


    for (var hotSpotId in scene.hotSpots) {
        scene.hotSpots[hotSpotId].CSS = scene.hotSpots[hotSpotId].CSS.replace(
            RegExp("#" + oldId + (/\s+#/).source, "g"), "#" + newId + " #"
        );
    }

    loadSceneList();
    if (newId == prevSelected) loadScene(newId);

}

function loadSceneList() {
    var sceneSelect = $("#sceneSelect");
    var prevSelected = sceneSelect.val();
    sceneSelect.empty();
    for (var i in paceData.scenes) {
        var option = $('<option value="' + i + '">' + i + '</option>');
        sceneSelect.append(option)
        if (i == prevSelected) {
            sceneSelect.val(i);
            loadScene(i);
        }
    }
}

function selectedSceneId() {
    return $("#sceneSelect").val();
}

function selectedSceneData() {
    return paceData.scenes[selectedSceneId()];
}

function sceneIds() {
    return Object.keys(paceData.scenes);
}

function loadHotSpot(hotSpotId) {

    $(".hotSpot.selected").removeClass("selected");
    $("#" + selectedSceneId() + " #" + hotSpotId + ".hotSpot").addClass("selected");

    $("#hotSpotOptions").show();
    $("#sceneOptions").hide();
    $("#hotSpotSelect").val(hotSpotId);
    var hotSpot = selectedSceneData().hotSpots[hotSpotId];
    $("#hotSpotOptions .label").val(hotSpotId);
    setAceData("#hotSpotOptions #CSSEditor", hotSpot.CSS);
    setAceData("#hotSpotOptions #JSEditor", hotSpot.JS);
    setAceData("#hotSpotOptions #onClickJSBody", hotSpot.onClickJSBody);
    setAceData("#hotSpotOptions #onDoubleClickJSBody", hotSpot.onDoubleClickJSBody);
    setAceData("#hotSpotOptions #onMouseMoveJSBody", hotSpot.onMouseMoveJSBody);
}

function createHotSpotDiv(hotSpotId, hotSpotData) {

    var hotSpotDiv = $("<div></div>");
    hotSpotDiv.attr("id", hotSpotId);
    hotSpotDiv.addClass("hotSpot");
    hotSpotDiv.attr("topXXX", "0px");
    hotSpotDiv.attr("leftXXX", "0px");
    hotSpotDiv.attr("style", hotSpotData.attributeCSS);
    hotSpotDiv.css("position", "absolute");
    hotSpotDiv.resizable({
        start: function(event, ui) {
        },
        stop: function(event, ui) {
            hotSpotData.attributeCSS = hotSpotDiv.attr("style");
        }
    }).draggable({
        containment: "parent",
        stop: function() {
            hotSpotDiv.css("position", "absolute");
            hotSpotData.attributeCSS = hotSpotDiv.attr("style");
        }
    });

    hotSpotDiv.click(function(evt) {
        evt.preventDefault();
        var div = $(this);
        var hotSpotId = div.attr("id");
        var hotSpotData = selectedSceneData().hotSpots[hotSpotId];
        $("#hotSpotSelect").val(hotSpotId);
        loadHotSpot(hotSpotId);
    });

    return hotSpotDiv;
}

function newHotSpot() {
    // find the highest XXX in 'untitledXXX' labels
    var x = 0;
    hotSpotIds().forEach(function (id) {
        var m = id.match(/untitled(\d+)/);
        if (m && m.length == 2) {
            var y = parseInt(m[1]);
            if (y > x)
                x = y;
        }
    });
    x += 1;
    var id = "untitled" + x;
    var hotSpotData = selectedSceneData().hotSpots[id] = {
        CSS: "#" + selectedSceneId() + " #" + id + ".hotSpot {\n}\n",
        attributeCSS: "",
        JS: "",
        HTML: "",
        onClickJSBody: "",
        onDoubleClickJSBody: "",
        onMouseMoveJSBody: ""
    };

    //var hotSpotDiv = $("<div></div>");
    //hotSpotDiv.attr("id", id);
    //hotSpotDiv.addClass("hotSpot");
    $("#scenes").find("#" + selectedSceneId() + ".scene").append(createHotSpotDiv(id, hotSpotData));
    return id;
}

function removeHotSpot(hotSpotId) {
    delete selectedSceneData().hotSpots[hotSpotId];
    $("#" + hotSpotId + ".hotSpot").remove();
    loadHotSpotList();
}

function renameHotSpot(oldId, newId){

    newId = newId.replace(/ |\t|\.|#|:/g, "");
    if (oldId == newId) return;

    var prevSelected = selectedHotSpotId() == oldId ? newId : selectedHotSpotId();
    var hotSpot = selectedSceneData().hotSpots[newId] = selectedSceneData().hotSpots[oldId];
    delete selectedSceneData().hotSpots[oldId];

    $("#" + selectedSceneId() + ".scene #" + oldId + ".hotSpot").attr("id", newId);

    hotSpot.CSS = hotSpot.CSS.replace(
        RegExp("#" + selectedSceneId() + (/\s+#/).source + oldId + ".hotSpot" + (/\s*{/).source, "g"),
        "#" + selectedSceneId() + " #" + newId + ".hotSpot {"
    );

    loadHotSpotList();
    if (newId == prevSelected) loadHotSpot(newId);

}

function loadHotSpotList() {
    var hotSpotSelect = $("#hotSpotSelect");
    hotSpotSelect.empty();
    for (var i in selectedSceneData().hotSpots) {
        var option = $('<option value="' + i + '">' + i + '</option>');
        hotSpotSelect.append(option)
    }
}

function selectedHotSpotId() {
    return $("#hotSpotSelect").val();
}

function selectedHotSpotData() {
    return selectedSceneData().hotSpots[selectedHotSpotId()];
}

function hotSpotIds() {
    return Object.keys(selectedSceneData().hotSpots);
}












function initEditor(){
    initConfigEditor();
    initSceneEditor();
    initHotSpotEditor();
}

function setAceData(divId, value) {
    var aceEditor = ace.edit($(divId)[0]);
    aceEditor.setValue(value);
    aceEditor.selection.clearSelection();
}

function getAceData(divId) {
    var aceEditor = ace.edit($(divId)[0]);
    return aceEditor.getValue();
}

/* Configuration Editor */

function initConfigEditor() {
    var panelDiv = $("#configEditor");

    var editorDiv;

    // Global CSS
    $("#configEditor #CSSEditor").keyup(function() {
        paceData.CSS = getAceData("#configEditor #CSSEditor");
        $("#globalCSS").text(paceData.CSS);
    });

    // Global JS
    $("#configEditor #JSEditor").keyup(function() {
        paceData.JS = getAceData("#configEditor #JSEditor");
    });

    // Header HTML
    $("#configEditor #headerHTMLEditor").keyup(function() {
        paceData.headerHTML = getAceData("#configEditor #headerHTMLEditor");
    });

    // Footer HTML
    $("#configEditor #footerHTMLEditor").keyup(function() {
        paceData.footerHTML = getAceData("#configEditor #footerHTMLEditor");
    });

}

/* Scene Editor options */

function initSceneEditor() {

    $("#addScene").click(function() {
        var id = newScene();
    });

    $("#removeScene").click(function() {
        removeScene(selectedSceneId());
    });

    $("#sceneSelect").change(function() {
        loadScene(selectedSceneId());
    });

    var panelDiv = $("#sceneEditor"), sceneDiv = $("#scenes"), sceneOptions = $("#sceneOptions");

    // Scene Label
    var label = sceneOptions.find(".label");
    var oldLabel = "untitled";
    label.focus(function(e) { oldLabel = label.val(); });
    label.focusout(function(e) {
        //var text = getAceData("#sceneOptions .label");
        var newLabel = label.val();
        //setAceData("#sceneOptions .label", text);
        renameScene(oldLabel, newLabel);
    });

    // Background Image URL
    var bgURL = sceneOptions.find(".imgURL");
    bgURL.focusout(function(e) {
        var text = getAceData("#sceneOptions #CSSEditor");
        var url = bgURL.val();
        if (url != "none" && url != "") {
            text = cssSet("#" + label.val() + ".scene", "background-image", "url(\"" + url + "\")", text);
        } else {
            text = cssSet("#" + label.val() + ".scene", "background-image", "none", text);
        }
        setAceData("#sceneOptions #CSSEditor", text);
    });

    // Scene CSS
    $("#sceneOptions #CSSEditor").keyup(function(e) {
        var text = getAceData("#sceneOptions #CSSEditor");
        selectedSceneData().CSS = text;
        $("#sceneCSS").text(text);
    });

    // Scene JavaScript
    $("#sceneOptions #JSEditor").keyup(function(e) {
        selectedSceneData().JS = getAceData("#sceneOptions #JSEditor");
    });

    // On Enter Script Body
    $("#sceneOptions #onEnterJSBody").keyup(function(e) {
        selectedSceneData().onEnterJSBody = getAceData("#sceneOptions #onEnterJSBody");
    });

    // On Exit Script Body
    $("#sceneOptions #onExitJSBody").keyup(function(e) {
        selectedSceneData().onExitJSBody = getAceData("#sceneOptions #onExitJSBody");
    });

    // On Mouse Move Script Body
    $("#sceneOptions #onMouseMoveJSBody").keyup(function(e) {
        selectedSceneData().onMouseMoveJSBody = getAceData("#sceneOptions #onMouseMoveJSBody");
    });
}

function initHotSpotEditor() {

    $("#addHotSpot").click(function() {
        var id = newHotSpot();
        loadHotSpotList();
    });

    $("#removeHotSpot").click(function() {
        removeHotSpot(selectedHotSpotId());
        loadHotSpotList();
    });

    $("#hotSpotSelect").change(function() {
        loadHotSpot(selectedHotSpotId());
    });

    var label = $("#hotSpotOptions .label");
    var oldLabel = "untitled";
    label.focus(function(e) { oldLabel = label.val(); });
    label.focusout(function(e) {
        renameHotSpot(oldLabel, label.val());
    });

    var editorDiv;

    // Click JS
    editorDiv = $("#hotSpotOptions #onClickJSBody");
    editorDiv.keyup(ace.edit(editorDiv[0]), function(e) {
        selectedHotSpotData().onClickJSBody = e.data.getValue();
    });

    // Double Click JS
    editorDiv = $("#hotSpotOptions #onDoubleClickJSBody");
    editorDiv.keyup(ace.edit(editorDiv[0]), function(e) {
        selectedHotSpotData().onDoubleClickJSBody = e.data.getValue();
    });

    // Mouse Move JS
    editorDiv = $("#hotSpotOptions #onMouseMoveJSBody");
    editorDiv.keyup(ace.edit(editorDiv[0]), function(e) {
        selectedHotSpotData().onMouseMoveJSBody = e.data.getValue();
    });

    // JS
    editorDiv = $("#hotSpotOptions #JSEditor");
    editorDiv.keyup(ace.edit(editorDiv[0]), function(e) {
        selectedHotSpotData().JS = e.data.getValue();
    });

    // CSS
    editorDiv = $("#hotSpotOptions #CSSEditor");
    editorDiv.keyup(ace.edit(editorDiv[0]), function(e) {
        selectedHotSpotData().CSS = e.data.getValue();
    });

}

$("#scenes").click(function(evt) {
    if (evt.isDefaultPrevented()) return;
    $("#hideHotSpotEditor").click();
});

$("#hideHotSpotEditor").click(function() {
    $("#hotSpotOptions").hide();
    $("#sceneOptions").show();
    $(".hotSpot.selected").removeClass("selected");
});












/** Given a string of CSS (possibly containing multiple blocks), set an attribute to a value.
 * If the selector does not have a block, one first be appended to the end.
 * If the selector block does not have the attribute definied, it will be appended to the end of the block.
 * @param selector Full CSS selector string.
 * @param attribute Attribute name to set value of.
 * @param newValue The new value to set.
 * @param cssStr The CSS body string.
 * @return The resulting CSS body string.
 */
function cssSet(selector, attribute, newValue, cssStr) {

    // BEWARE: This relies on the "attribute: oldValue;" line to follow a whitespace character.
    // Preferably a tab, because that is what it replaces it with.

    //cssStr = cssStr.replace(/\/\*(\r|\n|.)*\*\//g,""); // Remove comments

    // bod.match(/#scene\.label\s*{(?:\s*[^;]*;)*\s*width:\s*([^;]*);(?:\s[^;]*;\s)*}/)

    var regex = RegExp(
        selector.replace(".", "\\.")
            + ( /\s*{(?:[^};]*;)*\s*[^}]*}/ ).source, "g");

    // Selector is missing from CSS
    if (!regex.test(cssStr)) {
        cssStr += "\n" + selector + " {";
        cssStr += "\n\t" + attribute + ": " + newValue + ";\n";
        cssStr += "}\n";
        return cssStr;
    }


    var regex = RegExp(
        selector.replace(".", "\\.")
            + ( /\s*{(?:[^};]*;)*\s*/ ).source
            + attribute
            + ( /\s*:\s*([^;]*);[^}]*}/ ).source, "g");


    // Selector is present, but attribute is not
    if (!regex.test(cssStr)) {
        regex = RegExp( selector.replace(".", "\\.") + ( /\s*{[^}]*/ ).source, "g");
        return cssStr.replace(regex, "$&" + "\t" + attribute + ": " + newValue + ";\n");
    }

    // Selector and attribute are both present
    // First RegExp to find block: selector { }
    return cssStr.replace(regex, function(match, p1) {
        // Then RegExp to find: attribute: oldValue;
        var regex = RegExp(( /(\s|;)/ ).source + attribute + ( /\s*:\s*([^;]*);/ ).source);
        return match.replace(regex, "\t" + attribute + ": " + newValue + ";");
    });

}

/** Get the value of an attribute in a selector block in a string of CSS (possibly containing multiple blocks).
 * @param selector Full CSS selector string.
 * @param attribute Attribute name get value of.
 * @param cssStr The CSS body string.
 * @return The value of the attribute, or null of not found in the CSS string.
 */
function cssGet(selector, attribute, cssStr) {

    var regex = RegExp(
        selector.replace(".", "\\.")
            + ( /\s*{(?:\s*[^;]*;)*\s*/ ).source
            + attribute
            + (/\s*:\s*([^;]*);(?:\s[^;]*;\s)*}/).source );

    var matches = cssStr.match(regex);
    if (matches && matches.length > 1) {
        return matches[1];
    } else {
        return null;
    }
}


function initFoldDividers() {
    var foldDivs = $(".foldDivider");
    foldDivs.click(function(evt) {
        $(this).next().toggle();
    });
}

function initAceEditors() {

    // Setup JS editors
    var editors = $(".jsEditor");
    for (var i = 0; i < editors.length; i++) {
        var editor = ace.edit(editors[i]);
        //editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");
        ace.require("ace/ext/language_tools");
        editor.setOptions({ enableBasicAutocompletion: true });
    };

    // Setup CSS editors
    editors = $(".cssEditor");
    for (var i = 0; i < editors.length; i++) {
        var editor = ace.edit(editors[i]);
        //editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/css");
        ace.require("ace/ext/language_tools");
        editor.setOptions({ enableBasicAutocompletion: true });
    };

    // Setup HTML editors
    editors = $(".htmlEditor");
    for (var i = 0; i < editors.length; i++) {
        var editor = ace.edit(editors[i]);
        //editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/html");
        ace.require("ace/ext/language_tools");
        editor.setOptions({ enableBasicAutocompletion: true });
    };

}

$("#saveButton").click(function() {
    var th = $(this);
    th.addClass("selected")
    setTimeout(function() { th.removeClass("selected"); }, 500);
    localStorage.pace = JSON.stringify(paceData);
});

$("#reloadButton").click(function() {
    var th = $(this);
    th.addClass("selected")
    setTimeout(function() { th.removeClass("selected"); }, 500);
    loadGlobal(JSON.parse(localStorage.pace));
});

$("#newButton").click(function() {
    var th = $(this);
    th.addClass("selected")
    setTimeout(function() { th.removeClass("selected"); }, 500);
    loadGlobal(createPace());
});

$("#previewButton").click(function() {
    $("#navPanel .button.selected").removeClass("selected");
    $(this).addClass("selected");
    $(".mainContent").hide();
    $("#scenePreview").show();
    $("#scenePreview iframe")[0].contentWindow.window.loadJSON(paceData);
});

$("#viewButton").click(function() {
    var th = $(this);
    th.addClass("selected")
    setTimeout(function() { th.removeClass("selected"); }, 500);
    window.open("view.html")
});

$("#configButton").click(function() {
    $("#navPanel .button.selected").removeClass("selected");
    $(this).addClass("selected");
    $(".mainContent").hide();
    $("#configEditor").show();
});

$("#sceneButton").click(function() {
    $("#navPanel .button.selected").removeClass("selected");
    $(this).addClass("selected");
    $(".mainContent").hide();
    $("#sceneEditor").show();
});

$("#apiButton").click(function() {
    $("#navPanel .button.selected").removeClass("selected");
    $(this).addClass("selected");
    $(".mainContent").hide();
    $("#apiDoc").show();
});

$("#importButton").click(function() {
    var th = $(this);
    th.addClass("selected")
    setTimeout(function() { th.removeClass("selected"); }, 500);
    $("#importFile").click();
});

$("#importFile").change(function(evt) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.

    if (files.length != 1) return;
    var f = files[0];



    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = function(file) {
        loadGlobal(JSON.parse(file.target.result));
    };

    reader.readAsText(f);
});

$("#exportButton").click(function() {
    var th = $(this);
    th.addClass("selected")
    setTimeout(function() { th.removeClass("selected"); }, 500);
    var blob = new Blob([JSON.stringify(paceData)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "scene.json");
});

$("#helpButton").click(function() {
    $("#navPanel .button.selected").removeClass("selected");
    $(this).addClass("selected");
    $(".mainContent").hide();
    $("#help").show();
});

$("#loadDefaults").click(function() {
    $.get("examples/default.json", function(data) {
        loadGlobal(data);
        $("#previewButton").click();
    });
});

window.onload = function() {
    initFoldDividers();
    initAceEditors();
    initEditor();
    if (localStorage.pace) loadGlobal(JSON.parse(localStorage.pace));
    else loadGlobal(createPace());
}

$("#configButton").click();