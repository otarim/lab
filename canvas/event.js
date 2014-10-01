var Shape = function(config){
	var self = this;
	if(!(self instanceof Shape)){
		self = Object.create(Shape.prototype)
	}
	self.prop = config.prop;
	self.event = config.event || {};
	return self;
}
// Shape.instance = [];
Shape.prototype = Object.create({},{
	draw: {
		value: function(ctx){
			var prop = this.prop;
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(prop.x,prop.y);
			ctx.rect(prop.x,prop.y,prop.w,prop.h);
			ctx.fillStyle = prop.color;
			ctx.fill();
			ctx.restore();
			return this;
		}
	},
	reDraw: {
		value: function(ctx,point,eventType,e){
			var prop = this.prop;
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(prop.x,prop.y);
			ctx.rect(prop.x,prop.y,prop.w,prop.h);
			ctx.fillStyle = prop.color;
			/**
			 * 事件处理--遍历 item，判断 isPointInPath,执行对应的存在的 event 方法
			 */			
			if(this.event[eventType] && ctx.isPointInPath(point.x,point.y)){
				this.emit(eventType,e,ctx);
				this.draw(ctx);
			}else{
				ctx.fill();
				ctx.restore();
			}
			return this;
		}
	},
	/**
	 * [bind canvas 绑定事件接口]
	 * @type {Object}
	 */
	bind: {
		value: function(context){
			var self = this,
				eventObj = this.event;
			context.addEvent(Object.keys(eventObj));
			return this;
		}
	},
	emit: {
		value: function(eventType,e){
			this.event[eventType].call(this,e);
			return this;
		}
	}
})
var Canvas = function(config){
	var self = this;
	if(!(self instanceof Canvas)){
		self = Object.create(Canvas.prototype)
	}
	self.items = [];
	self.insertTarget = config.insertTarget || document.body;
	self.config = config.config;
	/**
	 * [events 存储 item 元素事件名，用于判断是否注册事件]
	 * @type {Object}
	 */
	self.events = [];
	self.init();
	return self;
}
Canvas.prototype = Object.create({},{
	init: {
		value: function(){
			var config = this.config;
			this.canvas = document.createElement('canvas');
			this.canvas.width = config.w;
			this.canvas.height = config.h;
			this.ctx = this.canvas.getContext('2d');
			this.insertTarget.appendChild(this.canvas);
			return this;
		}
	},
	clear: {
		value: function(){
			this.canvas.width = this.config.w;
			this.canvas.height = this.config.h;
		}
	},
	addItem: {
		value: function(instances){
			var items = this.items,
				ctx = this.ctx,
				instances = [].concat(instances);
			instances.forEach(function(instance){
				// draw
				instance.draw(ctx);
				// addEvent
				instance.bind(this);
				// add to items
				items.push(instance);	
			},this)
			return this;
		}
	},
	/**
	 * [addEvent Shape 接受事件接口]
	 * @type {Object}
	 */
	addEvent: {
		value: function(eventList){
			var canvas = this.canvas, items = this.items, ctx = this.ctx, events = this.events, self = this;
			var getPoint = function(e){
				return {
					x: e.layerX,
					y: e.layerY
				}
			}
			var checkQueue = function(e,type){
				self.clear();
				var point = getPoint(e);
				items.forEach(function(item){
					item.reDraw(ctx,point,type,e);
				})
			}
			/**
			 * 存在事件名，跳过
			 * 不存在事件名，绑定事件名
			 */
			eventList.forEach(function(eventType,index){
				if(events.indexOf(eventType) === -1){
					events.push(eventType);
					canvas.addEventListener(eventType,function(e){
						checkQueue(e,eventType);
					},false)	
				}
			})
		}
	}
});
var canvas = Canvas({
	config: {
		w: 1200, h: 720
	} 
})
var shape1 = Shape({
	prop: {type: 'rect', x: 20, y: 30, w: 400, h: 300, color: '#ff0000'},
	event: {
		click: function(e){
			console.log('click2')
		}
	}
});
var shape2 = Shape({
	prop: {
		type: 'rect', x: 40, y: 60, w: 200, h: 100, color: '#ff00ff'
	},
	event: {
		mousedown: function(e){
			this._x = e.layerX;
			this._y = e.layerY;
			this.__x = this.prop.x;
			this.__y = this.prop.y;
			this.active = true;
		},
		mousemove: function(e){
			if(this.active){
				var prop = this.prop;
				prop.fillStyle = '#fff0ff';
				prop.x = this.__x + e.layerX - this._x;
				prop.y = this.__y + e.layerY - this._y;
			}
		},
		mouseup : function(e){
			this.active = false;
		}
	}
});
canvas.addItem([shape1,shape2]);