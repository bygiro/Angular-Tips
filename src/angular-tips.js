/*! Angular Tips - v0.0.1
* Copyright (c) G. Tomaselli <girotomaselli@gmail.com> 2016; Licensed  
*/
angular.module('ng-tips', [])
.directive('ngTips', ["$timeout", "$compile",  "$parse", "$templateCache", function ($timeout, $compile, $parse, $templateCache) {
	
	var linkFunction = function(scope, element, attrs){
		var $ng = angular.element,
		isObj = angular.isObject,
		extend = angular.extend,
		copy = angular.copy,
		defaults = {
			template: '<div class="tooltip fade"><div class="tooltip-arrow"></div><div class="tooltip-inner"><tips></tips></div></div>',
			class: '',
			on: 'mouseenter mouseover touchenter',
			off: 'mouseleave mouseout touchleave',
			onOff: undefined,
			enable: undefined,
			placement: 'right',
			tipCloseOn: false, // events on the tip
			appendToBody: true // Should the tooltip be appended to 'body' instead to be after() the element?
		}, settings = extend({}, defaults, (scope.settings || {})),
		tipsEvents = {
			on: {},
			off: {}
		},
		types = ['on','off'],
		onEvents,
		offEvents,
		tipsActive = {},
		tipsPending = {},
		getById = document.getElementById,
		eleAttrs = ['template','class','on','off','onOff','enable','placement','appendtoBody','tipCloseOn'],
		tipsToShow = scope.tips;

		if(typeof tipsToShow == 'undefined') return;
		
		// get element options
		for(var a=0;a<eleAttrs.length;a++){
			var at = eleAttrs[a];
			if(typeof scope[at] != 'undefined'){
				settings[at] = scope[at];
			}
		}
		
		function setEvent(obj,index){
			var eve,type,t,e;
			if(!isObj(obj)){
				obj = {};
			}
			
			for(t=0;t<types.length;t++){
				type = types[t];
				eve = settings[type];
				
				if(obj[type] !== undefined){
					eve = obj[type];
				}
				
				if(typeof eve != 'string') continue;
				
				eve = eve.split(' ');
				for(e=0;e<eve.length;e++){
					tipsEvents[type][eve[e]] = tipsEvents[type][eve[e]] || [];
					tipsEvents[type][eve[e]].push(index);
				}
			}
		}

		for(var i=0;i<tipsToShow.length;i++){
			setEvent(tipsToShow[i],i);
		}

		scope.getPosition = function (htmlCompiled, placement){
			var tip = htmlCompiled[0].getBoundingClientRect(),
			tipWidth = tip.width,
			tipHeight = tip.height,
			el = element[0].getBoundingClientRect(),
			elTop = el.top,
			elLeft = el.left,
			elWidth = el.width,
			elHeight = el.height,
			scrollLeft = window.scrollX || document.documentElement.scrollLeft,
			scrollTop = window.scrollY || document.documentElement.scrollTop,
			arrow_size = 5,
			left = false,top,
			result = {};

			switch (placement) {
				case 'top':
					left = elLeft + (elWidth / 2) - (tipWidth / 2);
					top = elTop - tipHeight - (arrow_size / 2);
					break;
				case 'bottom':
					left = elLeft + (elWidth / 2) - (tipWidth / 2);
					top = elTop + elHeight + (arrow_size / 2);
					break;
				case 'left':
					left = elLeft - tipWidth - (arrow_size / 2);
					top = elTop + (elHeight / 2) - (tipHeight / 2);
					break;
				case 'right':
				default:
					left = elLeft + elWidth + (arrow_size / 2);
					top = elTop + (elHeight / 2) - (tipHeight / 2);
					break;
			};
			
			
			if(left !== false){
				result = {
					left: left + scrollLeft + 'px',
					top: top + scrollTop + 'px'
				};
			}
			return result;
		}
		
		var timer = {};
		
		scope.tipon = function(tips){
			var hash = 'on' + Object.keys(tips);
			
			clearTimeout (timer[hash]);
			timer[hash] = setTimeout(function(){
				$timeout(function(){

					for(var t in tips){
						var tip = tips[t],
						tipSettings = copy(settings),
						placement, htmlCompiled, tipCloseOn;
						
						if(!tip || tipsActive[t]) continue;

						if(isObj(tip)){
							extend(tipSettings,tip);
						} else {
							tipSettings.content = tip;
						}
						
						if(tipSettings.enable !== undefined){
							if(!$parse(tipSettings.enable)(scope.$parent)) return;
						}
						
						tipCloseOn = tipSettings.tipCloseOn;
						
						tipSettings.id = tipSettings.id || Math.random().toString(36).slice(2);
						
						tmpl = tipSettings.template;
						
						
						if(tmpl.slice(-5).toLowerCase() == '.html'){
							// we have a templateUrl
							tmpl = $templateCache.get(tmpl);
						}
						
						tmpl = tmpl || settings.template;
						placement = /^(right|left|top|bottom)$/gi.test(tipSettings.placement) ? tipSettings.placement.toLowerCase() : 'right';
						
						htmlCompiled = $ng(tmpl.replace('<tips></tips>',tipSettings.content));
						htmlCompiled = $compile(htmlCompiled)(scope.$parent);

						if(typeof htmlCompiled[0].getBoundingClientRect != 'function') continue;
						
						
						if(tipSettings.appendToBody){					
							$ng(document.querySelectorAll('body')).append(htmlCompiled);
						} else {
							element.after(htmlCompiled);
						}
						tipsActive[t] = htmlCompiled;

						if(tipsPending[t]){
							// remove 
							tipsPending[t].remove();
							delete(tipsPending[t]);
						}
													
						$timeout(function(){
							htmlCompiled
								.attr('id',tipSettings.id)
								.addClass(tipSettings.class +' '+ placement +' in')
								.css(scope.getPosition(htmlCompiled,placement));
						});
						
						if(tipCloseOn){
							htmlCompiled.on(tipSettings.tipCloseOn, function(){
								var tips = {};
								tips[t] = tip;
								scope.tipoff(tips);
							});
							
							if(tipCloseOn == 'click'){
								htmlCompiled.css({cursor: 'pointer'})
							}
						}
					}

				
				});
			}, 120);

		}
		
		var checking;
		scope.tipoff = function(tips){
			var hash = 'on' + Object.keys(tips);
			
			clearTimeout (timer[hash]);
			timer[hash] = setTimeout(function(){

				for(var t in tips){
					if(!tipsActive[t]) continue;

					tipsActive[t].removeClass('in');
					
					tipsPending[t] = tipsActive[t];
					delete tipsActive[t];
				}

				if(checking) return;
				
				checking = setInterval(function(){
					for(var p in tipsPending){
						if(window.getComputedStyle(tipsPending[p][0]).opacity == 0){
							tipsPending[p].remove();
							delete tipsPending[p];
						}
					}
					
					if(!Object.keys(tipsPending).length){
						clearInterval(checking);
						checking = false;
					}
				},100);
			
			}, 120);


		}
		
		
		// show/hide triggers
		onEvents = Object.keys(tipsEvents.on);
		offEvents = Object.keys(tipsEvents.off);
		element.on(onEvents.concat(offEvents).join(' '),function(e){
			var type = onEvents.indexOf(e.type) >= 0 ? 'on' : 'off',
			currentValue, tips = {}, tipsIndexes = tipsEvents[type][e.type];
			
			for(var k=0;k<tipsIndexes.length;k++){
				currentValue = tipsIndexes[k];
				tips[currentValue] = tipsToShow[currentValue];
			}
			
			scope['tip'+ type](tips);
		});

		$timeout(function(){			
			for(var t=0;t<tipsToShow.length;t++){
				var tip = tipsToShow[t],tipSettings = copy(settings);
				if(!isObj(tip) && tipSettings.onOff === undefined) continue;
				
				if(isObj(tip)){
					tipSettings = extend(tipSettings,tip);
				}
				
				if(tipSettings.onOff === undefined) continue;

				var tips = {};
					tips[t] = scope.tips[t];

				scope.$parent.$watch(
					function(onOff){
						return function(){return $parse(onOff)(scope.$parent);};
					}(tipSettings.onOff),
					function(aTip){
						return function(parseVal){
							var method = parseVal ? 'on' : 'off';
							scope['tip'+ method](aTip);
						};
					}(tips)
				);
			}		
		});
	};
	
	return({
		scope: {
			settings: "=ngTipsSettings",
			template: "=ngTipsTemplate",
			class: "=ngTipsClass",
			on: "=ngTipsOn",
			off: "=ngTipsOff",
			onOff: "=ngTipsOnOff",
			enable: "=ngTipsEnable",
			tipCloseOn: "=ngTipsTipCloseOn",
			placement: "=ngTipsPlacement",
			appendToBody: "=ngTipsAppendToBody",
			tips: "=ngTipsTips"
		},
		restrict: "A",
		link: linkFunction
	});
}]);
