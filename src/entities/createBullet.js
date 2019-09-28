import createState from 'utils/createState';
import canEmit from 'components/events/canEmit';
import isGameEntity from 'components/entities/isGameEntity';
import hasSprite from 'components/entities/hasSprite';
import hasPosition from 'components/hasPosition';
import store from 'root/store';
import hasCollision from 'components/entities/hasCollision';
import Matter from 'matter-js';
import gameConfig from 'configs/gameConfig';

const createBullet = (pos, direction) => {
    const state = {};
    const speed = 15;
    const velocity = direction.clone().setLength(speed);
    const lifeTime = 3; // in Seconds.

    let creationTime;

    function createSprite() {
        state.createSpriteFromKey(store.game.getScene(), 'Bullet');
    }

    function update(time) {
        const position = state.getPosition();
        position.x += velocity.x;
        position.y += velocity.y;
        state.setPosition(position);

        if (Date.now() - creationTime > lifeTime * 1000) {
            // TODO: Set inactive and reuseable in some bullet pool instead.
            state.destroy();
        }

        return time;
    }

    function __constructor() {
        state.type = 'bullet';
        creationTime = Date.now();
        state.setPosition(pos);
        createSprite();

        state.setColliderShape(Matter.Bodies.circle(state.getX(), state.getY(), 5));
        state.setCollisionCategory(gameConfig.COLLISION.bullets);
        state.setCollidesWith([gameConfig.COLLISION.enemies]);

        store.game.addEntity(state);
    }

    function destroy() {
        store.game.removeEntity(state);
    }

    const localState = {
        __constructor,
        update,
        destroy,
    };

    return createState('Bullet', state, {
        localState,
        isGameEntity: isGameEntity(state),
        canEmit: canEmit(state),
        hasPosition: hasPosition(state),
        hasSprite: hasSprite(state),
        hasCollision: hasCollision(state),
    });
};

export default createBullet;
