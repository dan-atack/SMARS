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
            keyframes = [0.2, 0.4, 0.6, 0.8, 1];
            frameRate = 0.2;
            xSpeeds = [1, 1, 1, 1, 1];  // X speeds combined times frame rate = 1
            ySpeeds = [0, 0, 0, 0, 0];  // y speeds combined times frame rate = 0 (No change in elevation)
            break;
        case "small-climb":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xSpeeds = [1, 0, 0, 1, 1, 1, 2, 2];                 // X speeds must sum to 8
            ySpeeds = [-1, 0, -2, -1, -4, 0, 0, 0];             // Y speeds must sum to -8
            break;
        case "big-climb":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xSpeeds = [1, -1, 1, 0, 0, 1, 1, 2, 3, 2];              // X speeds must sum to 10
            ySpeeds = [0, 0, -3, -1, 0, -2, -4, -2, -4, -4];        // Y speeds must sum to -20
            break;
        case "small-drop":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xSpeeds = [0, 1, 2, 2, 1, 1, 1, 0];
            ySpeeds = [0, 0, 1, 2, 3, 3, -1, 0];
            break;
        case "big-drop":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xSpeeds = [1, 2, 1, 1, 1, 1, 1, 0];
            ySpeeds = [0, 2, 3, 4, 5, 3, -1, 0];
            break;
        case "climb-ladder-up":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];           // X speeds must sum to 0
            ySpeeds = [0, -2, 0, -2, 0, -2, 0, -2, 0, -2];      // Y speeds must sum to -10
            break;
        case "climb-ladder-down":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];           // X speeds must sum to 0
            ySpeeds = [0, 2, 0, 2, 0, 2, 0, 2, 0, 2];           // Y speeds must sum to 10
            break;
        case "drink":
        case "eat":                                             // Body is at rest during both eat and drink animations
            keyframes = [0.5, 1];
            frameRate = 0.5;
            xSpeeds = [0, 0];
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
            keyframes = [0.2, 0.4, 0.6, 0.8, 1];
            frameRate = 0.2;
            xSpeeds = [1, 1, 1, 1, 1];
            ySpeeds = [0, 0, 0, 0, 0];
            break;
        case "small-climb":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xSpeeds = [1, 1, 1, 1, 1, 1, 1, 1];                 // X speeds must sum to 8
            ySpeeds = [-1, 0, -2, 0, -3, 0, -1, -1];            // Y speeds must sum to -8
            break;
        case "big-climb":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xSpeeds = [1, 0, 0, 0, 0, 1, 1, 2, 3, 2];
            ySpeeds = [0, 0, -3, -1, 0, -2, -4, -3, -3, -4];
            break;
        case "small-drop":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xSpeeds = [0, 1, 2, 2, 1, 1, 1, 0];
            ySpeeds = [0, 0, 1, 2, 3, 4, -1, -1];
            break;
        case "big-drop":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xSpeeds = [1, 2, 2, 1, 1, 1, 1, -1];
            ySpeeds = [1, 3, 3, 4, 5, 2, -2, 0];
            break;
        case "climb-ladder-up":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xSpeeds = [1, -1, 0, 0, 1, -1, 0, 0, 1, -1];        // X speeds must sum to 0
            ySpeeds = [0, -2, 0, -2, 0, -2, 0, -2, 0, -2];      // Y speeds must sum to -10
            break;
        case "climb-ladder-down":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xSpeeds = [1, -1, 0, 0, 1, -1, 0, 0, 1, -1];        // X speeds must sum to 0
            ySpeeds = [0, 2, 0, 2, 0, 2, 0, 2, 0, 2];           // Y speeds must sum to 10
            break;
        case "drink":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xSpeeds = [-1, -1, 0, 0, 0, 0, 0, 0, 0, 2];           // Head tilts slightly back and down during drinking animation
            ySpeeds = [1, 0, 0, 0, 0, 0, 0, 0, 0, -1];
            break;
        case "eat":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xSpeeds = [-1, -1, 0, 1, -1, 1, -1, 1, -1, 2];           // Head tilts back and forth during eating animation
            ySpeeds = [0, 0, 0, 1, -1, 1, -1, 1, -1, 0];
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
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xrSpeeds = [0, 0, 2, 2];  // Right moves first and stops halfway through the movement animation
            yrSpeeds = [0, 0, 0, 0];
            xlSpeeds = [2, 2, 0, 0];  // Left moves immediately afterwards and stops at the end of the animation
            ylSpeeds = [0, -0.5, 0, 0.5];
            break;
        case "small-climb":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xlSpeeds = [4, 4, 0, 0, 0, 0, 0, 0, 0];            // X values sum to 8
            ylSpeeds = [-1, -1, 0, 0, -2, -4, -1, 1];            // Y values sum to -8
            xrSpeeds = [2, 2, 0, 0, 2, 3, -1, 0];
            yrSpeeds = [-1, -1, 0, 0, -3, -4, 1, 0,];
            break;
        case "big-climb":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xlSpeeds = [5, 4, 0, 0, 1, 1, 0, 0, 0, -1];                              // X values sum to 10
            ylSpeeds = [-1, -1, 0, 0, -4, -3, 0, 0, -4, -7];                            // Y values sum to -20
            xrSpeeds = [2, 0, 1, 0, 0, 0, 3, 2, 0, 2];
            yrSpeeds = [0, 0, -4, -2, 0, 0, -4, -4, 0, -6];
            break;
        case "small-drop":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xrSpeeds = [1, 2, 1, 1, 1, 1, 1, 0];        // X values sum to 8
            yrSpeeds = [0, 1, 2, 2, 3, 1, -1, 0];       // Y values sum to 8
            xlSpeeds = [1, 0, 0, 0, 3, 2, 2, 0];
            ylSpeeds = [3, 3, 0, 0, 2, 1, -1, 0];
            break;
        case "big-drop":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xrSpeeds = [1, 2, 1, 1, 1, 1, 1, 0];        // X values sum to 8
            yrSpeeds = [0, 2, 3, 4, 5, 3, -2, 1];       // Y values sum to 16
            xlSpeeds = [1, 0, 0, 0, 3, 2, 2, 0];
            ylSpeeds = [4, 3, 0, 0, 5, 4, 1, -1];
            break;
        case "climb-ladder-up":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xlSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];                              // X values sum to 0
            ylSpeeds = [-1, -1, 0, 0, -2, -1, 0, 0, -2, -3];                        // Y values sum to -10
            xrSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            yrSpeeds = [0, 0, -2, -1, 0, 0, -2, -2, 0, -3];
            break;
        case "climb-ladder-down":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xlSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];                              // X values sum to 0
            ylSpeeds = [1, 1, 0, 0, 2, 1, 0, 0, 2, 3];                              // Y values sum to 10
            xrSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            yrSpeeds = [0, 0, 2, 1, 0, 0, 2, 2, 0, 3];
            break;
        case "drink":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xlSpeeds = [-1, -1, 0, 0, 0, 0, 0, 0, 0, 2];           // Left hand moves in slightly then is still during drinking
            ylSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            xrSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];           // Right hand is raised above the head
            yrSpeeds = [-2, -2, 0, 0, 0, 0, 0, 0, 2, 2];
            break;
        case "eat":                                         // Both hands move up and inward as if holding up food to be eaten
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xlSpeeds = [1, 1, 0, 0, 0, 0, 0, 0, 0, 2];      // Left hand inwards = positive
            ylSpeeds = [-1, -1, 0, 0, 0, 0, 0, 0, 0, 2];
            xrSpeeds = [-1, -1, 0, 0, 0, 0, 0, 0, 0, 2];    // Right hand inwards = negative
            yrSpeeds = [-1, -1, 0, 0, 0, 0, 0, 0, 0, 2];    // Both hands (and everything else) upward = negative
            break;
        case "boogie":
            // TODO: Add Easter Egg
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
        const t = yrAnimation;
        xrAnimation = xlAnimation;
        yrAnimation = ylAnimation;
        xlAnimation = s;
        ylAnimation = t;
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
            keyframes = [0.25, 0.5, 0.75, 1];
            frameRate = 0.25;
            xrSpeeds = [0, 0, 2, 2];  // Right moves second and stops at the end of the animation
            yrSpeeds = [0, 0, -0.5, 0.5];
            xlSpeeds = [2, 2, 0, 0];  // Left moves immediately and stops halfway through the movement animation
            ylSpeeds = [-0.5, 0.5, 0, 0];
            break;
        case "small-climb":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xlSpeeds = [4, 4, 0, 0, 0, 0, 0, 0];        // Sum to 8
            ylSpeeds = [-2, 0, 0, 0, -4, -3, 1, 0];        // Sum to -8
            xrSpeeds = [0, 0, 2, 2, 0, 0, 3, 1];
            yrSpeeds = [0, 0, -4, 0, 0, 0, -5, 1];
            break;
        case "big-climb":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xlSpeeds = [5, 5, 0, 0, 0, 0, 0, 0, 0, 0];                              // X values sum to 10
            ylSpeeds = [-2, -1, 0, 0, -5, -5, 0, 0, -8, 1];                            // Y values sum to -20
            xrSpeeds = [0, 0, 2, 1, 0, 0, 1, 3, 0, 3];
            yrSpeeds = [0, 0, -4, -2, 0, 0, -6, -6, 0, -2];
            break;
        case "small-drop":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xrSpeeds = [0, 0, 2, 2, 2, 2, 0, 0];        // Sums to 8
            yrSpeeds = [0, 0, 1, 2, 3, 2, 0, 0];        // Sums to 8
            xlSpeeds = [3, 3, 2, 0, 0, 0, 0, 0];
            ylSpeeds = [0, 1, 2, 3, 2, 0, 0, 0];
            break;
        case "big-drop":
            keyframes = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
            frameRate = 0.125;
            xrSpeeds = [1, 2, 1, 1, 1, 1, 1, 0];
            yrSpeeds = [0, 1, 4, 5, 4, 2, 0, 0];
            xlSpeeds = [2, 2, 1, 1, 1, 1, 0, 0];
            ylSpeeds = [0, 3, 4, 5, 4, 0, 0, 0];
            break;
        case "climb-ladder-up":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xlSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];                              // X values sum to 0
            ylSpeeds = [-1, 0, 0, 0, -2, -3, 0, 0, -4, 0];                          // Y values sum to -10
            xrSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            yrSpeeds = [0, 0, -2, -1, 0, 0, -3, -3, 0, -1];
            break;
        case "climb-ladder-down":
            keyframes = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
            frameRate = 0.1;
            xlSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];                              // X values sum to 0
            ylSpeeds = [1, 0, 0, 0, 2, 3, 0, 0, 4, 0];                              // Y values sum to 10
            xrSpeeds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            yrSpeeds = [0, 0, 2, 1, 0, 0, 3, 3, 0, 1];
            break;
        case "drink":
        case "eat":
            keyframes = [0.5, 1];
            frameRate = 0.5;
            xlSpeeds = [0, 0];           // Feet are completely still during drinking and eating
            ylSpeeds = [0, 0];
            xrSpeeds = [0, 0];
            yrSpeeds = [0, 0];
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