import express from 'express';

const app = express();
const port = 3000;

export class ProfileService {
  profileData = {
    name: 'Camper Bot',
    hobbies: ['cycling', 'boating', 'guitar'],
    skills: ['JavaScript', 'Node.js', 'Express.js']
  };

  getWelcomeMessage = () => "Welcome to Camper Bot's homepage!";
  getHobbiesText = () => 'I cycle, go boating, and play guitar.';
  getSkillsText = () => 'JavaScript, Node.js, and Express.js!';
  getProfile = () => this.profileData;
}

const profileService = new ProfileService();

app.get('/', (req, res) => {
  res.send(profileService.getWelcomeMessage());
});

app.get('/hobbies', (req, res) => {
  res.send(profileService.getHobbiesText());
});

app.get('/skills', (req, res) => {
  res.send(profileService.getSkillsText());
});

app.get('/api/profile', (req, res) => {
  res.json(profileService.getProfile());
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});