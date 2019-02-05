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
 
function EndMode () {
    let zodiac_animal_list = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
    let that = {};
    let id_ = 0;
    let score_ = 0;
    var isCompleted = false;
    let btn_size = 152;
    let play_timer = 0;
    let timerBgImg ;

    //responsive stuffs;
    let canvas;
    let ctx;
    let scale;  
    let baseWidth = 3840 * 0.5;
    let baseHeight = 2160 * 0.5;
    let baseRatio = baseWidth/baseHeight;

    let outDoYourSelfTextSize = 60 * 0.5;
    let timerTextSize = 135 * 0.5;
    let resultTextSize = 135 * 0.5;
    let imageDescriptionTextSize = 55 * 0.5;
    let btnSize = 297 * 0.5; 
    let btnSocialSize = 96;
    let resultImageSpacialScale = 2.3 * 0.5;
    let posL = 0.3;
    let posR = 0.7;

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
    }

    that.setup = function () {
        score_ = 0;
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
       
        that.setOnJqueryClickListener(); 
                
        summaryImg = new Image();
        summaryImg.onload = function(){}
        summaryImg.src = "content/ui/summary.png";

        playagainImg = new Image();
        playagainImg.onload = function(){}
        playagainImg.src = "content/ui/play_again.png";

        // that.setResults(11,12,121);
    }  

    that.update = function() {
        that.resizeWindow();            

    }

    that.setResults = function(id, score, gamePlayTimer) {
        if(score >= 12) {
            score = 12;
            isCompleted = true;
        } else { 
            isCompleted = false;
        }
       
        play_timer = ("0"+Math.floor(gamePlayTimer/60)).slice(-2) +":" + ("0"+Math.floor(gamePlayTimer)%60).slice(-2); 
        score_ = score;
        id_ = id;
        
        resultImage = new Image();
        resultImage.onload = function() {
        }
        resultImage.src = "content/shareImages/"+ lang +"/img_"+id+"_"+score+".png";
    }

    that.draw = function() {
        that.drawBg(); 
        that.drawResultImage();   
        that.drawResultDetails(); 

    }
    
    that.drawBg = function() {   
        ctx.save();      
        ctx.drawImage(bg_img, 0, 0, width, height);
        ctx.restore();    
    }

    that.drawResultImage = function() {
        ctx.save();      
        let imgW = resultImage.width * scale * resultImageSpacialScale ;
        let imgH = resultImage.height * scale * resultImageSpacialScale ;
        ctx.drawImage(resultImage, c.x - imgW * 0.5, c.y - imgH * 0.45 , imgW, imgH);
        ctx.restore();  
    }

    that.drawResultDetails = function(){    

        let btnScaledSize = btnSize * scale ;
           
        if(!isCompleted){
            $('#btn_play_end').show();
            $('#play_again_btn').hide();
            that.drawTextUncompleted();
      
            let btnScaledSize = btnSize * scale ;

            $('#btn_play_end').width(btnScaledSize);
            $('#btn_play_end').height(btnScaledSize);
            $('#btn_play_end').css({top: height*0.90 - btnScaledSize, left: width *0.952  - btnScaledSize });      

           
        } else{
           
            $('#btn_play_end').show();
            $('#play_again_btn').hide();

            that.drawTextCompleted();
            
            let btnScaledSize = btnSize * scale ;

            $('#btn_play_end').width(btnScaledSize);
            $('#btn_play_end').height(btnScaledSize);
            $('#btn_play_end').css({top: height*0.90 - btnScaledSize, left: width *0.952  - btnScaledSize });      


        }
          

        let btnSocialScaledSize = (btnSocialSize * scale) * 0.85;
        

        // if(lang == 'zh-cn'){                   
        //     $('#btn_save').width(btnSocialScaledSize);
        //     $('#btn_save').height(btnSocialScaledSize);
        //     $('#btn_save').css({top: height*0.80 - btnScaledSize, left: width * 0.935  - btnSocialScaledSize });
        // }else {
      
            
        $('#btn_twitter').width(btnSocialScaledSize);
        $('#btn_twitter').height(btnSocialScaledSize);
        $('#btn_twitter').css({top: height*0.80 - btnScaledSize, left: width * 0.935  - btnSocialScaledSize });


        $('#btn_fb').width(btnSocialScaledSize);
        $('#btn_fb').height(btnSocialScaledSize);
        $('#btn_fb').css({top: height*0.70 - btnScaledSize, left: width * 0.935  - btnSocialScaledSize });

        $('#btn_save').width(btnSocialScaledSize);
        $('#btn_save').height(btnSocialScaledSize);
        $('#btn_save').css({top: height*0.60 - btnScaledSize, left: width * 0.935  - btnSocialScaledSize });

        // }

    }

    that.drawTextUncompleted = function() {

        ctx.save();
        ctx.translate( c.x, c.y * 0.35);
        let h = resultTextSize * scale;
        ctx.fillStyle ='rgb(172, 102, 82)';
        ctx.font = h+"px " + $.i18n('fonts_primary');
        ctx.textAlign = "center";
        ctx.fillText($.i18n('unlock_animal', score_), 0 , h*-1)
        ctx.restore();

    }

    that.drawTextCompleted = function() {
        let text_01 = "You've completed";  
        let text_02 = "the zodiac cycle in";   

        ctx.save();
        ctx.translate( c.x , c.y * 0.35);
        let h =  resultTextSize  * scale;
        ctx.fillStyle ='rgb(172, 102, 82)';
        ctx.font = h+"px " + $.i18n('fonts_primary');
        ctx.textAlign = "center";
        ctx.fillText($.i18n('completing_all_12_animals', play_timer), 0 , h*-1);
        ctx.restore();
    }

    that.checkCompleted = function() {
        return isCompleted
    }

    that.hideUI = function() {
        $('#play_again_btn').hide();
        $('#btn_play_end').hide();
   
    }

    that.save_img = function (on_click_ref) {
        let download_url = getFullPathURL() + "content/shareImages/" +lang;     

        $(on_click_ref).attr('href', download_url + '/img_'+id_+'_'+score_+'.png');
        $(on_click_ref).attr('download', 'shadow_art.png');
    }

    that.share_to_facebook = function(on_click_ref) {
        let fb_end_point_url = 'https://www.facebook.com/sharer/sharer.php?u=';
        let html_share_url = getFullPathURL() + "content/htmlSocialSharing/" +lang;           
       
        $(on_click_ref).attr('href', fb_end_point_url  + html_share_url + '/img_'+id_+'_'+score_+'.html');
        $(on_click_ref).attr('target', '_blank');     
    }    

    that.share_to_twitter = function(on_click_ref) {
        let twitter_end_point_url = "https://twitter.com/intent/tweet?url=";
        let html_share_url = getFullPathURL() + "content/htmlSocialSharing/" +lang;
     
        $(on_click_ref).attr('href', twitter_end_point_url + html_share_url + '/img_'+id_+'_'+score_+'.html');
        $(on_click_ref).attr('target', '_blank');      
    }

    that.get_proverb = function(animal_index, score) {
        var intro = [$.i18n('unlock_animal', score)];
        var out  = intro.concat(proverbs[animal_index].split("|"));
        return out;
    }

    that.setOnJqueryClickListener = function() {
        $('#play_again_btn').click('on', function(){
            location.reload();
        });

        $("#btn_play_end").on('click', function(){
            location.reload();
        });

        $('#btn_save').on('click', function(){
            that.save_img(this);
        });

        $('#btn_fb').on('click touchstart', function(){
            that.share_to_facebook(this);

        });

        $('#btn_twitter').on('click touchstart', function(){
            that.share_to_twitter(this);
        });
               
    }


    

    return that;
}