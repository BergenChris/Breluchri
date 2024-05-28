const ringImg = document.getElementById('ring-img');
 if (ringImg){
    ringImg.addEventListener('click', function() {
        ringImg.style.animation = 'flyOut 3s forwards';

        ringImg.addEventListener('animationend', function() {
            // Verwijzen naar de volgende pagina
            window.location.href = '/quizPage';
        });
    })
 };
