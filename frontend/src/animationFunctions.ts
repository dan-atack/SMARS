// Since the Colonists will ultimately do a large variety of activities, their animations will be kept in their own file

export const bodyAnimations = (movementType: string, fpm: number, tick: number, cost: number, sign: number) => {
    let xAnimation: number = 0;
    let yAnimation: number = 0;
    switch (movementType) {
        case "walk":
            xAnimation = (1 / fpm) * tick * sign;
            break;
        case "small-climb":
            const keyframes = [0.4, 0.8];
            if ((1 / fpm) * tick / cost < keyframes[0]) {
                // Move body forward by 0.2 by the time keyframe one's time is reached
                xAnimation = ((0.5 / fpm) * tick * sign) / cost;
                // Do not move body upward during initial movement
                yAnimation = 0;
            } else if ((1 / fpm) * tick / cost < keyframes[1]) {
                // Halt forward motion and keep body at a constant horizontal location as we move to keyframe 2
                xAnimation = 0.2 * sign // Value here is equal to previous rate of change times keyframes[0]'s time (0.5 * 0.4)
                // Move y up at the normal pace, so that it ends up at 0.4; offset by prev keyframe times current pace
                yAnimation = -(((1 / fpm) * tick) / cost) + 0.4;
            } else {
                // Make x go the final 80% of the way in the last 20% of the time by going at quadruple pace
                // Offset = expected position (pace * time elapsed) - start position = (4 x 0.8) = 3.2 - 0.2 = 3.0
                xAnimation = ((((4 / fpm) * tick) / cost) - 3) * sign;
                // Y Offset: Current pace x prev keyframe time - prev position = (3 x 0.8) - 0.4 = 2
                yAnimation = -(((3 / fpm) * tick) / cost) + 2;
            }
            break;
        case "big-climb":
            const kfs = [0.25, 0.5, 0.75];
            const xPositions = [0, 0, 1, 3];
            const yPositions = [0, 3, 3, 2];
            if ((1 / fpm) * tick / cost < kfs[0]) {
                xAnimation = 0;
                yAnimation = 0;
            } else if ((1 / fpm) * tick / cost < kfs[1]) {
                xAnimation = 0;
                yAnimation = -(((3 / fpm) * tick) / cost) + 0.75;
            } else if ((1 / fpm) * tick / cost < kfs[2]) {
                xAnimation = ((((1 / fpm) * tick) / cost) - 0.5) * sign;
                yAnimation = -(((3 / fpm) * tick) / cost) + 0.75;
            } else {
                xAnimation = ((((3 / fpm) * tick) / cost) - 2) * sign;
                yAnimation = -(((2 / fpm) * tick) / cost);
            }
            break;
        case "small-drop":
            xAnimation = ((1 / fpm) * tick * sign) / cost;
            yAnimation = ((1 / fpm) * tick) / cost;
            break;
        case "big-drop":
            xAnimation = ((1 / fpm) * tick * sign) / cost;
            yAnimation = ((2 / fpm) * tick) / cost;
            break;
    }
    return { xAnimation, yAnimation };
}

