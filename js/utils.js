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

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function filterFloat(value) {
      if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
        .test(value))
        return Number(value);
    return 0;
}


function random(min, max) {

    return (min + Math.random() * (max - min) + 0.5) | 0;
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
}


function loadSvgImage(data, callback) {
  
    var DOMURL = window.URL || window.webkitURL || window;
    
    var img = new Image();
    
    var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var url = DOMURL.createObjectURL(svg);
    
    img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width  = img.width;
        canvas.height = img.height;    
        
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);
        
        callback(canvas);
    };
    
    img.src = url;
}

function encodeSvg(str) {
    return str.replace(/"/g,"'")
        .replace(/</g,"%3C")
        .replace(/>/g,"%3E")
        .replace(/&/g,"%26")
        .replace(/#/g,"%23");
}

function findAngle2pDeg(p1, p2) {
    var dy = p2.y - p1.y;
    var dx = p2.x - p1.x;
    var theta = Math.atan2(dy, dx);
    theta *= 180 / Math.PI; 
    return theta;
}

function findAngle2pDeg360(p1, p2) {
    var theta = findAngle2pDeg(p1, p2);
    if (theta < 0) theta = 360 + theta; 
    return theta;
}

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function lerp(value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
}

function splitText(str, regx) {  
    return str.split(regx);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
          callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

function getFullPathURL() {
    let port = window.location.port;
    let protocol = window.location.protocol;
    let domain_name =  window.location.hostname;
    let split_path =  window.location.pathname.split('index')[0];

    if (port != "") {
      port = ":" + port;
    }       

    return protocol + "//" + domain_name + port + split_path;
}

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}