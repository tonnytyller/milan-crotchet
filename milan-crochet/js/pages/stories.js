import { storiesManager } from '../features/stories.js';

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => storiesManager.displayStories()); else storiesManager.displayStories();