export const headAnimations = (movementType: string, fpm: number, tick: number, cost: number, sign: number) => {
    let xAnimation: number = 0;
    let yAnimation: number = 0;
    switch (movementType) {
        case "walk":
            xAnimation = (1 / fpm) * tick * sign;
            break;
        case "small-climb":
            const keyframes = [0.4, 0.8];
            if ((1 / fpm) * tick / cost < keyframes[0]) {
                xAnimation = ((0.5 / fpm) * tick * sign) / cost;
                yAnimation = 0;
            } else if ((1 / fpm) * tick / cost < keyframes[1]) {
                xAnimation = 0.2 * sign;
                yAnimation = -(((1 / fpm) * tick) / cost) + 0.4;
            } else {
                xAnimation = ((((4 / fpm) * tick) / cost) - 3) * sign;
                yAnimation = -(((3 / fpm) * tick) / cost) + 2;
            }
            break;
        case "big-climb":
            const kfs = [0.25, 0.5, 0.75];
            const xPositions = [0, 0, 1, 3];
            const yPositions = [0, 3, 3, 2];
            if ((1 / fpm) * tick / cost < kfs[0]) {
                xAnimation = 0;
                yAnimation = 0;
            } else if ((1 / fpm) * tick / cost < kfs[1]) {
                xAnimation = 0;
                yAnimation = -(((3 / fpm) * tick) / cost) + 0.75;
            } else if ((1 / fpm) * tick / cost < kfs[2]) {
                xAnimation = ((((1 / fpm) * tick) / cost) - 0.5) * sign;
                yAnimation = -(((3 / fpm) * tick) / cost) + 0.75;
            } else {
                xAnimation = ((((3 / fpm) * tick) / cost) - 2) * sign;
                yAnimation = -(((2 / fpm) * tick) / cost);
            }
            break;
        case "small-drop":
            xAnimation = ((1 / fpm) * tick * sign) / cost;
            yAnimation = ((1 / fpm) * tick) / cost;
            break;
        case "big-drop":
            xAnimation = ((1 / fpm) * tick * sign) / cost;
            yAnimation = ((2 / fpm) * tick) / cost;
            break;
    }
    let xOffsets: number[] = [];
    // Sign of 1 = colonist faces right
    if (sign === 1) {
        xOffsets = [0.6 + xAnimation, 0.7 + xAnimation];
    } else {
        xOffsets = [0.4 + xAnimation, 0.3 + xAnimation];
    }
    return { xAnimation: xAnimation, yAnimation: yAnimation };
}

