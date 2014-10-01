;(function(exports){
	// todo direction
	// todo add step
	// todo add resize
	// Progress({
	// 		direction: string,
	// 		max: num,
	// 		min: num,
	// 		value: num,
	// 		className: string,
	// 		target: object,
	// 		callback: function(){}
	// })
	var CONFIG = {
		max: 100,
		min: 0,
		value: 0
	}
	var Progress = function(config){
		var self = this;
		if(!(self instanceof Progress)){
			self = Object.create(Progress.prototype);
		}
		Object.keys(config).forEach(function(key){
			self[key] = (config[key] || CONFIG[key]);
		})
		self.init();
	}
	Progress.prototype = Object.create({},{
		init: {
			value: function(){
				var offset = getOffset(this.target),self = this;
				this.buildBar(offset);
				this.topValue = offset.width;
				this.bottomValue = offset.height;
				this.bindEvent(function(value){
					// update value
					self.value = value;
				});
			}
		},
		buildBar: {
			value: function(offset){
				var bar = this.bar = document.createElement('i'),
					marker = this.marker = document.createElement('div');
				var target = this.target;
				var percentCount = function(value,total){
					return value / total;
				}
				bar.setAttribute('draggable',true);
				bar.style.cssText = 'position: absolute;;top: 0;right: 0;width: '+offset.height+'px;height: '+offset.height+'px;background: #000;';
				marker.style.width = percentCount(this.value - this.min,this.max - this.min) * offset.width + 'px';
				marker.className = this.className;
				marker.appendChild(bar);
				target.appendChild(marker);
				return this;
			}
		},
		bindEvent: {
			value: function(callback){
				var curPos = {}, self = this,
					market = this.marker,marketStyle = market.style,
					topValue = this.topValue,bottomValue = this.bottomValue,curElemPos;
				var onDarg = function(e){
					var calPos = curElemPos + e.pageX - curPos.x;
					if(calPos > topValue){
						calPos = topValue;
					}
					if(calPos < bottomValue){
						calPos = bottomValue;
					}
					marketStyle.width = calPos + 'px';
				}
				var onDragend = function(e){
					var curElemValue = parseFloat(marketStyle.width),
						value = Math.floor((curElemValue - bottomValue) / (topValue - bottomValue) * self.max);
					self.bar.removeEventListener('drag',onDarg,false);
					self.bar.removeEventListener('dragend',onDragend,false);
					document.ondragover = document.ondrop = null;
					callback && callback(value);
					self.callback && self.callback(value);
				}
				this.bar.addEventListener('dragstart',function(e){
					curPos.x = e.pageX;
					e.dataTransfer.effectAllowed = 'move';
					// curPos.y = e.pageY;
					curElemPos = parseFloat(marketStyle.width);
					self.bar.addEventListener('drag',onDarg,false);
					self.bar.addEventListener('dragend',onDragend,false);
					document.ondragover = document.ondrop = function(e){
				        e.preventDefault();
				    }
				},false)
			}
		}
	})
	function getOffset(el){
		return {
			width: el.offsetWidth,
			height: el.offsetHeight
		}
	}
	exports.Progress = Progress;
})(window)