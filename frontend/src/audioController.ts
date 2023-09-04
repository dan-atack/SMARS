// The Audio Controller component is a context-like subclass of the App, which is passed to various subcomponents to allow them to control the game's sound effects

// UPGRADE IDEA: CHANNEL CLASS - Lets you keep track of as many sounds as you like, and without the massive overhead!
export type Channel = {
    domElementID: string,           // Can we in fact make this a reference to the element itself?
    volume: number,
    fadeInDuration: number,
    fadeinLastSecond: number,
    fadeoutStart: number,
    fadeoutDuration: number,
    fadeoutLastSecond: number
}

export default class AudioController {
    // Audio Controller types
    _music: string;             // The DOM ID of the currently playing music file, if any (empty string = no file)
    _effects: string;           // DOM ID of the currently playing sound effect file, if any (empty string = no file)
    _musicFadein: number;       // If used, determines how many seconds of a new track to play before reaching full volume ( 0 = start at full volume right away )
    _musicFadeout: number;      // Used to determine when in the track to start to fade-out the currently playing music, if requested ( 0 = no fadeout )
    _musicFadeoutDuration: number;  // Determines how many seconds to take before reaching zero volume when the designated fadeout start time arrives
    _musicFadeoutLastSecond: number;    // Keeps track of fadeout progress; fadeout progresses only once per second using this value
    _musicFadeinLastSecond: number;     // Keeps track of fadein progress
    _effectsFadein: number;
    _effectsFadeout: number;
    _effectsFadeoutDuration: number;
    _effectsFadeoutLastSecond: number;
    _effectsFadeinLastSecond: number;
    _musicVolume: number;       // Value ranges from 0 - 1.0; Represents the current volume of the game's music. Fade-ins will rise to this level
    _effectsVolume: number;     // Value ranges from 0 - 1.0; Volume for in-game sound effects. Sounds fading in will rise to this level
    _menuVolume: number;        // Value ranges from 0 - 1.0; Volume for buttons, menu events, etc

    constructor() {
        this._music = "";
        this._effects = "";
        this._musicFadein = 0;              // Zero means start at regular volume
        this._musicFadeout = 0;             // Zero means play the whole song
        this._musicFadeoutDuration = 0;     // Zero means stop the song immediately when the fadeout time is reached
        this._musicFadeoutLastSecond = 0;   // Set to equal fadeout start time when setting a new fadeout time
        this._musicFadeinLastSecond = 0;    // Set to zero when setting new song fadein duration
        this._effectsFadein = 0;            // Same system, for the effects channel
        this._effectsFadeout = 0;
        this._effectsFadeoutDuration = 0;
        this._effectsFadeoutLastSecond = 0;
        this._effectsFadeinLastSecond = 0;
        this._musicVolume = 1;              // Start at full volume by default
        this._effectsVolume = 1;
        this._menuVolume = 1;
    }

    // SECTION 1: UPDATER METHODS AND FADE EFFECTS

    // Checks every frame if it is time to advance the fade in/out effect for the music track
    handleUpdates = () => {
        try {       // FOR MUSIC
            const sound = document.getElementById(this._music);
            //@ts-ignore
            if (this._musicFadeout !== 0 && sound && sound.currentTime > this._musicFadeout && sound.currentTime > this._musicFadeoutLastSecond && sound.volume > 0) {
                this.handleFadeout("music");   // Fade-out: Gradually lower volume to 0
                //@ts-ignore
            } else if (this._musicFadein !== 0 && sound && sound.volume < 1 && sound.currentTime > this._musicFadeinLastSecond && sound.currentTime < this._musicFadein) {
                this.handleFadein("music");    // Fade-in: Gradually increase volume to the music volume level
            }
        } catch {
            console.log("ERROR: Fade music has encountered an issue.");
        }
        try {       // FOR EFFECTS
            const sound = document.getElementById(this._effects);
            //@ts-ignore
            if (this._effectsFadeout !== 0 && sound && sound.currentTime > this._effectsFadeout && sound.currentTime > this._effectsFadeoutLastSecond && sound.volume > 0) {
                this.handleFadeout("effects");
                //@ts-ignore
            } else if (this._effectsFadein !== 0 && sound && sound.volume < 1 && sound.currentTime > this._effectsFadeinLastSecond && sound.currentTime < this._effectsFadein) {
                this.handleFadein("effects");
            }
        } catch {
            console.log("ERROR: Fade effect has encountered an issue.");
        }
    }

