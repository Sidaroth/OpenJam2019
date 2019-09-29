import isGameEntity from 'components/entities/isGameEntity';
import canEmit from 'components/events/canEmit';
import hasPosition from 'components/hasPosition';
import createState from 'utils/createState';
import hasInput from 'components/hasInput';
import canListen from 'components/events/canListen';
import Vector from 'root/math/vector';
import keybindings from 'configs/keybindings';
import hasSprite from 'components/entities/hasSprite';
import gameConfig from 'configs/gameConfig';
import store from 'root/store';
import createBullet from './createBullet';
import hasHealth from 'components/entities/hasHealth';
import hasCollision from 'components/entities/hasCollision';
import Matter from 'matter-js';
import spriteConfig from 'configs/spriteConfig';
import eventConfig from 'configs/eventConfig';

const createPlayer = function createPlayerFunc() {
    // variables and functions here are private unless listed below in localState.
    const state = {};
    const velocity = new Vector();
    const acceleration = new Vector();

    let accelerationForceMag = 1.5;
    let maxSpeed = 7.5;
    let rateOfFire = 5; // Per second.
    let timeOfLastShot = 0;
    let facingDirection;

    const livesIcons = [];
    let activePowerups = [];

    // Drag
    let airDensity = 0.05; // We're in space after all....

    function createSprite() {
        state.createSpriteFromAtlas(store.world.getScene(), spriteConfig.SHIPPACK.KEY, 'playerShip2_green.png');
    }

    function __constructor() {
        state.type = 'player';
        createSprite();
        state.setPosition({ x: gameConfig.GAME.VIEWWIDTH / 2, y: gameConfig.GAME.VIEWHEIGHT / 2 });
        state.setColliderShape(Matter.Bodies.circle(state.getX(), state.getY(), 35));
        state.setCollisionCategory(gameConfig.COLLISION.player);
        state.setCollidesWith([gameConfig.COLLISION.enemy]); // TODO: Enemy bullets, but not our own.
        for (let i = 0; i < state.getLives(); i += 1) {
            const icon = store.UIScene.getScene().add.image(30 + 80 * i, 30, spriteConfig.PLAYER_SHIP_ICON.KEY);
            livesIcons.push(icon);
        }

        state.listenOn(state, eventConfig.ENTITY.DIE, (e) => {
            livesIcons.forEach((icon, index) => {
                if (e.lives > index) {
                    icon.setVisible(true);
                } else {
                    icon.setVisible(false);
                }
            });
        });
    }

    function calculateDrag(fluidDensity) {
        const speed = velocity.getLength();
        const dragMagnitude = fluidDensity * 0.1 * speed * speed;
        const drag = Vector.inverse(velocity).getUnit(); // Drag acts inversely on velocity.
        drag.multiply(dragMagnitude);

        acceleration.add(drag);
    }

    function checkMovement() {
        const input = new Array(4).fill(false);
        Object.keys(keybindings.MOVEMENT).forEach((key, direction) => {
            input[direction] = state.isInputDown(...keybindings.MOVEMENT[key]);
        });

        const accel = new Vector();
        if (input[gameConfig.CONSTS.DIRECTION.UP]) accel.add(0, -accelerationForceMag);
        if (input[gameConfig.CONSTS.DIRECTION.DOWN]) accel.add(0, accelerationForceMag);
        if (input[gameConfig.CONSTS.DIRECTION.LEFT]) accel.add(-accelerationForceMag, 0);
        if (input[gameConfig.CONSTS.DIRECTION.RIGHT]) accel.add(accelerationForceMag, 0);

        acceleration.add(accel);
    }

    function lookAt(pos) {
        const sprite = state.getSprite();
        if (sprite && pos) {
            facingDirection = Vector.sub(new Vector(pos.x, pos.y), new Vector(state.getX(), state.getY())).getUnit();
            sprite.rotation = facingDirection.angle();
        }
    }

    function shoot() {
        if (store.mouse && store.mouse.isDown) {
            const now = Date.now();
            if (now - timeOfLastShot > 1000 / rateOfFire) {
                timeOfLastShot = now;

                const pos = state.getPosition();
                createBullet(new Vector(pos.x, pos.y).add(facingDirection.clone().multiply(15)), facingDirection);
            }
        }
    }

    function move(time) {
        acceleration.zero();
        checkMovement();
        calculateDrag(airDensity);
        acceleration.multiply(time.deltaScale);
        velocity.add(acceleration);
        velocity.limit(maxSpeed);

        if (velocity.squaredLength() < 0.5) velocity.zero(); // We don't want to drift "endlessly" when the velocity is almost non-existant.

        const pos = state.getPosition();
        pos.x += velocity.x * time.deltaScale;
        pos.y += velocity.y * time.deltaScale;

        if (pos.x < 0) pos.x = 0;
        if (pos.x > gameConfig.GAME.VIEWWIDTH) pos.x = gameConfig.GAME.VIEWWIDTH;
        if (pos.y < 0) pos.y = 0;
        if (pos.y > gameConfig.GAME.VIEWHEIGHT) pos.y = gameConfig.GAME.VIEWHEIGHT;

        state.setPosition(pos);
    }

    function update(time) {
        activePowerups = activePowerups.filter(p => p.isActive());
        activePowerups.forEach(power => power.update(time));
        move(time);
        lookAt(store.mouse);
        shoot();
        return time;
    }

    function addPowerup(power) {
        activePowerups.push(power);
    }

    function setMaxSpeed(speed) {
        maxSpeed = speed;
    }

    function setRateOfFire(ROF) {
        rateOfFire = ROF;
    }

    function setAccelerationForceMagnitude(forceMag) {
        accelerationForceMag = forceMag;
    }

    function getAirDensity() {
        return airDensity;
    }

    function setAirDensity(t) {
        airDensity = t;
    }

    // functions and properties listed here will be public.
    const localState = {
        // props
        // methods
        __constructor,
        update,
        addPowerup,
        setMaxSpeed,
        setRateOfFire,
        setAccelerationForceMagnitude,
        getAirDensity,
        setAirDensity,
    };

    // These are the substates, or components, that describe the functionality of the resulting object.
    return createState('Player', state, {
        localState,
        isGameEntity: isGameEntity(state),
        hasPosition: hasPosition(state),
        canEmit: canEmit(state),
        canListen: canListen(state),
        hasInput: hasInput(state),
        hasSprite: hasSprite(state),
        hasHealth: hasHealth(state, gameConfig.PLAYER.HEALTHCONFIG),
        hasCollision: hasCollision(state),
    });
};

export default createPlayer;
