# Sanz Audio Player

With this small plugin (~9Kb) you will have at your disposal a fully customizable audio player and ready for mobile devices. It's still in Alpha version, but there are many improvements and new features in the list. So far all basic events are ready, such as Play/Pause, Volume, Mute, Timeline (with Drag and Drop ready, without jQuery UI dependence!).

## Dependencies
- jQuery
- FontAwsome (this will be removed)

## Use
Simple as select the audio element and call the `.sanzAudio()` function. You can see an example inside `index.html` file ;)

```
<audio class="audio-player" controls>
	<source src="./audio/bensound-funnysong.mp3" type="audio/mp3">
</audio>


 <script>
	 $('.audio-player').sanzAudio();

	// You can use sanzAudio on multiple audio elements
	$('.audio-player').each(function() {
		$(this).sanzAudio();
	});
 </script>
```

## ToDo
- Better style and responsive.
- PlayList option.
- Add cool effects for the buttons.
- etc.