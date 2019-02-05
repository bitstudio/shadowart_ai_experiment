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
 
function sprite (options) {
  let that = {},
      frameIndex = 0,
      tickCount = 0,
      ticksPerFrame = options.ticksPerFrame || 0,
      numberOfFrames = options.numberOfFrames || 1,
      isLastFrame = false;


    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.drawWidth = options.drawWidth;
    that.drawHeight = options.drawHeight; 
    that.x = 0;
    that.y = 0;
    that.image = options.image;
    that.scaleRatio = options.scale;
  
    that.setup = function() {            
        isLastFrame = false;
        frameIndex = 0;
    }

    that.update = function () {

            tickCount += 1;

            if (tickCount > ticksPerFrame) {

                tickCount = 0;

                if (frameIndex < numberOfFrames - 1) {
                    frameIndex += 1;
                    isLastFrame = false;
                } else {
                    //frameIndex = 0;
                    isLastFrame = true;
                }
            }
    };


    that.render = function () {
         that.context.drawImage(
                that.image,
                frameIndex * that.width / numberOfFrames,
                0,
                that.width / numberOfFrames,
                that.height,
                that.x,
                that.y,
                that.drawWidth,
                that.drawHeight);
    };


    that.isAnimStop = function() {
        return isLastFrame;
    };



    that.setPosition = function(x, y) {
            that.x = x;
            that.y = y;
    };

    that.getPosition = function() {
            return { x: that.x, y: that.y };
    };

    that.getSize = function() {
            return { width: that.width, height: that.height };
    };

  return that;

}
