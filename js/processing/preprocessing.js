function init_preprocessing(input_width, display_container, sample_container, on_capture_callback, on_shadow_callback, on_calibration) {
  
	let zodiac = true;

    let video = null;
    let package = null;
    let thread = null

    let height = 0;
    let width = 0;
    const FPS = 30;

    let canvasFrame = null;
    let context = null;
    let src = null;
    let background = null;
    let dst = null;
    let ones = null;
    let zeros = null;
    let disp = null;
    let disp_warpped = null;
    let M_raw_to_capture_to_disp = null;
    let M_raw_to_capture = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, 0, 0, 1, 0]);
    let capture_res = null;
    let raw_to_capture_to_disp_ratio = null;

    let capture_x = 0;
    let capture_y = 0;
    let capture_res_percent = 0.5;
    let capture_alpha = 0.05;

    let raw_offset_x = 0;
    let raw_offset_y = 0;
    let raw_to_disp_ratio = null;
    let M_raw_to_disp = null;
    let disp_width = input_width;
    let disp_height = disp_width;
    let disp_offset_x = 0;
    let disp_offset_y = 0;

    let mode = 0;
    let mode_steps = 0
    let background_update_alpha = 0.05

    // tracking
    let tx = -1;
    let ty = -1;
    let ta = 0.1;
    let epsilon = 200;
    let countdown = 1000;
    let stamp = new Date().getTime();
    let allow_capture = true;
    let allow_pre_capture = false;
    let first = true;


    function reset_state() {
        tx = -1;
        ty = -1;
        allow_pre_capture = false;
        first = true;
        allow_capture = true;
    }

    function in_criterior(x, y) {
        return (x - tx) * (x - tx) + (y - ty) * (y - ty) < epsilon;
    }

    $(document).ready(function() {
        init(640, 480);
        request_stream(assign_stream);
    });

    function request_stream(callback) {
        navigator.mediaDevices.getUserMedia({ video: { width: { min: 640 }, height: { min: 480 } }, audio: false })
            .then(function(stream) {
                callback(stream);
            })
            .catch(function(err) {
        
            });
    };

    function assign_stream(stream) {
        if(thread != null) clearTimeout(thread);     
        video = document.getElementById("videoInput"); // video is the id of video tag
        video.srcObject = stream;
        video.play();
        thread = setTimeout(processVideo, 0);
    }

    function stop_stream(){
        clearTimeout(thread);
        thread = null;
        video.srcObject.getTracks()[0].stop();
    }

    function init(w, h) {
        width = w;
        height = h;

        body = $('body');

        videoElement = $('<video autoplay="true" control="true" playsinline="true" id="videoInput" width="' + width + '" height="' + height + '"></video>');
        body.append(videoElement);
        videoElement.hide();

        canvasElement = $('<canvas id="canvasFrame" width="' + width + '" height="' + height + '"></canvas>');
        body.append(canvasElement);
        canvasElement.hide();
        canvasFrame = document.getElementById("canvasFrame"); // canvasFrame is the id of <canvas>
        context = canvasFrame.getContext("2d");

        canvasElement = $('<canvas id="canvasOutput" width="' + disp_width + '" height="' + disp_height  + '"class="rcorners"'+'></canvas>');
        display_container.append(canvasElement);
        rawFrame = document.getElementById("canvasOutput");
        rawContext = rawFrame.getContext("2d");

        capture_res = Math.min(width, height)*capture_res_percent;
        dataElement = $('<canvas id="dataFrame" width="' + capture_res + '" height="' + capture_res + '"></canvas>');
        body.append(dataElement);
        dataElement.hide();

        capture_x = width*0.25;
        capture_y = height/2;
        M_raw_to_capture = cv.matFromArray(2, 3, cv.CV_64FC1, [1.0, 0, -(capture_x - capture_res*0.5), 0, 1.0, -(capture_y - capture_res*0.5)]);

        previewElement = $('<canvas id="previewFrame" width="' + disp_width + '" height="' + disp_height + '"></canvas>');
        sample_container.prepend(previewElement);
        previewFrame = document.getElementById("previewFrame");
        previewContext = previewFrame.getContext("2d");
        
        raw_to_disp_ratio = disp_width * 1.0 / Math.min(width, height);
        raw_offset_x = (width - Math.min(width, height)) / 2;
        raw_offset_y = (height - Math.min(width, height)) / 2;
        M_raw_to_disp = cv.matFromArray(2, 3, cv.CV_64FC1, [raw_to_disp_ratio, 0, -raw_offset_x*raw_to_disp_ratio, 0, raw_to_disp_ratio, -raw_offset_y*raw_to_disp_ratio]);

        raw_to_capture_to_disp_ratio = disp_width * 1.0 / capture_res;

        M_raw_to_capture_to_disp = 
            cv.matFromArray(2, 3, cv.CV_64FC1, 
                [raw_to_capture_to_disp_ratio, 0, -(capture_x - capture_res*0.5)*raw_to_capture_to_disp_ratio, 0, raw_to_capture_to_disp_ratio, -(capture_y - capture_res*0.5)*raw_to_capture_to_disp_ratio]);

        src = new cv.Mat(height, width, cv.CV_8UC4);
        src_cap = new cv.Mat(capture_res, capture_res, cv.CV_8UC4, new cv.Scalar(255, 255, 255, 255));
        src_disp = new cv.Mat(disp_height, disp_width, cv.CV_8UC4, new cv.Scalar(255, 255, 255, 255));

        background = new cv.Mat(capture_res, capture_res, cv.CV_8UC4, new cv.Scalar(0, 0, 0, 255));
        diff = new cv.Mat(capture_res, capture_res, cv.CV_8UC4);
        dst = new cv.Mat(capture_res, capture_res, cv.CV_8UC1);
        ones = new cv.Mat(capture_res, capture_res, cv.CV_8UC1, new cv.Scalar(255, 255, 255, 255));
        zeros = new cv.Mat(capture_res, capture_res, cv.CV_8UC1, new cv.Scalar(0, 0, 0, 255));
        data_image = new cv.Mat(capture_res, capture_res, cv.CV_8UC4);

        disp = new cv.Mat(disp_height, disp_height, cv.CV_8UC4, new cv.Scalar(255, 255, 255, 255));
        preview_image = new cv.Mat(disp_height, disp_height, cv.CV_8UC4);

        reset_state();
        mode = 0;
        mode_steps = 0;
        background.setTo(new cv.Scalar(0, 0, 0, 255));
    }

    function collectBackground() {
        cv.addWeighted(background, 1.0 - background_update_alpha, src_cap, background_update_alpha, 0, background);
    }


    function processVideo() {
        let begin = Date.now();
        context.drawImage(video, 0, 0, width, height);
        src.data.set(context.getImageData(0, 0, width, height).data);
        cv.flip(src, src, 1);
        cv.warpAffine(src, src_cap, M_raw_to_capture, new cv.Size(capture_res, capture_res));

        if (mode == 0) {

            collectBackground();

            cv.absdiff(src_cap, background, diff);
            cv.cvtColor(diff, dst, cv.COLOR_RGBA2GRAY);

            kernel = new cv.Size(21, 21);
            cv.blur(dst, dst, kernel);
            maxTuple = cv.minMaxLoc(dst); 
            xy = maxTuple.maxLoc;
            max_value = maxTuple.maxVal;

            if(max_value < 20 && mode_steps > 70) {
                mode = 2;
                mode_steps = 0;
                allow_capture = true;
            }

            if(max_value < 20) mode_steps = mode_steps + 1;
            else mode_steps = Math.max(mode_steps - 1, 0);
            
            if(on_calibration != null) {
                on_calibration(mode_steps*1.0/70);
            }

            cv.resize(src_cap, disp, new cv.Size(disp_width, disp_width));
            cv.imshow("canvasOutput", disp);
            // cv.warpAffine(src, src_disp, M_raw_to_disp, new cv.Size(disp_width, disp_width));
            // cv.imshow("canvasOutput", src_disp);

        }else if(mode == 1) {

            collectBackground();

            cv.absdiff(src_cap, background, diff);
            cv.cvtColor(diff, dst, cv.COLOR_RGBA2GRAY);

            kernel = new cv.Size(21, 21);
            cv.blur(dst, dst, kernel);
            maxTuple = cv.minMaxLoc(dst); 
            xy = maxTuple.maxLoc;
            max_value = maxTuple.maxVal;

            if(max_value > 50) {
                allow_pre_capture = true;
                mode_steps = 0;
            }

            if(allow_pre_capture) {
                mode_steps = mode_steps + 1;
            }

            if (mode_steps > 30 && max_value < 20) {
                mode = 2;
                mode_steps = 0;
                allow_capture = true;
            }


            cv.warpAffine(src, src_disp, M_raw_to_disp, new cv.Size(disp_width, disp_width));
            cv.imshow("canvasOutput", src_disp);

            var dwcr = disp_width / (width - raw_offset_x*2);
            var dhcr = disp_height / (height - raw_offset_y*2);
            rawContext.strokeStyle = "blue";
            rawContext.rect((capture_x - capture_res*0.5 - raw_offset_x) * dwcr,
                (capture_y - capture_res*0.5 - raw_offset_y) * dhcr, capture_res * dwcr, capture_res * dhcr);
            rawContext.stroke();


        }else if(mode == 2) {


            cv.absdiff(src_cap, background, diff);
            cv.cvtColor(diff, dst, cv.COLOR_RGBA2GRAY);

            kernel = new cv.Size(5, 5)
            cv.blur(dst, dst, kernel)
            cv.threshold(dst, dst, 100, 255, cv.THRESH_TRIANGLE);
            // cv.subtract(ones, dst, dst);
            // let M = cv.Mat.ones(7, 7, cv.CV_8U);
            // cv.morphologyEx(dst, dst, cv.MORPH_CLOSE, M);

            let contours = new cv.MatVector();
            let hierarchy = new cv.Mat();
            cv.findContours(dst, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

            var max_i = -1;
            var max_size = 0;

            for (let i = 0; i < contours.size(); ++i) {
                var temp = contours.get(i)
                if (temp.rows > max_size) {
                    max_size = temp.rows;
                    max_i = i;
                }
                temp.delete();
            }

            if(max_i != -1 && max_size > 0)
            {

                data_image.setTo(new cv.Scalar(255, 255, 255, 255));
                let color = new cv.Scalar(0, 0, 0, 255);
                cv.drawContours(data_image, contours, max_i, color, cv.FILLED, cv.LINE_8, hierarchy, 1);

                let cnt = new Contour_Object(contours.get(max_i));

                if(cnt.area < capture_res*capture_res/2)
                {
                    if(on_shadow_callback != null)
                        on_shadow_callback(cnt);

                    if (in_criterior(cnt.cx, cnt.cy)) {
                        if (new Date().getTime() - stamp > countdown) {
                            capture(cnt);
                        }
                    } else {
                        stamp = new Date().getTime();
                    }

                    tx = tx * (1.0 - ta) + cnt.cx * ta;
                    ty = ty * (1.0 - ta) + cnt.cy * ta;     

                }else{
                    
                    if(on_shadow_callback != null)
                        on_shadow_callback(null);
                }

            }else{

                if(on_shadow_callback != null)
                    on_shadow_callback(null);
            }

            contours.delete();
            hierarchy.delete();

            cv.resize(src_cap, disp, new cv.Size(disp_width, disp_width));
            cv.imshow("canvasOutput", disp); // canvasOutput is the id of another <canvas>;
            // cv.imshow("canvasOutput", dst); // canvasOutput is the id of another <canvas>;

        }


        // schedule next one.
        let delay = 1000 / FPS - (Date.now() - begin);
        thread = setTimeout(processVideo, delay);
    }
    // schedule first one.

    let contour_object_list = {};
    function capture(contour_obj) {
        if (!allow_capture) return;
        allow_capture = false;

        contour_object_list[contour_obj.id] = contour_obj;

        cv.imshow("dataFrame", data_image);

        cv.resize(data_image, preview_image, new cv.Size(disp_width, disp_height));
        cv.imshow("previewFrame", preview_image);

        if(window.classify_contour != null) {
            window.classify_contour(contour_obj, on_inferred);
        }else{
            package = {
                reference: contour_obj.id,
                image: dataFrame.toDataURL()
            };

            $.post("/classify", package, function(data, status, xhr) {
                var json = JSON.parse(data);
                on_inferred(json.reference, json["classes"][0], json["raw"][0]);
            });
        }
    }

    function on_inferred(id, classes, raws){
        var contour_obj = contour_object_list[id];
        contour_obj["class"] = classes;
        contour_obj["score"] = raws;

        previewContext.fillStyle="#FFFFFF";
        previewContext.fillRect(40,35,40,20);
        previewContext.fillStyle="#000000";
        previewContext.font="18px Arial";
        previewContext.fillText(classes[0].toString(), 50, 50);

        reset_state();
        if(on_capture_callback != null) {
            on_capture_callback(contour_obj);
        }
        delete contour_object_list[id];
    };


    function Contour_Object(contours) {
    	this.id = new Date().getTime();
    	this.score = null;
    	this.class = null;
    	this.raw_contours = contours;
        
        var Moments = cv.moments(contours, false);
        this.cx = Moments.m10 / (Moments.m00 + 1e-6);
        this.cy = Moments.m01 / (Moments.m00 + 1e-6);
        var a = cv.contourArea(contours, true);
        this.ccw = a < 0;
        this.area = Math.abs(a);

        function point_dist(p0, p1) {
            return Math.sqrt((p0[0] - p1[0])*(p0[0] - p1[0]) + (p0[1] - p1[1])*(p0[1] - p1[1]));
        }

        function interpolate_point(p0, p1, alpha) {
            return [p0[0] * (1 - alpha) + p1[0] * (alpha), p0[1] * (1 - alpha) + p1[1] * (alpha)];
        }

        this.re_contour = function(size) {

            var len_contour = this.raw_contours.rows;
            var c_p = this.raw_contours.row(0).data32S;
            var contour_portions = [0.0];
            for(var i = 1; i<len_contour; ++i) {
                var n_p = this.raw_contours.row(i).data32S;
                var dist = point_dist(n_p, c_p);
                contour_portions.push(dist + contour_portions[i - 1]);
                c_p = n_p;
            }
            var n_p = this.raw_contours.row(0).data32S;
            var dist = point_dist(n_p, c_p);
            var total_length = dist + contour_portions[len_contour - 1];
            contour_portions.push(total_length);

            var out_contour = [];
            var index = 1
            for(var i = 0;i<size;++i) {
                var cs = total_length * i * 0.999 / (size - 1);
                while(contour_portions[index] < cs) {
                    index = index + 1;
                }
                var alpha = (cs - contour_portions[index - 1]) / (contour_portions[index] - contour_portions[index - 1]);
                var new_point = interpolate_point(this.raw_contours.row(index-1).data32S, this.raw_contours.row(index % len_contour).data32S, alpha);
                if(this.ccw) out_contour.push(new_point);
                else out_contour.unshift(new_point);
            }

            return out_contour;
        }

        this.set_canvas = function(x1, y1, x2, y2, size) {

            var new_contour = null;
            var total = this.raw_contours.rows;
            if(size != null)
            {
                new_contour = this.re_contour(size);
                total = size;
            }

            var w = x2-x1;
            var h = y2-y1;
            var sx = (x1 + x2)/2;
            var sy = (y1 + y2)/2;

            var nps = [];
            for(var i = 0;i<total;++i){
                var temp = new_contour ? new_contour[i] : this.raw_contours.row(i).data32S;
                var x = (temp[0]*1.0 / capture_res - 0.5) * w;
                var y = (temp[1]*1.0 / capture_res - 0.5) * h;
                
                nps.push([x + sx, y + sy]);
            }

            return nps;
        }

    }

    return {
        restart: function() {
            reset_state();
            mode = 0;
            mode_steps = 0;
        },
        shutdown: function() {
            stop_stream();
        },
        reset_camera: function() {
            stop_stream();
            request_stream(assign_stream);
        }
    };
};