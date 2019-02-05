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

function zodiac (params) {
    let that = { },
        canvas = params.canvas,
        image = params.image,
        image_black = params.image_black,
        image_play = params.image_play,
        img;
 
    that.sprite = params.sprite
    that.r = 60;    
    that.id = params.id;
    that.name = params.name;
    that.ctx = params.ctx;
    that.coord = params.coord;
    that.deg = params.deg;
    that.color = "gray";
    that.canvasWidth = canvas.width;
    that.canvasHeight = canvas.height;
    that.isActivated = false;
    that.scale = params.scale;


    that.init = function() {      
        canvas.addEventListener("mousedown", that.onClick, false);        
    };

    that.setup = function() {
        that.sprite.setup();
        that.setActivate(false);
        that.r * this.scale;
    };

    that.onUpdate = function(){
        that.sprite.update();
    };

    that.onDraw = function() {
        that.ctx.save();
        that.ctx.beginPath();
        that.ctx.translate(that.coord.x ,that.coord.y  )
        that.ctx.rotate((that.deg + 90)* Math.PI / 180);
        that.ctx.drawImage(img, -((image.width *  that.scale) / 2), - ((image.height *  that.scale) / 2), image.width * that.scale, image.height * that.scale); 
        that.ctx.closePath();
        that.ctx.restore();     
    };

    that.onDrawAnim = function() {    
        that.sprite.render();    
    };

    that.isAnimStop = function() {
        return  that.sprite.isAnimStop();
    };

    that.setPosition = function(x, y) {
        that.coord.x = x;
        that.coord.y = y;
    };

    that.setActivate = function(isActivated) {
        that.isActivated = isActivated;
        if(isActivated) {
            img = image_play;
        } else {
            img = image_black;
        }
    };

    that.setCompleted = function() {
        img = image;
    }

    that.setTriggerColor = function(color) {
        that.color = color;
    };

    that.onClick = function(e) {
        let mouseX = e.clientX;
        let mouseY = e.clientY;
        let isX = false, isY = false;
        
        if(mouseX >= Math.abs((that.coord.x + (that.canvasWidth / 4) - that.r)) && mouseX <= Math.abs((that.coord.x + (that.canvasWidth/ 4) + that.r ))) {
            isX = true;
        }
        if(mouseY >= Math.abs((that.coord.y + (that.canvasWidth / 4)- that.r)) && mouseY <= Math.abs((that.coord.y + (that.canvasWidth / 4) + that.r))) {
            isY = true;
        }
    
    };

    return that;
    
}