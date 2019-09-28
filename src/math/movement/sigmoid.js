import gameConfig from 'configs/gameConfig';
import normalizeRange from '../normalizeRange';

const createSigmoid = (pos) => {
    const val = normalizeRange(pos.x, 0, gameConfig.GAME.VIEWWIDTH, -10, 10);

    const sigmoid = 1 / (1 + Math.E ** val);
    const y = gameConfig.GAME.VIEWHEIGHT * sigmoid;

    return { x: pos.x, y };
};

export default createSigmoid;