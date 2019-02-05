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

let starttime = 0
let canvas;
var zodiac_message_list = [];
var zodiac_text_list = [];
var proverbs = [];
var localization_list = ['en-us', 'zh-cn', 'zh-hk', 'zh-tw', 'ko', 'ja','th', 'id', 'ms', 'es', 'pt-br'];
var lang;

$(document).ready(function() { 
    $("#fade-wrapper").show();
 
    canvas = createHiResCanvas(window.innerWidth, window.innerHeight); 
	var parent = document.getElementsByClassName("my-container")[0];
    parent.parentNode.insertBefore(canvas, parent);
    let getLang = () => (navigator.language || navigator.browserLanguage || (navigator.languages||[ "en" ])[0]).split(/[_-]/)[0].toLowerCase()
    let language = window.navigator.languages[0];
    
    if(getParameterByName("lang", document.location.href) == null) {
        if(localization_list.indexOf(language.toLocaleLowerCase()) > - 1) {                
            lang = language.toLocaleLowerCase(); 
        } else {
            lang = localization_list[0];                 
        }  
        document.location.href = window.location.href.toString().split("?")[0] + "?lang=" + lang;
    } else {
        lang = getParameterByName("lang", document.location.href);
        
        if(localization_list.indexOf(lang.toLocaleLowerCase()) < 0) {
            lang = "en-us";
            document.location.href = window.location.href.toString().split("?")[0] + "?lang=" + lang;          
        }          
    }

    
    $.i18n().load(
	{
		"en-us": 'localization/en-us.json',
        "zh-cn": 'localization/zh-cn.json',
        "zh-hk": 'localization/zh-hk.json',
        "zh-tw": 'localization/zh-tw.json',
        "es": 'localization/es.json',
        "ms": 'localization/ms.json',
        "pt-br": 'localization/pt-br.json',
        "ko": 'localization/ko.json',
        "id": 'localization/id.json',
        "th":'localization/th.json',
        "ja": 'localization/ja.json'
       
    }).done(
       
		function () {
           
    
            $.i18n().locale = lang;

            zodiac_message_list = [
                $.i18n('animal_rat'),
                $.i18n('animal_ox'),
                $.i18n('animal_tiger'),
                $.i18n('animal_rabbit'),
                $.i18n('animal_dragon'),
                $.i18n('animal_snake'),
                $.i18n('animal_horse'),
                $.i18n('animal_goat'),
                $.i18n('animal_monkey'),
                $.i18n('animal_rooster'),
                $.i18n('animal_dog'),
                $.i18n('animal_pig')
            ];    
            
            zodiac_text_list = [
                $.i18n('animal_text_rat'),
                $.i18n('animal_text_ox'),
                $.i18n('animal_text_tiger'),
                $.i18n('animal_text_rabbit'),
                $.i18n('animal_text_dragon'),
                $.i18n('animal_text_snake'),
                $.i18n('animal_text_horse'),
                $.i18n('animal_text_goat'),
                $.i18n('animal_text_monkey'),
                $.i18n('animal_text_rooster'),
                $.i18n('animal_text_dog'),
                $.i18n('animal_text_pig')
            ]; 
            
            
            proverbs = [
                $.i18n('fail_states_rat'),
                $.i18n('fail_states_ox'),     
                $.i18n('fail_states_tiger'),
                $.i18n('fail_states_rabbit'),
                $.i18n('fail_states_dragon'),
                $.i18n('fail_states_snake'),
                $.i18n('fail_states_horse'),
                $.i18n('fail_states_goat'),
                $.i18n('fail_states_monkey'),
                $.i18n('fail_states_rooster'),
                $.i18n('fail_states_dog'),
                $.i18n('fail_states_pig')
            ];
            
            $("#btn_play").css({'background-image': 'url('+$.i18n('btn_play') +')'});
            $("#btn_next").css({'background-image': 'url('+$.i18n('btn_next') +')'});
            $("#btn_begin").css({'background-image': 'url('+$.i18n('btn_begin') +')'});
            $("#play_again_btn").css({'background-image': 'url('+$.i18n('btn_play_again') +')'});
            $("#btn_play_end").css({'background-image': 'url('+$.i18n('btn_play') +')'});
            $("#calibrate_message").html($.i18n('calibrating_copy'));
            $("#calibrate_message").css({'font-family': $.i18n('fonts_primary')});
            $("#zodiac_text").html($.i18n('btn_name_zodiac'));
            $("#zodiac_text").css({'font-family': $.i18n('fonts_primary')});
            $("#year_text").css({'font-family': $.i18n('fonts_primary')});
            $("#loading_img").attr('src', $.i18n('loading'));
            $("#btn_select_zodiac").css({'background-image':  'url('+ $.i18n('btn_next') +')'});
            // $(".zodiac-ic-name").css({'font-family': $.i18n('fonts_primary')}) ;     
                      
            setTimeout( function()   { 
                $("#fade-wrapper").fadeOut();
                gameLoop(new Date().getTime());  
                hideUI();
                setup();  
            
            }, 1000);

            
        }
        
    );

    (function() {
         
          let lastTime = 0;
          const vendors = ['ms', 'moz', 'webkit', 'o'];
          for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
              window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
              window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                         || window[vendors[x]+'CancelRequestAnimationFrame'];
          }

          if (!window.requestAnimationFrame)
              window.requestAnimationFrame = function(callback, element) {
                  let currTime = new Date().getTime();
                  let timeToCall = Math.max(0, 16 - (currTime - lastTime));
                  let id = window.setTimeout(function() { callback(currTime + timeToCall); },
                   timeToCall);
                  lastTime = currTime + timeToCall;
                  return id;
              };

          if (!window.cancelAnimationFrame)
              window.cancelAnimationFrame = function(id) {
                  clearTimeout(id);
              };
    }());
    setSelectOptionsLanguage();
    selectLanguageListener();
});


let timestamp = 0;
let elapsedtimeseconds = 0;
let video;

function gameLoop (timestamp) {
    timestamp = timestamp || new Date().getTime();
    let runtime = timestamp - starttime;
    elapsedtimeseconds = runtime / 1000;

    update();
    draw();

    window.requestAnimationFrame(function (timestamp) {
        gameLoop(timestamp)
    })

}

function getElapsedTimeSeconds() {
    return elapsedtimeseconds;
}

function getPixelRatio(){
	var ctx = document.createElement("canvas").getContext("2d"),
		dpr = window.devicePixelRatio || 1,
		bsr = ctx.webkitBackingStorePixelRatio ||
			ctx.mozBackingStorePixelRatio ||
			ctx.msBackingStorePixelRatio ||
			ctx.oBackingStorePixelRatio ||
			ctx.backingStorePixelRatio || 1;
	return dpr / bsr;
}

function createHiResCanvas(w, h, ratio) {
	if (!ratio) { ratio = getPixelRatio(); }

  	devicescreenratio = ratio;
	var can = document.createElement("canvas");
	can.setAttribute("id", "canvas");
	
	can.width = w * ratio;
	can.height = h * ratio;
	
	can.style.width = w + "px";
	can.style.height = h + "px";
	can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
	return can;
}

function selectLanguageListener() {
    $('#dropdown_select').change(function(){ 
        var value = $(this).val();
        window.location = window.location.href.toString().split("?")[0] + "?lang=" + value;
        setTimeout(function(){
            location.reload();
        }, 500);               
    });
}

function setSelectOptionsLanguage() {
    $("#dropdown_select").val(lang);
}