var GifMaker = {
	queue: [],
	init: function(config,callback){
		var self = this;
		this.callback = callback;
		Object.keys(config).forEach(function(key){
			self[key] = self[key] || config[key]
		})
		this.gif = new GIF({
			workers: 2,
			quality: this.quality,
			workerScript: '../public/js/gif.worker.js'
		});
		this.gif.on('finished', function(blob) {
		  self.callback && self.callback(URL.createObjectURL(blob));
		});
	},
	add: function(el){
		this.queue.push(el);
	},
	render: function(photoMode){
		var fragment = document.createDocumentFragment(),
			delay = this.delay,
			self = this;
		var makeThumb = function(el,index){
			var container = document.createElement('div'),
				img = document.createElement('img');
			container.className = 'image-container' + (index === 0 ? ' selected' : '');
			container.dataset['url'] = container.appendChild(img).src = el.toDataURL('image/jpg');
			return container;
		}
		if(photoMode){
			this.queue.forEach(function(el,index){
				fragment.appendChild(makeThumb(el,index));
			})
			this.insertTarget.appendChild(fragment);
			// first frame;
			this.callback && this.callback(this.queue[0].toDataURL('image/jpg'));	
		}else{
			this.queue.forEach(function(el){
				self.gif.addFrame(el, {delay: delay});
			})
			this.gif.render();
		}		
	}
}
var OverLayer = (function(){
	var layer = document.createElement('div');
	var loadingImg = document.createElement('img');
	loadingImg.src = ((new Image).src = '../public/media/loading.gif');
	loadingImg.style.cssText = 'position: fixed;top: 50%;left: 50%;-webkit-transform: translate(-50%,-50%);';
	layer.style.cssText = 'position: fixed;top: 0;left: 0;bottom: 0;right: 0;background: rgba(0,0,0,0);z-index: -1;transition: all linear .5s';
	document.body.appendChild(layer);
	return {
		show: function(callback){
			layer.style.cssText += 'background: rgba(0,0,0,.8);z-index: 1000;';
			callback && callback();
		},
		hide: function(callback){
			layer.style.cssText += 'background: rgba(0,0,0,0);z-index: -1;';
			callback && callback();
		},
		loading: function(){
			layer.style.cssText += 'z-index: 1003;';
			layer.appendChild(loadingImg);
		},
		end: function(){
			layer.removeChild(loadingImg);
		}
	}
})();
var CountDown = (function(){
	var timmer = start = endTime = now = callbackFn = null;
	var countNum = document.createElement('strong');
	countNum.style.cssText = 'position: fixed;font-size: 200px;font-weight: bold;color: #fff;top: 50%;left: 50%;-webkit-transform: translate(-50%,-50%);z-index: 1002;';
	countNum.innerText = '';
	var run = function(){
		if(+new Date - now < endTime){
			countNum.innerText = start--;
			timmer = setTimeout(run,1000);
		}else{
			clearInterval(timmer);
			countNum.innerText = '';
			document.body.removeChild(countNum);
			callbackFn && callbackFn();
		}
	}
	return {
		start: function(duration,callback){
			now = +new Date;
			start = duration;
			endTime = start * 1000;
			callbackFn = callback;
			document.body.appendChild(countNum);
			run();
		}
	}
})();
var imgEditor = (function(){
	// 裁剪，缩放，旋转，图层，插入文字，插入语音,颜色选择器,马赛克
	// 文字编辑器
})();
function getTarget(el,callback){
	if(el === document || callback(el)){return el}
	while(el !== document && !callback(el = el.parentNode)){}
	return el;
}