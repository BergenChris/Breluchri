

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

    const charButtons = document.querySelectorAll('.selected-char');
    charButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Verberg eerst alle afbeeldingen van de knoppen
            const charIcons = document.querySelectorAll('.selected-icon-char');
            charIcons.forEach(function(icon) {
                icon.style.display = 'none';
            });
    
            // Zoek de geselecteerde knop en toon de bijbehorende afbeeldingen
            const selectedIcons = button.querySelectorAll('.selected-icon-char');
            selectedIcons.forEach(function(selectedIcon) {
                selectedIcon.style.display = 'inline-block';
            });
        });
    });

    const movButtons = document.querySelectorAll('.selected-mov');
    movButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Verberg eerst alle afbeeldingen van de knoppen
            const movIcons = document.querySelectorAll('.selected-icon-mov');
            movIcons.forEach(function(icon) {
                icon.style.display = 'none';
            });
    
            // Zoek de geselecteerde knop en toon de bijbehorende afbeeldingen
            const selectedIcons = button.querySelectorAll('.selected-icon-mov');
            selectedIcons.forEach(function(selectedIcon) {
                selectedIcon.style.display = 'inline-block';
            });
        });
    });
    

    

    

    // Event listener voor knoppen met de klasse 'volgende'
   // Event listener voor knoppen met de klasse 'volgende'
const nextButtons = document.querySelectorAll('.volgende');
nextButtons.forEach(function(button) {
    button.addEventListener('click', function(event) {
        // Voorkom dat de standaardgedraging van de 'Volgende' knop plaatsvindt
        event.preventDefault();

        

        // Voeg de klasse 'correctAnswer' toe aan de geselecteerde knoppen van de juiste antwoorden
        const correctCharButton = document.querySelector('.correctCharacter');
        const correctMovButton = document.querySelector('.correctMovie');
        correctCharButton.classList.add('correctAnswer');
        correctMovButton.classList.add('correctAnswer');

       

        

            

            // Reset de selectie nadat op 'Volgende' is geklikt
            characterSelected = false;
            movieSelected = false;

            // Reset de geselecteerde correcte karakter- en filmknoppen
            correctCharSelected = false;
            correctMovSelected = false;

            // Laad de volgende pagina
         
            
            
        }, 2000); // Vertraging van 5000 milliseconden (5 seconden)
    });
});

   
