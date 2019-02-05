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
 
function PlayMode (EndMode) {
    let that = {};
    that.zodiacs = [];
    let endMode = EndMode;
   
    let zodiac_name = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
    let zodiac_position = [];

    let morp_contours;
    let live_contours;

    let first_play = false;
    let first_zodiac = 0;
    let zodiac_id = -99;
    let gameTimer = 20;
    let game_play_counter = 0;
    let timer = 0;
    let playTime = 0;
    let score = 0;
    let origin_pos = {x: 0, y: -290};

    let beginPlayAnim = 0;
    let timerAnim = 0;
    let timeAnim = 5;

    let beginFirstDone = 0;
    let timerFirstDone = 0;
    let timeFirstDone = 5;

    let threshold = 0.3;
    let threshold_for_first = 0.2;
    let confidence_val = 0;
    let isCaribrateCam = 0;

    let isPlaySound = false;
    
    let calibProgress = 0.0;
    let lastElapsedTimeAtNoneZeroCalibProgress = 0;
    let isCalibrateCompleted = false;

    var ENUM_STATE = {
        IDLE: 0,
        PLAY: 1,
        MORP: 2,
        PLAY_ANIM: 3,
        ROTATE: 4,
        END: 5,
        FIRST_DONE: 6
    };
    let spriteWidth = 0;
    let spriteHeight = 0;
    let spriteScale = 0;

    let state = ENUM_STATE.IDLE;

    var zodiac_sprite_img = new Array();
    var zodiac_play_img = new Array();
    var zodiac_img = new Array();
    var zodiac_black_img = new Array();
    var hand_guide_img = new Array();
    var zodiac_sound = new Array();
  
    let countTimeGamePlay = 0; 
    let beginTimerGamePlay = 0;

    // responsive stuff
    let canvas;
    let ctx;
    let scale;  
    let baseWidth = 3840 * 0.5;
    let baseHeight = 2160 * 0.5;
    let baseRatio = baseWidth/baseHeight;

    let wellDoneTextSize = 110 * 0.5;
    let wellDoneDescriptionTextSize = 90 * 0.5;
    let zodiacNameTextSize = 120 * 0.5;
    let timerLineWidth = 45 * 0.5;
    let moon_base_rad = 600 * 0.5;
    let calibrateMessageSize = 95 * 0.45;
    let zodiacPadSize = 120 * 0.5;
    
    
    let moveGradient_begin = 0 ;
    let moveGradient_timer = 2.0;
    let moveGradient_t = 0; 



    let moveGradient_cicle_begin = 0 ;
    let moveGradient_cicle_timer = 2;
    let moveGradient_cicle_t = 0; 

    let scale_shadow_art = 0.90;

    that.loadImageSource = function() {

        var queue = new createjs.LoadQueue();
        queue.on("fileload", handlePreloading, that);
        queue.on("complete", handlePreloadComplete, that);

        if(!mobileDevice) {
            if(lang === "zh-cn"){
                queue.loadManifest([
                    {id: "sprite_src", src: "js/manifest/common/zh-cn/zodiac_sprite.json", type: "manifest"},
                    {id: "img_color_src", src: "js/manifest/zodiac_color_image.json", type: "manifest"},
                    {id: "img_black_src", src: "js/manifest/zodiac_black_image.json", type: "manifest"},
                    {id: "img_play_src", src: "js/manifest/zodiac_play_image.json", type: "manifest"},
                    {id: "hand_guide_src", src: "js/manifest/hand_guide_image.json", type: "manifest"},
                    {id: "sound_src", src: "js/manifest/zodiac_sound.json", type: "manifest"}
                ], true);
                spriteWidth = 15300;
                spriteHeight = 300;
                spriteScale = (moon_base_rad * 2) / spriteHeight;
            } else {
                queue.loadManifest([
                    {id: "sprite_src", src: "js/manifest/common/en-us/zodiac_sprite.json", type: "manifest"},
                    {id: "img_color_src", src: "js/manifest/zodiac_color_image.json", type: "manifest"},
                    {id: "img_black_src", src: "js/manifest/zodiac_black_image.json", type: "manifest"},
                    {id: "img_play_src", src: "js/manifest/zodiac_play_image.json", type: "manifest"},
                    {id: "hand_guide_src", src: "js/manifest/hand_guide_image.json", type: "manifest"},
                    {id: "sound_src", src: "js/manifest/zodiac_sound.json", type: "manifest"}
                ], true);
                spriteWidth = 62500;
                spriteHeight = 500;
                spriteScale = (moon_base_rad * 2) / spriteHeight;
            }
        } else {
            if(lang === "zh-cn"){
                queue.loadManifest([
                    {id: "sprite_src", src: "js/manifest/mobile/zh-cn/zodiac_sprite.json", type: "manifest"},
                    {id: "img_color_src", src: "js/manifest/zodiac_color_image.json", type: "manifest"},
                    {id: "img_black_src", src: "js/manifest/zodiac_black_image.json", type: "manifest"},
                    {id: "img_play_src", src: "js/manifest/zodiac_play_image.json", type: "manifest"},
                    {id: "hand_guide_src", src: "js/manifest/hand_guide_image.json", type: "manifest"},
                    {id: "sound_src", src: "js/manifest/zodiac_sound.json", type: "manifest"}
                ], true);
                spriteWidth = 10200;
                spriteHeight = 200;
                spriteScale = (moon_base_rad * 2) / spriteHeight;
            } else {
                queue.loadManifest([
                    {id: "sprite_src", src: "js/manifest/mobile/en-us/zodiac_sprite.json", type: "manifest"},
                    {id: "img_color_src", src: "js/manifest/zodiac_color_image.json", type: "manifest"},
                    {id: "img_black_src", src: "js/manifest/zodiac_black_image.json", type: "manifest"},
                    {id: "img_play_src", src: "js/manifest/zodiac_play_image.json", type: "manifest"},
                    {id: "hand_guide_src", src: "js/manifest/hand_guide_image.json", type: "manifest"},
                    {id: "sound_src", src: "js/manifest/zodiac_sound.json", type: "manifest"}
                ], true);
                spriteWidth = 25000;
                spriteHeight = 200;
                spriteScale = (moon_base_rad * 2) / spriteHeight;
            }
        }
        function handlePreloading(event) {             
            $('#fade-wrapper').show();
        }  


        function handlePreloadComplete(event) {
            zodiac_sprite_img = that.swapToImageArray(queue.getResult("sprite_src").image, callback);
            zodiac_img = that.swapToImageArray(queue.getResult("img_color_src").image, callback);
            zodiac_black_img = that.swapToImageArray(queue.getResult("img_black_src").image, callback);
            zodiac_play_img = that.swapToImageArray(queue.getResult("img_play_src").image, callback);
            hand_guide_img = that.swapToStringArray(queue.getResult("hand_guide_src").image);
            if(isPlaySound)
                zodiac_sound = that.swapToAudioArray(queue.getResult("sound_src").sound);

            that.preCompute();

            mode = ENUM_MODE.SELECT;  
            let counter = 0;
            let img_total = zodiac_sprite_img.length + zodiac_img.length + zodiac_black_img.length + zodiac_play_img.length;
           
            function callback() {
                counter++;
                if (counter > img_total - 1){
                    $('#fade-wrapper').fadeOut();
                }     
            }          
                           
        }

    }


    that.swapToImageArray = function(array, callback ) {
        let target_array = new Array();
        let index = 0;
        array.forEach(element => {
            target_array[index] = new Image();
            target_array[index].onload = callback
            target_array[index].src =  element.src;
            index++;
        });

        return  target_array;
        
    }

    that.swapToStringArray = function (array) {
        let target_array = new Array();
        let index = 0;
        array.forEach(element => {
            target_array[index] =  element.src;
            index++;
        });

        return  target_array;
        
    }

    that.swapToAudioArray = function (array) {
        let target_array = new Array();
        let index = 0;
        array.forEach(element => {
            target_array[index] = new Audio(element.src);
            index++;
        });

        return  target_array;
        
    }

    that.preLoader = function() {  
        that.loadImageSource();    
    }

    that.preCompute = function(){
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        
        that.resizeWindow();
        
        degree = -90;

        let zodiac_count = 0;

        while(zodiac_count < 12) {

            zodiacPosX =  parseFloat(Math.cos(degree * (Math.PI / 180.0)))
            zodiacPosY =  parseFloat(Math.sin(degree * (Math.PI / 180.0)))

            zodiac_position.push(moon_rad * filterFloat(zodiacPosX));
            zodiac_position.push(moon_rad * filterFloat(zodiacPosY));
            let coord = { x: (moon_rad + (70 * scale))*  filterFloat(zodiacPosX), y: (moon_rad + (70 * scale)) * filterFloat(zodiacPosY) };
            
            let zodiac_sprite = new sprite({
                context: ctx,
                width: spriteWidth,
                height: spriteHeight,
                image: zodiac_sprite_img[zodiac_count],
                numberOfFrames: spriteWidth / spriteHeight,
                ticksPerFrame: 1,
                scale: spriteScale
                
            });

            that.zodiacs.push(new zodiac({
                canvas: canvas, 
                ctx: ctx, 
                id: zodiac_count,coord: coord, 
                sprite: zodiac_sprite, 
                image: zodiac_img[zodiac_count],
                image_play: zodiac_play_img[zodiac_count],
                image_black: zodiac_black_img[zodiac_count],
                name: zodiac_name[zodiac_count], 
                deg: degree,
                scale: scale
            }));
        
            that.zodiacs[zodiac_count].init();
            that.zodiacs[zodiac_count].setup();
        
            degree += 30.0;

            zodiac_count++;

        }
        origin_pos = {x: that.zodiacs[0].coord.x, y: that.zodiacs[0].coord.y};    
        
    }

  
   
    that.resizeWindow = function() {
        canvas.width = window.innerWidth*devicescreenratio;
        canvas.height = window.innerHeight*devicescreenratio;

        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        
        ctx.setTransform(devicescreenratio, 0, 0, devicescreenratio, 0, 0);

        width = window.innerWidth;
        height = window.innerHeight;
        
        c = {x: width / 2.0, y: height / 2.0 };
        degree = -90;

        scale = width / height > baseRatio ?  height / baseHeight :  width / baseWidth;

        let resizeMoonRad = moon_base_rad * scale;
        moon_rad = resizeMoonRad ;
    }


    that.initZodiac = function(id) {
        first_zodiac = id;
        zodiac_id = id;
        first_play = true;
        for(var i = 0; i < that.zodiacs.length;i++) {
            that.zodiacs[i].setActivate(false);
        }
        that.zodiacs[zodiac_id].setActivate(true);

        let step_temp = that.zodiacs.length  -  zodiac_id;
        let step_deg = (step_temp ) * 30;
       
        let degree_temp = (step_deg - 90);

     
       for(var i = 0; i < that.zodiacs.length; i++) {
            zodiacPosX =  parseFloat(Math.cos( degree_temp * (Math.PI / 180.0)))
            zodiacPosY =  parseFloat(Math.sin( degree_temp * (Math.PI / 180.0)))

            let coord = { x: (moon_rad + (zodiacPadSize * scale))*  filterFloat(zodiacPosX), y: (moon_rad + (zodiacPadSize * scale)) * filterFloat(zodiacPosY) };
   
            that.zodiacs[i].setPosition(coord.x  ,coord.y);
            that.zodiacs[i].deg =  degree_temp
            degree_temp +=30;
               
        }
    }

    that.updateZodiac = function() {
        for(var i = 0; i < that.zodiacs.length; i++) {
            zodiacPosX =  parseFloat(Math.cos( that.zodiacs[i].deg  * (Math.PI / 180.0)))
            zodiacPosY =  parseFloat(Math.sin( that.zodiacs[i].deg  * (Math.PI / 180.0)))

            let coord = { x: (moon_rad + (zodiacPadSize * scale))*  filterFloat(zodiacPosX), y: (moon_rad + (zodiacPadSize * scale)) * filterFloat(zodiacPosY) };
   
            that.zodiacs[i].setPosition(coord.x  ,coord.y);
            that.zodiacs[i].scale = scale;
            that.zodiacs[i].sprite.drawWidth = moon_rad*2;
            that.zodiacs[i].sprite.drawHeight = moon_rad*2;
        }
    }
    
    that.setup = function (){

        state = ENUM_STATE.IDLE;
        isCalibrateCompleted = false;
        playTime = getElapsedTimeSeconds();

        document.getElementById("sample_container").style.display = "none";
        document.getElementById("sample_container").style.height = "0px";       
        
        that.resizeWindow();
      

        mode = ENUM_MODE.PLAY;
    
        var loop_duration = 2;
        var total_loop = 1;
        var FPS = 30;
        var width = moon_rad * 2;
        var height = moon_rad * 2;
        var confident;

        var controls = init_preprocessing(parseInt($(window).width() / 3 - 120), $('#display_container'), $('#sample_container'), function(contour_obj){
            var nps = contour_obj.set_canvas(0, 0, width, height, 256); 
            
            if(state == ENUM_STATE.PLAY) {
                confident = that.compareConfident(contour_obj, zodiac_id);
            }
            
            prepare_morph(nps, contour_obj["class"][confident.id], 0, 0, moon_rad*2, moon_rad*2, function(morph_object) { 
                var start_time = Date.now();
                var loop_count = 0;
                
                function captureContours() {
                    
                    let begin = Date.now();
                    let elapsed = (Date.now() - start_time)/1000.0;
                                
                    if(confident.result) {
                        morp_contours = morph_object(elapsed * 2.0 / loop_duration - 1.0);
                        that.zodiacs[zodiac_id].setCompleted();
                        state = ENUM_STATE.MORP;  
                        
                    } 
                    
                    if(elapsed > loop_duration) {
                        loop_count = loop_count + 1;
                        start_time = Date.now();
                        
                        if(confident.result) {                
                            beginPlayAnim = getElapsedTimeSeconds();
                            state = ENUM_STATE.PLAY_ANIM;                           
                        }
                    }

                    if(loop_count < total_loop)
                    {
                        let delay = 1000 / FPS - (Date.now() - begin);
                        setTimeout(captureContours, delay);
                    }
                
                }
                
                if(state === ENUM_STATE.PLAY) {            
                    setTimeout(captureContours, 0);
                    
                    moveGradient_begin = getElapsedTimeSeconds();    
                    moveGradient_cicle_begin = getElapsedTimeSeconds();                  
                }

            });

        
        }, function(contour_obj) {
            if(!contour_obj) return;

            isCaribrateCam = isCaribrateCam + 1;
            if (isCaribrateCam == 1) {
                state = ENUM_STATE.PLAY;
                playTime = getElapsedTimeSeconds();
            }

            if (state === ENUM_STATE.PLAY || ENUM_STATE.PLAY_ANIM) {
                live_contours = contour_obj.set_canvas(0, 0, moon_rad*2, moon_rad*2);
                $("#hand_guide_diagram").attr("src", hand_guide_img[zodiac_id]);
                $("#calibrate_message").hide();
            }
        }, function(percent) {
            if(isCalibrateCompleted) return;
            calibProgress = percent;
            if(percent > 0.0){
                // lastElapsedTimeAtNoneZeroCalibProgress  = getElapsedTimeSeconds();
                if(percent >= 1.0){
                    $("#calibrate_message").html('');//Calibration Complete!
                    isCalibrateCompleted = true;
                }
                else $("#calibrate_message").html($.i18n('calibrating_copy'));
            }else {
                // let timeBack = 1;
                // let calibFailElapsedTime =  (getElapsedTimeSeconds() - lastElapsedTimeAtNoneZeroCalibProgress);
                // calibProgress = calibFailElapsedTime >= timeBack ? 0.0 : calibProgress*(timeBack-calibFailElapsedTime)/timeBack;
                $("#calibrate_message").html($.i18n('keep_clear_copy'));
            }
            
        });

        init_shadow();
        init_morph();

        if(iOS || isSafari) {
            setTimeout(function(){
                controls.reset_camera();
            }, 2000);
            
        }
    }


    that.compareConfident = function(ml_result, id) {
        let raw_score;
        let raw_id;

        for(var i = 0; i < ml_result["class"].length; i++) {
            if(id + 1 ==  ml_result["class"][i]) {
                raw_id = i;
                raw_score =  ml_result["score"][raw_id];  
            }
        }

        confidence_val = raw_score * 100;

        if(id == first_zodiac) {
            if (raw_score > threshold_for_first) {  
                score = score + 1;                                       
                return {result: true, id: raw_id};
            }
        }

        if (raw_score > threshold) {   
            score = score + 1;                                        
            return {result: true, id: raw_id};
        }

        return {result: false, id: 0};
    }


    let timeBeginRotate = 0;
    let timeRotateTimer = 0;
    let timeToRotate = 2;
    
    

    that.update = function(){
      
        that.resizeWindow();
        that.gameControl();
        that.updateZodiac();
        $("#calibrate_message").css({width: moon_rad * 2, height: moon_rad * 2});
    }

    that.gameControl = function () {    
        countTimeGamePlay = getElapsedTimeSeconds() - beginTimerGamePlay;
        if (state === ENUM_STATE.PLAY) {
            if(zodiac_id == first_zodiac)
                return;

           
            timer = getElapsedTimeSeconds() - playTime;
            timer = gameTimer - timer;   
            
            if (timer <= 0 ) {
                mode = ENUM_MODE.SUMMARY;
                endMode.setResults(first_zodiac, score, countTimeGamePlay);
                that.hideUI();           
               
            }

        } else if (state === ENUM_STATE.PLAY_ANIM) {
            if(isPlaySound)
                zodiac_sound[zodiac_id].play();

            timerAnim = getElapsedTimeSeconds() - beginPlayAnim;
            that.zodiacs[zodiac_id].onUpdate();
        
            if (that.zodiacs[zodiac_id].isAnimStop()) {
                loop_gradient_count = 0;
                zodiac_id = zodiac_id + 1;                
                if(zodiac_id < 0) {
                    zodiac_id = that.zodiacs.length - 1;
                }
                if (zodiac_id > that.zodiacs.length - 1) {
                    zodiac_id = 0;
                }
                
                that.zodiacs[zodiac_id].setActivate(true);
                that.nextZodiac(zodiac_id);
            }

        } else if (state === ENUM_STATE.ROTATE) {
            that.rotateCW();
        } else if (state === ENUM_STATE.FIRST_DONE) {
            timerFirstDone = getElapsedTimeSeconds() - beginFirstDone;

            if(timerFirstDone > timeFirstDone) {
                playTime = getElapsedTimeSeconds();
                beginTimerGamePlay = getElapsedTimeSeconds();
                state = ENUM_STATE.PLAY;  
                first_play = false;
            } 
        }
    } 

    that.nextZodiac = function(id) {
        game_play_counter = game_play_counter + 1;
        zodiac_id = id;
        playTime = getElapsedTimeSeconds();  
        timer = 0;  
        
        var check_first_zodiac = function() {
            if(first_play) {
                state = ENUM_STATE.FIRST_DONE;
                beginFirstDone = getElapsedTimeSeconds();
               
            } else {
                state = ENUM_STATE.PLAY;   
            }
        }

        var check_play_end = function() {
            if(game_play_counter > (that.zodiacs.length - 1)) {
                mode = ENUM_MODE.SUMMARY;
                endMode.setResults(first_zodiac, score, countTimeGamePlay);
                that.hideUI();        
            }
        }         
   
        check_first_zodiac();             
        check_play_end();
        that.showHandGuide();      

    }

    that.showHandGuide = function() {
        $("#hand_guide_diagram").attr("src", hand_guide_img[zodiac_id]);

    }

    that.rotateCW =  function() {
        timeRotateTimer = getElapsedTimeSeconds() - timeBeginRotate;
        
        if ((Math.floor(that.zodiacs[zodiac_id].coord.x) >= origin_pos.x) && (Math.floor(that.zodiacs[zodiac_id].coord.y) >= origin_pos.y)){
            setZodiacDeg();
            that.zodiacs[zodiac_id].setActivate(false);
            playTime = getElapsedTimeSeconds();  
            timer = 0;    
            state = ENUM_STATE.PLAY;
        } else {
            state = ENUM_STATE.ROTATE;
            animate(timeRotateTimer);      
        }
        
    }

    that.resetState = function() {
        timer = 0;
        game_play_counter = 0;
        for(var i = 0; i < that.zodiacs.length;i++) {
            that.zodiacs[i].setActivate(false);
            that.zodiacs[i].setup();
        }
        that.initZodiac(0);
    }

    that.draw = function() {
        that.drawRayShadowBg();
        that.drawShadowArtText();
        that.drawMoon();
        that.drawZodiacs();
        that.drawText();
     
        if(state === ENUM_STATE.IDLE ) {
            that.drawCalibProgress(isCalibrateCompleted ? 1.0 : calibProgress);
        }
        if (state === ENUM_STATE.PLAY) {       
            if(!first_play) {
                that.drawTimerProgress(timer);
            }       
        }

        if(state === ENUM_STATE.MORP || state === ENUM_STATE.PLAY_ANIM) {
            that.drawTimerProgressMorpState(-90 )
        }
    
    }

    let loop_gradient_total = 1;    
    let loop_gradient_count = 0;

    that.drawRayShadowBg = function() {
        $('#canvasOutput').width(moon_rad*2);
        $('#canvasOutput').height(moon_rad*2);
        $('#hand_guide_diagram').width(moon_rad*2);
        $('#hand_guide_diagram').height(moon_rad*2);
        $('#calibrate_message').width(moon_rad*2);
        $('#calibrate_message').height(moon_rad*2);
        $("#calibrate_message").css({ 'font-size': calibrateMessageSize* scale});        
        $('#display_container ').offset({top: Math.round(c.y - moon_rad ), left: Math.round(width - width / 4 - moon_rad)});
        $('#canvasOutput ').offset({top: Math.round(c.y - moon_rad), left: Math.round(width - width / 4 - moon_rad)});
        $('#out_line_diagrame ').offset({top: Math.round(c.y - moon_rad) , left:Math.round( width - width / 4 - moon_rad) });
    
   
        ctx.save();      
        ctx.drawImage(bg_img, 0, 0, width, height);
        ctx.restore(); 

        var on_morph_gradient = function(norm_t) {     
            ctx.save();
            ctx.translate(c.x / 2, c.y);
            // ctx.fillStyle = "rgba(196, 195, 181, 0.5)";
            let grd = ctx.createLinearGradient(-moon_rad, 0, (width - width / 2) + (moon_rad * 0.65), 0);
            
            grd.addColorStop(clamp(norm_t - 0.2, 0,  1), 'rgba(255, 228, 184, 0.5)');
            grd.addColorStop(clamp(norm_t, 0,  1), 'rgba(255, 255, 255, 0.1)');
            grd.addColorStop(clamp(norm_t + 0.2, 0,  1), 'rgba(255, 228, 184, 0.5)');

            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(0, 0, moon_rad  , 0 , 2* Math.PI);
            ctx.moveTo(0, -moon_rad );
            ctx.lineTo(width - width / 2 , -moon_rad * 0.65);
            ctx.arc(width - width / 2  , 0 ,  moon_rad * 0.65 , Math.PI ,  Math.PI / 2);
            ctx.lineTo(0, moon_rad );    
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };

        var on_idle_gradient = function() {
            ctx.save();
            ctx.translate(c.x / 2, c.y);
            ctx.fillStyle = 'rgba(160, 56, 57, 0.1)';
            ctx.beginPath();
            ctx.arc(0, 0, moon_rad  , 0 , 2* Math.PI);
            ctx.moveTo(0, -moon_rad );
            ctx.lineTo(width - width / 2 , -moon_rad * 0.65);
            ctx.arc(width - width / 2  , 0 ,  moon_rad * 0.65 , Math.PI ,  Math.PI / 2);
            ctx.lineTo(0, moon_rad );    
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };
    

        on_idle_gradient();

        if(state === ENUM_STATE.MORP || state === ENUM_STATE.PLAY_ANIM) {

            moveGradient_t = getElapsedTimeSeconds() - moveGradient_begin;
            let norm_t = ( moveGradient_timer - moveGradient_t ) / moveGradient_timer;
        

            on_morph_gradient(norm_t);

            if(norm_t < 0) {
                if(loop_gradient_count < loop_gradient_total) {
                    moveGradient_begin = getElapsedTimeSeconds();  
                    loop_gradient_count++ 
                }
            }

        }

  
    }

    
    that.drawShadowArtText = function() {
        ctx.save();
        ctx.translate(width*0.02, height*0.02);
        ctx.drawImage(shadowArtTextImg, 0  ,0, shadowArtTextImg.width * scale * scale_shadow_art,  shadowArtTextImg.height * scale* scale_shadow_art); 
        ctx.restore();
    }


    that.drawMoon = function() {
        ctx.save();
        ctx.translate(c.x / 2, c.y);
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(0, 0, moon_rad, 0 , 2* Math.PI);
        ctx.clip();
        ctx.fill();
        if(state == ENUM_STATE.MORP ) {
            if(morp_contours) {   
                ctx.save();            
                ctx.translate(-moon_rad, - moon_rad);            
                that.drawContour(morp_contours);
                ctx.restore();
            }
        } 

        if(state == ENUM_STATE.PLAY) {
            if(live_contours) {   
                ctx.save();            
                ctx.translate(-moon_rad, - moon_rad);            
                that.drawContour(live_contours);
                ctx.restore();
            }
        } 
        
        if (state == ENUM_STATE.PLAY_ANIM) {
            ctx.save();
            ctx.translate(-moon_rad, - moon_rad);
            that.zodiacs[zodiac_id].onDrawAnim();
            ctx.restore();            
        }   

        if (state == ENUM_STATE.FIRST_DONE) {
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(0, 0, moon_rad, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
         
            let h = wellDoneTextSize * scale;
            let line_h = h;

            let str_array = splitText($.i18n('own_zodiac_completion'), "|");

            if(str_array) {
                let origin_ = -1;
                for(var i = 0;i < str_array.length; i++) {
                    if(i == 0) {
                        ctx.font = h +"px " + $.i18n('fonts_primary');
                        ctx.fillStyle ='rgb(160, 56, 57)';           
                        ctx.textAlign = "center";   
                        ctx.fillText(str_array[0], 0, line_h * origin_);                
                    } else {
                        h = wellDoneDescriptionTextSize *scale;
                        ctx.font = h + "px " + $.i18n('fonts_primary');
                        ctx.fillStyle ='rgb(160, 56, 57)';           
                        ctx.textAlign = "center";

                        ctx.fillText(str_array[i], 0, line_h * origin_);
                        
                    }
                    origin_ += 1.0;
                  
                }
            }    
            

        } 
       
        ctx.restore();


        var fill_circle_live_feed = function() {     
            ctx.save();
            ctx.translate(c.x +  (c.x / 2), c.y);
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(0, 0, moon_rad, 0 , 2* Math.PI);
            ctx.clip();
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        };

        fill_circle_live_feed();

    }

    that.drawZodiacs = function() {
        ctx.save();
        ctx.translate(c.x / 2, c.y);

        for (var i = 0; i < that.zodiacs.length ; i++) {
        that.zodiacs[i].onDraw();
        }
        ctx.restore();

    }


    that.drawContour = function(contours) {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(contours[0][0], contours[0][1]);
        for(var i = 1; i < contours.length; ++i) {
            ctx.lineTo(contours[i][0], contours[i][1]);
        }
        ctx.lineTo(contours[0][0], contours[0][1]);
        ctx.closePath();
        ctx.fill();
    }


    that.drawText =function() {
        let zodiac = zodiac_text_list[zodiac_id];
      
        ctx.save();
        ctx.translate(width - width / 4, c.y - moon_rad - 100 * scale);
        ctx.beginPath();

        ctx.font = zodiacNameTextSize*scale + "px " + $.i18n('fonts_primary');
        ctx.fillStyle ='rgb(160, 56, 57)';    
        ctx.textAlign = "center";
        ctx.fillText(zodiac,0, 0);   
        ctx.fill();       
        ctx.font = "20px " + $.i18n('fonts_primary');
        ctx.fillStyle ='rgb(172, 102, 82)';       
        ctx.fill();    
        ctx.closePath();
        ctx.restore();    
    }

    that.drawCalibProgress = function(t) {
        ctx.lineCap = 'round'; 
        let deg_ = t * 360;
        ctx.save();
        ctx.translate(c.x + (c.x / 2), c.y);
        ctx.beginPath();
        // ctx.globalAlpha = 0.1;
        ctx.strokeStyle = 'rgba(160, 56, 57, 0.1)';
        ctx.lineWidth = timerLineWidth * scale;
        ctx.arc(0, 0, (moon_rad) + timerLineWidth * scale * 0.5,  (Math.PI/180) * 270, (Math.PI/180) * (270 + deg_ + 0.1)); 
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

    }

    that.drawTimerProgress = function(t) {
        ctx.lineCap = 'round'; 
        let rate = t / gameTimer;
        let deg_ = rate * 360;
        ctx.save();
        ctx.translate(c.x + (c.x / 2), c.y);
        ctx.beginPath();
        ctx.strokeStyle = '#A05540';
        ctx.lineWidth = timerLineWidth * scale;
        ctx.arc(0, 0, (moon_rad) + timerLineWidth * scale * 0.5,  (Math.PI/180) * 270, (Math.PI/180) * (270 - (deg_ )));
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

    }

    that.drawTimerProgressMorpState = function(t) {
        ctx.lineCap = 'round'; 
        let rate = t / moveGradient_cicle_t;
        let deg_ = rate * 360;
        ctx.save();
        ctx.translate(c.x + (c.x / 2), c.y);
        ctx.beginPath();
        ctx.strokeStyle = '#FFE4B8';
        ctx.lineWidth = timerLineWidth * scale;
        ctx.arc(0, 0, (moon_rad) + timerLineWidth * scale * 0.5,  (Math.PI/180) * 270, (Math.PI/180) * (270 - (deg_ )));
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

    that.animate = function(t) {
        let linearSpeed =  100;
        
        for(var i = 0; i < that.zodiacs.length; i++) {
            
            let newPosX = ((moon_rad + 10) + that.zodiacs[i].r) * Math.cos((that.zodiacs[i].deg * (Math.PI / 180.0)) + (t * linearSpeed) * (Math.PI / 180.0)) ;
            let newPosY = ((moon_rad + 10) + that.zodiacs[i].r) * Math.sin((that.zodiacs[i].deg  * (Math.PI / 180.0))  + (t * linearSpeed) * (Math.PI / 180.0));
            
            that.zodiacs[i].setPosition(Math.round(newPosX)  , Math.round(newPosY));
            
        }
    }


    that.setZodiacDeg = function() {
        that.zodiacs[0].deg += 30;
        that.zodiacs[1].deg += 30;
        that.zodiacs[2].deg += 30;
        that.zodiacs[3].deg += 30;
        that.zodiacs[4].deg += 30;
        that.zodiacs[5].deg += 30;
        that.zodiacs[6].deg += 30;
        that.zodiacs[7].deg += 30;
        that.zodiacs[8].deg += 30;
        that.zodiacs[9].deg += 30;
        that.zodiacs[10].deg += 30;
        that.zodiacs[11].deg += 30;
    }

    that.hideUI = function() {
        $('#canvasOutput').hide();
        $('#hand_guide_diagram').hide();
        $('#calibrate_message').hide(); 
        $('#display_container ').hide();
        $('#out_line_diagrame ').hide();
    }


    that.showUI = function() {
        $("#calibrate_message").show();
        $('#canvasOutput').show();
        $('#hand_guide_diagram').show();
        $('#calibrate_message').show();  
        $('#display_container ').show();
        $('#out_line_diagrame ').show();
        $('#calibrate_message').css({ position: 'none' , bottom: 0, left: 0});;
    }
    
    return that;
}