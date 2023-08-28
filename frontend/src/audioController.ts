// The Audio Controller component is a context-like subclass of the App, which is passed to various subcomponents to allow them to control the game's sound effects

export class AudioController {
    // Audio Controller types
    _music: string;             // The DOM ID of the currently playing music file, if any (empty string = no file)
    _effects: string;           // DOM ID of the currently playing sound effect file, if any (empty string = no file)
    _musicFadein: number;       // If used, determines how many seconds of a new track to play before reaching full volume ( 0 = start at full volume right away )
    _musicFadeout: number;      // Used to determine when in the track to start to fade-out the currently playing music, if requested ( 0 = no fadeout )
    _musicFadeoutDuration: number;  // Determines how many seconds to take before reaching zero volume when the designated fadeout start time arrives
    _musicFadeoutLastSecond: number;    // Keeps track of fadeout progress; fadeout progresses only once per second using this value
    _musicVolume: number;       // Value ranges from 0 - 1.0; Represents the current volume of the game's music
    _effectsVolume: number;     // Value ranges from 0 - 1.0; Volume for in-game sound effects
    _menuVolume: number;        // Value ranges from 0 - 1.0; Volume for buttons, menu events, etc

    constructor() {
        this._music = "";
        this._effects = "";
        this._musicFadein = 0;              // Zero means start at regular volume
        this._musicFadeout = 0;             // Zero means play the whole song
        this._musicFadeoutDuration = 0;     // Zero means stop the song immediately when the fadeout time is reached
        this._musicFadeoutLastSecond = 0;   // 
        this._musicVolume = 1;              // Start at full volume by default
        this._effectsVolume = 1;
        this._menuVolume = 1;
    }

    // SECTION 1: UPDATER METHODS

    // Checks every frame if it is time to advance the fade in/out effect for the music track
    updateFades = () => {
        try {
            const sound = document.getElementById(this._music);
            //@ts-ignore
            if (sound && this._musicFadeout !== 0 && sound.currentTime > this._musicFadeout && sound.currentTime > this._musicFadeoutLastSecond && sound.volume > 0) {
                //@ts-ignore
                this._musicFadeoutLastSecond++;
                const increment = -1 / this._musicFadeoutDuration;
                this.adjustVolume("music", increment);
            }   // TODO: Add fade-ins
        } catch {
            console.log("ERROR: Fade effect has encountered an issue.");
        }
    }

    // Sets when a fadeout should start, and how long it should take
    setMusicFadeoutTimes = (start: number, duration: number) => {
        this._musicFadeout = start;
        this._musicFadeoutDuration = duration;
        this._musicFadeoutLastSecond = start;
    }

    // Sets how long a fade-in should take to get to max volume
    setMusicFadeinTime = (duration: number) => {
        this._musicFadein = duration;
    }

    // SECTION 2: BASIC PLAYBACK METHODS

    // Looks up a sound file by its ID and attempts to play it on the given channel (music or effects)
    playSound = (channel: string, id: string) => {
        try {
            const sound = document.getElementById(id);
            if (sound) {
                // Store the ID if the element is found
                if (channel === "music") {
                    this._music = id;
                    //@ts-ignore
                    sound.volume = this._musicVolume;
                } else if (channel === "effects") {
                    this._effects = id;
                    //@ts-ignore
                    sound.volume = this._effectsVolume;
                }
                //@ts-ignore
                sound.play();
            }
        } catch {
            console.log(`ERROR: Sound file not found for ${id}`);
        }
    }
    
    // Stops a sound file but keeps its playback at the current location so it can be resumed the next time it's played
    pauseSound = (channel: string, id: string) => {
        try {
            const sound = document.getElementById(id);
            if (sound) {
                //@ts-ignore
                sound.pause();
                // Store the ID if the element is found
                if (channel === "music") {
                    this._music = id;
                } else if (channel === "effects") {
                    this._effects = id;
                }
            }
        } catch {
            console.log(`ERROR: Was unable to pause sound ${id}`);
        }
    }
    
    // Stops whatever sound file is currently playing for the specified channel
    stopSound = (channel: string) => {
        try {
            const id = channel === "effects" ? this._effects : this._music;
            const sound = document.getElementById(id);
            if (sound) {
                //@ts-ignore
                sound.pause();
                //@ts-ignore
                sound.currentTime = 0;
            }
        } catch {
            console.log(`ERROR: Was unable to stop sound for channel ${channel}`);
        }
    }

