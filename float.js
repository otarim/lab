// 浮点数参与四则运算都可能会有精度问题
// 所有语言都存在
// http://rockyee.iteye.com/blog/891538
// Number 自动去0操作
function fillZero(l){
	var ret = '';
	for(var i = 0;i < l;i++){
		ret += '0';
	}
	return ret;
}
function forEach(arr,callback){
	for(var i = 0,l = arr.length;i < l;i++){
		callback.call(arr,arr[i],i);
	}
}
Array.prototype.reduce = function(callback,begin){
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
};
function map(arr,callback){
	var ret = [];
	forEach(arr, function(item,index){
		ret.push(callback.call(arr,item,index))
	})
	return ret;
}
function _Pow(num,scale,symbol,intPart,floatPart){
	// Math.Pow(10,scale)
	var pointOffset = floatPart.length;
	if(scale >= pointOffset){
		num = symbol  + intPart + floatPart + fillZero(scale - pointOffset);
	}else{
		num = symbol  + intPart + floatPart.slice(0,scale) + '.' + floatPart.slice(pointOffset - scale);
	}
	return Number(num);
}
function _(num,scale,symbol,intPart,floatPart){
	// 1.23456 --> 0000123456 ->0.000123456
	// 12345.6 --> 123456 -> 12.3456
	// 位数不够，补0
	// 位数够，直接移动
	var pointOffset = intPart.length;
	if(scale >= pointOffset){
		num = symbol + '0' + '.' + fillZero(scale - pointOffset) + intPart + floatPart;
	}else{
		num = symbol + intPart.slice(0,pointOffset - scale) + '.' + intPart.slice(pointOffset - scale) + floatPart;
	}
	return Number(num);
}
function fix(fn,num,scale){
	num = String(num);
	var symbolIndex = num.indexOf('-') + 1,
		symbol = symbolIndex ? '-' : '',
		intPart = num.split('.')[0].slice(symbolIndex),
		floatPart = num.split('.')[1] || '';
	return fn(num,scale,symbol,intPart,floatPart);
}



function toFixed(num,bit){
	// 0.1234 fixed(2) --> 123.4 --> 123 0.123 
	var pointOffset = String(num).indexOf('.'),
		num = fix(_Pow,num,bit),round;
	if(pointOffset !== -1){
		round = String(num).charAt(pointOffset + bit + 2);
		if(round >= 5){
			num = Math.ceil(num);
		}else{
			num = Math.floor(num);
		}
	}
	return fix(_,num,bit)
}
function add(){
	// add(1,2,3,4.56,7.23,777)
	var args = Array.prototype.slice.call(arguments),ret;
	var maxOffset = Math.max.apply(null,map(args,function(item,index){
		return (String(item).split('.')[1] || '').length;
	}));
	args = map(args,function(item,index){
		return fix(_Pow,item,maxOffset);
	})
	ret = args.reduce(function(prev,cur){
		return prev + cur;
	})
	return fix(_,ret,maxOffset);
}
function sub(){
	// add(1,2,3,4.56,7.23,777)
	var args = Array.prototype.slice.call(arguments),ret;
	var maxOffset = Math.max.apply(null,map(args,function(item,index){
		return (String(item).split('.')[1] || '').length;
	}));
	args = map(args,function(item,index){
		return fix(_Pow,item,maxOffset);
	})
	ret = args.reduce(function(prev,cur){
		return prev - cur;
	})
	return fix(_,ret,maxOffset);
}
function mul(){
	var args = Array.prototype.slice.call(arguments),ret,totalOffset = 0;
	forEach(args,function(item,index){
		var len = (String(item).split('.')[1] || '').length;
		args[index] = fix(_Pow,item,len);
		totalOffset += len;
	});
	ret = args.reduce(function(prev,cur){
		return prev * cur;
	})
	return fix(_,ret,totalOffset);
}
function div(){
	var args = Array.prototype.slice.call(arguments),ret;
	ret = args.reduce(function(prev,cur){
		var len1 = (String(prev).split('.')[1] || '').length,
			len2 = (String(cur).split('.')[1] || '').length,
			max = Math.max(len1,len2);
		return fix(_Pow,prev,max) / fix(_Pow,cur,max);
	})
	return ret;
}
console.log(div(-2,50,0.0002));



function testRound()  
{  
    var dt, dtBegin, dtEnd, i;  
    dtBegin = new Date();  
    for (i=0; i<100000; i++)  
    {  
        dt = new Date();  
        // Number("0." + dt.getMilliseconds()).toFixed(2);  
       	fixed(Number("0." + dt.getMilliseconds()), 2)
    }  
    dtEnd = new Date();  
    console.log(dtEnd.getTime()-dtBegin.getTime());  
} 
// testRound()