/*! Angular Bar Rating - v0.0.1
* Copyright (c) G. Tomaselli <girotomaselli@gmail.com> 2016; Licensed  
*/
angular.module('ng-tips', [])
.directive('ngTips', ["$timeout","$compile", "$templateCache", function ($timeout, $compile, $templateCache) {
	
	var linkFunction = function(scope, element, attrs){
		var $ng = angular.element,
		defaults = {
			template: '<div class="tooltip fade"><div class="tooltip-arrow"></div><div class="tooltip-inner"><tips></tips></div></div>',
			class: '',
			on: 'mouseenter mouseover touchenter',
			off: 'mouseleave mouseout touchleave',
			placement: 'right',
			appendToBody: true // Should the tooltip be appended to 'body' instead to be after() the element?
		}, settings = angular.extend({}, defaults, (scope.settings || {})),
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
		eleAttrs = ['template','class','on','off','placement','appendtoBody'];
		
		// get element options
		for(var a=0;a<eleAttrs.length;a++){
			var at = eleAttrs[a];
			if(typeof scope[at] != 'undefined'){
				settings[at] = scope[at];
			}
		}
		
		function showHide(e,task){			
			var currentValue, tips = [], tipsIndexes = tipsEvents[task][e.type];
			for(var k=0;k<tipsIndexes.length;k++){
				currentValue = tipsIndexes[k];
				tips[currentValue] = scope.tips[currentValue];
			}

			if(task == 'on'){
				scope.showTip(tips);
			} else {
				scope.hideTip(tips);				
			}
		};
		
		function setEvent(obj,index){
			var eve,type,t,e;
			if(!angular.isObject(obj)){
				obj = {};
			}
			
			for(t=0;t<types.length;t++){
				type = types[t];
				eve = settings[type];
				
				if(obj[type]){
					eve = obj[type];
				}
				
				eve = eve.split(' ');
				for(e=0;e<eve.length;e++){
					tipsEvents[type][eve[e]] = tipsEvents[type][eve[e]] || [];
					tipsEvents[type][eve[e]].push(index);
				}
			}
		}

		for(var i=0;i<scope.tips.length;i++){
			var tip = scope.tips[i];
			setEvent(tip,i);
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
		
		scope.showTip = function(tips){
			for(var t=0;t<tips.length;t++){
				var tip = tips[t],
				tipSettings = angular.copy(settings),
				placement, htmlCompiled;
				
				if(!tip || tipsActive[t]) continue;

				if(angular.isObject(tip)){
					angular.extend(tipSettings,tip);
				} else {
					tipSettings.content = tip;
				}
				
				tipSettings.id = tipSettings.id || Math.random().toString(36).slice(2);
				
				tmpl = tipSettings.template;
				
				
				if(tmpl.slice(-5).toLowerCase() == '.html'){
					// we have a templateUrl
					tmpl = $templateCache.get(tmpl);
				}
				
				tmpl = tmpl || settings.template;
				placement = /^(right|left|top|bottom)$/gi.test(tipSettings.placement) ? tipSettings.placement.toLowerCase() : 'right';
				
				htmlCompiled = tmpl.replace('<tips></tips>',tipSettings.content);

				htmlCompiled = $compile(htmlCompiled)(scope.$parent);
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
				
				htmlCompiled
					.attr('id',tipSettings.id)
					.addClass(tipSettings.class +' '+ placement)
					.css(scope.getPosition(htmlCompiled,placement))
					.addClass('in');
			}
		}
		
		var checking;
		scope.hideTip = function(tips){
			for(var t=0;t<tips.length;t++){
				if(!tips[t] || !tipsActive[t]) continue;

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
		}
		
		// show tips
		onEvents = Object.keys(tipsEvents.on);
		offEvents = Object.keys(tipsEvents.off);
		element.on(onEvents.join(' '),function(e){
			showHide(e,'on');
		});
		
		// hide tips
		element.on(offEvents.join(' '),function(e){
			showHide(e,'off');			
		});
		
	};
	
	return({
		scope: {
			settings: "=ngTipsSettings",
			template: "=ngTipsTemplate",
			class: "=ngTipsClass",
			on: "=ngTipsOn",
			off: "=ngTipsOff",
			placement: "=ngTipsPlacement",
			appendToBody: "=ngTipsAppendToBody",
			tips: "=ngTipsTips"
		},
		restrict: "A",
		link: linkFunction
	});
}]);