    handleFadeout = (channel: string) => {
        if (channel === "music") {
            this._musicFadeoutLastSecond++;
            const increment = -1 / this._musicFadeoutDuration;
            // console.log(`Fading out ${channel} by ${increment}`);
            this.adjustVolume(channel, increment, true);

        } else if (channel === "effects") {
            this._effectsFadeoutLastSecond++;
            const increment = -1 / this._effectsFadeoutDuration;
            // console.log(`Fading out ${channel} by ${increment}`);
            this.adjustVolume(channel, increment, true);
        } else {
            console.log("ERROR: Fadeout has encountered an issue.");
        }
        
    }

    handleFadein = (channel: string) => {
        if (channel === "music") {
            this._musicFadeinLastSecond ++;
            const increment = this._musicVolume / this._musicFadein;
            // console.log(`Fading in ${channel} by ${increment}`);
            this.adjustVolume(channel, increment, true);
        } else if (channel === "effects") {
            this._effectsFadeinLastSecond ++;
            const increment = this._effectsVolume / this._effectsFadein;
            // console.log(`Fading in ${channel} by ${increment}`);
            this.adjustVolume(channel, increment, true);
        } else {
            console.log("ERROR: Fadein has encountered an issue.");
        }
    }

    // For either the music or effects channel, sets when a fadeout should start, and how long it should take
    setFadeoutTimes = (channel: string, start: number, duration: number) => {
        if (channel === "music") {
            this._musicFadeout = start;
            this._musicFadeoutDuration = duration;
            this._musicFadeoutLastSecond = start;
        } else if (channel === "effects") {
            this._effectsFadeout = start;
            this._effectsFadeoutDuration = duration;
            this._effectsFadeoutLastSecond = start;
        } else {
            console.log("ERROR: Please select either the 'effects' or 'music' channel to set a fadeout time.");
        }
        
    }

    // Tells the Audio Controller to immediately begin to fade out the music track, over a given duration
    startFadeout = (channel: string, duration: number) => {
        if (channel === "music") {
            const sound = document.getElementById(this._music);
            if (sound) {
                //@ts-ignore
                const time = sound.currentTime;
                this._musicFadeout = time;
                this._musicFadeoutDuration = duration;
                this._musicFadeoutLastSecond = time;
                // Halt any fade-in effect that is still ongoing
                this._musicFadein = 0;
                this._musicFadeinLastSecond = 0;
            } else {
                console.log("ERROR: Unable to start music fadeout.");
            }
        } else if (channel === "effects") {
            const sound = document.getElementById(this._effects);
            if (sound) {
                //@ts-ignore
                const time = sound.currentTime;
                this._effectsFadeout = time;
                this._effectsFadeoutDuration = duration;
                this._effectsFadeoutLastSecond = time;
                // Halt any fade-in effect that is still ongoing
                this._effectsFadein = 0;
                this._effectsFadeinLastSecond = 0;
            } else {
                console.log("ERROR: Unable to start effects fadeout.");
            }
        } else {
            console.log("ERROR: Please select either the 'effects' or 'music' channel to start a fadeout effect.");
        }
    }

    // Sets how long a fade-in should take to get to max volume (should be called immediately AFTER the play method?!)
    setFadeinTime = (channel: string, duration: number) => {
        if (channel === "music") {
            this._musicFadein = duration;
            this._musicFadeinLastSecond = 0;        // Reset fadein duration counter
            this.adjustVolume("music", -1, true);         // Set the current audio track's volume to zero
        } else if (channel === "effects") {
            this._effectsFadein = duration;
            this._effectsFadeinLastSecond = 0;      // Reset fadein duration counter
            this.adjustVolume("effects", -1, true);
        } else {
            console.log("ERROR: Please select either the 'effects' or 'music' channel to set fadein time/duration.");
        }
    }

