const MUTOR_alib = {
    draw_waveform : (buffer, canvas) =>
    {
	const samps = buffer.getChannelData(0);
	let c = canvas;
	let ctx = c.getContext("2d");
	const width = parseFloat(c.getAttribute("width"));
	const height = parseFloat(c.getAttribute("height"));
	let samps_per_pixel = Math.floor(samps.length / width);
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, width, height);
	ctx.strokeStyle = "#FFFFFF";
	ctx.moveTo(0, height / 2);
	for(x = 0; x < width; x++){
	    let y = 0;//, yy = 0;
	    for(i = 0; i < samps_per_pixel; i++){
		//yy += samps[i + (samps_per_pixel * x)];
		y += Math.pow(samps[i + (samps_per_pixel * x)], 2.);
	    }
	    y = Math.sqrt(y / samps_per_pixel);
	    if(x % 2){
		y *= -1;
	    }
	    y = y * (height / 2.) + (height / 2.);
	    ctx.lineTo(x, y);
	}
	ctx.stroke();
    },
    draw_meter : (meter, canvas, color) =>
    {
	const v = 1 - meter.getValue();
	let c = canvas;
	let ctx = c.getContext("2d");
	const width = parseFloat(c.getAttribute("width"));
	const height = parseFloat(c.getAttribute("height"));
	const vc = v * (height);
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.fillRect(0, vc, width, height);
	ctx.stroke();
    },
    draw_playhead : (player, progress, canvas, color) =>
    {
	const v = progress;
	let c = canvas;
	let ctx = c.getContext("2d");
	const width = parseFloat(c.getAttribute("width"));
	const height = parseFloat(c.getAttribute("height"));
	const vc = v * (width);
	ctx.clearRect(0, 0, width, height);
	ctx.strokeStyle = "#FFFFFF";
	ctx.beginPath();
	ctx.moveTo(vc, 0);
	ctx.lineTo(vc, height);
	ctx.stroke();
    },
    draw_spectroscope : (fft, gain, canvas, color) =>
    {
	let spec = fft.getValue();
	let c = canvas;
	let ctx = c.getContext("2d");
	const width = parseFloat(c.getAttribute("width"));
	const height = parseFloat(c.getAttribute("height"));
	const g = parseFloat(gain);
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = "#FFFFFF";
	ctx.beginPath();
	ctx.moveTo(0, height);
	if(width < fft.size){
	    let samps_per_pixel = Math.floor(fft.size / width);
	    for(i = 0; i < width; i++){
		let y = 0;
		for(j = 0; j < samps_per_pixel; j++){
		    y += Tone.dbToGain(spec[j + (i * samps_per_pixel)] + 18);
		}
		y /= samps_per_pixel;
		ctx.lineTo(i, height - ((y * g) * height));
	    }
	}else{
	    let pixels_per_samp = Math.floor(width / fft.size);
	    for(i = 0; i < fft.size; i++){
		let y = Tone.dbToGain(spec[i] + 18);
		ctx.lineTo(i * pixels_per_samp, height - ((y * g) * height));
	    }
	    ctx.lineTo(fft.size * pixels_per_samp, height - 1);
	}
	ctx.closePath();
	ctx.fill();
    },
    draw_sonogram : (fft, gain, canvas, color) =>
    {
	let spec = fft.getValue();
	let c = canvas;
	let ctx = c.getContext("2d");
	const width = parseFloat(c.getAttribute("width"));
	const height = parseFloat(c.getAttribute("height"));
	const g = parseFloat(gain);
	// shift everything to the left by one col of pixels	  
	let imageData = ctx.getImageData(1, 0, width - 1, height);
	ctx.putImageData(imageData, 0, 0);

	if(height < fft.size){
	    let samps_per_pixel = Math.floor(fft.size / height);
	    for(i = 0; i < height; i++){
		let y = 0;
		for(j = 0; j < samps_per_pixel; j++){
		    y += spec[j + (i * samps_per_pixel)];
		}
		y /= samps_per_pixel;
		ctx.fillStyle = `hsl(
        	  	${Math.floor(y * g * 360.)},
        	  	${Math.floor(y * g * 100.)}%,
	          	${Math.floor(y * g * 100.)}%)`;
		ctx.fillRect(width - 1, height - i - 1, 1, 1);
	    }
	}else{
	    let pixels_per_samp = Math.floor(height / fft.size);
	    for(i = 0; i < fft.size; i++){
		let y = spec[i];
		ctx.fillStyle = `hsl(
        	  	${Math.floor(y * g * 360.)},
        	  	${Math.floor(y * g * 100.)}%,
	          	${Math.floor(y * g * 100.)}%)`;
		ctx.fillRect(width - 1, height - (i * pixels_per_samp) - 1, 1, pixels_per_samp);
	    }
	}
    },
    draw_scope : (analyser, gain, samps_per_pixel, lasty, canvas, color) =>
    {
	let sv = analyser.getValue();
	const svs = analyser.size;
	let c = canvas;
	let ctx = c.getContext("2d");
	const width = parseFloat(c.getAttribute("width"));
	const height = parseFloat(c.getAttribute("height"));
	const g = parseFloat(gain);
	if(samps_per_pixel < 1){
	    samps_per_pixel = 1;
	}
	if(samps_per_pixel > svs){
	    samps_per_pixel = svs;
	}

	const pix_to_draw = (svs / samps_per_pixel);
	//console.log("svs = " + svs + " samps_per_pixel = " + samps_per_pixel + " pix_to_draw = " + pix_to_draw);
	// shift everything to the left by one col of pixels
	let imageData;
	if(pix_to_draw < width){
	    imageData = ctx.getImageData(pix_to_draw - 1, 0, (width - 1) - pix_to_draw, height);
	}
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, width, height);
	if(pix_to_draw < width){
	    ctx.putImageData(imageData, 0, 0);
	}
	
	// ctx.clearRect(0, 0, width, height);
	// ctx.fillStyle = "#000000";
	// ctx.fillRect(0, 0, width, height);
	ctx.strokeStyle = "#FFFFFF";
	ctx.beginPath();
	let x = (width - 1) - pix_to_draw;
	let y = 0;
	ctx.moveTo(x - 1, lasty);
	for(i = 0; i < pix_to_draw; i++){
	    // y = 0;
	    // for(j = 0; j < samps_per_pixel; j++){
	    //     y += sv[i + (j * samps_per_pixel)];
	    // }
	    // y /= samps_per_pixel;
	    y = sv[i * samps_per_pixel];
	    y = ((-y + 1.) / 2.) * height;
	    ctx.lineTo(x, y);
	    ++x;
	}
	
	//ctx.closePath();
	//ctx.fill();
	ctx.stroke();
	return y;
    },
    plot2d : (canvas, params = {}) =>
    {
	let p = {
	    _canvas : canvas,
	    _xmin : -1.0,
	    _xmax : 1.0,
	    _ymin : -1.0,
	    _ymax : 1.0,
	    _xs : [],
	    _ys : [],
	    _gridx : [],
	    _gridy : [],
	    _gridpx : undefined,
	    _connected : true,
	    _pointsize : 3,
	    _fillpoints : true,
	    _linedash : [],
	    _linewidth : 2,
	    _bgcolor : "#FFFFFF",
	    _pointcolor : "#000000",
	    _linecolor : "#000000",
	    scale : (x, imin, imax, omin, omax) => {
		return (((x - imin) / (imax - imin)) * (omax - omin)) + omin;
	    },
	    redraw : function()
	    {
		let c = this._canvas;
		let ctx = c.getContext("2d");
		const w = c.width;
		const h = c.height;
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = this._bgcolor;
		ctx.fillRect(0, 0, w, h);
		if(this._gridpx != undefined){
		    ctx.putImageData(this._gridpx, 0, 0);
		}
		const xs = this._xs;
		const ys = this._ys;
		const n = xs.length < ys.length ? xs.length : ys.length;
		if(n <= 0){
		    return;
		}
		const xmin = this._xmin;
		const xmax = this._xmax;
		const ymin = this._ymin;
		const ymax = this._ymax;
		const ps = this._pointsize;
		const twopi = Math.PI * 2;
		if(ps > 0){
		    for(i = 0; i < n; i++){
			const x = this.scale(xs[i], xmin, xmax, 0, w);
			const y = this.scale(ys[i], ymin, ymax, h, 0);
			// console.log("xs[" + i + "] = " + xs[i] +
			// 	    " x = " + x +
			// 	    " ys[" + i + "] = " + ys[i] +
			// 	    " y = " + y);
			ctx.beginPath();
			ctx.arc(x, y, ps, 0, twopi);
			if(this._fillpoints){
			    ctx.fillStyle = this._pointcolor;
			    ctx.fill();
			}else{
			    ctx.strokeStyle = this._pointcolor;
			    ctx.stroke();
			}
		    }
		    
		}
		if(this._connected){
		    let x = this.scale(xs[0], xmin, xmax, 0, w);
		    let y = this.scale(ys[0], ymin, ymax, h, 0);
		    ctx.beginPath();
		    ctx.moveTo(x, y);
		    for(i = 1; i < n; i++){
			x = this.scale(xs[i], xmin, xmax, 0, w);
			y = this.scale(ys[i], ymin, ymax, h, 0);
			// console.log("xs[" + i + "] = " + xs[i] +
			// 	    " x = " + x +
			// 	    " ys[" + i + "] = " + ys[i] +
			// 	    " y = " + y);
			ctx.lineTo(x, y);
		    }
		    ctx.lineWidth = this._linewidth;
		    ctx.strokeStyle = this._pointcolor;
		    ctx.stroke();
		}
	    },
	    updategrid : function()
	    {
		let c = this._canvas;
		let ctx = c.getContext("2d");
		const w = c.width;
		const h = c.height;
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = this._bgcolor;
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = this._linecolor;
		const gridx = this._gridx;
		const gridy = this._gridy;
		const xmin = this._xmin;
		const xmax = this._xmax;
		const ymin = this._ymin;
		const ymax = this._ymax;
		for(i = 0; i < gridx.length; i++){
		    const x = this.scale(gridx[i], xmin, xmax, 0, w);
		    ctx.beginPath();
		    ctx.moveTo(x, h);
		    ctx.lineTo(x, 0);
		    ctx.stroke();
		}
		for(i = 0; i < gridy.length; i++){
		    const y = this.scale(gridy[i], ymin, ymax, h, 0);
		    ctx.beginPath();
		    ctx.moveTo(0, y);
		    ctx.lineTo(w, y);
		    ctx.stroke();
		}
		this._gridpx = ctx.getImageData(0, 0, w, h);
		ctx.clearRect(0, 0, w, h);
	    },
	    accparam : function(param, val = undefined)
	    {
		if(val == undefined){
		    return this[param];
		}else{
		    this[param] = val;
		    this.redraw();
		}
	    },
	    xmin : function(v){return this.accparam('_xmin', v)},
	    xmax : function(v){return this.accparam('_xmax', v)},
	    ymin : function(v){return this.accparam('_ymin', v)},
	    ymax : function(v){return this.accparam('_ymax', v)},
	    xs : function(v){return this.accparam('_xs', v)},
	    ys : function(v){return this.accparam('_ys', v)},
	    gridx : function(v){
		const ret = this.accparam('_gridx', v);
		this.updategrid();
		this.redraw();
		return ret;
	    },
	    gridy : function(v){
		const ret = this.accparam('_gridy', v);
		this.updategrid();
		this.redraw();
		return ret;
	    },
	    connected : function(v){return this.accparam('_connected', v)},
	    linedash : function(v){return this.accparam('_linedash', v)},
	    bgcolor : function(v){return this.accparam('_bgcolor', v)},
	    pointcolor : function(v){return this.accparam('_pointcolor', v)},
	    linecolor : function(v){return this.accparam('_linecolor', v)}
	};
	for(const [k, v] of Object.entries(params)){
	    p[k](v);
	}
	if(p.gridx().length || p.gridy().length){
	    p.updategrid();
	}
	p.redraw();
	return p;
    }
};
