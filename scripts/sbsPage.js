
// sidebar problem type buttons
let typeButtons = document.querySelectorAll("#problem-type-sidebar button");
let activeProbType = typeButtons[0].id;
typeButtons.forEach(function(b1) {
    b1.onclick = function() {
        if (b1.classList.contains("active")) return;
        typeButtons.forEach(function(b2) {
            b2.classList.remove("active");
        });
        b1.classList.add("active");
        activeProbType = b1.id;
    }
});
typeButtons[0].classList.add("active");