    resetFadeEffects = (channel: string) => {
        if (channel === "music") {
            this._musicFadein = 0;
            this._musicFadeout = 0;
            this._musicFadeoutDuration = 0;
            this._musicFadeoutLastSecond = 0;
            this._musicFadeinLastSecond = 0;
        } else if (channel === "effects") {
            this._effectsFadein = 0;            // Same system, for the effects channel
            this._effectsFadeout = 0;
            this._effectsFadeoutDuration = 0;
            this._effectsFadeoutLastSecond = 0;
            this._effectsFadeinLastSecond = 0;
        } else {
            console.log("ERROR: Please select either the 'effects' or 'music' channel to reset fade effects");
        }
    }

    // SECTION 2: BASIC PLAYBACK METHODS

    // Looks up a sound file by its ID and attempts to play it on the given channel (music or effects)
    playSound = (channel: string, id: string) => {
        try {
            const sound = document.getElementById(id);
            this.resetFadeEffects(channel);
            if (sound) {
                // Store the ID if the element is found
                if (channel === "music") {
                    this._music = id;
                    //@ts-ignore
                    sound.play();
                    //@ts-ignore
                    sound.volume = this._musicVolume;
                } else if (channel === "effects") {
                    this._effects = id;
                    //@ts-ignore
                    sound.play();
                    //@ts-ignore
                    sound.volume = this._effectsVolume;
                }
            } else {
                console.log(`ERROR: Sound file ${id} not found.`);
            }
        } catch {
            console.log(`ERROR: Sound file ${id} was not found or was unplayable.`);
        }
    }

    // Provides the basic functionality of the play method, but doesn't store any info about the file being played
    quickPlay = (id: string) => {
        try {
            const sound = document.getElementById(id);
            if (sound) {
                //@ts-ignore
                sound.play();
            } else {
                console.log(`ERROR: Sound file not found for ${id}.`);
            }
        } catch {
            console.log(`ERROR: Failed to play sound ${id}.`);
        }
    }
    
    // Stops the sound file from the given channel, but keeps its playback at the current location so it can be resumed the next time it's played
    pauseSound = (channel: string) => {
        try {
            let id: string = "";
            if (channel === "music") {
                id = this._music;
            } else if (channel === "effects") {
                id = this._effects;
            }
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
            console.log(`ERROR: Was unable to pause sound for ${channel} channel.`);
        }
    }

