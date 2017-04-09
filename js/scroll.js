function barScroll(oBar,barParent,oList,oFresh,who){
	var reY=who?1.5:2;oList.style.cursor='pointer';
	var barHeight=0,maxTop=0;
	oList.ontouchstart=function(ev){
		barHeight=Math.round(barParent.offsetHeight*barParent.offsetHeight/oList.offsetHeight);
		maxTop=barParent.offsetHeight-oList.offsetHeight-20;
		if(oFresh){ var oP=oFresh.getElementsByTagName('p')[0],oArrow=oFresh.getElementsByTagName('img')[0]; }
		
		if(barHeight>=barParent.offsetHeight){barHeight=0;} else if(barHeight<=40){barHeight=40;}
		oBar.style.height = barHeight+'px';
		
		clearInterval(oList.timer);clearInterval(oBar.timer);
		oBar.style.display='block'; oBar.style.opacity=0.5;oList.style.cursor='pointer';
		
		var touch=ev.changedTouches[0];
		var disY=touch.pageY,listTop=oList.offsetTop;
		var preY=touch.pageY,speedY=0;
		var onoff=true;
		
		if(this.setCapture){this.setCapture();}
		var _this=this;

		document.ontouchmove=function(ev){
			var touch=ev.changedTouches[0];
			speedY=touch.pageY-preY; preY=touch.pageY;
			
			if(oList.offsetTop>=0){
				if(onoff){onoff=false;disY=touch.pageY;}
				
				if(oList.offsetTop>=-oFresh.offsetTop*reY){
					oArrow.onoff=true;oP.innerHTML='释放更新';oArrow.style.animation='arrowRotate 0.2s ease 1 forwards';
				}else{ 
					oP.innerHTML='下拉刷新';
					if(oArrow.onoff){oArrow.onoff=false;oArrow.style.animation='backwordsRotate 0.2s ease 1 forwards';}
				}
				oList.style.top=(touch.pageY-disY)/2.5+'px'; barStyle();
			}else if(oList.offsetTop<=maxTop){
				if(onoff){onoff=false;disY=touch.pageY}
				oList.style.top=(touch.pageY-disY)/2.5+maxTop+'px'; barStyle();
			}else{  oList.style.top=touch.pageY-disY+listTop+'px'; barStyle();  }
		}
		document.ontouchend=function(){
			document.ontouchmove=null;document.ontouchend=null;if(_this.releaseCapture){_this.releaseCapture();} oList.style.cursor='';
			clearInterval(oList.timer);
			oList.timer=setInterval(function(){
				if( Math.abs(speedY)<1 || oList.offsetTop>50 || oList.offsetTop<maxTop-50 ){
					clearInterval(oList.timer);
					if(oList.offsetTop>=0){ 						
						if(oList.offsetTop>=-oFresh.offsetTop*reY){
							oP.innerHTML='加载中…';
							if(who){oArrow.src='../img/00_loading3.gif';}else{oArrow.src='img/00_loading3.gif';}
							startMove(oList,{top:-oFresh.offsetTop*reY},220,'easeOut',function(){
								barHide();setTimeout(function(){
									startMove(oList,{top:0},250,'easeOut',function(){
										oP.innerHTML='下拉刷新';oArrow.onoff=false;
										if(who){oArrow.src='../img/00_refresh.png';}else{oArrow.src='img/00_refresh.png';}
										oArrow.style.animation='backwordsRotate 0s ease 1 forwards';
									});
								},1000);
							}); 
						}else{ startMove(oList,{top : 0},400,'easeOut',barHide); }
						
						startMove(oBar,{height:barHeight},400,'easeOut');

					}else if(oList.offsetTop<=maxTop){ 
						startMove(oList,{top : maxTop},400,'easeOut',barHide); 
						startMove(oBar,{height:barHeight,top:barParent.offsetHeight-barHeight},400,'easeOut');
					}else{ barHide(); }
				}else{  
					speedY*=0.95; oList.style.top=oList.offsetTop+speedY+'px'; barStyle();  
				}
			},12);
		}
		return false;
	}
	function barStyle(){			
		if(oList.offsetTop>=0){
			oBar.style.height=barHeight*(1-oList.offsetTop*2.5/barParent.offsetHeight)+'px';
			if(oBar.offsetHeight<20){oBar.style.height='20px';}
			oBar.style.top=0;
		}
		else if(oList.offsetTop<=maxTop){
			oBar.style.height=barHeight*(1-(maxTop-oList.offsetTop)*2.5/barParent.offsetHeight)+'px';
			if(oBar.offsetHeight<20){oBar.style.height='20px';}
			oBar.style.top=barParent.offsetHeight-oBar.offsetHeight+'px';
		}
		else{
			var iScale=(barParent.offsetHeight-oBar.offsetHeight)/maxTop;
			oBar.style.top=iScale*oList.offsetTop+'px';
		}
	}
	function barHide(){ startMove(oBar,{opacity:0},400,'easeOut',function(){ oBar.style.display='none';}); }
	
}

function startMove(obj,json,times,fx,fn,fnMove){
	var iCur = {};
	for(var attr in json){
		if(attr == 'opacity'){  iCur[attr] = Math.round(getStyle(obj,attr)*100);  }
		else{  iCur[attr] = parseInt(getStyle(obj,attr));  }
	}
	
	var startTime = now();
	
	clearInterval(obj.timer);
	obj.timer = setInterval(function(){
		
		var changeTime = now();
		
		var scale = 1 - Math.max(0,(startTime - changeTime + times)/times);
		
		if(fnMove){  fnMove(scale);  }
		
		for(var attr in json){
			                
			var value = Tween[fx](scale*times, iCur[attr] , json[attr] - iCur[attr] , times );
			
			if(attr == 'opacity'){
				obj.style.filter = 'alpha(opacity='+ value +')';
				obj.style.opacity = value/100;
			}
			else{ obj.style[attr] = value + 'px'; }
			
			if(scale==1){
				clearInterval(obj.timer);
				if(fn){ fn.call(obj); }
			}	
		}	
	},13);
	function now(){ return Date.now();  }
}

function getStyle(obj,attr){
	return getComputedStyle(obj,false)[attr];
}

var Tween = {
	linear: function (t, b, c, d){
		return c*t/d + b;
	},
	easeIn: function(t, b, c, d){
		return c*(t/=d)*t + b;
	},
	easeOut: function(t, b, c, d){
		return -c *(t/=d)*(t-2) + b;
	},
	easeBoth: function(t, b, c, d){
		if ((t/=d/2) < 1) {
			return c/2*t*t + b;
		}
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInStrong: function(t, b, c, d){
		return c*(t/=d)*t*t*t + b;
	},
	easeOutStrong: function(t, b, c, d){
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeBothStrong: function(t, b, c, d){
		if ((t/=d/2) < 1) {
			return c/2*t*t*t*t + b;
		}
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	}
}