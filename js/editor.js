/**
 * Created by samuel on 17/11/13.
 */

function initEditor(){

    initFoldDividers();
    initTextEdit();
    initAceEditors();
    initListEdit();

    initSceneEditor();
}

/* Configuration Editor options */

function initConfigEditor() {
    var panel = $("#configEditor");

}

/* Scene Editor options */

function initSceneEditor() {
    var panel = $("#sceneEditor");

    var sizeX = panel.find("#sizeX");
    var sizeY = panel.find("#sizeY");
    var posX = panel.find("#posX");
    var posY = panel.find("#posY");
    var bgURL = panel.find("#url");
    var label = panel.find("#label");

    [sizeX, sizeY].forEach(function (dim) {
        dim.keydown(function(e) { textEditKeyDown(e); });
        dim.keyup(function(e) {
            textEditKeyUp(e);
            validateSceneSize(sizeX, sizeY, label.text());
        });
    });

    [posX, posY].forEach(function (dim) {
        dim.keydown(function(e) { textEditKeyDown(e); });
        dim.keyup(function(e) {
            textEditKeyUp(e);
            validateSceneBGPos(posX, posY, label.text());
        });
    });

    var sceneCSSEditor = ace.edit($("#sceneCSS")[0]);

    bgURL.keydown(function(e) { textEditKeyDown(e); })
    bgURL.keyup(function(e) {
        textEditKeyUp(e);
        var sceneCSS = sceneCSSEditor.getValue();
        var url = bgURL.text();
        if (url != "none") {
            sceneCSS = cssSet("#scene ." + label.text(), "background-url", "url(" + url + ")", sceneCSS);
        } else {
            sceneCSS = cssSet("#scene ." + label.text(), "background-url", "none", sceneCSS);
        }
        sceneCSSEditor.setValue(sceneCSS);
        sceneCSSEditor.selection.clearSelection();
    });

    var oldLabel = "untitled";
    label.keydown(function(e) {
        textEditKeyDown(e);
        oldLabel = label.text();
    })
    label.keyup(function(e) {
        var sceneCSS = sceneCSSEditor.getValue();
        sceneCSS = sceneCSS.replace(
            RegExp("#scene ." + oldLabel + (/\s*{/).source, "g"), "#scene ." + label.text() + " {");
        sceneCSSEditor.setValue(sceneCSS);
        sceneCSSEditor.selection.clearSelection();
        textEditKeyUp(e);
    });

}

function validateSceneLabel() {}

/**
 * Check the text content of the sizeX and sizeY JQuery elements and modify the #sceneCSS editor contents.
 * @param sizeX
 * @param sizeY
 */
function validateSceneSize(sizeX, sizeY, sceneLabel) {
    var valid = true;
    [sizeX, sizeY].forEach(function (dim) {
        var text = dim.text();
        if (isDimension(text) || text == "auto" || text == "inherit") {
            dim.css("color", "blue");
            dim.attr("title", "");
        } else {
            dim.css("color", "red");
            dim.attr("title", "must be a valid dimension, ie. '800px' or '60%'");
            valid = false;
        }
    });

    if (valid) {
        var sceneCSSEditor = ace.edit($("#sceneCSS")[0])
        var sceneCSS = sceneCSSEditor.getValue();
        sceneCSS = cssSet("#scene ." + sceneLabel, "width", sizeX.text(), sceneCSS);
        sceneCSS = cssSet("#scene ." + sceneLabel, "height", sizeY.text(), sceneCSS);
        sceneCSSEditor.setValue(sceneCSS);
        sceneCSSEditor.selection.clearSelection();
    }
}

/**
 * Check the text content of the sizeX and sizeY JQuery elements and modify the #sceneCSS editor contents.
 * @param sizeX
 * @param sizeY
 */
function validateSceneBGPos(posX, posY, sceneLabel) {
    var valid = true;
    [posX, posY].forEach(function (dim) {
        var text = dim.text();
        if (isDimension(text) || text == "auto" || text == "inherit") {
            dim.css("color", "blue");
            dim.attr("title", "");
        } else {
            dim.css("color", "red");
            dim.attr("title", "must be a valid dimension, ie. '800px' or '60%'");
            valid = false;
        }
    });

    if (valid) {
        var sceneCSSEditor = ace.edit($("#sceneCSS")[0])
        var sceneCSS = sceneCSSEditor.getValue();
        sceneCSS = cssSet("#scene ." + sceneLabel, "background-position", posX.text() + " " + posY.text(), sceneCSS);
        sceneCSSEditor.setValue(sceneCSS);
        sceneCSSEditor.selection.clearSelection();
    }
}

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

    // bod.match(/#scene \.label\s*{(?:\s*[^;]*;)*\s*width:\s*([^;]*);(?:\s[^;]*;\s)*}/)

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

/* Inventory Editor options */

/* Helper functions */

function isDimension(str) {

    var m;

    // pixel
    m = str.match(/\d*px/)
    if (str != "px" && m && m.length == 1 && m[0] == str) {
        return true;
    }

    // percentage
    m = str.match(/\d*%/)
    if (str != "%" && m && m.length == 1 && m[0] == str) {
        return true;
    }

    return false;
}

/* GUI elements */

function initListEdit(div) {

    // le = list edit, ar = after row
    function addRow(le, ar) {
        var row = $("<div></div>");
        row.addClass("row");
        row.text("null" + le.find("div").length);
        row.attr("contenteditable", "true");

        // Remove row button
        var remove = $('<span class="remove button">Delete</span>');
        remove.click(function (e) {
            if (le.find(".row").length == 1) {
                row[0].childNodes[0].nodeValue = "null";
            } else {
                row.remove();
            }
        });
        row.attr("title", "delete row");
        row.append(remove);
        remove.attr("contenteditable", "false");

        // Insert Row Button
        var add = $('<span class="add button">Insert Row</span>');
        add.click(function (e) {
            addRow(le, row);
        });
        add.attr("title", "insert row after");
        row.append(add);
        add.attr("contenteditable", "false");

        // Move Down Button
        var down = $('<span class="down button">Down</span>');
        down.click(function (e) {
            var nxt = row.next();
            if (nxt != null) {
                nxt.after(row);
            }
        });
        down.attr("title", "move row down");
        row.append(down);
        down.attr("contenteditable", "false");

        // Move Up Button
        var up = $('<span class="up button">Up</span>');
        up.click(function (e) {
            var prev = row.prev();
            if (prev != null) {
                prev.before(row);
            }
        });
        up.attr("title", "move row up");
        row.append(up);
        up.attr("contenteditable", "false");


        var status = $('<span class="status button">...</span>');
        row.append(status);
        status.attr("contenteditable", "false");

        if (ar == null) {
            le.append(row);
        } else {
            ar.after(row);
        }
    }

    if (div != null) {
        addRow(div);
    } else {
        var editables = $(".listEdit");
        for (var i = 0; i < editables.length; i++) {
            addRow($(editables[i]));
        }
    }
}

function initFoldDividers() {
    var foldDivs = $(".foldDivider");
    foldDivs.next().css("display", "none");
    foldDivs.click(function(evt) {
        var next = $(this).next();
        if (next.css("display") == "none") {
            next.css("display", "block");
        } else {
            next.css("display", "none");
        }
    });
}

function initTextEdit() {
    var editables = $(".textEdit");
    editables.attr("contenteditable", true);
}

function textEditKeyDown(e) {
    var target = $(e.target);
    if (target.text() == "undefined") {
        target.text("");
    }
}

function textEditKeyUp(e) {
    var target = $(e.target);
    if (target.text().trim() == "") {
        target.text("undefined");
    }
}

function initAceEditors() {

    // Setup JS editors
    var editors = $(".jsEditor");
    console.log(editors);
    for (var i = 0; i < editors.length; i++) {
        var editor = ace.edit(editors[i]);
        //editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");
        ace.require("ace/ext/language_tools");
        editor.setOptions({
            enableBasicAutocompletion: true
        });
    };

    // Setup CSS editors
    editors = $(".cssEditor");
    for (var i = 0; i < editors.length; i++) {
        var editor = ace.edit(editors[i]);
        //editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/css");
        ace.require("ace/ext/language_tools");
        editor.setOptions({
            enableBasicAutocompletion: true
        });
    };

    // Setup HTML editors
    editors = $(".htmlEditor");
    for (var i = 0; i < editors.length; i++) {
        var editor = ace.edit(editors[i]);
        //editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/html");
        ace.require("ace/ext/language_tools");
        editor.setOptions({
            enableBasicAutocompletion: true
        });
    };

}