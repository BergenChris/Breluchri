import express, { Request, Response } from 'express';


const app = express();
const port = 3000;
const apiKey = '2bV52o3FGbuxH6876ax5';

// Function to fetch data from the API
const fetchData = async (url: string) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

app.get("/",(req,res)=>
{
    res.redirect("/character");
})

// Endpoint to get character data
app.get('/character', async (req: Request, res: Response) => {
    try {
        const url = 'https://the-one-api.dev/v2/character';
        const data = await fetchData(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to get movie data
app.get('/movie', async (req: Request, res: Response) => {
    try {
        const url = 'https://the-one-api.dev/v2/movie';
        const data = await fetchData(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to get quote data
app.get('/quote', async (req: Request, res: Response) => {
    try {
        const url = 'https://the-one-api.dev/v2/quote';
        const data = await fetchData(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Listen to requests on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
