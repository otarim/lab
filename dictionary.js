'use strict'
var Dict = function(values){
	this.values = values || Object.create(null); 
}
var hasOwnProperty = Object.prototype.hasOwnProperty;
var isObject = function(obj){
	return Object.prototype.toString.call(obj).slice(8,-1) === 'Object';
}
var isArray = function(arr){
	if(typeof Array.isArray === 'function'){
		return Array.isArray(arr);
	}else{
		return Object.prototype.toString.call(arr).slice(8,-1) === 'Array';
	}
}
if(typeof Object.create !== 'function'){
	Object.create = (function(){
		var F = function(){};
		return function(proto){
			F.prototype = proto;
			return new F;
		}
	})()
}
Dict.prototype = {
	constructor: Dict,
	get: function(key){
		return this.values[key];
	},
	add: function(){
		var arg;
		// add(key,value)
		// add({key:value...})
		if(arguments.length === 2){
			this.values[arguments[0]] = arguments[1];
		}else if(isObject(arguments[0])){
			arg = arguments[0];
			for(var i in arg){
				if(hasOwnProperty.call(arg,i)){
					this.values[i] = arg[i];
				}
			}
		}
		return this;
	},
	edit: function(key,value){
		if(this.contains(key)){
			this.add(key,value)
		}
		return this; 
	},
	remove: function(){
		var arg = Array.prototype.slice.call(arguments);
		for(var i = 0,l = arg.length;i < l;i++){
			delete this.values[arg[i]];
		}
		return this;
	},
	each: function(callback,context){
		var values = this.values;
		for(var i in values){
			if(hasOwnProperty.call(values,i)){
				callback.call(context || this.values,i,values[i]);
			}
		}
		return this;
	},
	keys: (function(){
		// 返回包含 key 的数组
		if(typeof Object.keys === 'function'){
			return function(){
				return Object.keys(this.values)
			}
		}else{
			return function(){
				var ret = [];
				this.each(function(key){
					ret.push(key)
				}) 
				return ret;
			}
		}
	})(),
	contains: function(key){
		return key !== '_proto_' && hasOwnProperty.call(this.values,key);
	},
	toString: (function(){
		// JSON.stringify
		if(JSON && typeof JSON.stringify === 'function'){
			return function(){
				return JSON.stringify(this.values)
			}
		}else{
			var parse = function(input){
				if(isArray(input)){
					for(var i = 0;i < input.length;i++){
						input[i] = parse(input[i]);
					}
					return '[' + input.join(',') + ']';
				}else if(isObject(input)){
					var ret = [];
					for(var i in input){
						if(input.hasOwnProperty(i)){
							ret.push('"' + i + '":' + parse(input[i]));
						}
					}
					return '{' + ret.join(',') + '}';
				}else if(typeof input === "string"){
		            return '"' + input.toString() + '"';
		        }else{
		            return input.toString();
		        }
			}
			return function(){
				return parse(this.values);
			}
		}
	})(),
	equal: function(obj){
		return this.toString() === (new Dict(obj).toString());
	},
	slice: function(from,to){

	},
	length: (function(){
		// current context is global
		if(typeof Object.keys !== 'function'){
			return function(){
				return Object.keys(this.values).length;
			}
		}else{
			return function(){
				var length = 0;
				this.each(function(){
					length++;
				})
				return length;
			}
		}
	})(),
	clear: function(){
		// 建议尽可能避免使用delete，不利于引擎优化
		this.values = {};
		return this;
	},
	isEmpty: function(){
		return !this.length();
	},
	clone: function(deep){
		// 深拷贝，浅拷贝
		// 深拷贝，每一项都取消引用
		function clone(input,deep){
			// time,dom,object,array,null
			var ret;
			if(isArray(input)){
				if(deep){
					ret = [];
					for(var i = 0,l = input.length;i < l;i++){
						ret[i] = clone(input[i],true);
					}
				}else{
					ret = Array.prototype.slice.call(input);
				}
				return ret;
			}
			if(isObject(input)){
				ret = {};
				for(var i in input){
					ret[i] = deep ? clone(input[i],true) : input[i];
				}
				return ret;	
			}
			if(input && input.nodeType && typeof input.cloneNode === 'function' && deep){
				// null...
				return input.cloneNode(true);
			}
			return input;
		}
		return clone(this,deep);
	},
	extend: function(target,overwrite){
		var source = this.values;
		var extend = function(target,source,overwrite){
			for(var i in source){
				if(hasOwnProperty.call(source,i)){
					if(isObject(source[i]) && isObject(target[i]) && hasOwnProperty.call(target,i) && typeof target[i] !== 'undefined'){
						target[i] = extend(target[i],source[i],overwrite);
					}else{
						if(hasOwnProperty.call(target,i) && typeof target[i] !== 'undefined'){
							if(overwrite === true){
								continue;
							}else{
								target[i] = source[i];
							}
						}else{
							target[i] = source[i];
						}	
					}	
				}
			}
			return target;
		}
		this.values = extend(source,target,overwrite);
		return this;
	}
}
var bb = [1,2,3,4];
var obj = new Dict({a:2,b:4,c:bb,e: [bb],z: new Dict({a:20,k: null})});
var blank = new Dict();
var obj2 = obj.clone(true);
bb.shift();
console.log(obj.get('a'));
// console.log(obj.remove('a','b'))
console.log(obj.edit('a',30));
obj.each(function(key,value){
	console.log(key,value)
})
console.log(obj.length(),obj.isEmpty())
console.log(obj2)
console.log(obj2.extend({a:30,z: {b:30}},true))
// console.log(obj.clear(),obj.isEmpty())
console.log(blank.add('fuck',{a:20}));
console.log(blank.get(['fuck']))
console.log(blank.toString(),obj.toString(),obj.keys(),obj.get('z').get('a'));
var arrr = [1,2,3];
var o1 = new Dict({a:20,b:arrr});
var o2 = {a:20,b:[1,2,3]};
console.log(o1.equal(o2))

