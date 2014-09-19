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
var STANDARDMETHODS = ['pop','push','shift','unshift','slice','reverse','concat','join'];
var ArrayProto = Array.prototype;
var List = function(arr){
	this.listSize = arr && arr.length || 0;
	this.dataStore = arr || [];
	this.pos = 0;	
}
// fill,forEach,map,reduce,every,some,filter,reduceRight,splice,sort,indexOf,lastIndexOf
List.prototype = {
	constructor: List,
	append: function(el){
		this.dataStore[this.listSize++] = el;
		this.pos = this.listSize; //reset pos
		return this;
	},
	find: function(el){
		var ret = this.dataStore.filter(function(item){
			return item === el
		})
		return ret;
	},
	remove: function(el){
		var lastIndex = 0;
		for(var i = 0, l = this.dataStore.length;i<l;i++){
			if(this.dataStore[i] === el){
				this.listSize--; // async length
				l--;
				this.dataStore.splice(i--,1);
				lastIndex = i;
			}
		}
		this.pos = lastIndex; //reset pos
		return this;
	},
	length: function(){
		return this.listSize;
	},
	// toString: function(){
	// 	return this.dataStore.toString();
	// },
	toString: (function(){
		// JSON.stringify
		if(JSON && typeof JSON.stringify === 'function'){
			return function(){
				return JSON.stringify(this.dataStore)
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
				return parse(this.dataStore);
			}
		}
	})(),
	insert: function(elem,el){
		var args = [].slice.call(arguments),
			el = args.pop(),
			elem = args.shift(),
			lastIndex = 0;
		if(elem){
			for(var i = 0, l = this.dataStore.length;i<l;i++){
				if(this.dataStore[i] === elem){
					this.listSize++; // async length
					l++;
					this.dataStore.splice(i + 1,0,el);
					i++;
					lastIndex = i;
				}
			}
			this.pos = lastIndex; //reset pos	
		}else{
			this.listSize++;
			this.dataStore.splice(this.pos + 1,0,el);
			this.pos++;
		}
		return this;
	},
	clear: function(){
		// delete this.dataStore; 
		this.dataStore = [];
		this.pos = this.listSize = 0;
		return this;
	},
	contains: function(el){
		return this.dataStore.some(function(elem){
			return elem === el;
		})
	},
	front: function(){
		this.pos = 0;
		return this.dataStore[this.pos];
	},
	end: function(){
		this.pos = this.listSize - 1;
		return this.dataStore[this.pos];
	},
	prev: function(){
		if (this.pos > 0) {
			return this.dataStore[--this.pos];
		}
	},
	next: function(){
		if (this.pos < this.listSize - 1) {
           return this.dataStore[++this.pos];
        }
	},
	curPos: function(){
		return this.pos;
	},
	moveTo: function(pos){
		if(pos < this.listSize - 1){
			this.pos = pos;
		}
		return this.dataStore[this.pos];
	},
	getElem: function(){
		return this.dataStore[this.pos];
	},
	forEach: function(){
		
	}
}
for(var i = 0,l = STANDARDMETHODS.length;i < l;i++){
	(function(i){
		List.prototype[STANDARDMETHODS[i]] = function(){
			return ArrayProto[STANDARDMETHODS[i]].apply(this.dataStore,arguments);
		}
	})(i)
}
// var list = new List();
// var el = {a:'b'};
// list.append(el);
// list.append(el);
// list.append("Cynthia");
// list.append("Raymond");
// list.append("Barbara");
// console.log(list.find(el));
// console.log(list.remove('Cynthia'));
// console.log(list.insert(el,123));
// console.log(list.contains(el));
// console.log(list.curPos());
// // list.next();
// // list.next();
// // list.prev();
// // list.prev();
// console.log(list.curPos());
// console.log(list.front());
// console.log(list.next());
// console.log(list.moveTo(4));
// console.log(list.insert('otarim'));
// list.front();
// var len = list.length();
// while(len--){
// 	console.log(list.getElem());
// 	list.next();
// }
// var obj1 = {
// 	value: 123,
// 	arr: [1,2,3],
// 	obj: {
// 		headers: 'xml-http-request'
// 	}
// }
// var merge = function(target,source){
// 	for(var i in source){
// 		if(source.hasOwnProperty(i)){
// 			if(({}).toString.call(source[i]).slice(8,-1) === 'Object' && target[i]){
// 				target[i] = merge(target[i],source[i]);
// 			}else if(typeof target[i] === 'undefined'){
// 				target[i] = source[i];
// 			}
// 		}
// 	}
// 	return target;
// }
// var extend = function(target,source,overwrite){
// 	var hasOwnProperty = function(el,property){
// 		return el.hasOwnProperty(property) && typeof el[property] !== 'undefined';
// 	}
// 	var isObject = function(el){
// 		return Object.prototype.toString.call(el).slice(8,-1).toLowerCase() === 'object';
// 	}
// 	for(var i in source){
// 		if(source.hasOwnProperty(i)){
// 			if(isObject(source[i]) && isObject(target[i]) && hasOwnProperty(target,i)){
// 				target[i] = extend(target[i],source[i],overwrite);
// 			}else{
// 				if(hasOwnProperty(target,i)){
// 					if(overwrite === true){
// 						continue;
// 					}else{
// 						target[i] = source[i];
// 					}
// 				}else{
// 					target[i] = source[i];
// 				}	
// 			}	
// 		}
// 	}
// 	return target;
// }
// var a = extend({
// 	arr: [2,3],
// 	obj: null,
// 	el: 'xx'
// },obj1,true)
// console.log(a);
// console.log(obj1);
console.log((new List([1,2,3,{a:2}])).toString());
