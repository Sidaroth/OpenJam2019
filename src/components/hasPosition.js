const hasPosition = function hasPositionFunc(state) {
    let x = 0;
    let y = 0;

    function setPosition(pos) {
        ({ x, y } = pos);

        return { x, y };
    }

    function setX(xp) {
        state.setPosition({ x: xp, y });
        return xp;
    }

    function setY(yp) {
        state.setPosition({ x, yp });
        return yp;
    }

    function getPosition() {
        return { x, y };
    }

    function getX() {
        return x;
    }

    function getY() {
        return y;
    }

    return {
        // props
        // methods
        setPosition,
        setX,
        setY,
        getPosition,
        getX,
        getY,
    };
};

export default hasPosition;
