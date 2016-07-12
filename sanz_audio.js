(function($) {
    /**
     * @author Alejandro Orta (orta.sanz.93@gmail.com)
     * @desc This small plugins reate a new audio element
     *       from the original but much more customizable.
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
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				out.x = touch.pageX;
				out.y = touch.pageY;
			}
			else {
				out.x = e.pageX;
				out.y = e.pageY;
			}

			return out;
		}
	};

	$.fn.sanzAudio = function() {
		var player   = $(this),
			duration = player.prop('duration');

		var callback = utils.once(initSanzPlayer);

		player.on('canplaythrough', callback);
		player.prop('readyState') > 3 && callback();

		function initSanzPlayer() {
			// Prepare and render the new Player
			var newHtml  = '<div class="sanz_audio">';
			newHtml += '<i class="sanz_audio_controls fa fa-play"></i>';
			newHtml += '<div class="sanz_audio_controls progress"><span class="sanz_audio_controls progress_control"></span></div>';
			newHtml += '<div class="sanz_audio_time">00:00</div>';
			newHtml += '<div class="sanz_audio_controls volume"><i class="fa fa-volume-up"></i></div>';
			newHtml += '<div class="sanz_audio_controls volume_control"><span class="volume_control_toggler"></span></div>';
			newHtml += '</div>';

			player.after(newHtml);

			// Hide the old Player
			player.css('display', 'none', 'important');
			var newPlayer = player.next('.sanz_audio');

			var controls = {
				'play'        : newPlayer.find('.sanz_audio_controls.fa-play'),
				'timeline'    : newPlayer.find('.sanz_audio_controls.progress'),
				'timeToggle'  : newPlayer.find('.sanz_audio_controls.progress_control'),
				'audio'       : newPlayer.find('.sanz_audio_controls.volume_control'),
				'audioToggle' : newPlayer.find('.sanz_audio_controls .volume_control_toggler'),
				'audioIcon'   : newPlayer.find('.sanz_audio_controls.volume')
			};

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

			// Bind Play event
			controls.play.on('click', function() {
				if(player.prop('paused')) {
					player.trigger('play');
					$(this).removeClass('fa-play').addClass('fa-pause');
				}
				else {
					player.trigger('pause');
					$(this).removeClass('fa-pause').addClass('fa-play');
				}
			});

			// Update the duration on Play
			player.bind('timeupdate', function() {
				var newLength = utils.getParsedLength(duration - player.prop('currentTime'));

				newPlayer.find('.sanz_audio_time').html(newLength);

				var percentage = Math.floor(100 * player.prop('currentTime') / duration);
				controls.timeToggle.css('left', percentage + '%')
			});

			// Mute and unmute event
			controls.audioIcon.on('click', function(e) {
				if(player.prop('volume') > 0) {
					player.prop('volume', 0)
					controls.audioToggle.css('left', '0px');
				}
				else {
					player.prop('volume', 1)
					controls.audioToggle.css('left', '100%');
				}
				updateAudioIcon(player.prop('volume'));
			});

			// Makes timeline and audio draggable
			controls.audioToggle.on('touchstart mousedown', mouseDownAudio);
			controls.timeToggle.on('touchstart mousedown', mouseDownTimeline);

			$(window).on('touchend mouseup', mouseUp);

			// Makes audio clickable
			controls.audio.on('click', function(e) {
				var newVolume = utils.clickPercent(event, controls.audio);
				if(newVolume >= 0 && newVolume <= 1) {
					player.prop('volume', newVolume);
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
				}
				if (newMargLeft < 0) {
					controls.timeToggle.css('left', '0px');
				}
				if (newMargLeft > timelineWidth) {
					controls.timeToggle.css('left', timelineWidth + 'px');
				}
			}

			// Moves the audio line as user drags
			function moveAudioAhead(e) {
				var timelineWidth = controls.audio.outerWidth() - controls.audioToggle.outerWidth();
				var newMargLeft = utils.pointerEventToXY(e).x - controls.audio.offset().left;

				if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
					controls.audioToggle.css('left', newMargLeft + 'px');
				}
				if (newMargLeft < 0) {
					controls.audioToggle.css('left', '0px');
				}
				if (newMargLeft > timelineWidth) {
					controls.audioToggle.css('left', timelineWidth + 'px');
				}
			}

			var onPlayHead = false,
				touchFlag  = null;

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
					if(touchFlag == 'audio') {
						moveAudioAhead(e);
						window.removeEventListener('mousemove', moveAudioAhead, true);

						var newVolume = utils.clickPercent(e, controls.audio);

						if(newVolume < 0) {
							newVolume = 0;
						}
						else if(newVolume > 1) {
							newVolume = 1;
						}

						if(newVolume >= 0 && newVolume <= 1) {
							updateAudioIcon(newVolume);
							player.prop('volume', newVolume);
						}
					}
					else if(touchFlag == 'time') {
						moveTimelineAhead(e);
						window.removeEventListener('mousemove', moveTimelineAhead, true);
						player.prop('currentTime', duration * utils.clickPercent(e, controls.timeline));
					}
				}

				onPlayHead = false;
			}

			// Update audio icon based on volumen value
			function updateAudioIcon(volume) {
				var icon = '<i class="fa fa-volume-up"></i>';

				if(volume >= 0.5) {
					icon = '<i class="fa fa-volume-up"></i>';
				}
				else if(volume > 0.2 && volume < 0.5) {
					icon = '<i class="fa fa-volume-down"></i>';
				}
				else if(volume <= 0.2) {
					icon = '<i class="fa fa-volume-off"></i>';
				}

				newPlayer.find('.sanz_audio_controls.volume').find('.fa').remove();
				newPlayer.find('.sanz_audio_controls.volume').append(icon);
			}
		};
	};
}(jQuery));