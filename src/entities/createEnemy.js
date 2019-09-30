import createState from 'utils/createState';
import canEmit from 'components/events/canEmit';
import hasPosition from 'components/hasPosition';
import hasSprite from 'components/entities/hasSprite';
import canListen from 'components/events/canListen';
import store from 'root/store';
import isGameEntity from 'components/entities/isGameEntity';
import hasCollision from 'components/entities/hasCollision';
import Matter from 'matter-js';
import gameConfig from 'configs/gameConfig';
import eventConfig from 'configs/eventConfig';
import hasHealth from 'components/entities/hasHealth';
import Vector from 'math/vector';
import spriteConfig from 'configs/spriteConfig';
import createExplosion from './createExplosion';

const createEnemy = (pos, movementFunc = undefined) => {
    const state = {};
    const available = false;
    const maxSpeed = 3;
    const velocity = new Vector(-2.5, 0);
    const killZoneLimit = -200;
    let movementFunction = movementFunc;

    function __constructor() {
        state.available = false;
        state.createSpriteFromAtlas(store.world.getScene(), spriteConfig.SHIPPACK.KEY, 'spaceShips_001.png');
        state.setPosition(pos);
        state.setColliderShape(Matter.Bodies.circle(state.getX(), state.getY(), 35));
        state.setCollisionCategory(gameConfig.COLLISION.enemy);
        state.setCollidesWith([gameConfig.COLLISION.bullet, gameConfig.COLLISION.player]);
        state.setRotation(Math.PI / 2);

        state.listenOn(state, eventConfig.ENTITY.DIE, (e) => {
            if (e.lives <= 0) {
                const explosion = createExplosion();
                explosion.setPosition(state.getPosition());
                state.destroy();
            }
        });
    }

    function setMovementFunction(func) {
        movementFunction = func;
    }

    function setVelocity(vel) {
        velocity.copy(vel);
    }

    function update(time) {
        velocity.setLength(maxSpeed);

        let newPos = new Vector(state.getX() + velocity.x * time.deltaScale, state.getY() + velocity.y * time.deltaScale);
        if (movementFunction) {
            newPos = movementFunction(newPos);
        }

        state.setPosition(newPos);

        if (state.getX() < killZoneLimit) state.destroy();

        return time;
    }

    function destroy() {
        store.game.removeEntity(state);
    }

    const localState = {
        available,
        // methods
        __constructor,
        destroy,
        update,
        setMovementFunction,
        setVelocity,
    };

    return createState('Enemy', state, {
        localState,
        isGameEntity: isGameEntity(state),
        canEmit: canEmit(state),
        canListen: canListen(state),
        hasPosition: hasPosition(state),
        hasSprite: hasSprite(state),
        hasCollider: hasCollision(state),
        hasHealth: hasHealth(state),
    });
};

export default createEnemy;