export const handAnimations = (movementType: string, fpm: number, tick: number, cost: number, sign: number) => {
    let xlAnimation: number = 0;
    let xrAnimation: number = 0;
    let ylAnimation: number = 0;
    let yrAnimation: number = 0;
    let xlSpeeds = [];
    let ylSpeeds = [];
    let xrSpeeds = [];
    let yrSpeeds = [];
    let xlProg = 0;
    let ylProg = 0;
    let xrProg = 0;
    let yrProg = 0;
    // TODO: Let keyframes, speeds, etc. so you don't have to use a different variable name for each switch case
    switch (movementType) {
        case "walk":
            // Right moves first and stops halfway through the movement animation
            xlAnimation = (2.5 / fpm) * Math.min(fpm / 2, tick) * sign;
            // Left moves immediately afterwards and stops at the end of the animation
            xrAnimation = (2 / fpm) * Math.max(0, tick - fpm / 2) * sign;
            break;
        case "small-climb":
            const keyframes = [0.4, 0.8, 1];
            if ((1 / fpm) * tick / cost < keyframes[0]) {
                // Rear hand moves forward at double pace to join forward hand
                xlAnimation = ((2 / fpm) * tick * sign) / cost;
                xrAnimation = ((1 / fpm) * tick * sign) / cost;
                // Forward hand moves upward by 0.2
                ylAnimation = 0;
                yrAnimation = -((0.5 / fpm) * tick) / cost;
            } else if ((1 / fpm) * tick / cost < keyframes[1]) {
                // Hands remain in place, as if to 'boost' the rest of the body
                xlAnimation = 0.8 * sign;   // Previous rate of change (2) times previous keyframe end time (0.4)
                xrAnimation = 0.4 * sign;
                ylAnimation = 0;
                yrAnimation = -0.2;
            } else {
                // Hands move quickly to their final destination
                xlAnimation = ((1 / fpm) * tick * sign) / cost;
                xrAnimation = ((((3 / fpm) * tick) / cost) - 2) * sign; // Expected (3 * 0.8) - Current (0.4)
                ylAnimation = -(((5 / fpm) * tick) / cost) + 4;
                yrAnimation = -(((4 / fpm) * tick) / cost) + 3;
            }
            break;
        case "big-climb":
            const kfs = [0.25, 0.5, 0.75, 1];
            const frameRate = 0.25;
            // Can we use a formula here to convert a series of speed values into animation instructions?
            // Formula: the sum of the positions (3 + 1) times the keyframes' time increment length (0.25) = 1 for x and 2 for y
            xlSpeeds = [3, 0, 1, 0];    // X values sum to 1 (when multiplied by frame rate)
            ylSpeeds = [3, 0, 3, 2];    // Y values sum to 2 (when multiplied by frame rate)
            xrSpeeds = [0, 1, 0, 3];
            yrSpeeds = [0, 5, 0, 3];
            // Get current frame: Current frame = first frame that is LOWER than the current progress value:
            const progress = (tick + 1) / (fpm * cost);   // Start as though first tick was a 1, not a zero
            // Convert progress into index of current keyframe (and speed value)
            const frame = Math.ceil(progress * kfs.length) - 1; // Subtract one to convert to index position
            // Get progress already made for each component
            const xlProg = (xlSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
            const ylProg = (ylSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
            const xrProg = (xrSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
            const yrProg = (yrSpeeds.slice(0, frame).reduce((a,b) => a + b, 0) * frameRate);
            // Update the position for any frame using the above data
            if (frame > 0) {    // Only check for an offset if this isn't the first frame
                xlAnimation = ((xlSpeeds[frame] * tick) / (cost * fpm) - (xlSpeeds[frame] * kfs[frame - 1] - xlProg)) * sign;
                // ylAnimation = ((ylSpeeds[frame] * tick) / (cost * fpm) - (ylSpeeds[frame] * kfs[frame - 1] - ylProg)) * sign;
                xrAnimation = ((xrSpeeds[frame] * tick) / (cost * fpm) - (xrSpeeds[frame] * kfs[frame - 1] - xrProg)) * sign;
                // yrAnimation = ((yrSpeeds[frame] * tick) / (cost * fpm) - (yrSpeeds[frame] * kfs[frame - 1] - yrProg)) * sign;
            } else {
                xlAnimation = ((xlSpeeds[frame] * tick) / (cost * fpm)) * sign;
                // ylAnimation = ((ylSpeeds[frame] * tick) / (cost * fpm)) * sign;
                xrAnimation = ((xrSpeeds[frame] * tick) / (cost * fpm)) * sign;
                // yrAnimation = ((yrSpeeds[frame] * tick) / (cost * fpm)) * sign;
            }
            if ((1 / fpm) * tick / cost < kfs[0]) {
                // Rear leg moves quickly forward and slowly upward
                // xlAnimation = (xlSpeeds[0] * tick * sign) / (fpm * cost);
                // xlAnimation = (((3 / fpm) * tick) / cost) * sign;
                ylAnimation = -(((3 / fpm) * tick) / cost);
                // xrAnimation = 0;
                yrAnimation = 0;
            } else if ((1 / fpm) * tick / cost < kfs[1]) {
                // Front leg moves upwards; rear leg remains still
                // xlAnimation = 0.75 * sign;
                ylAnimation = -0.75;
                // xrAnimation = ((((1 / fpm) * tick) / cost) - 0.25) * sign;
                yrAnimation = -(((5 / fpm) * tick) / cost) + 1.25;
            } else if ((1 / fpm) * tick / cost < kfs[2]) {
                // Rear leg moves upwards; front leg remains still
                // xlAnimation = ((((2 / fpm) * tick) / cost) - 0.25) * sign;
                ylAnimation = -(((3 / fpm) * tick) / cost) + 0.75;
                // xrAnimation = 0.25 * sign;
                yrAnimation = -1.25;
            } else {
                // Both legs move final distance
                // xlAnimation = 1.25 * sign;
                ylAnimation = -(((2 / fpm) * tick) / cost);
                // xrAnimation = ((((3 / fpm) * tick) / cost) - 2) * sign;
                yrAnimation = -(((3 / fpm) * tick) / cost) + 1;
            }
            break;
        case "small-drop":
            xlAnimation = ((1 / fpm) * tick * sign) / cost;
            xrAnimation = ((1 / fpm) * tick * sign) / cost;
            ylAnimation = ((1 / fpm) * tick) / cost;
            yrAnimation = ((1 / fpm) * tick) / cost;
            break;
        case "big-drop":
            xlAnimation = ((1 / fpm) * tick * sign) / cost;
            xrAnimation = ((1 / fpm) * tick * sign) / cost;
            ylAnimation = ((2 / fpm) * tick) / cost;
            yrAnimation = ((2 / fpm) * tick) / cost;
            break;
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
    switch (movementType) {
        case "walk":
            // Right moves first and stops halfway through the movement animation
            xlAnimation = (2 / fpm) * Math.min(fpm / 2, tick) * sign;
            // Left moves immediately afterwards and stops at the end of the animation
            xrAnimation = (2 / fpm) * Math.max(0, tick - fpm / 2) * sign;
            break;
        case "small-climb":
            const keyframes = [0.4, 0.8, 1];
            if ((1 / fpm) * tick / cost < keyframes[0]) {
                // Rear leg moves quickly forward and slowly upward
                xlAnimation = ((2 / fpm) * tick * sign) / cost;
                xrAnimation = 0;
                ylAnimation = -((0.5 / fpm) * tick) / cost;
                yrAnimation = 0;
            } else if ((1 / fpm) * tick / cost < keyframes[1]) {
                // Front leg moves upwards rapidly and forward slowly
                xlAnimation = 0.8 * sign;
                xrAnimation = ((((0.5 / fpm) * tick) / cost) - 0.2) * sign;
                ylAnimation = -0.2
                yrAnimation = -(((2 / fpm) * tick) / cost) + 0.8;
            } else {
                xlAnimation = ((1 / fpm) * tick * sign) / cost;
                xrAnimation = ((((4 / fpm) * tick) / cost) - 3) * sign;
                ylAnimation = -(((4 / fpm) * tick) / cost) + 3;
                yrAnimation = -((1 / fpm) * tick) / cost;
            }
            break;
        case "big-climb":
            const kfs = [0.25, 0.5, 0.75];
            // Can we use a formula here to convert a series of positions into animation instructions?
            const xlPositions = [0.75, 0.75, 0.75];
            const xrPositions = [0, 0.25, 0.25];
            const ylPositions = [0.75, 0.75, 1.75];
            const yrPositions = [0, 1, 1];
            if ((1 / fpm) * tick / cost < kfs[0]) {
                // Rear leg moves quickly forward and slowly upward
                xlAnimation = ((3 / fpm) * tick * sign) / cost;
                xrAnimation = 0;
                ylAnimation = -((2 / fpm) * tick) / cost;
                yrAnimation = 0;
            } else if ((1 / fpm) * tick / cost < kfs[1]) {
                // Front leg moves upwards; rear leg remains still
                xlAnimation = 0.75 * sign;
                xrAnimation = 0;
                ylAnimation = -0.5;
                yrAnimation = -(((4 / fpm) * tick) / cost) + 1;
            } else if ((1 / fpm) * tick / cost < kfs[2]) {
                // Rear leg moves upwards; front leg remains still
                xlAnimation = 0.75 * sign;
                xrAnimation = 0;
                ylAnimation = -(((3 / fpm) * tick) / cost) + 1;
                yrAnimation = -1;
            } else {
                // Both legs move final distance
                xlAnimation = ((1 / fpm) * tick * sign) / cost;
                xrAnimation = ((((4 / fpm) * tick) / cost) - 3) * sign;
                ylAnimation = -(((3 / fpm) * tick) / cost) + 1;
                yrAnimation = -(((4 / fpm) * tick) / cost) + 2;
            }
            break;
        case "small-drop":
            xlAnimation = ((1 / fpm) * tick * sign) / cost;
            xrAnimation = ((1 / fpm) * tick * sign) / cost;
            ylAnimation = ((1 / fpm) * tick) / cost;
            yrAnimation = ((1 / fpm) * tick) / cost;
            break;
        case "big-drop":
            xlAnimation = ((1 / fpm) * tick * sign) / cost;
            xrAnimation = ((1 / fpm) * tick * sign) / cost;
            ylAnimation = ((2 / fpm) * tick) / cost;
            yrAnimation = ((2 / fpm) * tick) / cost;
            break;
    }
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