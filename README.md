Pace
====
Pace is a "point and click adventure" style game editor and viewer that can save/load from localstorage and export/import from JSON files. Pace does not require hosting on a webserver, but the editor and viewer can be deployed to one either together or as a viewer only.

Deploying
---------
To deploy a game, the required files are:

* view.html - the game viewer
* game.json - a game JSON file exported from the Pace editor
* js/pace.js - the Pace library
* js/vendor/jquery-1.10.2.min.js

Anatomy of the Pace viewer
--------------------------
The Pace viewer includes all CSS in the link#CSS element and all JavaScript in the script#JS element in the header. In the body, there is a header element div#headerHTML and footer element div#footerHTML which surround the div#scenes element contains scenes as div.scene, which in turn contain hotspots as div.hotSpot.


Pace API
--------
The Pace JavaScript library provides a number of functions that can be used in event callbacks (on enter, on click, etc).


### Scene
*goToScene(sceneId)*

*hideScenes()*

### Page Manipulation

*setTitle(title)* - Set the title of the web page.

*setHeader(html)* - Set the footer to the string of HTML.

*appendHeader(html)* - Add a string of HTML to the end of the footer.

*prependHeader(html)* - Add a string of HTML to the beginning of the footer.

*setFooter(html)* - Set the footer to the string of HTML.

*appendFooter(html)* - Add a string of HTML to the end of the footer.

*prependFooter(html)* - Add a string of HTML to the beginning of the footer.

*loadExternalCSS(href)* - Load a CSS into the page from the given URL.

*loadExternalJS(href)* - Load a JavaScript script into the page from the given URL.

### Inventory

*createInventory()* - Return an inventory an HTML element for adding to the document.

*addItem(imgURL, count=1)*

*removeItem(imgURL, count=1)*

*countItem(imgURL)*

### Audio
*playSound(filename, channel, volume, loop)*

*pauseSound(channel)*

*replaySound(channel)*

