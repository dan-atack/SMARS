// The Audio Controller component is a context-like subclass of the App, which is passed to various subcomponents to allow them to control the game's sound effects

export class AudioController {
    // Audio Controller types
    _music: string;             // The DOM ID of the currently playing music file, if any (empty string = no file)
    _effect: string;            // DOM ID of the currently playing sound effect file, if any (empty string = no file)
    _musicCutoff: number;       // Actual format TBD; will be used to determine when to fade-out the currently playing music, if requested ( 0 = no cutoff )
    _musicVolume: number;       // Value ranges from 0 - 1.0; Represents the current volume of the game's music
    _effectsVolume: number;     // Value ranges from 0 - 1.0; Volume for in-game sound effects
    _menuVolume: number;        // Value ranges from 0 - 1.0; Volume for buttons, menu events, etc

    constructor() {
        this._music = "";
        this._effect = "";
        this._musicCutoff = 0;
        this._musicVolume = 1;      // Start at full volume by default
        this._effectsVolume = 1;
        this._menuVolume = 1;
    }

    // Looks up a sound file by its ID and attempts to play it
    playSound = (id: string) => {
        try {
            const sound = document.getElementById(id);
            if (sound) {
                //@ts-ignore
                sound.play();
            }
        } catch {
            console.log(`ERROR: Sound file not found for ${id}`);
        }
    }
    
    // Stops a sound file but keeps its playback at the current location so it can be resumed the next time it's played
    pauseSound = (id: string) => {
        try {
            const sound = document.getElementById(id);
            if (sound) {
                //@ts-ignore
                sound.pause();
            }
        } catch {
            console.log(`ERROR: Was unable to pause sound ${id}`);
        }
    }
    
    // Stops a sound file and re-loads it so it will start from the beginning next time it's played
    stopSound = (id: string) => {
        try {
            const sound = document.getElementById(id);
            if (sound) {
                //@ts-ignore
                sound.pause();
                //@ts-ignore
                sound.currentTime = 0;
            }
        } catch {
            console.log(`ERROR: Was unable to stop sound ${id}`);
        }
    }
}
