/**
 * Created by samuel on 19/11/13.
 */

class PaceData {

    globalCSS : string;
    globalJS : string;
    headerHTML : string;
    footerHTML : string;

    imagePrecache : string[];
    audioPrecache : string[];

    hotspots : HotSpot[];

    constructor() {

        this.globalCSS = "";
        this.globalJS = "";
        this.headerHTML = "";
        this.footerHTML = "";

        this.imagePrecache = [];
        this.audioPrecache = [];

        this.hotspots = [];
    }

}

class PaceState {
}

class HotSpot {
    css : string;
    onClickJs : string;
}

class Inventory {
    css : string;
}

class Item {

}