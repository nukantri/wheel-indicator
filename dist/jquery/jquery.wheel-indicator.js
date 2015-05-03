;(function($){
    var WheelIndicator = (function() {
    var eventWheel = 'onwheel' in document ? 'wheel' : 'mousewheel';

    function Module(elem){
        this.last5values = [ 0, 0, 0, 0, 0 ];
        this.memoryAcceleration = [ 0, 0 , 0 ];
        this.isAcceleration = false;
        this.isStopped = true;
        this.direction = '';
        this.delta = '';
        this.timer = '';
        this.prevent = false;

        var self = this;
        addEvent(elem, eventWheel, function(event) {
            processDelta(event, self);

            if (self.prevent) {
                event.preventDefault();
            }
        });
    }

    Module.prototype = {
        Constructor: Module,

        on: function(cb){
            this.callback = cb || function(){};

            return this;
        }
    };

    function triggerEvent(self, event){
        event.prevent = function(){
            preventDefault.call(self);
        };
        event.direction = self.direction;
        self.callback.call(this, event);
    }

    var getDeltaY = function(event){
        if(event.wheelDelta) {
            getDeltaY = function(event) {
                return event.wheelDelta / -120;
            }
        } else {
            getDeltaY = function(event) {
                return event.deltaY;
            }
        }
        getDeltaY(event);
    };

    function preventDefault(){
        this.prevent = true;
    }

    function processDelta(event, self) {
        var stepAcceleration = 0,
            deltaY = getDeltaY(event),
            i;

        self.direction = deltaY > 0 ? self.direction = 'down' : self.direction = 'up';
        self.delta = Math.abs(deltaY);

        clearTimeout(self.timer);

        self.timer = setTimeout(function() {
            self.last5values = [ 0, 0, 0, 0, 0 ];
            self.memoryAcceleration = [ 0, 0 , 0 ];
            self.isStopped = true;
            self.isAcceleration = false;
        }, 200);

        if(self.isStopped) {
            triggerEvent(self, event);
            self.isStopped = false;
            self.isAcceleration = true;
            stepAcceleration = 1;

            self.memoryAcceleration.shift();
            self.memoryAcceleration.push(stepAcceleration);
        } else {

            self.last5values.shift();
            self.last5values.push(self.delta);

            for(i = 5; i--; i == 1) {
                if(self.last5values[i - 1] < self.last5values[i]) {
                    stepAcceleration++;
                }
            }

            self.memoryAcceleration.shift();
            self.memoryAcceleration.push(stepAcceleration);

            if( (self.memoryAcceleration[2] < self.memoryAcceleration[1]) &&
                (self.memoryAcceleration[1] < self.memoryAcceleration[0])) {
                //Произошло затухание
                self.isAcceleration = false;
            }

            if( (self.memoryAcceleration[2] > self.memoryAcceleration[1]) &&
                (self.memoryAcceleration[1] > self.memoryAcceleration[0])) {
                //Произошло ускорение
                if(!self.isAcceleration) {
                    self.isAcceleration = true;
                    triggerEvent(self, event);
                }
            }
        }
    }

    function addEvent(elem, type, handler){
        if(window.addEventListener) {
            elem.addEventListener(type, handler, false);
        } else if (window.attachEvent) {
            elem.attachEvent('on' + type, handler);
        }
    }

    return Module;
}());

    $.event.special['wheel-indicator'] = {
        setup: function(){
            var $this = $(this);

            if ($this.data('wheel-indicator')) return;

            var indicator = new WheelIndicator(this);

            $this.data('wheel-indicator', indicator);

            indicator.on(function(e){
                $this.trigger('wheel-indicator', e);
            });
        },

        handle: function (e, data) {
            var event = $.extend({}, e, data);
            return e.handleObj.handler.apply( this, [event, data] );
        }
    };
})(jQuery);
