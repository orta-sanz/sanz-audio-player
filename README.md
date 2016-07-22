# Sanz Audio Player

With this small plugin (~9Kb) you will have at your disposal a fully customizable audio player and ready for mobile devices. It's still in Alpha version, but there are many improvements and new features in the list. So far all basic events are ready, such as Play/Pause, Volume, Mute, Timeline (with Drag and Drop ready, without jQuery UI dependence!).

![Audio](https://dl.dropboxusercontent.com/u/37507878/MTS/audio1.png)

----------

## Dependencies
- jQuery

## Params
You can use multiple params to personalize the Audio Player:

- `audioControl` **Boolean** - Show or hide the Volume control.
- `volume` **Int** - Set the default volume. Range between 0 - 1


## Use
You will need both `sanz_audio.css` and `sanz_audio.js` inside your project.

Simple as select the audio element and call the `.sanzAudio()` function. You can see an example inside `index.html` file ;)

```html
<audio class="audio-player" controls>
	<source src="./audio/bensound-funnysong.mp3" type="audio/mp3">
</audio>

<script>
	$('.audio-player').sanzAudio({
		audioControl : true,
		volume : 0.7
	});

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

****
Thanks to **Saeed Alipoor** for his [Pure CSS Icons](https://github.com/saeedalipoor/icono)