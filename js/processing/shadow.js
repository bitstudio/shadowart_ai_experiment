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
 
function init_shadow() {

	function load_weight(path, shape, is_integer) {
    	var deferred = new $.Deferred();
		var oReq = new XMLHttpRequest();
		oReq.open("GET", path, true);
		oReq.responseType = "arraybuffer";

		oReq.onload = function (oEvent) {
		  var arrayBuffer = oReq.response; // Note: not oReq.responseText
		  if (arrayBuffer) {
		  	if(is_integer) {
			    var weights = new Int32Array(arrayBuffer);
			    deferred.resolve({"d": weights, "t": "i", "s": shape});
		  	}else{
			    var weights = new Float32Array(arrayBuffer);
			    deferred.resolve({"d": weights, "t": "f", "s": shape});
		  	}
		  }else{
		  	deferred.reject();
		  }
		};
		oReq.send(null);	
		return deferred.promise();
	}

	function load_descriptor(path) {
    	var deferred = new $.Deferred();
		var oReq = new XMLHttpRequest();
		oReq.open("GET", path, true);
		oReq.responseType = "text";

		oReq.onload = function (oEvent) {
		    if (this.readyState == 4 && this.status == 200) {
		        var weight_set = JSON.parse(this.responseText);
		    	
		        var children = [];
		        for(i in weight_set) {
		        	weight = weight_set[i];
		        	if(weight["t"] == "n") {
		        		children.push(load_descriptor(weight["path"]));
		        	}else{
		        		children.push(load_weight(weight["path"], weight["shape"], weight["t"] == "i"));
		        	}
		        }

				$.when.apply($, children).then(function(){
					results = [];
					for(i in arguments) {
						results.push(arguments[i]);
					}
		    		deferred.resolve(results);
				}).fail(function(){
		  			deferred.reject();
				});
		    }else{
		  		deferred.reject();
		    }
		};
		oReq.send(null);
		return deferred.promise();
	}	


	load_descriptor("model/model.json").then(on_ready);

	    // const v = tf.tensor2d([[1, 2], [3, 4]]);
	    // const b = tf.tensor1d([1, 2]);

	    // const W = [tf.tensor2d([[1, 2], [3, 4]])];
	    // const U = [tf.tensor2d([[1, 2], [3, 4]])];
	    // const Ub = [tf.tensor1d([1, 2])];
	    // const Wb = [tf.tensor1d([1, 2])];

	function transform_to_tensor(ary, two_ds) {
		out = [];
		for(var i = 0;i<ary.length;++i)
			if(two_ds)
				out.push(tf.tensor2d(ary[i]["d"], ary[i]["s"]));
			else
				out.push(tf.tensor1d(ary[i]["d"]));
		return out;
	}

	function on_ready(weights) {

	    const v = tf.tensor2d(weights[0]["d"], weights[0]["s"]);
	    const b = tf.tensor1d(weights[1]["d"]);

	    const W = transform_to_tensor(weights[2], true);
	    const U = transform_to_tensor(weights[3], true);
	    const Ub = transform_to_tensor(weights[4], false);
	    const Wb = transform_to_tensor(weights[5], false);

		function normalize(r, t) {
			size = r.length;
			return tf.tidy(() => {
			    r = tf.tensor2d(r, [1, size]);
			    t = tf.tensor2d(t, [1, size]);
			    m = tf.mean(r, axis=1, keepDims=true);
			    r = tf.div(r, m);
			    out = tf.concat([r, tf.mul(t, r)], 0)
				return tf.reshape(out, [-1, size*2]);
			});
		}

		function compute(input) {
			return tf.tidy(() => {
				function residue_layer(input, i) {
					const w = W[i];
					const u = U[i];
					const ub = Ub[i];
					const wb = Wb[i];

			        const residue = tf.mul(tf.elu(tf.add(tf.matMul(input, u), ub)), input)
			        const output = tf.add(tf.elu(tf.add(tf.matMul(residue, w), wb)), residue)
					return output;
				}

			    a = input;
			    for(var i = 0;i<W.length;++i)
			        a = residue_layer(a, i);

			    const output = tf.elu(tf.add(tf.matMul(a, v), b));
			    return output;
			});
		}


		function compare(f0, f1) {
			return tf.tidy(() => {
				return tf.exp(tf.sum(tf.squaredDifference(f0.expandDims(1), f1.expandDims(0)), 2).neg());
			});
		}

		function get_class_score(response, class_indices) {
			return tf.tidy(() => {

				var class_scores = [];
				for(var c in class_indices) {
					class_scores.push(tf.max(response.gather(class_indices[c], 1), 1));
				}

				return tf.stack(class_scores, 1);
			});
		}

	    function point_dist(p0, p1) {
	        return Math.sqrt((p0[0] - p1[0])*(p0[0] - p1[0]) + (p0[1] - p1[1])*(p0[1] - p1[1]));
	    }


		function point_radian(p0, p1){
		    return Math.atan2(p0[1] - p1[1], p0[0] - p1[0]);
		}


		function radian_diff(r0, r1) {
		    delta = r0 - r1;
		    sign = (delta < 0? -1.0: 1.0);
		    abs_delta = Math.abs(delta);
		    while(abs_delta >= 2 * Math.PI)
		        abs_delta = abs_delta - 2 * Math.PI;
		    return (abs_delta < - (abs_delta - 2 * Math.PI)? sign * abs_delta : sign * (abs_delta - 2 * Math.PI));
		}

		function get_polar_stat(contour) {
		    sx = 0;
		    sy = 0;
		    len_contour = contour.length;
		    size = Math.max(len_contour, 1)
		    for(var i = 0;i<size;++i) {
		        sx = sx + contour[i][0];
		        sy = sy + contour[i][1];
		    }

		    centroid = [sx / size, sy / size];

		    r = new Float32Array(size);
		    t = new Float32Array(size);

		    for(var i = 0;i<size;++i) {
		        r[i] = point_dist(contour[i], centroid);
		        t[i] = radian_diff(point_radian(contour[(i + 1) % size], centroid), point_radian(contour[i], centroid));
		    }

		    return [r, t];
		}

		const templates = tf.tensor2d(weights[6]["d"], weights[6]["s"]);
		const class_lut = weights[7]["d"];

		const class_indices = {};
		for(var i in class_lut) {
			if(class_indices[class_lut[i]] == null) {
				var k = class_lut[i];
				class_indices[k] = class_lut.map( function( cls, idx ){ return ( cls == k) ? idx : -1 } ).filter(function(item){return item != -1;});
			}
		}

		const class_list = [];
		for(var c in class_indices) {
			class_list.push(c);
		}


		function sort_indices(ary) {
			indices = Array.apply(null, {length: ary.length}).map(Function.call, Number);
			indices.sort(function(a, b){
				return ary[b] - ary[a];
			});
			return indices;
		}

		function re_order(ary, indices) {
			out = [];
			for(var i in indices) {
				out.push(ary[indices[i]]);
			}
			return out;
		}

		window.classify_contour = function(contour_obj, on_inferred_callback) {
		  
		  	var eqi_length = contour_obj.re_contour(256);
	  		r_t = get_polar_stat(eqi_length);

	  		const input = normalize(r_t[0], r_t[1]);
			const r0 = compute(input);
			const raw = compare(r0, templates);
			const class_scores = get_class_score(raw, class_indices);
			class_scores.data().then(function(class_scores_cpu){

				var indices = sort_indices(class_scores_cpu);

	     		on_inferred_callback(contour_obj.id, re_order(class_list, indices), re_order(class_scores_cpu, indices));
	    		input.dispose();
	    		r0.dispose();
	    		raw.dispose();
	    		class_scores.dispose();
			})
		};

	}

};