    // Unlike the regular PlaySound method, this resumes whatever sound was playing in a given channel without resetting fade times
    resumeSound = (channel: string) => {
        let id: string = "";
        if (channel === "music") {
            id = this._music;
        } else if (channel === "effects") {
            id = this._effects;
        }
        try {
            const sound = document.getElementById(id);
            if (sound) {
                //@ts-ignore
                sound.play();
            }
        } catch {
            console.log(`ERROR: Unable to resume playing sound ${id} for ${channel} channel.`);
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
            console.log(`ERROR: Was unable to stop sound for channel ${channel}.`);
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

    // Takes the name of a sound channel (music or effects only) and a DELTA (-1 to 1) to set that channel's new volume FOR THE CURRENT TRACK ONLY (used for fade effects) ... Fadeout boolean means reset the track's time when volume hits zero
    adjustVolume = (channel: string, delta: number, fadeout: boolean) => {
        try {
            const adjustedDelta = Math.min(Math.max(delta, -1), 1);        // Ensure delta respects the limits
            switch (channel) {
                case "music":
                    if (this._music) {
                        const sound = document.getElementById(this._music);
                        if (sound) {
                            //@ts-ignore
                            const vol = Math.min(Math.max(sound.volume + adjustedDelta, 0), 1);  // Ensure final value also respects the limits
                            //@ts-ignore
                            sound.volume = vol;
                            //@ts-ignore
                            if (vol === 0 && fadeout) sound.currentTime = 0;   // Reset track to beginning if it fades all the way out
                        }
                    } else {
                        console.log("ERROR: Was unable to adjust volume for music sound channel. Current music ID not found.");
                    }
                    break;
                case "effects":
                    if (this._effects) {
                        const sound = document.getElementById(this._effects);
                        if (sound) {
                            //@ts-ignore
                            const vol = Math.min(Math.max(sound.volume + adjustedDelta, 0), 1);  // Ensure final value also respects the limits
                            //@ts-ignore
                            sound.volume = vol;
                            //@ts-ignore
                            if (vol === 0 && fadeout) sound.currentTime = 0;   // Reset track to beginning if it fades all the way out
                        }
                    } else {
                        console.log("ERROR: Was unable to adjust volume for effects sound channel. Current effect ID not found.");
                    }
                    break;
            }
        } catch {
            console.log(`ERROR: Something went wrong trying to adjust volume for ${channel} sound channel.`);
        }
    }

    // SECTION 4: SOUND AND MUSIC PRE-PACKAGED BUNDLES (Quasi-content as code, which is generally a bad practice, but whatever there...)

    // Packages come with built-in but adjustable fade-in/fade-out times; played in the 'effects' channel (by default)
    playAirlockSound = (fadeoutStart: number, fadeoutduration: number, channel?: string) => {
        this.playSound(channel || "effects", "airlock01");
        this.setFadeoutTimes(channel || "effects", fadeoutStart || 4, fadeoutduration || 5);
    }

    // Note that effects which start at full volume don't require a fadein duration to be set
    playRocketSound = (fadeoutStart: number, fadeoutduration: number, channel?: string) => {
        this.playSound(channel || "effects", "rocket");
        this.setFadeoutTimes(channel || "effects", fadeoutStart || 3, fadeoutduration || 5);
    }

    playWindSound = (fadein: number, fadeoutStart: number, fadeoutduration: number, channel?: string) => {
        this.playSound(channel || "effects", "wind01");
        this.setFadeinTime(channel || "effects", fadein || 19); // Use default values if custom ones are not provided
        this.setFadeoutTimes(channel || "effects", fadeoutStart || 20, fadeoutduration || 20);
    }

    // SECTION 5: QUICK SOUND RANDOMIZED SAMPLES (For playing quick sounds that have a few different, interchangeable samples)

    playQuickAirlockSound = () => {
        const rando = Math.floor(Math.random() * 3)
        const airlock: string = rando > 1 ? "airlock02" : rando > 0 ? "airlock03" : "airlock04";   // Pick a random airlock sound each time a module is placed
        this.quickPlay(airlock);
    }

    playQuickDemolishSound = () => {
        const rando = Math.floor(Math.random() * 3)
        const demo: string = rando > 1 ? "demolish01" : rando > 0 ? "demolish02" : "demolish03";   // Pick a random demolition sound each time
        this.quickPlay(demo);
    }

    playQuickExcavateSound = () => {
        const rando = Math.floor(Math.random() * 2)     // Only 2 options for excavate (dig) sound
        const exc: string = rando > 0 ? "excavate01" : "excavate02";
        this.quickPlay(exc);
    }

    playQuickRocksSound = () => {
        const rando = Math.floor(Math.random() * 3)
        const rocks: string = rando > 1 ? "rocks01" : rando > 0 ? "rocks02" : "rocks03";
        this.quickPlay(rocks);
    }

    // SECION 5-B: COLONIST SOUNDS (SORTED BY MORALE)

    playHappyMale = () => {
        const rando = Math.floor(Math.random() * 3)
        const happy: string = rando > 1 ? "colonistMaleHappy01" : rando > 0 ? "colonistMaleHappy02" : "colonistMaleHappy03";
        this.quickPlay(happy);
    }

    playNeutralMale = () => {
        const rando = Math.floor(Math.random() * 3)
        const neutral: string = rando > 1 ? "colonistMaleNeutral01" : rando > 0 ? "colonistMaleNeutral02" : "colonistMaleNeutral03";
        this.quickPlay(neutral);
    }
    
    playSadMale = () => {
        const rando = Math.floor(Math.random() * 3)
        const sad: string = rando > 1 ? "colonistMaleSad01" : rando > 0 ? "colonistMaleSad02" : "colonistMaleSad03";
        this.quickPlay(sad);
    }

}
