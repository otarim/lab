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
var ES3MEHTHODS = ['pop','push','shift','unshift','slice','reverse','concat','join'];
var ES5POLLYFILL = ['fill','forEach','map','reduce','every','some','filter','reduceRight'];
// 'splice','sort','indexOf','lastIndexOf'
var ArrayProto = Array.prototype;
var mothodHooks = {
	// [].fill.call({length: 3}, 4) this ---> length: 3
	fill: function(value,start,end){
		// 空数组无法map,forEach...
		var ret;
		start = start || 0;
		end = end || this.length;
		var newArr = (function(len){
			var ret = [];
			for(var i = 0;i < len;i++){
				ret.push(value);
			}
			return ret;
		})(end - start) 
		ret = this.slice(0,start).concat(newArr,this.slice(end,this.length))
		return ret;
	},
	forEach: function(callback,thisArg){
		for(var i = 0,l = this.length;i < l;i++){
            callback.call(thisArg || null,this[i],i,this);
        }
	},
	filter: function(callback,thisArg){
		var ret = [];
        for(var i = 0,l = this.length;i < l;i++){
            if(callback.apply(thisArg || null,[this[i],i,this]) === true){
                ret.push(this[i]);
            }
        }
        return ret;
	},
	map: function(callback,thisArg){
        var ret = [];
        for(var i = 0,l = this.length;i < l;i++){
            ret.push(callback.apply(thisArg || null,[this[i],i,this]));
        }
        return ret;
    },
    some: function(callback,thisArg){
    	var ret = false;
        for(var i = 0,l = this.length;i < l;i++){
            if(callback.apply(thisArg || null,[this[i],i,this]) === true){
                ret = true;
                return ret;
            }
        }
        return ret;
    },
    every: function(callback,thisArg){
    	var ret = false;
        for(var i = 0,l = this.length;i < l;i++){
            if(callback.apply(thisArg || null,[this[i],i,this]) === true){
                ret = true;
                return ret;
            }
        }
        return ret;
    },
    reduce: function(callback,thisArg){
		var processArr = this.slice(),
            preValue = typeof begin !== 'undefined' ? begin : processArr[0],
            curId = typeof begin !== 'undefined' ? 0 : 1,
            len = typeof begin !== 'undefined' ? processArr.length : processArr.length - 1,
            curValue;
        while(len){
            curValue = this[curId];
            preValue = callback.apply(processArr,[preValue,curValue,curId,this]);
            curId++;
            len--;
        }
        return preValue;
    },
    reduceRight: function(callback,thisArg){

    }
}
var List = function(arr){
	this.listSize = arr && arr.length || 0;
	this.dataStore = arr || [];
	this.pos = 0;	
}
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
	splice: function(){

	},
	sort: function(){

	},
	indexOf: function(){

	},
	lastIndexOf: function(){
		
	}
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
	}
}
for(var i = 0,l = ES3MEHTHODS.length;i < l;i++){
	(function(i){
		List.prototype[ES3MEHTHODS[i]] = function(){
			return ArrayProto[ES3MEHTHODS[i]].apply(this.dataStore,arguments);
		}
	})(i)
}
for(var i = 0,l = ES5POLLYFILL.length;i < l;i++){
	var method = ES5POLLYFILL[i];
	(function(method){
		if(typeof ArrayProto[method] === 'function'){
			List.prototype[method] = function(){
				var args = ArrayProto.slice.call(arguments);
				return ArrayProto[method].apply(this.dataStore, args);
			}
		}else{
			List.prototype[method] = function(){
				var args = ArrayProto.slice.call(arguments);
				return mothodHooks[method].apply(this.dataStore,args);
			}
		}
	})(method)
}
var list = new List([1,2,3,{a:2}]);
console.log(list.some(function(i){
	return i === 1
}))
console.log(list)
