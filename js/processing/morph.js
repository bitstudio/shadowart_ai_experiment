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

function init_morph() {

    function load_data(path) {
        var deferred = new $.Deferred();
        var oReq = new XMLHttpRequest();
        oReq.open("GET", path, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
          var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                var data = new Float32Array(arrayBuffer);
                deferred.resolve(data);
            }else{
                deferred.reject();
            }
        };
        oReq.send(null);    
        return deferred.promise();
    }

    function load_targets(path) {
        var deferred = new $.Deferred();
        var oReq = new XMLHttpRequest();
        oReq.open("GET", path, true);
        oReq.responseType = "text";

        oReq.onload = function (oEvent) {
            if (this.readyState == 4 && this.status == 200) {
                var target_set = JSON.parse(this.responseText);
                
                var shape = target_set[0]["shape"];
                var scale = target_set[0]["scale"];
                load_data(target_set[0]["path"]).then(function(data){
                    var target_contours = {};

                    for(var cls = 0; cls < shape[0]; ++cls)
                    {
                        var contour = [];
                        for(var length = 0; length < shape[1]; ++length)
                        {
                            var index = (cls*shape[1] + length)*shape[2];
                            contour.push(data.slice(index, index+2));
                        }
                        target_contours[cls + 1] = contour;
                    }

                    deferred.resolve(target_contours, scale);
                }, function(){
                    deferred.reject();
                });

            }else{
                deferred.reject();
            }
        };
        oReq.send(null);
        return deferred.promise();
    }   

    load_targets("morph_data/desc.json").then(on_ready);

    function mod(v, n) {
        return ((v%n)+n)%n;
    };

    function find_a_center(points) {

        var sumx = 0;
        for(var i = 0;i<points.length;++i){
            sumx += points[i][0];
        }
        var cx = sumx/points.length;

        var crosses = [];
        for (var i = 0;i<points.length - 1; ++i) {
            if ( (points[i][0] < cx && cx <= points[i + 1][0]) || (points[i][0] >= cx && cx > points[i + 1][0]) )
                crosses.push((points[i][1] + points[i + 1][1]) * 0.5);
        }

        crosses.sort(function(a, b){return a - b;});

        var max_value = 0;
        var max_index = 0;
        for (var i = 0;i<crosses.length/2;++i){
            var v = Math.abs(crosses[2 * i] - crosses[2 * i + 1]);
            if(v > max_value) {
                max_value = v;
                max_index = i;
            }
        }

        var cy = (crosses[2 * max_index] + crosses[2 * max_index + 1]) * 0.5;

        return [cx, cy]
    }


    function transform_polar(xys, width, height, scale) {

        var stats = {};

        width = width || 1.0;
        height = height || 1.0;
        scale = scale || [1.0, 1.0];

        var center = find_a_center(xys);
        center[0] = center[0]*width/scale[0];
        center[1] = center[1]*height/scale[1];

        stats.center = center;

        var min_x = width;
        var min_y = height;
        var max_xy = 0;

        var imin_x = 0;
        var imin_y = 0;
        var imax_xy = 0;

        var R = [];
        var T = [];
        var X = [];
        var Y = [];
        for(var i = 0;i<xys.length;++i) {
            let nx = ((xys[i][0])*width/scale[0]) - center[0];
            let ny = ((xys[i][1])*height/scale[1]) - center[1];
            R.push(Math.sqrt(nx*nx + ny*ny));
            T.push(Math.atan2(ny, nx));
            X.push(nx);
            Y.push(ny);
            if(nx < min_x) {
                imin_x = i;
                min_x = nx;
            }
            if(ny < min_y) {
                imin_y = i;
                min_y = ny;
            }
            if(max_xy < nx + ny) {
                imax_xy = i;
                max_xy = nx + ny;
            }
        }           

        stats.X = X;
        stats.Y = Y;
        stats.R = R;
        stats.T = T;

        stats.min_x = imin_x;
        stats.min_y = imin_y;
        stats.max_xy = imax_xy;

        return stats;
    }

    function extract_extrema(Rs, start, end) {

        if(end < start) end = end + Rs.length;

        var out = [];
        var g = 1;

        out.push(start);
        for(var i = start+1;i<end;++i) {
            let _i = mod(i, Rs.length);

            let ll = Rs[mod(_i - g - g, Rs.length)];
            let l = Rs[mod(_i - g, Rs.length)];
            let m = Rs[_i];
            let r = Rs[mod(_i + g, Rs.length)];
            let rr = Rs[mod(_i + g + g, Rs.length)];

            if(l < m && r < m && ll < m && rr < m) {
                out.push(_i);
            }else if(l > m && r > m && ll > m && rr > m){
                out.push(_i);
            }
        }
        out.push(mod(end, Rs.length));

        return out;
    }


    function delta_theta(t0, t1) {
        if(t0 > t1)
            return Math.min(t0-t1, 2*Math.PI - t0 + t1);
        else
            return Math.min(t1-t0, 2*Math.PI - t1 + t0);
    }

    function interpolate_theta(t0, t1, alpha) {
        var a0 = 1-alpha;
        var a1 = alpha;

        if(t1 > t0){
            if(t1 - t0 < Math.PI*2 + t0 - t1) return t0*a0 + t1*a1;
            else return (t0+Math.PI*2)*a0 + t1*a1;
        }else{
            if(t0 - t1 < Math.PI*2 + t1 - t0) return t0*a0 + t1*a1;
            else return t0*a0 + (t1+Math.PI*2)*a1;
        }
    }


    function DTW(iN, nstat, iM, mstat) {
        var table = [];
        var visit = [];

        for(var i = 0;i<iN.length;++i) {
            table[i] = [Infinity];
            visit[i] = [-1];
        }

        for(var j = 0;j<iM.length;++j) {
            table[0][j] = Infinity;
            visit[0][j] = -1;
        }

        table[0][0] = 0;
        visit[0][0] = -1;

        RN = nstat.R;
        RM = mstat.R;
        TN = nstat.T;
        TM = mstat.T;

        for(var i = 1;i<iN.length;++i){
            for(var j = 1;j<iM.length;++j) {

                let dR = Math.abs(RN[iN[i]], RM[iM[j]]);
                let dT = delta_theta(TN[iN[i]], TM[iM[j]]);

                var cost = dR + dT;

                let _10 = table[i-1][j];
                let _01 = table[i][j-1];
                let _11 = table[i-1][j-1];

                if(_10 < _01) {
                    if(_10 < _11) {
                        table[i][j] = cost*2 + _10;
                        visit[i][j] = 10;
                    }else{
                        table[i][j] = cost + _11;
                        visit[i][j] = 11;
                    }
                }else{
                    if(_01 < _11) {
                        table[i][j] = cost*2 + _01;
                        visit[i][j] = 1;
                    }else{
                        table[i][j] = cost + _11;
                        visit[i][j] = 11;
                    }

                }

            }
        }

        var i = iN.length-1;
        var j = iM.length-1;
        var map = [];
        var v = null;
        do {
            var v = visit[i][j];
            map.unshift([iN[i], iM[j]]);
            if(v === 10) {
                i = i-1;
            }else if(v === 11) {
                
                i = i-1;
                j = j-1;
            }else{

                j = j-1;
            }
        }while(v !== -1);

        return map;
    }

    function interpolate(C, map, stats, tstats) {

        function _ov(f, t, L) {
            return t >= f? (t-f): (t + L - f); 
        }

        function _fi(f, t, L, s) {
            if(t >= f) {
                return f*(1-s) + s*t;
            }

            let k = f*(1-s) + s*(t + L);
            return k >= L? k-L: k;
        }

        function _i(V, a, L) {
            let f = mod(parseInt(Math.floor(a)), L);
            let t = mod(parseInt(Math.ceil(a)), L);
            let s = a - f;
            return V[f]*(1-s) + V[t]*s;
        }

        var L = stats.R.length;

        for(var i = 0;i<map.length-1;++i) {
            var f = map[i];
            var t = map[i + 1];

            var s = _ov(f[0], t[0], L);
            var st = _ov(f[1], t[1], L);

            var steps = Math.ceil((s + st)*1.0);

            for(var j = 0;j<steps;++j) {

                let s = 1.0*j/steps;

                let _0 = _fi(f[0], t[0], L, s);
                let _1 = _fi(f[1], t[1], L, s);

                let x_ = _i(stats.X, _0, L);
                let xt_ = _i(tstats.X, _1, L);

                let y_ = _i(stats.Y, _0, L);
                let yt_ = _i(tstats.Y, _1, L);
            
                let r_ = Math.sqrt(x_*x_ + y_*y_); 
                let rt_ = Math.sqrt(xt_*xt_ + yt_*yt_);
                let t_ = Math.atan2(y_, x_);
                let tt_ = Math.atan2(yt_, xt_);

                C.push([r_, rt_, t_, tt_]);
            }

        }

    }


    function match(stats, tstats) {

        var S0 = extract_extrema(stats.R, stats.min_y, stats.min_x);
        var tS0 = extract_extrema(tstats.R, tstats.min_y, tstats.min_x);
        var map0 = DTW(S0, stats, tS0, tstats);

        var S1 = extract_extrema(stats.R, stats.min_x, stats.max_xy);
        var tS1 = extract_extrema(tstats.R, tstats.min_x, tstats.max_xy);
        var map1 = DTW(S1, stats, tS1, tstats);

        var S2 = extract_extrema(stats.R, stats.max_xy, stats.min_y);
        var tS2 = extract_extrema(tstats.R, tstats.max_xy, tstats.min_y);
        var map2 = DTW(S2, stats, tS2, tstats);

        var map = [];
        interpolate(map, map0, stats, tstats);
        interpolate(map, map1, stats, tstats);
        interpolate(map, map2, stats, tstats);

        return map;
    }


	function on_ready(target_contours, scale) {

		window.prepare_morph = function(nps, target_id, x, y, width, height, on_ready) {

            var target = target_contours[target_id];

            var tstats = transform_polar(target, width, height, scale);
            var stats = transform_polar(nps);

            // map is a sequence of (R, tR, T, tT) followed the contour's order.
            var map = match(stats, tstats);

            var get_contours = function(step) {
                
                var s = (Math.sin(step * Math.PI / 2) + 1)*0.5;
                var u = 1 - Math.exp(-(step + 1)*1.5);
                var out = [];
                for(var i = 0;i<map.length;++i) {

                    let tuple = map[i];

                    let r_ = tuple[0]*(1-s) + tuple[1]*s;
                    let t_ = interpolate_theta(tuple[2], tuple[3], u);

                    let x_ = x + r_ * Math.cos(t_) + stats.center[0] * (1-s) + s * tstats.center[0];
                    let y_ = y + r_ * Math.sin(t_) + stats.center[1] * (1-s) + s * tstats.center[1];
                    out.push([x_, y_]);
                }
                return out; 
	        };

            on_ready(get_contours);

		};

	};


};