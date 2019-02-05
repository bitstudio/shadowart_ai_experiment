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
 
function SelectMode () {
    let zodiac_animal_list = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
    let that = {};
    let zodiac_id = 0;
    
    let ENUM_SELECT_STATE = {
        SELECT: 0,
        PREPARE_BEGIN: 1
    }

    let select_state = null;
    let begin_result_img;
    let select_zodiac = "rat";


    //responsive stuffs;
    let canvas;
    let ctx;
    let scale;  
    let baseWidth = 3840 * 0.5;
    let baseHeight = 2160 * 0.5;
    let baseRatio = baseWidth/baseHeight;

    let defaultTextSize = 95 * 0.5;
    let btnSize = 297 * 0.5;
    let dropdownSize = 280 * 0.5;
    let beginResImgSpecialScale = 3.0 * 0.5;

    let text_select_state_desc = "";

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
        that.createModalZodiac();
        that.setOnJqueryClickListener();
     
        select_state = ENUM_SELECT_STATE.SELECT;
        that.initZodiac();
        

        circle_mask = new Image();
        circle_mask.onload = function(){}
        circle_mask.src = "content/ui/circle_mask.png";

        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');  
        
    }  

    that.initZodiac = function() {
        zodiac_id = 11;
        select_zodiac = zodiac_animal_list[zodiac_id];
        let get_zodiac_name = zodiac_animal_list[zodiac_id].toLocaleLowerCase();
        let btn_path = 'content/ui/animal_button/' + get_zodiac_name + '_button.png'; 
        let date = new Date();
        let year = date.getFullYear().toString().slice(2);
        
        $("#date_text").html(year);  
        $("#select_zodiac").css({'background-image': 'url(' +btn_path+')'});
        that.setSelectorZodiac(zodiac_id);
    }

    that.update = function() {
        that.resizeWindow();       
    }

    that.draw = function() {
        if(select_state === ENUM_SELECT_STATE.SELECT) {
            that.drawBg();
            that.drawText();
            that.drawInput();              
        } else {
            ctx.save();            
            let briscale = beginResImgSpecialScale * scale;
            let y = c.y - circle_mask.height * 0.3* scale  - begin_result_img.height * 0.5 *briscale ;
            let x = c.x - begin_result_img.width * 0.5 * briscale; 
            that.drawBg();
            ctx.drawImage(  begin_result_img,x,y,begin_result_img.width * briscale,begin_result_img.height * briscale);
           

            let h = defaultTextSize * scale;
            let header_h = h * 1.2;
            let line_h = h*0.83;
			let instruction_h = h*0.73;
            
            ctx.translate(c.x, c.y);
            ctx.font = header_h  + "px " + $.i18n('fonts_primary');
            ctx.fillStyle ='rgb(160, 56, 57)';           
            ctx.textAlign = "center";
            let str_zodiac_animal =  splitText($.i18n('copy_in_spotlight', zodiac_message_list[zodiac_id]), "|");
            let origin = -3.2;
            if(str_zodiac_animal) {
				ctx.font = header_h + "px " + $.i18n('fonts_primary');
                for(var i = 0;i < str_zodiac_animal.length; i++) {
                    ctx.fillText(str_zodiac_animal[i], 0 , line_h * origin);
                    origin += 1.0;
                }
            }

     		ctx.font = instruction_h + "px " + $.i18n('fonts_primary');
            let str_array_splited = splitText($.i18n('intro_begin'), "|");
            let origin_ = -1.2;

            if(str_array_splited) {
                for(var i = 0;i < str_array_splited.length; i++) {
                    ctx.fillText(str_array_splited[i], 0 , line_h * origin_);
                    origin_ += 1.0;
                }
            }         
      
            ctx.restore();
            that.drawBeginBtn();  
        }
    }


    that.drawBg = function() {       
        ctx.save();      
        ctx.drawImage(bg_img, 0, 0, width, height);
        ctx.drawImage(circle_mask, c.x - (circle_mask.width *0.5 * scale),  c.y - (circle_mask.height *0.5 * scale) ,circle_mask.width* scale,circle_mask.height* scale );
        ctx.restore();    
    }

    that.drawBeginBtn = function() {     
        let btnScaledSize = btnSize * scale;
        let y = c.y + circle_mask.height * 0.325 * scale  - btnScaledSize * 0.5;
        let x = c.x - btnScaledSize * 0.5; 
        $('#btn_begin').width(btnScaledSize);
        $('#btn_begin').height(btnScaledSize);
        $('#btn_begin').offset({top: y , left: x }); 
    
    }

    that.drawText = function() {       

        let h = defaultTextSize * scale * 0.85;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.beginPath();
        ctx.font = h + "px " + $.i18n('fonts_primary');
        ctx.fillStyle ='rgb(172, 102, 82)';
   
        let line_h = h  * 1.3;
        let origin_ = -4;
        let str_select_desc = splitText($.i18n('select_your_chinese_zodiac_sign'), "|");


        if(str_select_desc) {
            for(var i = 0;i < str_select_desc.length; i++) {
                ctx.fillText(str_select_desc[i], -ctx.measureText(str_select_desc[i]).width / 2 , line_h * origin_);
                origin_ += 1.0;
            }
        }
        
        ctx.fill();    
        ctx.closePath();
        ctx.restore();
    }

    that.drawInput = function() {        
        //Start Button
        let btnScaledSize = btnSize * scale;
        let y = c.y + circle_mask.height * 0.325 * scale  - btnScaledSize * 0.5;
        let x = c.x - btnScaledSize * 0.5; 
       
        $('#btn_next').width(btnScaledSize);
        $('#btn_next').height(btnScaledSize);
        $('#btn_next').offset({top:y,left: x}); 
        
        $('#select_zodiac').height(btnScaledSize);
        $('#select_zodiac').width(btnScaledSize);
        $('#select_year').height(btnScaledSize );
        $('#select_year').width(btnScaledSize);              
    
        
        $('#btn_select_zodiac').width(btnScaledSize);
        $('#btn_select_zodiac').height(btnScaledSize);
    

        $('#select_year').css({top: c.y - btnScaledSize * 0.5, left: c.x - btnScaledSize * -0.5,position:'absolute'  });        
        $('#select_zodiac').css({top:  c.y - btnScaledSize *0.5 , left: c.x - btnScaledSize * 1.5  ,position:'absolute' });    
       
        let date_picker_w = $('.datepicker-dropdown').width();
        let date_picker_h = $('.datepicker-dropdown').height();

        $('.datepicker-dropdown').css({top: c.y - date_picker_h * 0.5, left: c.x - (date_picker_w * 0.5)});
        
         
        let h = defaultTextSize * scale;        
        ctx.font = h + "px " + $.i18n('fonts_primary');
        ctx.fillStyle = 'rgb(172, 102, 82)';
        let line_h = h  * 1.3;
        let text = $.i18n('or_text');
        ctx.translate(c.x, c.y);
        ctx.fillText(text, -ctx.measureText(text).width / 2, line_h * 0.3) ;
        ctx.fill(); 
        ctx.restore();
    
    }
    

    that.createModalZodiac = function () {
        let div = ""; 
        for(var i = 0; i  <  zodiac_animal_list.length; i++) {
            let animal_file = zodiac_animal_list[i].toLocaleLowerCase();
            let animal_name= zodiac_text_list[i].toLocaleLowerCase();
         
            if(i % 4 == 0){
                div += '</div>' ;
                div += '<div  class="row">' ;
            }
           
                div += '<div id="'+i +'"class="col-sm-3 btn-zodiac" >';
                div += '<p  id="zodiac_ic_name"  class="zodiac-ic-name center-message" style="font-family:' +$.i18n('fonts_primary')+'"> ' +animal_name+'</p>'
                div += '<img  width="50" src="content/ui/animal_silhouette/' +animal_file +'.png " style="	margin-left: auto; margin-right: auto;display: block;">'   ;           
                div += '</div>';                    
          
        }
    
        $("#modal_zodiac_body").append(div);

    };

    that.selectShowUI = function() {
        $('#select_zodiac').show();
        $('#select_year').show();
        $('#btn_next').show();
    }
    
    that.selectHideUI = function() {
        $('#select_zodiac').hide();
        $('#select_year').hide();
        $('#btn_next').hide();
    }

       
    that.beginShowUI = function() {
        $("#btn_begin").show();
    }

       
    that.beginHideUI = function() {
        $("#btn_begin").hide();
    }

    that.checkState = function() {
        return select_state;
    }

    that.setSelectorZodiac = function(id) {
        select_zodiac = zodiac_animal_list[id];    
        for(var i = 0; i < zodiac_animal_list.length; i++) {
            $("#" + i).find("img").attr('src','content/ui/animal_silhouette/' +zodiac_animal_list[i].toLocaleLowerCase() +'.png ');
            if(i == id) {
                $("#" + id).find("img").attr('src','content/zodiac_play/' +select_zodiac.toLocaleLowerCase() +'.png ');        
            }
        }                    
    }

    that.setOnJqueryClickListener = function() {
        $("#btn_next").on('click', function(){    
            that.selectHideUI();  
        
            begin_result_img = new Image();
            begin_result_img.onload = function(){
                select_state = ENUM_SELECT_STATE.PREPARE_BEGIN;
                $("#btn_begin").show();
                           
            }
            begin_result_img.src = "content/zodiac_black/"+select_zodiac.toLocaleLowerCase()+".png";         
   
        });

        $("#btn_begin").on('click', function() {
            that.selectHideUI();  
            playMode.resetState();
            playMode.initZodiac(zodiac_id);
            playMode.showUI();
            playMode.setup();           
            mode = ENUM_MODE.PLAY;
            that.beginHideUI();
        });



        $('.datepicker').datepicker({            
            minViewMode: 0,     
            format: 'dd/mm/yyyy',       
            orientation: "center",
            autoclose: true

        });

        
        $('.datepicker').on('changeDate', function() {
            var date = $('.datepicker').datepicker('getDate');
            select_zodiac = getAnimalName(date.getFullYear(), date.getMonth()+1, date.getDate());
            for(var i = 0; i < zodiac_animal_list.length;i++) {
                let animal_str = zodiac_animal_list[i];
                if(select_zodiac === animal_str) {
                    zodiac_id = i;
                }
            }   

            let get_zodiac_name = zodiac_animal_list[zodiac_id].toLocaleLowerCase();
            let btn_path = 'content/ui/animal_button/' + get_zodiac_name + '_button.png';
            $("#select_zodiac").css({'background-image': 'url(' +btn_path+')'})          
            $("#year_text").html( date.getFullYear().toString().slice(2));
            that.setSelectorZodiac(zodiac_id);

        });

        $("#select_zodiac").on('click', function(){
            $('#myModal').modal({show:true});
          
        });

        //create zodiac animal selection.
        for(var i = 0; i  <  zodiac_animal_list.length; i++) {
            $("#" + i).on('click', function() {              
                zodiac_id = parseInt($(this).attr('id'));      
                select_zodiac = zodiac_animal_list[zodiac_id];
                let get_zodiac_name = zodiac_animal_list[zodiac_id].toLocaleLowerCase();
                let btn_path = 'content/ui/animal_button/' + get_zodiac_name + '_button.png';
                $("#select_zodiac").css({'background-image': 'url(' +btn_path+')'})
                $("#date_text").html('');              
                $(this).find("img").attr('src','content/zodiac_play/' +select_zodiac.toLocaleLowerCase() +'.png ');
                that.setSelectorZodiac(zodiac_id);
            
            });
        }
        
    }


    return that;
}