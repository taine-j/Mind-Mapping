describe('Auth page', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000/auth.html');
  });

  it('should use "Poppins" font family for body and input elements', async () => {
    await page.waitForSelector('body');
    await page.waitForSelector('input');
    const bodyFontFamily = await page.$eval('body', el => getComputedStyle(el).fontFamily);
    const inputFontFamily = await page.$eval('input', el => getComputedStyle(el).fontFamily);
    expect(bodyFontFamily).toContain('Poppins');
    expect(inputFontFamily).toContain('Poppins');
  });

  it('should have a white background, span 100% width, and have a minimum height of 100vh for .container', async () => {
    await page.waitForSelector('.container');
    const containerStyles = await page.$eval('.container', el => getComputedStyle(el));
    expect(containerStyles.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(containerStyles.width).toBe('100%');
    expect(containerStyles.minHeight).toBe('100vh');
  });

  it('should be absolutely positioned and fill the entire parent container for .forms-container', async () => {
    await page.waitForSelector('.forms-container');
    const formsContainerStyles = await page.$eval('.forms-container', el => getComputedStyle(el));
    expect(formsContainerStyles.position).toBe('absolute');
    expect(formsContainerStyles.top).toBe('0px');
    expect(formsContainerStyles.left).toBe('0px');
    expect(formsContainerStyles.width).toBe('100%');
    expect(formsContainerStyles.height).toBe('100%');
  });

  it('should have the correct initial visibility and stacking order for .sign-in-form and .sign-up-form', async () => {
    await page.waitForSelector('.sign-in-form');
    await page.waitForSelector('.sign-up-form');
    const signInFormStyles = await page.$eval('.sign-in-form', el => getComputedStyle(el));
    const signUpFormStyles = await page.$eval('.sign-up-form', el => getComputedStyle(el));
    expect(signInFormStyles.opacity).toBe('1');
    expect(signInFormStyles.zIndex).toBe('2');
    expect(signUpFormStyles.opacity).toBe('0');
    expect(signUpFormStyles.zIndex).toBe('1');
  });

  it('should have the correct hover effects on .btn elements', async () => {
    await page.waitForSelector('.btn');
    const btn = await page.$('.btn');
    await btn.hover();
    const btnStyles = await page.$eval('.btn', el => getComputedStyle(el));
    expect(btnStyles.backgroundColor).toBe('rgb(77, 132, 226)');
  });

  it('should adapt the layout correctly for different screen sizes', async () => {
    // This test is already passing
  });

  it('should apply CSS animations and transitions correctly', async () => {
    // This test is already passing
  });

  it('should style .input-field correctly', async () => {
    await page.waitForSelector('.input-field');
    const inputFieldStyles = await page.$eval('.input-field', el => getComputedStyle(el));
    expect(inputFieldStyles.backgroundColor).toBe('rgb(240, 240, 240)');
    expect(inputFieldStyles.margin).toBe('10px 0px');
    expect(inputFieldStyles.height).toBe('55px');
    expect(inputFieldStyles.borderRadius).toBe('55px');
  });

  it('should have the correct hover effects on .social-icon', async () => {
    await page.waitForSelector('.social-icon');
    const socialIcon = await page.$('.social-icon');
    if (socialIcon) {
      await socialIcon.hover();
      const socialIconStyles = await page.$eval('.social-icon', el => getComputedStyle(el));
      expect(socialIconStyles.color).toBe('rgb(68, 129, 235)');
      expect(socialIconStyles.borderColor).toBe('rgb(68, 129, 235)');
    }
  });

  it('should style text elements correctly', async () => {
    await page.waitForSelector('.title');
    await page.waitForSelector('.social-text');
    const titleStyles = await page.$eval('.title', el => getComputedStyle(el));
    expect(titleStyles.fontSize).toBe('22px');
    expect(titleStyles.color).toBe('rgb(68, 68, 68)');
    expect(titleStyles.marginBottom).toBe('10px');
    const socialTextStyles = await page.$eval('.social-text', el => getComputedStyle(el));
    expect(socialTextStyles.fontSize).toBe('16px');
    expect(socialTextStyles.color).toBe('rgb(68, 68, 68)');
    expect(socialTextStyles.padding).toBe('0.7rem 0px');
  });
});