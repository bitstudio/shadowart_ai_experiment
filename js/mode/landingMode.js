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

function LandingMode (playMode) {
    let that = {};
    let btn_size = 297 * 0.5;   
    let text_size = 80 * 0.5;   
    let dropdown_select_lang_w = 200;
    let dropdown_select_lang_h = 45;

    let canvas;
    let ctx;
    let badgeImg;
    let scale;
    let intro_sptire;
    let spriteIntroImg;
    let intro_sprite_w = 830;
    let circle_mask_intro = intro_sprite_w*0.5  ;
    let header_scale = 0.1;
    
    
    that.resizeWindow = function() {
        width = window.innerWidth;
        height = window.innerHeight;
        
        canvas.width = width*devicescreenratio;
        canvas.height = height*devicescreenratio;
        
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        
        canvas.getContext("2d").setTransform(devicescreenratio, 0, 0, devicescreenratio, 0, 0);
        
        c = {x: width / 2.0, y: height / 2.0 };
        degree = -90;

        scale = width / height > 1.77778 ?  height / (2160 * 0.5) :  width / (3840 * 0.5);
    }


    that.setup = function () {
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        that.showUI();

        headerImg = new Image();
        headerImg.onload = function() {};
        headerImg.src = $.i18n('header_img');
       
        badgeImg = new Image();
        badgeImg.onload = function() {};
        badgeImg.src = "content/ui/ai_experiment.svg";

        shadowArtTextImg = new Image();
        shadowArtTextImg.onload = function(){}
        shadowArtTextImg.src = "content/ui/shadow_art.png";

        shadowCircleImg = new Image();
        shadowCircleImg.onload = function(){}
        shadowCircleImg.src = "content/ui/circle_shadow_art.png";

        if(lang === "zh-cn") {
            spriteIntroImg = new Image();
            spriteIntroImg.onload = function(){
                intro_sptire = new sprite({
                    context: ctx,
                    width: this.width,
                    height: this.height,
                    drawWidth: intro_sprite_w,
                    drawHeight: intro_sprite_w,
                    image: spriteIntroImg,
                    numberOfFrames: this.width / this.height,
                    ticksPerFrame: 2,
                    scale: 1.0
                })
            }
            spriteIntroImg.src = "content/ui/zh-cn/instruction_4s.png";       
        }else {
            spriteIntroImg = new Image();
            spriteIntroImg.onload = function(){
            
                intro_sptire = new sprite({
                    context: ctx,
                    width: this.width,
                    height: this.height,
                    drawWidth: intro_sprite_w,
                    drawHeight: intro_sprite_w,
                    image: spriteIntroImg,
                    numberOfFrames: this.width / this.height,
                    ticksPerFrame: 2,
                    scale: 1.0
                })
                
            }
            spriteIntroImg.src = "content/ui/en-us/instruction_5s.png";  
        }
       


        that.setOnJqueryClickListener(); 

    }  

    that.setResultImage = function(id, score) {
        shadowCircleImg = new Image();
        shadowCircleImg.onload = function(){}
        shadowCircleImg.src = "content/ui/circle_02.png";
    }

    that.update = function() {
        that.resizeWindow();

        
        let btn_scaled_size = btn_size * scale 
        
        let btn_play_pos_x =  width * 0.96 - btn_scaled_size;
        let btn_play_pos_y =   height * 0.92  - btn_scaled_size

        $('#btn_play').width(btn_scaled_size);
        $('#btn_play').height(btn_scaled_size);
        $('#btn_play').offset({top:  btn_play_pos_y , left: btn_play_pos_x});
      
        let scaled_dropdown_select_lang_w = dropdown_select_lang_w * scale;
        let scaled_dropdown_select_lang_h  = dropdown_select_lang_h * scale;
        $('#dropdown_select_lang').width(scaled_dropdown_select_lang_w);
        $('#dropdown_select_lang').height(scaled_dropdown_select_lang_h);
        $('#dropdown_select_lang').offset({top:  btn_play_pos_y + btn_scaled_size*0.5 - scaled_dropdown_select_lang_h * 0.5, left: btn_play_pos_x  - scaled_dropdown_select_lang_w*1.1 });

        let privacy_link_w = $('.intro__footer-link--right').width();
        $('.intro__footer-link--right').offset({top:  btn_play_pos_y + btn_scaled_size * 0.5 + scaled_dropdown_select_lang_h * 0.5, left: btn_play_pos_x - scaled_dropdown_select_lang_w*1.1});   
        
        if(intro_sptire) {
            intro_sptire.update();
        }
        // $('#btn_practice').width(btn_scaled_size);
        // $('#btn_practice').height(btn_scaled_size);
        // $('#btn_practice').offset({top: height*0.96 - btn_scaled_size, left: width- 80* scale  - (btn_scaled_size * 0.5)});
    }

    that.draw = function() {
        that.drawBg();
        that.drawShadowCircle();
        that.drawBadge();
        that.drawDescriptionText();
    }

    that.drawBg = function() {   
        ctx.save();      
        ctx.drawImage(bg_img, 0, 0, width, height);
        ctx.restore();    
    }

    that.drawBadge = function() {
        ctx.save();
        ctx.translate(width*0.04, height*0.925 );
        ctx.beginPath();
        ctx.fillStyle = "black"
        ctx.drawImage(badgeImg, 0, - badgeImg.height * scale , badgeImg.width* scale ,  badgeImg.height* scale );
        ctx.fill(); 
        ctx.closePath();
        ctx.restore();        
    }

    that.drawShadowCircle = function() {
    
        if(intro_sptire) {
            ctx.save();
            ctx.translate(c.x, height * 0.535);            
            ctx.beginPath();
            ctx.fillStyle = "white";          
            ctx.arc(0, 0, circle_mask_intro * scale, 0 , 2* Math.PI);          
            ctx.clip();
            ctx.fill();
                ctx.translate(-intro_sprite_w *0.5 * scale, -intro_sprite_w *0.5 * scale);  
                intro_sptire.render();
                intro_sptire.drawWidth = intro_sprite_w *scale ;
                intro_sptire.drawHeight = intro_sprite_w * scale ;
                ctx.restore();
            ctx.closePath();
            ctx.restore();
        }
    }

    that.drawDescriptionText = function(){
        ctx.save();
        let fontSize = text_size * scale;
      

        ctx.save();
        ctx.translate(c.x, (height * 0.535 - circle_mask_intro * scale)/2.0);

        let headerLocalizationScale = parseFloat($.i18n('header_img_scale'));
        
        let headerScaleW = headerImg.width *scale * headerLocalizationScale;
        let headerScaleH = headerImg.height *scale * headerLocalizationScale;
        ctx.drawImage(headerImg , -headerScaleW ,  -headerScaleH  , headerScaleW * 2 , headerScaleH * 2) ;

        ctx.restore();
        
    }


    that.setOnJqueryClickListener = function() {
        $("#btn_practice").on('click', function(){
            mode = ENUM_MODE.PRACTICE;
            that.hideUI();
        });

        $("#btn_play").on('click', function(){
            if(isAndroid && !iOS && isChrome) {
                document.body.requestFullscreen();
            }
            playMode.preLoader();
            selectMode.selectShowUI();
            that.hideUI();           
        });
    }

    that.hideUI = function() {
        $("#btn_practice").hide();
        $("#btn_play").hide();
        $('.intro__footer-link--right ').hide();
        $('#dropdown_select_lang').hide();
    }

    that.showUI = function() {
        $("#btn_play").show();
        $('.intro__footer-link--right ').show();
        $('#dropdown_select_lang').show();
    }

    return that;
}