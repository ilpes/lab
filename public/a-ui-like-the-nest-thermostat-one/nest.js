//Nest Class
Nest = function (selector, from, to, label, onValueChanged) {

    //OPTIONS
    let defaultOptions = {
        from: from || 0,
        to: to || 180,
        label: label || "",
        onValueChanged: onValueChanged || null
    };

    //DOM ELEMENTS
    let dragger, output, ring;

    //VARIABLES
    let ratio, numLines;
    let currentTheta = 0;
    let currentValue = 0;

    /**
     * Initialize the thermostat
     */
    function initialize() {

        currentValue = defaultOptions.from;

        let label = document.querySelector(selector + " div.output small");
        label.innerHTML = defaultOptions.label;

        ring = document.querySelector(selector);

        output = document.querySelector(selector + " div.output strong");
        output.innerHTML = currentValue.toString();

        numLines = document.querySelectorAll(selector + " svg#ring-lines line").length;
        ratio = Math.round(360 / numLines);
        dragger = document.querySelector(selector + " svg#marker polygon");

        dragger.addEventListener('mousedown', startDragging);
        dragger.addEventListener('touchstart', startDragging);
    }

    /**
     *
     * @param e
     */
    function startDragging(e) {
        window.addEventListener('mousemove', performDragging);
        window.addEventListener('mouseup', stopDragging);
        document.body.addEventListener('touchmove', performDragging);
        document.body.addEventListener('touchend', stopDragging);
        e.preventDefault();
    }

    /**
     *
     * @param e
     */
    function stopDragging(e) {
        window.removeEventListener('mousemove', performDragging);
        window.removeEventListener('mouseup', stopDragging);
        document.body.removeEventListener('touchmove', performDragging);
        document.body.removeEventListener('touchend', stopDragging);
        e.preventDefault();
    }

    /**
     *
     * @param index
     */
    function highlightLine(index) {
        let lineSelector = selector + " svg#ring-lines line:nth-child(" + (180 - index).toString() + ")";
        TweenMax.to(lineSelector, .3, {css: {stroke: 'rgba(255, 255, 255, 1)'}});
        TweenMax.to(lineSelector, .8, {delay: .3, css: {stroke: 'rgba(255, 255, 255, .5)'}});
    }

    /**
     *
     * @param e
     */
    function performDragging(e) {
        let x = (e.clientX || e.touches[0].pageX) - (ring.offsetLeft + ring.offsetWidth / 2);
        let y = (e.clientY || e.touches[0].pageY) - (ring.offsetTop + ring.offsetHeight / 2);

        let theta = Math.atan2(y, x) * (180 / Math.PI); //[-180,180]
        theta = (theta + 360 + 90) % 360;
        TweenMax.set(selector + " svg#marker", {rotationZ: theta});


        let roundedTheta = Math.round(theta);
        if (roundedTheta !== currentTheta) {
            let diff = (roundedTheta - currentTheta) * (Math.PI / 180);
            let shortestRotation = Math.atan2(Math.sin(diff), Math.cos(diff));
            let shortestRotationInDegrees = shortestRotation * (180 / Math.PI);
            let direction = shortestRotationInDegrees > 0 ? "CW" : "CCW";
            let from = Math.round(currentTheta / ratio);
            let to = Math.round(roundedTheta / ratio);

            switch (direction) {
                case "CW":
                    if (to > from) {
                        for (let i = from; i < to; i++) {
                            highlightLine(i);
                        }
                    } else if (to < from) {
                        for (let i = from; i < numLines; i++) {
                            highlightLine(i);
                        }
                        for (let i = 0; i < to; i++) {
                            highlightLine(i);
                        }
                    }
                    break;

                case "CCW":
                    if (to < from) {
                        for (let i = from; i >= to; i--) {
                            highlightLine(i);
                        }
                    } else if (to > from) {
                        for (let i = from; i >= 0; i--) {
                            highlightLine(i);
                        }
                        for (let i = numLines; i >= to; i--) {
                            highlightLine(i);
                        }
                    }
                    break;
            }


            currentTheta = roundedTheta;

            let newValue = Math.round((defaultOptions.to - defaultOptions.from) * (currentTheta / 360) + defaultOptions.from);
            if (newValue !== currentValue) {
                currentValue = newValue;
                output.innerHTML = currentValue.toString();

                if (defaultOptions.onValueChanged) {
                    defaultOptions.onValueChanged.call(this, currentValue)
                }
            }
        }
        e.preventDefault();
    }

    initialize();
}





