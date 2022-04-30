// Since the Colonists will ultimately do a large variety of activities, their animations will be kept in their own file

export const bodyAnimations = (movementType: string, fpm: number, tick: number, cost: number, sign: number) => {
    let xAnimation: number = 0;
    let yAnimation: number = 0;
    switch (movementType) {
        case "walk":
            xAnimation = (1 / fpm) * tick * sign;
            break;
        case "small-climb":
            xAnimation = ((1 / fpm) * tick * sign) / cost;
            yAnimation = -((1 / fpm) * tick) / cost;
            break;
        case "big-climb":
            xAnimation = ((1 / fpm) * tick * sign) / cost;
            yAnimation = -((2 / fpm) * tick) / cost;
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
            xAnimation = ((1 / fpm) * tick * sign) / cost;
            yAnimation = -((1 / fpm) * tick) / cost;
            break;
        case "big-climb":
            xAnimation = ((1 / fpm) * tick * sign) / cost;
            yAnimation = -((2 / fpm) * tick) / cost;
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
    return { xOffsets: xOffsets, yAnimation: yAnimation };
}

export const handAnimations = (movementType: string, fpm: number, tick: number, cost: number, sign: number) => {
    let xlAnimation: number = 0;
    let xrAnimation: number = 0;
    let ylAnimation: number = 0;
    let yrAnimation: number = 0;
    switch (movementType) {
        case "walk":
            // Right moves first and stops halfway through the movement animation
            // TODO: Correct xlAnimation to add graceful 'swing back' animation for arm movement
            xlAnimation = (2.5 / fpm) * Math.min(fpm / 2, tick) * sign;
            // Left moves immediately afterwards and stops at the end of the animation
            xrAnimation = (2 / fpm) * Math.max(0, tick - fpm / 2) * sign;
            break;
        case "small-climb":
            xlAnimation = ((1 / fpm) * tick * sign) / cost;
            xrAnimation = ((1 / fpm) * tick * sign) / cost;
            ylAnimation = -((1 / fpm) * tick) / cost;
            yrAnimation = -((1 / fpm) * tick) / cost;
            break;
        case "big-climb":
            xlAnimation = ((1 / fpm) * tick * sign) / cost;
            xrAnimation = ((1 / fpm) * tick * sign) / cost;
            ylAnimation = -((2 / fpm) * tick) / cost;
            yrAnimation = -((2 / fpm) * tick) / cost;
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
            xlAnimation = ((1 / fpm) * tick * sign) / cost;
            xrAnimation = ((1 / fpm) * tick * sign) / cost;
            ylAnimation = -((1 / fpm) * tick) / cost;
            yrAnimation = -((1 / fpm) * tick) / cost;
            break;
        case "big-climb":
            xlAnimation = ((1 / fpm) * tick * sign) / cost;
            xrAnimation = ((1 / fpm) * tick * sign) / cost;
            ylAnimation = -((2 / fpm) * tick) / cost;
            yrAnimation = -((2 / fpm) * tick) / cost;
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
        xrAnimation = xlAnimation;
        xlAnimation = s;
    }
    return { xlAnimation, xrAnimation, ylAnimation, yrAnimation };
}