// Since the Colonists will ultimately do a large variety of activities, their animations will be kept in their own file

export const bodyAnimations = (movementType: string, fpm: number, tick: number, cost: number, sign: number) => {
    let xAnimation: number = 0;
    let yAnimation: number = 0;
    let keyframes: number[] = [];
    let frameRate: number = 0;
    let xSpeeds: number[] = [0, 0];
    let ySpeeds: number[] = [0, 0];
    switch (movementType) {
        case "walk":
            keyframes = [0.5, 1];
            frameRate = 0.5;
            xSpeeds = [1, 1];
            break;
        case "small-climb":
            keyframes = [0.2, 0.4, 0.6, 0.8, 1];
            frameRate = 0.2;
            xSpeeds = [1, 1, 1, 1, 1];
            ySpeeds = [-1, -1, -1, -1, -1];
            break;
        case "big-climb":
            keyframes = [0.2, 0.4, 0.6, 0.8, 1];
            frameRate = 0.2;
            xSpeeds = [0, 0, 1, 1, 3];
            ySpeeds = [0, 0, -4, -4, -2];
            break;
        case "small-drop":
            keyframes = [0.2, 0.4, 0.6, 0.8, 1];
            frameRate = 0.2;
            xSpeeds = [0, 0, 1, 3];
            ySpeeds = [0, 3, 3, 2];
            break;
        case "big-drop":
            keyframes = [0.2, 0.4, 0.6, 0.8, 1];
            frameRate = 0.2;
            xSpeeds = [0, 0, 1, 3];
            ySpeeds = [0, 3, 3, 2];
            break;
        default:
            keyframes = [0.5, 1];
            frameRate = 0.5;
            cost = 1;
    }
    const progress = (tick + 1) / (fpm * cost);
    const frame = Math.ceil(progress * keyframes.length) - 1;
    const xProg = (xSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    const yProg = (ySpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    if (frame > 0) {
        xAnimation = ((xSpeeds[frame] * tick) / (cost * fpm) - (xSpeeds[frame] * keyframes[frame - 1] - xProg)) * sign;
        yAnimation = (ySpeeds[frame] * tick) / (cost * fpm) - (ySpeeds[frame] * keyframes[frame - 1] - yProg);
    } else {
        xAnimation = ((xSpeeds[frame] * tick) / (cost * fpm)) * sign;
        yAnimation = (ySpeeds[frame] * tick) / (cost * fpm);
    }
    return { xAnimation, yAnimation };
}

export const headAnimations = (movementType: string, fpm: number, tick: number, cost: number, sign: number) => {
    let xAnimation: number = 0;
    let yAnimation: number = 0;
    let keyframes: number[] = [];
    let frameRate: number = 0;
    let xSpeeds: number[] = [0, 0];
    let ySpeeds: number[] = [0, 0];
    switch (movementType) {
        case "walk":
            keyframes = [0.5, 1];
            frameRate = 0.5;
            xSpeeds = [1, 1];
            ySpeeds = [0, 0];
            break;
        case "small-climb":
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xSpeeds = [0, 0, 3, 1];
            ySpeeds = [0, -3, 0, -1];
            break;
        case "big-climb":
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xSpeeds = [0, 0, 3, 1];
            ySpeeds = [0, -6, 0, -2];
            break;
        case "small-drop":
            keyframes = [0.5, 1];
            frameRate = 0.5;
            xSpeeds = [1, 1];
            ySpeeds = [0, 0];
            break;
        case "big-drop":
            keyframes = [0.5, 1];
            frameRate = 0.5;
            xSpeeds = [1, 1];
            ySpeeds = [0, 0];
            break;
        default:
            keyframes = [0.5, 1];
            frameRate = 0.5;
            cost = 1;
    }
    const progress = (tick + 1) / (fpm * cost);
    const frame = Math.ceil(progress * keyframes.length) - 1;
    const xProg = (xSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    const yProg = (ySpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    if (frame > 0) {    // Only check for an offset if this isn't the first frame
        xAnimation = ((xSpeeds[frame] * tick) / (cost * fpm) - (xSpeeds[frame] * keyframes[frame - 1] - xProg)) * sign;
        yAnimation = (ySpeeds[frame] * tick) / (cost * fpm) - (ySpeeds[frame] * keyframes[frame - 1] - yProg);
    } else {
        xAnimation = ((xSpeeds[frame] * tick) / (cost * fpm)) * sign;
        yAnimation = (ySpeeds[frame] * tick) / (cost * fpm);
    }
    return { xAnimation: xAnimation, yAnimation: yAnimation };
}

export const handAnimations = (movementType: string, fpm: number, tick: number, cost: number, sign: number) => {
    let xlAnimation: number = 0;
    let xrAnimation: number = 0;
    let ylAnimation: number = 0;
    let yrAnimation: number = 0;
    let keyframes: number[] = [];
    let frameRate: number = 0;
    let xlSpeeds: number[] = [0, 0];
    let ylSpeeds: number[] = [0, 0];
    let xrSpeeds: number[] = [0, 0];
    let yrSpeeds: number[] = [0, 0];
    switch (movementType) {
        case "walk":
            keyframes = [0.5, 1];
            frameRate = 0.5;
            xrSpeeds = [0, 2];  // Right moves first and stops halfway through the movement animation
            xlSpeeds = [2, 0];  // Left moves immediately afterwards and stops at the end of the animation
            break;
        case "small-climb":
            // Declare how many frames you are going to use, and how much each component moves in every frame
            // Reminder: Y values are negative when you're climbing
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xlSpeeds = [3, 0, 0, 1];            // X values sum to 1 (when multiplied by frame rate)
            ylSpeeds = [-1, 0, 0, -3];          // Y values sum to -1 (when multiplied by frame rate)
            xrSpeeds = [1, 0, 0, 3];
            yrSpeeds = [0, 0, -1, -3];
            break;
        case "big-climb":
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xlSpeeds = [3, 0, 1, 0];        // X values sum to 1 (when multiplied by frame rate)
            ylSpeeds = [-3, 0, -3, -2];     // Y values sum to -2 (when multiplied by frame rate)
            xrSpeeds = [0, 1, 0, 3];
            yrSpeeds = [0, -5, 0, -3];
            break;
        case "small-drop":
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xlSpeeds = [2, 0, 0, 2];        // X values sum to 1 (when multiplied by frame rate)
            ylSpeeds = [3, 0, 0, 1];        // Y values sum to 1 (when multiplied by frame rate)
            xrSpeeds = [1, 0, 0, 3];
            yrSpeeds = [3, 0, 0, 1];
            break;
        case "big-drop":
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xlSpeeds = [2, 0, 1, 1];        // X values sum to 1 (when multiplied by frame rate)
            ylSpeeds = [3, 0, 5, 0];        // Y values sum to 2 (when multiplied by frame rate)
            xrSpeeds = [1, 0, 1, 2];
            yrSpeeds = [3, 0, 5, 0];
            break;
        default:
            // Ensure no glitches for standing still animation
            keyframes = [0.5, 1];
            frameRate = 0.5;
            cost = 1;
    }
    // Get current frame: Current frame = first frame that is LOWER than the current progress value:
    const progress = (tick + 1) / (fpm * cost);   // Start as though first tick was a 1, not a zero
    // Convert progress into index of current keyframe (and speed value)
    const frame = Math.ceil(progress * keyframes.length) - 1; // Subtract one to convert to index position
    // Get progress already made for each component
    const xlProg = (xlSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    const ylProg = (ylSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    const xrProg = (xrSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    const yrProg = (yrSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    // Update the position for any frame using the above data
    if (frame > 0) {    // Only check for an offset if this isn't the first frame
        xlAnimation = ((xlSpeeds[frame] * tick) / (cost * fpm) - (xlSpeeds[frame] * keyframes[frame - 1] - xlProg)) * sign;
        ylAnimation = (ylSpeeds[frame] * tick) / (cost * fpm) - (ylSpeeds[frame] * keyframes[frame - 1] - ylProg);
        xrAnimation = ((xrSpeeds[frame] * tick) / (cost * fpm) - (xrSpeeds[frame] * keyframes[frame - 1] - xrProg)) * sign;
        yrAnimation = (yrSpeeds[frame] * tick) / (cost * fpm) - (yrSpeeds[frame] * keyframes[frame - 1] - yrProg);
    } else {
        xlAnimation = ((xlSpeeds[frame] * tick) / (cost * fpm)) * sign;
        ylAnimation = (ylSpeeds[frame] * tick) / (cost * fpm);
        xrAnimation = ((xrSpeeds[frame] * tick) / (cost * fpm)) * sign;
        yrAnimation = (yrSpeeds[frame] * tick) / (cost * fpm);
    }
    // Invert which hand gets which instructions if the colonist is moving to the left:
    if (sign === -1) {
        const s = xrAnimation;
        xrAnimation = xlAnimation;
        xlAnimation = s;
    }
    return { xlAnimation, xrAnimation, ylAnimation, yrAnimation };
}

export const footAnimations = (movementType: string, fpm: number, tick: number, cost: number, sign: number) => {
    let xlAnimation: number = 0;
    let xrAnimation: number = 0;
    let ylAnimation: number = 0;
    let yrAnimation: number = 0;
    let keyframes: number[] = [];
    let frameRate: number = 0;
    let xlSpeeds: number[] = [0, 0];
    let ylSpeeds: number[] = [0, 0];
    let xrSpeeds: number[] = [0, 0];
    let yrSpeeds: number[] = [0, 0];
    switch (movementType) {
        case "walk":
            keyframes = [0.5, 1];
            frameRate = 0.5;
            xrSpeeds = [0, 2];  // Right moves first and stops halfway through the movement animation
            xlSpeeds = [2, 0];
            break;
        case "small-climb":
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xlSpeeds = [3, 0, 0, 1];
            ylSpeeds = [-1, 0, 0, -3];
            xrSpeeds = [0, 1, 0, 3];
            yrSpeeds = [0, -2, 0, -2];
            break;
        case "big-climb":
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xlSpeeds = [3, 0, 0, 1];
            ylSpeeds = [-2, 0, -3, -3];
            xrSpeeds = [0, 0, 0, 4];
            yrSpeeds = [0, -4, 0, -4];
            break;
        case "small-drop":
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xlSpeeds = [0, 0, 3, 1];
            ylSpeeds = [0, 0, 3, 1];
            xrSpeeds = [0, 0, 3, 1];
            yrSpeeds = [0, 0, 3, 1];
            break;
        case "big-drop":
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xlSpeeds = [0, 0, 3, 1];
            ylSpeeds = [0, 1, 5, 2];
            xrSpeeds = [0, 0, 3, 1];
            yrSpeeds = [0, 1, 5, 2];
            break;
        default:
            keyframes = [0.5, 1];
            frameRate = 0.5;
            cost = 1;
    }
    const progress = (tick + 1) / (fpm * cost);   // Start as though first tick was a 1, not a zero
    const frame = Math.ceil(progress * keyframes.length) - 1; // Subtract one to convert to index position
    // Get progress already made for each component
    const xlProg = (xlSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    const ylProg = (ylSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    const xrProg = (xrSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    const yrProg = (yrSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
    // Update the position for any frame using the above data
    if (frame > 0) {
        xlAnimation = ((xlSpeeds[frame] * tick) / (cost * fpm) - (xlSpeeds[frame] * keyframes[frame - 1] - xlProg)) * sign;
        ylAnimation = (ylSpeeds[frame] * tick) / (cost * fpm) - (ylSpeeds[frame] * keyframes[frame - 1] - ylProg);
        xrAnimation = ((xrSpeeds[frame] * tick) / (cost * fpm) - (xrSpeeds[frame] * keyframes[frame - 1] - xrProg)) * sign;
        yrAnimation = (yrSpeeds[frame] * tick) / (cost * fpm) - (yrSpeeds[frame] * keyframes[frame - 1] - yrProg);
    } else {
        xlAnimation = ((xlSpeeds[frame] * tick) / (cost * fpm)) * sign;
        ylAnimation = (ylSpeeds[frame] * tick) / (cost * fpm);
        xrAnimation = ((xrSpeeds[frame] * tick) / (cost * fpm)) * sign;
        yrAnimation = (yrSpeeds[frame] * tick) / (cost * fpm);
    }
    // Invert which foot gets which instructions if the colonist is moving to the left:
    if (sign === -1) {
        const s = xrAnimation;
        const t = yrAnimation;
        xrAnimation = xlAnimation;
        yrAnimation = ylAnimation;
        xlAnimation = s;
        ylAnimation = t;
    }
    return { xlAnimation, xrAnimation, ylAnimation, yrAnimation };
}