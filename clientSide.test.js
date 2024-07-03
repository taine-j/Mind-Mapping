const puppeteer = require('puppeteer');

describe('Login and Node Manipulation', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false, slowMo: 50 }); // Slow motion for observing interactions
    page = await browser.newPage();
    await page.goto('http://localhost:3000/auth.html', { waitUntil: 'networkidle0' });
    // Adding console logs in page context
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should login successfully', async () => {
    await page.type('#loginUsername', 'taine');
    await page.type('#loginPassword', 'taine123');
    await page.click('input[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const isLoggedIn = await page.$eval('body', body => body.innerText.includes('Logged in as')); // Assuming "Logged in as" is part of the body text
    expect(isLoggedIn).toBe(true);
  });

  describe('Node Operations', () => {
    it('should create a new node with default properties when clicking the "add-node" button', async () => {
      await page.waitForSelector('#add-node', { visible: true });
      await page.click('#add-node');
      await page.waitForSelector('.node'); 
      const nodeStyles = await page.evaluate(() => {
        const node = document.querySelector('.node');
        return { left: node.style.left, top: node.style.top };
      });
      expect(nodeStyles.left).toBe('50px');
      expect(nodeStyles.top).toBe('50px');
    });

    it('should remove a selected node and update the connections array when clicking the "delete-node" button', async () => {
      await page.click('#add-node'); 
      await page.click('.node'); 
      await page.click('#delete-node');
      await page.waitFor(() => !document.querySelector('.node'));
      const nodesCount = await page.evaluate(() => document.querySelectorAll('.node').length);
      expect(nodesCount).toBe(0);
    });
  });

  describe('Connection Management', () => {
    it('should create a line between two selected nodes when clicking the "connect-nodes" button', async () => {
      await page.click('#add-node');
      await page.click('#add-node');
      await page.evaluate(() => {
        document.querySelectorAll('.node')[0].click();
        document.querySelectorAll('.node')[1].click();
      });
      await page.click('#connect-nodes');
      const connectionsCount = await page.evaluate(() => document.querySelectorAll('.connection').length);
      expect(connectionsCount).toBe(1);
    });
  });

  describe('Event Handling', () => {
    it('should update the node position when dragging', async () => {
      await page.click('#add-node');
      const node = await page.$('.node');
      const box = await node.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.up();
      const newPos = await node.boundingBox();
      expect(newPos.x).toBeGreaterThan(box.x);
      expect(newPos.y).toBeGreaterThan(box.y);
    });
  });

  describe('Editing and Selection', () => {
    it('should select a node when clicking on it', async () => {
      await page.click('#add-node');
      await page.click('.node');
      const isSelected = await page.evaluate(() => document.querySelector('.node').classList.contains('selected'));
      expect(isSelected).toBe(true);
    });

    it('should deselect a node when clicking outside', async () => {
      await page.click('#add-node');
      await page.click('.node');
      await page.click('body');
      const isSelected = await page.evaluate(() => document.querySelector('.node.selected'));
      expect(isSelected).toBeNull();
    });
  });

  describe('State Management', () => {
    it('should update the application state when adding a new node', async () => {
      await page.click('#add-node');
      const nodesCount = await page.evaluate(() => window.connections.length); // Assuming 'window.connections' exists and is accurate
      expect(nodesCount).toBeGreaterThan(0);
    });

    it('should update the application state when removing a node', async () => {
      await page.click('#add-node');
      await page.click('.node');
      await page.click('#delete-node');
      const nodesCount = await page.evaluate(() => window.connections.length);
      expect(nodesCount).toBe(0);
    });
  });
});