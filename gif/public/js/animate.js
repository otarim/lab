;(function(exports,undefined){
exports.requestAnimationFrame = exports.requestAnimationFrame ||
    exports.mozRequestAnimationFrame ||
    exports.webkitRequestAnimationFrame ||
    exports.msRequestAnimationFrame ||
    exports.oRequestAnimationFrame ||
    function(callback) {return setTimeout(callback, 1e3 / 60); };
exports.cancelAnimationFrame = exports.cancelAnimationFrame ||
    exports.mozCancelAnimationFrame ||
    exports.webkitCancelAnimationFrame ||
    exports.msCancelAnimationFrame ||
    exports.oCancelAnimationFrame ||
    function(callback) {return clearTimeout(callback, 1e3 / 60); };
if(typeof Object.create !== 'function'){
	Object.create = function(proto){
		var F = function(){}
		F.prototype = proto;
		return new F;
	}
}
var prefix = ['webkit','moz','ms','o'];
var support = (function(){
	var testElem = document.createElement('otarim'),
		testStyle = testElem.style;
	var test = function(cssText){
		testStyle.cssText = cssText;
	}
	var support = {
		opacity: (function(){
			test('opacity: .5');
			return (/^0.5$/).test(testStyle.opacity);
		})()
	}
	return support;
})();
var cssHooks = {
	opacity: {
		get: function(el){
			var ropacity = /opacity=([^)]*)/,ret;
			// 低版本正则匹配
			if(!support.opacity && el.currentStyle){
				ret = ropacity.test(el.currentStyle.filter || '') ?
                        (parseFloat(RegExp.$1) / 100) + '' : '';
                return ret === '' ? '1' : ret;
			}
			// 高版本
			ret = document.defaultView.getComputedStyle(el,null).getPropertyValue('opacity');
			return ret;
		},
		set: function(el,value){
			var style = el.style,
				ralpha = /alpha\([^)]*\)/,opacity,filter;
			if(!support.opacity){
				style.zoom = 1;
	            // Set the alpha filter to set the opacity
	            opacity = isNaN(+value) ? '' : 'alpha(opacity=' + value * 100 + ')';
	            //修复IE下图片透明度滤镜可能会出现白点
	            if( value >= 1 ){
	                opacity = ''; 
	            }
	            filter = style.filter || '';
	            style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : opacity;
			}else{
				el.style.opacity = value;
			}
		}
	},
	scrollTop: {
		get: function(el){
			var ret;
			if(el === document){
				ret = document.body.scrollTop + document.documentElement.scrollTop;
			}else{
				ret = el.scrollTop
			}
			return ret;
		},
		set: function(el,value){
			if(el === document){
				el.body.scrollTop = document.documentElement.scrollTop = value;
			}else{
				el.scrollTop = value
			}
		}
	}
}
var getStyle = (function(){
	// opacity
	var rnumpx = /^-?\d+(?:px)?$/i,
		rnum = /^-?\d/;
	var postFix = function(el,prop,value){
		var style = el.style,
			left = el.runtimeStyle.left,
			ret;
		if(prop.toLowerCase() === 'fontSize'){
			value = '1em';
		}
  		style.left = value;
  		ret = style.pixelLeft;
  		el.runtimeStyle.left = left;
  		return ret;
	}
	
	if(document.defaultView && document.defaultView.getComputedStyle){
		return function(el,prop){
			if(cssHooks[prop]){
				return cssHooks[prop].get(el,prop);
			}
			return document.defaultView.getComputedStyle(el,null).getPropertyValue(prop);
		}
	}else{
		return function(el,prop){
			if(cssHooks[prop]){
				return cssHooks[prop].get(el);
			}
			// 处理 em 的情况
			var ret = el.currentStyle[prop];
			if(!rnumpx.test(ret) && rnum.test(ret)){
				ret = postFix(el,prop,ret);
			}
			return ret;
		}
	}
})();
var Effect = {
	linear: function(a) {
		return a
	},
	ease: function(a) {
		return a * a
	},
	'ease-in': function(a) {
		return a * a * a
	},
	'ease-out': function(a) {
		return --a * a * a + 1
	},
	'ease-in-out': function(a) {
		return (a *= 2) < 1 ? .5 * a * a * a : .5 * ((a -= 2) * a * a + 2)
	}
}		
function coPrefixProp(prop){
	var style = document.createElement('a').style,l,origName;
	prop = camelCase(prop);
	if(prop.toLowerCase() === 'float'){
		return !!style.cssFloat ? 'cssFloat' : 'styleFloat';
	}
	if(prop in style){
		return prop;
	}
	origName = prop;
	prop = prop.charAt(0).toUpperCase() + prop.slice(1);
	l = prefix.length;
	while(l--){
		if(prefix[l] + prop in style){
			return prefix[l] + prop;
		}
	}
	return origName;
}
function vendorPropName(props){
	var ret = {};
	for(var i in props){
		if(props.hasOwnProperty(i)){
			ret[coPrefixProp(i)] = props[i];
		}
	}
	return ret;
}
function camelCase(el){
	return el.replace(/-([a-z])/gi,function(all,letter){return letter.toUpperCase()})
}
function Animate(elem,props,duration,effect,callback){
	var self = this;
	if(!(this instanceof Animate)){
		// new 无法 apply 的问题
		// return new Animate(arguments);
		self = Object.create(Animate.prototype);
	}
	self.queue = [];
	self.elem = elem; // 非数组
	self.targetProps = props;
	self.duration = duration || 400;
	self.timer = null;
	self.effect = Effect[effect] || Effect.linear;
	self.callback = callback;
	self.init();
	return self;
}
Animate.prototype = {
	init: function(){
		this.makeAnimateQueue();
		this.doAnimate();
	},
	makeAnimateQueue: function(){
		var targetProps = this.targetProps;
		var getInitalStyle = function(el,targetProps){
			var ret = {el: el,style: {}};
			for(var i in targetProps){
				if(targetProps.hasOwnProperty(i)){
					ret.style[i] = getStyle(el,i) || 0;
				}
			}
			return ret;
		}
		if(this.elem.length){
			for(var i = 0,l = this.elem.length;i < l;i++){
				this.queue.push(getInitalStyle(this.elem[i],targetProps));
			}
		}else{
			this.queue.push(getInitalStyle(this.elem,targetProps));
		}
		targetProps = vendorPropName(targetProps);
	},
	doAnimate: function(){
		var t = new Date,
			duration = this.duration,
			rUnit = /[a-z]+$/,
			targetProps = this.targetProps,
			self = this,step;
		var calc = function(){
			if((step = (new Date - t) / duration) >= 1){
				cancelAnimationFrame(self.timer);
				setValue(true);
				self.queue = [];
				self.callback && self.callback();
			}else{
				setValue();
				self.timer = requestAnimationFrame(calc);
			}
		}
		var getUnit = function(prop){
			return prop === 'opacity' ? '' : 'px';
		}
		var setValue = function(done){
			var unit,initStyle,tmpValue;
			for(var i = 0,l = self.queue.length;i < l; i++){
				initStyle = self.queue[i].style;
				style = self.queue[i].el.style;
				for(var j in targetProps){
					if(targetProps.hasOwnProperty(j)){
						if(done){
							// setStyle,handle opacity
							tmpValue = targetProps[j];
						}else{
							tmpValue = self.effect(step) * (parseInt(targetProps[j],10) - parseInt(initStyle[j],10)) + parseInt(initStyle[j],10);
						}
						if(cssHooks[j]){
							cssHooks[j].set(self.queue[i].el,tmpValue);
						}else{
							style[j] = tmpValue + getUnit(j);
						}
					}
				}
			}
		}
		calc();
	},
	stop: function(){
		cancelAnimationFrame(this.timer);
	}
}
exports.Animate = Animate;
})(window)