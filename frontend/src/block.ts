// The Block class represents the individual terrain tiles on the map
import P5 from "p5";
import { constants, blocks, BlockData } from "./constants";

export default class Block {
    // Block types:
    _x: number;     // Blocks' x and y positions will be in terms of grid locations to act as fixed reference points
    _y: number;
    _type: number;
    _blockData: BlockData | undefined;      // Undefined is allowed just in case the type does not match an entry in the blocktionary
    _width: number;
    _xOffset: number;   // The offset value, on the other hand, will be in terms of pixels, to allow for smoother scrolling
    _yOffset: number;
    _color: string;
    _maxHp: number          // Initial block toughness
    _currentHp: number      // Current block toughness (block is worn down by mining or removing it)

    constructor(x: number, y: number, type: number) {
        this._x = x;
        this._y = y;
        this._type = type;
        this._blockData = blocks.find((block) => block.type === this._type);
        this._width = constants.BLOCK_WIDTH;
        this._xOffset = 0;
        this._yOffset = 0;
        // Determined by matching block type to entry in the blocktionary:
        this._color = this._blockData?.color || constants.ALMOST_BLACK; // Supply default values in case block data is missing
        this._maxHp = this._blockData?.hp || 100;
        this._currentHp = this._blockData?.hp || 100;
    }

    render = (p5: P5, xOffset: number) => {    // TODO: Block gets y offset values as arguments to renderer
        this._xOffset = xOffset;
        const x = this._x * this._width - this._xOffset;
        const y = this._y * this._width - this._yOffset;
        p5.fill(this._color);
        p5.strokeWeight(2);
        p5.stroke(constants.ALMOST_BLACK);
        p5.rect(x, y, this._width, this._width);
    }

}