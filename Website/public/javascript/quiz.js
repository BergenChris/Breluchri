document.addEventListener('DOMContentLoaded', function() {
    // Variabelen voor scores van correct, character en movie
    let correctScore = 0;
    let characterScore = 0;
    let movieScore = 0;

    // Houd bij of de gebruiker al een character en movie heeft geselecteerd
    let characterSelected = false;
    let movieSelected = false;
    let correctCharSelected = false;
    let correctMovSelected = false;
    

    // Event listener voor knoppen met de klasse 'correctCharacter'
    const correctCharButtons = document.querySelectorAll('.correctCharacter');
    correctCharButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Update de correctScore wanneer er op een correct karakterknop wordt geklikt
            if (!correctCharSelected) {
                // Update de characterScore wanneer er op een karakterknop wordt geklikt
                correctScore += 0.5;
                console.log("Correct Score: " + correctScore);
                correctCharSelected = true; // Markeer dat de gebruiker een character heeft geselecteerd
            }
        });
    });

    // Event listener voor knoppen met de klasse 'correctMovie'
    const correctMovButtons = document.querySelectorAll('.correctMovie');
    correctMovButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Update de correctScore wanneer er op een correct filmknop wordt geklikt
            if (!correctMovSelected) {
                // Update de characterScore wanneer er op een karakterknop wordt geklikt
                correctScore += 0.5;
                console.log("Correct Score: " + correctScore);
                correctMovSelected = true; // Markeer dat de gebruiker een character heeft geselecteerd
            }
        });
    });

    // Event listener voor knoppen met de klasse 'character'
    const characterButtons = document.querySelectorAll('.character');
    characterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Controleer of de gebruiker al een character heeft geselecteerd
            if (!characterSelected) {
                // Update de characterScore wanneer er op een karakterknop wordt geklikt
                characterScore += 0;
                console.log("Character Score: " + characterScore);
                characterSelected = true; // Markeer dat de gebruiker een character heeft geselecteerd
            }
        });
    });

    // Event listener voor knoppen met de klasse 'movie'
    const movieButtons = document.querySelectorAll('.movie');
    movieButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Controleer of de gebruiker al een movie heeft geselecteerd
            if (!movieSelected) {
                // Update de movieScore wanneer er op een filmknop wordt geklikt
                movieScore += 0;
                console.log("Movie Score: " + movieScore);
                movieSelected = true; // Markeer dat de gebruiker een movie heeft geselecteerd
            }
        });
    });

    // Event listener voor knoppen met de klasse 'volgende'
    const nextButtons = document.querySelectorAll('.volgende');
    nextButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Toon de totale score nadat de gebruiker op 'Volgende' heeft geklikt
            const totalScore = correctScore + characterScore + movieScore;
            console.log("Total Score: " + totalScore);
            // pop-up
            const chosenCharacter = document.querySelector('.correctCharacter').textContent;
            const chosenMovie = document.querySelector('.correctMovie').textContent;

            // Toon een pop-up bericht met de gemaakte keuzes en of het antwoord correct was
            const message = `Gekozen karakter: ${chosenCharacter}\nKarakter is ${correctCharSelected ? "correct" : "incorrect"}\nGekozen film: ${chosenMovie}\nFilm is ${correctMovSelected ? "correct" : "incorrect"}\nScore: ${correctScore}`;
            alert(message);

            // Reset de selectie nadat op 'Volgende' is geklikt
            characterSelected = false;
            movieSelected = false;

            // Reset de geselecteerde correcte karakter- en filmknoppen
            correctCharSelected = false;
            correctMovSelected = false;
        });
    });
});

//Als de gebruiker op een karakter- of filmknop klikt en later van gedachten verandert voordat hij op "Volgende" klikt, kan hij op een andere knop klikken om zijn keuze te wijzigen. De code zorgt ervoor dat de laatste gemaakte keuze wordt bijgehouden en dat de gebruiker slechts één keer kan klikken op een karakter- en een filmknop voordat hij op "Volgende" klikt.