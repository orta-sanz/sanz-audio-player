(function($) {
    /**
     * @author Alejandro Orta (orta.sanz.93@gmail.com)
     * @desc This small plugins creates a new audio element
     *       from the original but much more customizable.
     *
     * @version 0.2.3.1
     */

	var utils = {
		once : function once(fn, context) { 
			var result;

			return function() {
				if(fn) {
					result = fn.apply(context || this, arguments);
					fn = null;
				}

				return result;
			};
		},

		getParsedLength: function(s) {
			var m = Math.floor(s / 60);
			s -= m * 60;
			return (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + Math.floor(s) : Math.floor(s));
		},

		clickPercent: function(e, timeline) {
			return (utils.pointerEventToXY(e).x - timeline.offset().left) / timeline.outerWidth();
		},

		pointerEventToXY: function(e) {
			var out = { x : 0, y : 0 };
			if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
				if(e.touches || e.changedTouches || e.originalEvent.touches || e.originalEvent.changedTouches) {
					if(e.touches && e.touches[0]) {
						var touch = e.touches[0]
					}
					else {
						var touch = e.originalEvent.changedTouches[0];
					}

					out.x = touch.pageX;
					out.y = touch.pageY;
				}
			}
			else {
				out.x = e.pageX;
				out.y = e.pageY;
			}

			return out;
		}
	};

	var defaults = {
		audioControl : true,
		volume : 1
	};

	$.fn.sanzAudio = function(opt) {
		var options = $.extend({}, defaults, opt);

		var player   = $(this),
			volume   = player.prop('volume'),
			duration = player.prop('duration');

		var callback = utils.once(initSanzPlayer);

		player.on('canplaythrough', callback);
		player.prop('readyState') > 3 && callback();

		function initSanzPlayer() {
			// Prepare and render the new Player
			var newHtml  = '<div class="sanz_audio">';
			newHtml += '<div class="sanz_audio_controls play-pause"><i class="icono-play"></i></div>';
			newHtml += '<div class="sanz_audio_controls progress"><span class="timeline-line"></span><span class="sanz_audio_controls progress_control"></span></div>';
			newHtml += '<div class="sanz_audio_time">00:00</div>';

			if(options.audioControl) {
				newHtml += '<div class="sanz_audio_controls volume"><i class="icono-volumeHigh"></i></div>';
				newHtml += '<div class="sanz_audio_controls volume_control"><span class="volume-line"></span><span class="volume_control_toggler"></span></div>';
			}

			newHtml += '</div>';

			player.after(newHtml);

			// Hide the old Player
			player.css('display', 'none', 'important');
			var newPlayer = player.next('.sanz_audio');

			var controls = {
				'play'        : newPlayer.find('.sanz_audio_controls.play-pause'),
				'timeline'    : newPlayer.find('.sanz_audio_controls.progress'),
				'timedraw'    : newPlayer.find('.timeline-line'),
				'timeToggle'  : newPlayer.find('.sanz_audio_controls.progress_control'),
				'audio'       : newPlayer.find('.sanz_audio_controls.volume_control'),
				'audiodraw'   : newPlayer.find('.volume-line'),
				'audioToggle' : newPlayer.find('.sanz_audio_controls .volume_control_toggler'),
				'audioIcon'   : newPlayer.find('.sanz_audio_controls.volume')
			};

			// Varibles for Drag and Drop
			var onPlayHead = false,
				touchFlag  = null;

			// Append the total duration of the audio
			var length = utils.getParsedLength(duration);
			duration && newPlayer.find('.sanz_audio_time').html(length);

			setTimeout(function() {
				if(!duration) {
					duration = player.prop('duration');
					length = utils.getParsedLength(duration);
					newPlayer.find('.sanz_audio_time').html(length);
				}
			}, 1200);

			// Bind Play/Pause event
			controls.play.on('click', function() {
				if(player.prop('paused')) {
					player.trigger('play');
					controls.play.find('i').removeClass('icono-play').addClass('icono-pause');
				}
				else {
					player.trigger('pause');
					controls.play.find('i').removeClass('icono-pause').addClass('icono-play');
				}
			});

			// Update the duration on Play
			player.bind('timeupdate', function() {
				var newLength = utils.getParsedLength(duration - player.prop('currentTime'));

				newPlayer.find('.sanz_audio_time').html(newLength);

				var percentage = Math.floor(100 * player.prop('currentTime') / duration);
				controls.timeToggle.css('left', percentage + '%');
				controls.timedraw.css('width', percentage + '%');
			});

			// Set default Audio from opt
			updateAudioIcon(options.volume);
			if(options.volume > 1 || options.volume == 1) {
				player.prop('volume', 1);
				controls.audioToggle.css('right', '0px');
			}
			else if(options.volume < 0 || options.volume == 0) {
				player.prop('volume', 0);
				controls.audioToggle.css('left', '0px');
			}
			else {
				player.prop('volume', options.volume);
				var width = controls.audio.width() * options.volume / 1;
				controls.audioToggle.css('left', width + 'px');
			}

			// Mute and unmute event
			options.audioControl && controls.audioIcon.on('click', function(e) {
				if(player.prop('volume') > 0) {
					player.prop('volume', 0);
					volume = player.prop('volume');
					controls.audioToggle.css('left', '0px');
					controls.audiodraw.css('width', '0px');
				}
				// Restore the last volume before mute
				else {
					if(volume == 0) {
						volume = 1;
						player.prop('volume', 1);
						controls.audioToggle.css('left', '');
						controls.audiodraw.css('width', '100%');
						controls.audioToggle.css('right', '0px');
					}
					else {
						player.prop('volume', volume);

						var width = controls.audio.width() * volume / 1;
						if(width > controls.audio.width() || volume == 1) {
							controls.audioToggle.css('left', '');
							controls.audiodraw.css('width', '100%');
							controls.audioToggle.css('right', '0px');
						}
						else {
							controls.audioToggle.css('left', width + 'px');
							controls.audiodraw.css('width', width + 'px');
						}
					}
				}

				updateAudioIcon(player.prop('volume'));
			});

			// On End event
			player.on('ended', function() {
				if(!onPlayHead) {
					controls.timedraw.css('width', '0px');
					controls.timeToggle.css('left', '0px');
					newPlayer.find('.sanz_audio_time').html(length);
					controls.play.find('i').removeClass('icono-pause').addClass('icono-play');
				}
			});

			// Makes timeline and audio draggable
			options.audioControl && controls.audioToggle.on('touchstart mousedown', mouseDownAudio);
			controls.timeToggle.on('touchstart mousedown', mouseDownTimeline);

			$(window).on('touchend mouseup', mouseUp);

			// Makes audio clickable
			options.audioControl && controls.audio.on('click', function(e) {
				var newVolume = utils.clickPercent(event, controls.audio);
				if(newVolume >= 0 && newVolume <= 1) {
					player.prop('volume', newVolume);
					volume = newVolume;
					updateAudioIcon(newVolume);
					moveAudioAhead(e);
				}
			});

			// Makes timeline clickable
			controls.timeline.on('click', function(e) {
				moveTimelineAhead(e);
				player.prop('currentTime', duration * utils.clickPercent(event, controls.timeline));
			});

			// Moves playhead as user drags
			function moveTimelineAhead(e) {
				var timelineWidth = controls.timeline.outerWidth() - controls.timeToggle.outerWidth();
				var newMargLeft = utils.pointerEventToXY(e).x - controls.timeline.offset().left;

				if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
					controls.timeToggle.css('left', newMargLeft + 'px');
					controls.timedraw.css('width', newMargLeft + 'px');
				}
				if (newMargLeft < 0) {
					controls.timedraw.css('width', '0px');
					controls.timeToggle.css('left', '0px');
				}
				if (newMargLeft > timelineWidth) {
					controls.timedraw.css('width', '100%');
					controls.timeToggle.css('left', timelineWidth + 'px');
				}

				player.prop('currentTime', duration * utils.clickPercent(e, controls.timeline));
			}

			// Moves the audio line as user drags
			function moveAudioAhead(e) {
				var timelineWidth = controls.audio.outerWidth() - controls.audioToggle.outerWidth();
				var newMargLeft = utils.pointerEventToXY(e).x - controls.audio.offset().left;

				if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
					controls.audioToggle.css('left', newMargLeft + 'px');
					controls.audiodraw.css('width', newMargLeft + 'px');
				}
				if (newMargLeft < 0) {
					controls.audioToggle.css('left', '0px');
					controls.audiodraw.css('width', '0px');
				}
				if (newMargLeft > timelineWidth) {
					controls.audiodraw.css('width', '100%');
					controls.audioToggle.css('left', timelineWidth + 'px');
				}

				// Set the volume
				var newVolume = utils.clickPercent(e, controls.audio);

				if(newVolume < 0 || newVolume > 1) {
					newVolume = newVolume > 1 ? 1 : 0;
				}

				updateAudioIcon(newVolume);
				player.prop('volume', newVolume);
			}

			// Draggable functions for Audio
			function mouseDownAudio() {
				onPlayHead = true;
				touchFlag = 'audio';

				var event = 'ontouchstart' in window ? 'touchmove' : 'mousemove';
				window.addEventListener(event, moveAudioAhead, true);
			}

			// Draggable functions for TimeLine
			function mouseDownTimeline() {
				onPlayHead = true;
				touchFlag = 'time';

				var event = 'ontouchstart' in window ? 'touchmove' : 'mousemove';
				window.addEventListener(event, moveTimelineAhead, true);
			}

			function mouseUp(e) {
				if (onPlayHead == true) {
					var event = 'ontouchstart' in window ? 'touchmove' : 'mousemove';

					touchFlag == 'audio' && window.removeEventListener(event, moveAudioAhead, true);
					touchFlag == 'time' && window.removeEventListener(event, moveTimelineAhead, true);
				}

				onPlayHead = false;
			}

			// Update audio icon based on volumen value
			function updateAudioIcon(volume) {
				var icon;

				if(volume >= 0.7) {
					icon = '<i class="icono-volumeHigh"></i>';
				}
				else if(volume >= 0.5 && volume < 0.7) {
					icon = '<i class="icono-volumeMedium"></i>';
				}
				else if(volume > 0.2 && volume < 0.5) {
					icon = '<i class="icono-volumeLow"></i>';
				}
				else if(volume <= 0.2) {
					icon = '<i class="icono-volume"></i>';
				}

				newPlayer.find('.sanz_audio_controls.volume').find('i').remove();
				newPlayer.find('.sanz_audio_controls.volume').append(icon);
			}
		};
	};
}(jQuery));