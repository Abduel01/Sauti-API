const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/landing.html');
  });
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Sauti API inafanya kazi!',
    version: '1.0.0'
  });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `Wewe ni msaidizi wa biashara anayeelewa Kiswahili na Kiingereza.
                     Kazi yako ni kuchambua maneno ya mtumiaji na kutoa data iliyopangwa vizuri.
                     
                     Kila wakati mtumiaji anasema kitu, toa JSON kama hii:
                     {
                       "aina": "mauzo/manunuzi/matumizi/mapato/nyingine",
                       "mteja": "jina la mteja kama lipo",
                       "bidhaa": "bidhaa au huduma",
                       "kiasi": nambari,
                       "bei": nambari,
                       "jumla": nambari,
                       "tarehe": "leo kama haikusemwa",
                       "maelezo": "muhtasari mfupi wa Kiswahili",
                       "jibu": "jibu fupi la kirafiki kwa mtumiaji"
                     }
                     
                     Jibu kwa JSON TU bila maelezo mengine.`
            }]
          },
          contents: [{
            parts: [{ text: message }]
          }]
        })
      }
    );

    const data = await response.json();
    let reply = data.candidates[0].content.parts[0].text;
    reply = reply.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(reply);
    res.json({ 
      reply: parsed.jibu,
      data: parsed 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hitilafu imetokea' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Sauti API inaendesha kwenye port ${PORT}`);
});