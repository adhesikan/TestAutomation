export interface ParsedScript {
  script: string;
  url?: string;
  warnings?: string[];
  unconvertedLines?: string[];
}

export function parsePlaywrightScript(playwrightCode: string): ParsedScript {
  const lines = playwrightCode.split('\n');
  const commands: string[] = [];
  const unconvertedLines: string[] = [];
  const warnings: string[] = [];
  let baseUrl: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('import') || 
        trimmed.startsWith('test(') || trimmed === '}' || trimmed === '});' ||
        trimmed.includes('test.describe') || trimmed.includes('test.beforeEach')) {
      continue;
    }

    let converted = false;

    if (trimmed.includes('.goto(')) {
      const urlMatch = trimmed.match(/\.goto\(['"`]([^'"`]+)['"`]/);
      if (urlMatch) {
        baseUrl = urlMatch[1];
        commands.push(`goto ${urlMatch[1]}`);
        converted = true;
      }
    }
    
    else if (trimmed.match(/\.click\(\)/)) {
      let clickMatch;
      
      if ((clickMatch = trimmed.match(/page\.click\(['"`]([^'"`]+)['"`]\)/))) {
        commands.push(`click ${clickMatch[1]}`);
        converted = true;
      }
      else if ((clickMatch = trimmed.match(/page\.locator\(['"`]([^'"`]+)['"`]\)\.click\(\)/))) {
        commands.push(`click ${clickMatch[1]}`);
        converted = true;
      }
      else if ((clickMatch = trimmed.match(/\.getByRole\(['"`]([^'"`]+)['"`](?:,\s*\{\s*name:\s*['"`]([^'"`]+)['"`]\s*\})?\)\.click\(\)/))) {
        if (clickMatch[2]) {
          warnings.push(`Line ${i + 1}: getByRole with accessible name cannot be reliably converted. Please add manually using getByText() or element type with :has-text().`);
          unconvertedLines.push(`Line ${i + 1}: ${trimmed}`);
        } else {
          const roleToElement: Record<string, string> = {
            'button': 'button',
            'link': 'a',
            'textbox': 'input',
            'checkbox': 'input[type="checkbox"]',
            'radio': 'input[type="radio"]',
          };
          const element = roleToElement[clickMatch[1]] || clickMatch[1];
          commands.push(`click ${element}`);
          converted = true;
        }
      }
      else if ((clickMatch = trimmed.match(/\.getByText\(['"`]([^'"`]+)['"`]\)\.click\(\)/))) {
        warnings.push(`Line ${i + 1}: getByText converted to text selector. May need adjustment if text is dynamic.`);
        commands.push(`click :text("${clickMatch[1]}")`);
        converted = true;
      }
      else if ((clickMatch = trimmed.match(/\.getByLabel\(['"`]([^'"`]+)['"`]\)\.click\(\)/))) {
        warnings.push(`Line ${i + 1}: getByLabel.click() cannot be reliably converted. Please add manually using the appropriate selector for your form structure.`);
        unconvertedLines.push(`Line ${i + 1}: ${trimmed}`);
      }
      else if ((clickMatch = trimmed.match(/\.getByPlaceholder\(['"`]([^'"`]+)['"`]\)\.click\(\)/))) {
        commands.push(`click [placeholder="${clickMatch[1]}"]`);
        converted = true;
      }
      else if ((clickMatch = trimmed.match(/\.getByTestId\(['"`]([^'"`]+)['"`]\)\.click\(\)/))) {
        commands.push(`click [data-testid="${clickMatch[1]}"]`);
        converted = true;
      }
    }
    
    else if (trimmed.match(/\.fill\(/)) {
      let fillMatch;
      
      if ((fillMatch = trimmed.match(/page\.fill\(['"`]([^'"`]+)['"`],\s*['"`]([^'"`]*)['"`]\)/))) {
        commands.push(`type ${fillMatch[1]} "${fillMatch[2]}"`);
        converted = true;
      }
      else if ((fillMatch = trimmed.match(/page\.locator\(['"`]([^'"`]+)['"`]\)\.fill\(['"`]([^'"`]*)['"`]\)/))) {
        commands.push(`type ${fillMatch[1]} "${fillMatch[2]}"`);
        converted = true;
      }
      else if ((fillMatch = trimmed.match(/\.getByPlaceholder\(['"`]([^'"`]+)['"`]\)\.fill\(['"`]([^'"`]*)['"`]\)/))) {
        commands.push(`type [placeholder="${fillMatch[1]}"] "${fillMatch[2]}"`);
        converted = true;
      }
      else if ((fillMatch = trimmed.match(/\.getByLabel\(['"`]([^'"`]+)['"`]\)\.fill\(['"`]([^'"`]*)['"`]\)/))) {
        warnings.push(`Line ${i + 1}: getByLabel.fill() cannot be reliably converted. Please add manually - try using getByPlaceholder() or a direct CSS selector.`);
        unconvertedLines.push(`Line ${i + 1}: ${trimmed}`);
      }
      else if ((fillMatch = trimmed.match(/\.getByRole\(['"`]textbox['"`](?:,\s*\{\s*name:\s*['"`]([^'"`]+)['"`]\s*\})?\)\.fill\(['"`]([^'"`]*)['"`]\)/))) {
        if (fillMatch[1]) {
          warnings.push(`Line ${i + 1}: getByRole('textbox', {name:...}) cannot be reliably converted. Please add manually using getByPlaceholder() or appropriate selector.`);
          unconvertedLines.push(`Line ${i + 1}: ${trimmed}`);
        } else {
          commands.push(`type input "${fillMatch[2]}"`);
          converted = true;
        }
      }
    }
    
    else if (trimmed.match(/\.type\(/)) {
      const typeMatch = trimmed.match(/\.type\(['"`]([^'"`]+)['"`],\s*['"`]([^'"`]*)['"`]\)/);
      if (typeMatch) {
        commands.push(`type ${typeMatch[1]} "${typeMatch[2]}"`);
        converted = true;
      }
    }
    
    else if (trimmed.match(/\.press\(/)) {
      const pressMatch = trimmed.match(/\.press\(['"`]([^'"`]+)['"`]\)/);
      if (pressMatch) {
        warnings.push(`Line ${i + 1}: .press('${pressMatch[1]}') converted to wait 500ms. You may need to adjust timing.`);
        commands.push(`wait 500`);
        converted = true;
      }
    }
    
    else if (trimmed.match(/\.waitForSelector\(/) || trimmed.match(/\.waitFor\(/)) {
      const waitMatch = trimmed.match(/\.waitForSelector\(['"`]([^'"`]+)['"`]\)/) || 
                        trimmed.match(/\.waitFor\(\{[^}]*state:\s*['"`]visible['"`]/);
      if (waitMatch) {
        if (waitMatch[1]) {
          commands.push(`expect ${waitMatch[1]}`);
        } else {
          warnings.push(`Line ${i + 1}: waitFor converted to wait 1000ms. Original condition may not be preserved.`);
          commands.push(`wait 1000`);
        }
        converted = true;
      }
    }
    
    else if (trimmed.match(/\.waitForTimeout\(/)) {
      const timeoutMatch = trimmed.match(/\.waitForTimeout\((\d+)\)/);
      if (timeoutMatch) {
        commands.push(`wait ${timeoutMatch[1]}`);
        converted = true;
      }
    }
    
    else if (trimmed.match(/expect\(/)) {
      let expectMatch;
      
      if ((expectMatch = trimmed.match(/expect\(page\.locator\(['"`]([^'"`]+)['"`]\)\)/))) {
        warnings.push(`Line ${i + 1}: Assertion converted to expect (waits for element). Original assertion logic may differ.`);
        commands.push(`expect ${expectMatch[1]}`);
        converted = true;
      }
      else if ((expectMatch = trimmed.match(/expect\(page\.getByRole\(['"`]([^'"`]+)['"`](?:,\s*\{\s*name:\s*['"`]([^'"`]+)['"`]\s*\})?\)\)/))) {
        if (expectMatch[2]) {
          warnings.push(`Line ${i + 1}: expect() on getByRole with accessible name cannot be reliably converted. Please add manually.`);
          unconvertedLines.push(`Line ${i + 1}: ${trimmed}`);
        } else {
          const roleToElement: Record<string, string> = {
            'button': 'button',
            'link': 'a',
            'textbox': 'input',
            'checkbox': 'input[type="checkbox"]',
            'radio': 'input[type="radio"]',
          };
          const element = roleToElement[expectMatch[1]] || expectMatch[1];
          warnings.push(`Line ${i + 1}: Assertion converted to expect (waits for element). Original assertion logic may differ.`);
          commands.push(`expect ${element}`);
          converted = true;
        }
      }
      else if ((expectMatch = trimmed.match(/expect\(page\.getByText\(['"`]([^'"`]+)['"`]\)\)/))) {
        warnings.push(`Line ${i + 1}: Assertion converted to expect (waits for element). Original assertion logic may differ.`);
        commands.push(`expect :text("${expectMatch[1]}")`);
        converted = true;
      }
      else if ((expectMatch = trimmed.match(/expect\(page\.getByPlaceholder\(['"`]([^'"`]+)['"`]\)\)/))) {
        warnings.push(`Line ${i + 1}: Assertion converted to expect (waits for element). Original assertion logic may differ.`);
        commands.push(`expect [placeholder="${expectMatch[1]}"]`);
        converted = true;
      }
      else if ((expectMatch = trimmed.match(/expect\(page\.getByTestId\(['"`]([^'"`]+)['"`]\)\)/))) {
        warnings.push(`Line ${i + 1}: Assertion converted to expect (waits for element). Original assertion logic may differ.`);
        commands.push(`expect [data-testid="${expectMatch[1]}"]`);
        converted = true;
      }
      else if ((expectMatch = trimmed.match(/expect\(page\.getByLabel\(['"`]([^'"`]+)['"`]\)\)/))) {
        warnings.push(`Line ${i + 1}: Assertion on getByLabel cannot be reliably converted. Please add manually.`);
        unconvertedLines.push(`Line ${i + 1}: ${trimmed}`);
      }
      else if (trimmed.match(/expect\(/)) {
        unconvertedLines.push(`Line ${i + 1}: ${trimmed}`);
      }
    }

    if (!converted && trimmed && trimmed.length > 5 && 
        !trimmed.startsWith('//') && !trimmed.startsWith('import') &&
        !trimmed.startsWith('test(') && trimmed !== '}' && trimmed !== '});') {
      unconvertedLines.push(`Line ${i + 1}: ${trimmed}`);
    }
  }

  if (commands.length === 0) {
    throw new Error(
      'No Playwright commands could be converted. Please ensure you pasted valid Playwright test code. ' +
      'Supported commands: goto, click, fill/type, waitForSelector, press, and basic expect assertions.'
    );
  }

  if (unconvertedLines.length > 0) {
    warnings.push(
      `${unconvertedLines.length} line(s) could not be automatically converted. ` +
      'Please review and add them manually if needed.'
    );
  }

  return {
    script: commands.join('\n'),
    url: baseUrl,
    warnings,
    unconvertedLines: unconvertedLines.length > 0 ? unconvertedLines : undefined
  };
}
