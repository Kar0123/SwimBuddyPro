// Service Worker Registration and PWA Install Prompt
export class PWAManager {
  private deferredPrompt: any = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private async init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SwimBuddy Pro: Service Worker registered successfully:', registration.scope);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, show update notification
                this.showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error('SwimBuddy Pro: Service Worker registration failed:', error);
      }
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('SwimBuddy Pro: Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      console.log('SwimBuddy Pro: App installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
    });

    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      console.log('SwimBuddy Pro: Running as PWA');
      this.isInstalled = true;
    }
  }

  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('SwimBuddy Pro: Install prompt not available');
      return false;
    }

    try {
      // Show install prompt
      this.deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log('SwimBuddy Pro: Install prompt result:', outcome);
      
      if (outcome === 'accepted') {
        this.isInstalled = true;
        this.hideInstallButton();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('SwimBuddy Pro: Install failed:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  private showInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
    }

    // Dispatch custom event for React components
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private hideInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }

    // Dispatch custom event for React components
    window.dispatchEvent(new CustomEvent('pwa-install-completed'));
  }

  private showUpdateNotification() {
    // Show update notification to user
    const updateBanner = document.createElement('div');
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #00bcd4, #0097a7);
        color: white;
        padding: 12px 16px;
        text-align: center;
        z-index: 10000;
        font-family: Inter, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        🏊‍♀️ New SwimBuddy Pro features available! 
        <button onclick="window.location.reload()" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 6px 12px;
          margin-left: 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">Update Now</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent;
          border: none;
          color: white;
          padding: 6px 8px;
          margin-left: 8px;
          cursor: pointer;
          font-size: 16px;
        ">×</button>
      </div>
    `;
    document.body.appendChild(updateBanner);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (updateBanner.parentElement) {
        updateBanner.remove();
      }
    }, 10000);
  }

  public getInstallStatus(): boolean {
    return this.isInstalled;
  }

  public isInstallPromptAvailable(): boolean {
    return this.deferredPrompt !== null;
  }
}

// Global PWA manager instance
declare global {
  interface Window {
    pwaManager: PWAManager;
  }
}

// Initialize PWA manager when DOM is loaded
if (typeof window !== 'undefined') {
  window.pwaManager = new PWAManager();
}
