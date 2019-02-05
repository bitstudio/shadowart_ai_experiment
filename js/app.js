/*
 * Copyright 2018 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//version 20190201 11:53PM
let fps = 30;
let ctx = undefined;
let width = undefined;
let height = undefined;
let c = undefined;
let scale = 1;
let device = []

var ENUM_MODE = {
    LANDING: 0,
    SELECT: 1,
    PLAY: 2,
    PRACTICE: 3,
    SUMMARY: 4
};

let mode = null;
let landingMode, selectMode, playMode, endMode;
let bg_img;
let bg_circle_img_01;
let defaultRotateImgScale =1.77778;
let rotate_device_img;
let mobileDevice = false;

let iOS = false;
let isAndroid =false;
let isFirefox = false;
let isSafari = false;
let isChrome = false;
// let alreadyTryGetUserMedia = false;
// let canGetUserMedia = false;
let text_valid_device_size = 50;

function setup() {
    checkDevice();

    mode =  ENUM_MODE.LANDING;

    endMode = EndMode();
    playMode = PlayMode(endMode);

    landingMode = LandingMode(playMode);
    selectMode = SelectMode(playMode);

    landingMode.setup();
    selectMode.setup();
    endMode.setup();

    bg_img = new Image();
    bg_img.onload = function(){}
    bg_img.src = "content/ui/bg.jpg";

    bg_circle_img_01 = new Image();
    bg_circle_img_01.onload = function(){}
    bg_circle_img_01.src = "content/ui/circle_mask.png";

    rotate_device_img = new Image();
    rotate_device_img.onload = function(){}
    rotate_device_img.src = "content/ui/rotate_icon.png";

    browser_support_img = new Image();
    browser_support_img.onload = function(){}
    browser_support_img.src = "content/ui/shadow_art.png";


    // canGetUserMedia = false;
    // alreadyTryGetUserMedia = true;
    // alert(navigator.mediaDevices==null);
    // navigator.mediaDevices.getUserMedia({ video: { width: { min: 640 }, height: { min: 480 } }, audio: false })
    // .then(function(stream) {
    //     canGetUserMedia = true;
    // })
    // .catch(function(err) {
    //     canGetUserMedia = false;
    // });
}

function checkDevice(){
    var md = new MobileDetect(window.navigator.userAgent);

    if(md.mobile() || md.phone() || md.tablet()) {
        mobileDevice = true;
    } else {
        mobileDevice = false;
    }

}

function update() {
    scale = width / height > 1.77778 ?  height / 1080:  width / 1920;
    if (mode == ENUM_MODE.LANDING) {
        landingMode.update();
    } else if (mode == ENUM_MODE.SELECT) {
        selectMode.update();
    } else if (mode == ENUM_MODE.PLAY) {
        playMode.update();
    } else if (mode == ENUM_MODE.SUMMARY) {
        endMode.update();
    }

}

function hideUI() {
    $('#btn_practice').hide();
    $('#btn_next').hide();
    $('#select_zodiac').hide();
    $('#select_year').hide();
    $('#play_again_btn').hide();
    $('#btn_play_end').hide();
    $('#calibrate_message').hide();
    $('#btn_begin').hide();

}

function iOSversion() {
    if (/iP(hone|od|ad)/.test(navigator.platform)) {
      // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
      var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
      return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
    }
}
  

function draw() {

    var isChromium = window.chrome;
    var winNav = window.navigator;
    var vendorName = winNav.vendor;
    var isOpera = typeof window.opr !== "undefined";
    var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    var hasMediaDevices = navigator.mediaDevices!=null;
    isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    isChrome = isChromium !== null &&
                    typeof isChromium !== "undefined" &&
                    vendorName === "Google Inc." &&
                    isOpera === false &&
                    isIEedge === false;  
    isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    isAndroid = /(android)/i.test(navigator.userAgent);
    var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    var iOSver = iOSversion();

    if(mode == ENUM_MODE.LANDING) {
        if(  !hasMediaDevices                   // Can not use camera.
            || iOS && !isSafari                 // iPad|iPhone|iPod did not use Safari.
            || iOS && iOSver[0] < 11            // iPad|iPhone|iPod had iOS version lower than 11.
            || !iOS && !isMac && !isChrome      // All devices except Mac|iPad|iPhone|iPod did not use Chrome.
            || isMac && !isChrome && !isSafari  // Mac did not use Chrome or Safari.
            ) 
            {
            $('#btn_play').hide();
         
            let _canvas = document.getElementById('canvas');
            let _ctx = _canvas.getContext('2d');
            _ctx.save();
            _ctx.drawImage( bg_img, 0, 0, window.innerWidth, window.innerHeight);
            
            _ctx.translate(c.x, c.y);
            let circle_size_w = bg_circle_img_01.width * scale;
            let circle_size_h = bg_circle_img_01.height * scale;
            
            _ctx.drawImage(bg_circle_img_01 , -circle_size_w*0.5 ,  -circle_size_h*0.5 , circle_size_w , circle_size_h ) ;
          
            let browser_support_img_w = browser_support_img.width *scale;
            let browser_support_img_h = browser_support_img.height *scale;
            _ctx.drawImage(browser_support_img , -browser_support_img_w*0.5 ,  -browser_support_img_h * 3.0 , browser_support_img_w, browser_support_img_h ) ;
          

            let h = text_valid_device_size * scale;
            let line_h = h * 1.3 ;
            _ctx.font = h  + "px " + $.i18n('fonts_primary');
            _ctx.fillStyle ='rgb(160, 56, 57)';           
            _ctx.textAlign = "center";          
            texts = ["It looks like your browser or device", 
                    "doesn't support this experiment.",
                    "Please try again on",
                    "Chrome (Windows, Mac, Android)",
                    "or Safari (Mac, iOS)."];
            _ctx.fillText(texts[0], 0, line_h * -0.5); 
            _ctx.fillText(texts[1], 0, line_h * 0.5); 
            _ctx.fillText(texts[2], 0, line_h * 1.5); 
            _ctx.fillText(texts[3], 0, line_h * 2.5); 
            _ctx.fillText(texts[4], 0, line_h * 3.5);
            _ctx.restore();
            hideUIState();
            
            return;
        } 
  
    }

        if(mode!=null &&mobileDevice&& window.innerHeight > window.innerWidth) {
            let _canvas = document.getElementById('canvas');
            let _ctx = _canvas.getContext('2d');
            let scaleRotateDeviceImg = defaultRotateImgScale * scale;
            _ctx.save();
            _ctx.drawImage( bg_img, 0, 0, window.innerWidth, window.innerHeight);
            _ctx.translate( c.x, c.y);
            _ctx.drawImage( rotate_device_img, -rotate_device_img.width * 0.5 * scaleRotateDeviceImg, - rotate_device_img.height * 0.5 * scaleRotateDeviceImg, rotate_device_img.width *scaleRotateDeviceImg, rotate_device_img.height *scaleRotateDeviceImg);
            _ctx.restore();
            hideUIState();
        } else {
            if (mode == ENUM_MODE.LANDING) {
                landingMode.showUI();
                landingMode.draw();
            } else if (mode == ENUM_MODE.SELECT) {
                landingMode.hideUI();
                if(selectMode.checkState() == 0) {
                    selectMode.selectShowUI();
                }else {
                    selectMode.selectHideUI();
                    selectMode.beginShowUI();
                }
                selectMode.draw();
            } else if (mode == ENUM_MODE.PLAY) {
                playMode.draw();
            } else if (mode == ENUM_MODE.SUMMARY) {
                if(!endMode.checkCompleted()) {
                    $('#btn_play_end').hide();
                    $('#play_again_btn').show();
                }else{
                    $('#btn_play_end').show();
                    $('#play_again_btn').hide();
                }
                endMode.draw();
            }
        }

}

function hideUIState() {
    if (mode == ENUM_MODE.LANDING) {
        landingMode.hideUI();
    } else if (mode == ENUM_MODE.SELECT) {

        if(selectMode.checkState() == 0) {
            selectMode.selectHideUI();
        }else {
            selectMode.beginHideUI();
        }
    } else if (mode == ENUM_MODE.SUMMARY) {
        $('#btn_play_end').hide();
        $('#play_again_btn').hide();

    }
    $('.intro__footer-link--right ').hide();
    $('#dropdown_select_lang').hide();
}
