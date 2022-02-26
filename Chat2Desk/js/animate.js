let button = document.querySelectorAll(".tab-btn");
let item = document.querySelectorAll(".round");
button.forEach(index => {
    index.addEventListener("mouseenter", function(event) {
        this.classList += " animate";

        let buttonX = event.offsetX;
        let buttonY = event.offsetY;

        item.forEach(items => {
            if (buttonY < 24) {
                items.style.top = 0 + "px";
            } else if (buttonY > 30) {
                items.style.top = 48 + "px";
            }

            items.style.left = buttonX + "px";
            items.style.width = "1px";
            items.style.height = "1px";
        });
    });
    index.addEventListener("mouseleave", function(event) {
        this.classList.remove("animate");
        let buttonX = event.offsetX;
        let buttonY = event.offsetY;
        item.forEach(items => {
            if (buttonY < 24) {
                items.style.top = 0 + "px";
            } else if (buttonY > 30) {
                items.style.top = 48 + "px";
            }
            items.style.left = buttonX + "px";
        });
    });
});