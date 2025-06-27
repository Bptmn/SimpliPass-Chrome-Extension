export function useCredentialInjection() {
  function injectCredential(username: string, password: string): boolean {
    // Find all forms with a password field
    const forms = Array.from(document.querySelectorAll('form')).filter((form) =>
      form.querySelector('input[type="password"]'),
    );
    let injected = false;
    for (const form of forms) {
      // Find password input
      const passInput = form.querySelector('input[type="password"]') as HTMLInputElement | null;
      if (!passInput) continue;
      // Heuristic for username/email field (most robust order)
      const userInput =
        form.querySelector('input[type="email"]') ||
        form.querySelector(
          'input[autocomplete*="user" i], input[autocomplete*="email" i], input[autocomplete*="login" i]',
        ) ||
        form.querySelector(
          'input[name*="user" i], input[name*="email" i], input[name*="login" i]',
        ) ||
        form.querySelector('input[id*="user" i], input[id*="email" i], input[id*="login" i]') ||
        form.querySelector(
          'input[aria-label*="user" i], input[aria-label*="email" i], input[aria-label*="login" i]',
        ) ||
        form.querySelector(
          'input[placeholder*="user" i], input[placeholder*="email" i], input[placeholder*="login" i]',
        ) ||
        form.querySelector('input[type="text"]');
      if (userInput && userInput instanceof HTMLInputElement) {
        userInput.focus();
        userInput.value = username;
        userInput.dispatchEvent(new Event('input', { bubbles: true }));
        userInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      passInput.focus();
      passInput.value = password;
      passInput.dispatchEvent(new Event('input', { bubbles: true }));
      passInput.dispatchEvent(new Event('change', { bubbles: true }));
      injected = true;
      // Optionally submit the form if both fields are filled
      // form.dispatchEvent(new Event('submit', { bubbles: true }));
      break; // Only inject into the first matching form
    }
    return injected;
  }
  return { injectCredential };
}
