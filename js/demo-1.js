(function() {

    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: width*5, y: height*5};

        largeHeader = document.getElementById('large-header');
        largeHeader.style.height = height+'px';

        canvas = document.getElementById('demo-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // create points
        points = [];
        for(var x = 0; x < width; x = x + width/15) {
            for(var y = 0; y < height; y = y + height/15) {
                var px = x + Math.random()*width/15;
                var py = y + Math.random()*height/15;
                var p = {x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // for each point find the 5 closest points
        for(var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for(var j = 0; j < points.length; j++) {
                var p2 = points[j]
                if(!(p1 == p2)) {
                    var placed = false;
                    for(var k = 0; k < 6; k++) {
                        if(!placed) {
                            if(closest[k] == undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for(var k = 0; k < 6; k++) {
                        if(!placed) {
                            if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        // assign a circle to each point
        for(var i in points) {
            var c = new Circle(points[i], 1.5+Math.random()*1.5, 'rgba(255,255,255,0.7)');
            points[i].circle = c;
        }
    }

    // Event handling
    function addListeners() {
        if(!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
        }
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    function mouseMove(e) {
        var posx = posy = 1;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY)    {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        target.x = posx;
        target.y = posy;
    }

    function scrollCheck() {
        if(document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height+'px';
        canvas.width = width;
        canvas.height = height;
    }

    // animation
    function initAnimation() {
        animate();
        for(var i in points) {
            shiftPoint(points[i]);
        }
    }

    function animate() {
        if(animateHeader) {
            ctx.clearRect(0,0,width,height);
            for(var i in points) {
                // detect points in range
                if(Math.abs(getDistance(target, points[i])) < 1000) {
                    points[i].active = 0.3;
                    points[i].circle.active = 0.8;
                } else if(Math.abs(getDistance(target, points[i])) < 2000) {
                    points[i].active = 0.4;
                    points[i].circle.active = 0.3;
                } else if(Math.abs(getDistance(target, points[i])) < 22000) {
                    points[i].active = 0.07;
                    points[i].circle.active = 0.01;
                } else {
                    points[i].active = 0;
                    points[i].circle.active = 0.2541254;
                }

                drawLines(points[i]);
                points[i].circle.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
        TweenLite.to(p, 1+1*Math.random(), {x:p.originX-100+Math.random()*200,
            y: p.originY-100+Math.random()*200, ease:Circ.easeInOut,
            onComplete: function() {
                shiftPoint(p);
            }});
    }

    // Canvas manipulation
    function drawLines(p) {
        if(!p.active) return;
        for(var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            ctx.strokeStyle = 'rgba(255,255,255,'+ p.active+')';
            ctx.stroke();
        }
    }

    function Circle(pos,rad,color) {
        var _this = this;

        // constructor
        (function() {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
        })();

        this.draw = function() {
            if(!_this.active) return;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(255,255,255,'+ _this.active+')';
            ctx.fill();
        };
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
    
})();

// glitch javascript

(function (){
  "use strict";
  var textSize = 10;
  var glitcher = {

    init: function () {
      setTimeout((function () {
        this.canvas = document.getElementById('stage');
        this.context = this.canvas.getContext('2d');

        this.initOptions();
        this.resize();
        this.tick();
      }).bind(this), 100);
    },

    initOptions: function () {
      var gui = new dat.GUI(),
        current = gui.addFolder('Current'),
        controls = gui.addFolder('Controls');
      this.width = document.documentElement.offsetWidth;
      this.height = document.documentElement.offsetHeight;      
      
      this.textSize = Math.floor(this.width / 7);
      // sets text size based on window size
      if (this.textSize > this.height) {
        this.textSize = Math.floor(this.height/1.5); }
      // tries to make text fit if window is
      // very wide, but not very tall
      this.font = '900 ' + this.textSize + 'px "Orbitron"';
      this.context.font = this.font;
      this.text = "RESIST";
      this.textWidth = (this.context.measureText(this.text)).width;

      this.fps = 60;

      this.channel = 0; // 0 = red, 1 = green, 2 = blue
      this.compOp = 'lighter'; // CompositeOperation = lighter || darker || xor
      this.phase = 0.0;
      this.phaseStep = 0.05; //determines how often we will change channel and amplitude
      this.amplitude = 0.0;
      this.amplitudeBase = 2.0;
      this.amplitudeRange = 2.0;
      this.alphaMin = 0.8;

      this.glitchAmplitude = 20.0;
      this.glitchThreshold = 0.9;
      this.scanlineBase = 40;
      this.scanlineRange = 40;
      this.scanlineShift = 15;

      current.add(this, 'channel', 0, 2).listen();
      current.add(this, 'phase', 0, 1).listen();
      current.add(this, 'amplitude', 0, 5).listen();
      // comment out below to hide ability to change text string
      var text = controls.add(this, 'text');
      text.onChange((function (){
        this.textWidth = (this.context.measureText(this.text)).width;
      }).bind(this));
      // comment out above to hide ability to change text string
      controls.add(this, 'fps', 1, 60);
      controls.add(this, 'phaseStep', 0, 1);
      controls.add(this, 'alphaMin', 0, 1);
      controls.add(this, 'amplitudeBase', 0, 5);
      controls.add(this, 'amplitudeRange', 0, 5);
      controls.add(this, 'glitchAmplitude', 0, 100);
      controls.add(this, 'glitchThreshold', 0, 1);
      controls.open();
      gui.close(); // start the control panel cloased
    },

    tick: function () {
      setTimeout((function () {
        this.phase += this.phaseStep;

        if (this.phase > 1) {
          this.phase = 0.0;
          this.channel = (this.channel === 2) ? 0 : this.channel + 1;
          this.amplitude = this.amplitudeBase + (this.amplitudeRange * Math.random());
        }

        this.render();
        this.tick();

      }).bind(this), 1000 / this.fps);
    },

    render: function () {
      var x0 = this.amplitude * Math.sin((Math.PI * 2) * this.phase) >> 0,
        x1, x2, x3;

      if (Math.random() >= this.glitchThreshold) {
        x0 *= this.glitchAmplitude;
      }

      x1 = this.width - this.textWidth >> 1;
      x2 = x1 + x0;
      x3 = x1 - x0;


      this.context.clearRect(0, 0, this.width, this.height);
      this.context.globalAlpha = this.alphaMin + ((1 - this.alphaMin) * Math.random());

      switch (this.channel) {
        case 0:
          this.renderChannels(x1, x2, x3);
          break;
        case 1:
          this.renderChannels(x2, x3, x1);
          break;
        case 2:
          this.renderChannels(x3, x1, x2);
          break;
      }
        this.renderScanline();
        if (Math.floor(Math.random() * 2) > 1) {
          this.renderScanline();
          // renders a second scanline 50% of the time
        }
    },

    renderChannels: function (x1, x2, x3) {
      this.context.font = this.font;
      this.context.fillStyle = "rgb(255,0,0)";
      this.context.fillText(this.text, x1, this.height / 2);

      this.context.globalCompositeOperation = this.compOp;

      this.context.fillStyle = "rgb(0,255,0)";
      this.context.fillText(this.text, x2, this.height / 2);
      this.context.fillStyle = "rgb(0,0,255)";
      this.context.fillText(this.text, x3, this.height / 2);
    },

    renderScanline: function () {
      var y = this.height * Math.random() >> 0,
        o = this.context.getImageData(0, y, this.width, 1),
        d = o.data,
        i = d.length,
        s = this.scanlineBase + this.scanlineRange * Math.random() >> 0,
        x = -this.scanlineShift + this.scanlineShift * 2 * Math.random() >> 0;

      while (i-- > 0) {
        d[i] += s;
      }

      this.context.putImageData(o, x, y);
    },

    resize: function () {
      this.width = document.documentElement.offsetWidth;
      //this.height = window.innerHeight;
            this.height = document.documentElement.offsetHeight;
      if (this.canvas) {
        this.canvas.height = this.height;
        //document.documentElement.offsetHeight;
        this.canvas.width = this.width;
        //document.documentElement.offsetWidth;
        this.textSize = Math.floor(this.canvas.width / 7);
        // RE-sets text size based on window size
        if (this.textSize > this.height) {
          this.textSize = Math.floor(this.canvas.height/1.5); }
          // tries to make text fit if window is
          // very wide, but not very tall
        this.font = '900 ' + this.textSize + 'px "Orbitron"';
        this.context.font = this.font;
      }
    }
  };

  document.onload = glitcher.init();
  window.onresize = glitcher.resize();
  // return;
 // executes anonymous function onload
})();