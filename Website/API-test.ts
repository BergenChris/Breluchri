// geef de naam in de url mee bv. http://localhost:3000/character-dialogs/Gandalf
// probeer een andere naam http://localhost:3000/character-dialogs/Frodo Baggins


import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

// Functie om het ID van een personage op te halen op basis van de naam
async function getCharacterId(characterName: string): Promise<string | null> {
    try {
        const apiKey = '2bV52o3FGbuxH6876ax5';
        const url = `https://the-one-api.dev/v2/character?name=${characterName}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Fout bij het ophalen van karaktergegevens: ${response.status} ${response.statusText}`);
        }

        const data: any = await response.json();
        if (data.docs.length > 0) {
            return data.docs[0]._id;
        } else {
            throw new Error(`Karakter '${characterName}' niet gevonden.`);
        }
    } catch (error) {
        console.error('Fout bij het ophalen van karakter-ID:', error);
        return null;
    }
}

// Endpoint voor het ophalen van dialogen van een specifiek personage
app.get('/character-dialogs/:characterName', async (req: Request, res: Response) => {
    try {
        const characterName = req.params.characterName;
        const characterId = await getCharacterId(characterName);
        if (!characterId) {
            throw new Error(`Karakter '${characterName}' niet gevonden.`);
        }

        const apiKey = '2bV52o3FGbuxH6876ax5';
        const url = `https://the-one-api.dev/v2/quote?character=${characterId}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Fout bij het ophalen van citaatgegevens: ${response.status} ${response.statusText}`);
        }

        const data: any = await response.json();
        const dialogs = data.docs.map((quote: any) => quote.dialog);

        res.json(dialogs);
    } catch (error) {
        console.error('Fout bij het ophalen van dialogen:', error);
        res.status(500).json({ error: 'Er is een interne fout opgetreden' });
    }
});

// Luisteren naar verzoeken op de opgegeven poort
app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
