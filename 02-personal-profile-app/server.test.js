import { ProfileService } from './server.js';

describe('ProfileService Tests', () => {
  let profileService;

  beforeEach(() => {
    profileService = new ProfileService();
  });

  test('should return the correct welcome message', () => {
    const message = profileService.getWelcomeMessage();
    expect(message).toBe("Welcome to Camper Bot's homepage!");
  });

  test('should return the correct hobbies text', () => {
    const hobbies = profileService.getHobbiesText();
    expect(hobbies).toBe('I cycle, go boating, and play guitar.');
  });

  test('should return the correct skills text', () => {
    const skills = profileService.getSkillsText();
    expect(skills).toBe('JavaScript, Node.js, and Express.js!');
  });

  test('should return profile object with name and arrays', () => {
    const profile = profileService.getProfile();

    expect(profile).toHaveProperty('name', 'Camper Bot');
    expect(profile.hobbies).toEqual(['cycling', 'boating', 'guitar']);
    expect(profile.skills).toEqual(['JavaScript', 'Node.js', 'Express.js']);
  });
});