    // SECTION 3: VOLUME SETTINGS METHODS

    // Takes the name of a sound channel (music, effects, menu or master) and a value from 0 to 1 to set as that channel's volume
    setVolume = (channel: string, value: number) => {
                try {
                    switch (channel) {
                        case "music":
                            this._musicVolume = value;      // Set the value regardless
                            if (this._music) {
                                const sound = document.getElementById(this._music);
                                if (sound) {
                                    //@ts-ignore
                                    sound.volume = value;
                                }
                            } else {
                                console.log("ERROR: Was unable to adjust volume for music sound channel. Current music ID not found.");
                            }
                            break;
                        case "effects":
                            this._effectsVolume = value;    // Set the value regardless
                            if (this._effects) {
                                const sound = document.getElementById(this._effects);
                                if (sound) {
                                    //@ts-ignore
                                    sound.volume = value;
                                }
                            } else {
                                console.log("ERROR: Was unable to adjust volume for effects sound channel. Current effect ID not found.");
                            }
                            break;
                        case "menu":    // Menu case is shorter since we do not bother to record the ID of menu events (as they are too short-lived to bother with)
                            this._menuVolume = value;
                            break;
                        case "master":                  // Master sets the volume for all channels
                            this._musicVolume = value;
                            this._effectsVolume = value;
                            this._menuVolume = value;
                            if (this._effects) {
                                const sound = document.getElementById(this._effects);
                                if (sound) {
                                    //@ts-ignore
                                    sound.volume = value;
                                }
                            }
                            if (this._music) {
                                const sound = document.getElementById(this._music);
                                if (sound) {
                                    //@ts-ignore
                                    sound.volume = value;
                                }
                            }
                    }
                } catch {
                    console.log(`ERROR: Something went wrong tryng to adjust volume for ${channel} sound channel.`);
                }
    }

    // Takes the name of a sound channel (music, effects, menu or master) and a value from 0 to 1 to use as the DELTA to set that channel's new volume
    adjustVolume = (channel: string, delta: number) => {
        try {
            switch (channel) {
                case "music":
                    this._musicVolume += delta;                                             // Set the value
                    this._musicVolume = Math.min(Math.max(this._musicVolume, 0), 1);        // Ensure it respects the limits
                    if (this._music) {
                        const sound = document.getElementById(this._music);
                        if (sound) {
                            //@ts-ignore
                            sound.volume = this._musicVolume;       // Just use the new volume number right away
                            //@ts-ignore
                            console.log(sound.volume);
                        }
                    } else {
                        console.log("ERROR: Was unable to adjust volume for music sound channel. Current music ID not found.");
                    }
                    break;
                case "effects":
                    this._effectsVolume += delta;                                               // Set the value
                    this._effectsVolume = Math.min(Math.max(this._effectsVolume, 0), 1);        // Ensure it respects the limits
                    if (this._effects) {
                        const sound = document.getElementById(this._effects);
                        if (sound) {
                            //@ts-ignore
                            sound.volume = this._effectsVolume;
                        }
                    } else {
                        console.log("ERROR: Was unable to adjust volume for effects sound channel. Current effect ID not found.");
                    }
                    break;
                case "menu":    // Menu case is shorter since we do not bother to record the ID of menu events (as they are too short-lived to bother with)
                    this._menuVolume += delta;                                                  // Set the value
                    this._menuVolume = Math.min(Math.max(this._menuVolume, 0), 1);              // Ensure it respects the limits
                    break;
                case "master":  // Master updates the volume for all channels
                    const d = Math.min(Math.max(delta, 0), 1);
                    this._effectsVolume += d;
                    this._musicVolume += d;
                    this._effectsVolume += d;
                    if (this._effects) {
                        const sound = document.getElementById(this._effects);
                        if (sound) {
                            //@ts-ignore
                            sound.volume = this._effectsVolume;
                        }
                    }
                    if (this._music) {
                        const sound = document.getElementById(this._music);
                        if (sound) {
                            //@ts-ignore
                            sound.volume = this._musicVolume;       // Just use the new volume number right away
                            //@ts-ignore
                            console.log(sound.volume);
                        }
                    }
            }
        } catch {
            console.log(`ERROR: Something went wrong tryng to adjust volume for ${channel} sound channel.`);
        }
    }

    
}
