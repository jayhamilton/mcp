// Content Loader Module
export class ContentLoader {
  constructor() {
    this.contentCache = new Map();
    this.sectionIds = ['overview', 'jsonrpc', 'architecture', 'implementation', 'rag', 'quiz', 'resources'];
  }

  async loadAllSections() {
    const contentArea = document.querySelector('.content-area');
    contentArea.innerHTML = '';
    
    try {
      // Load all content files in parallel
      const contentPromises = this.sectionIds.map(id => this.loadSectionContent(id));
      const contents = await Promise.all(contentPromises);
      
      // Create and append section elements
      contents.forEach((content, index) => {
        const sectionId = this.sectionIds[index];
        const sectionDiv = document.createElement('div');
        sectionDiv.id = sectionId;
        sectionDiv.className = sectionId === 'overview' ? 'module-section active' : 'module-section';
        sectionDiv.innerHTML = content;
        contentArea.appendChild(sectionDiv);
      });
      
    } catch (error) {
      console.error('Failed to load content sections:', error);
      this.loadFallbackContent(contentArea);
    }
  }

  async loadSectionContent(sectionId) {
    // Check cache first
    if (this.contentCache.has(sectionId)) {
      return this.contentCache.get(sectionId);
    }

    try {
      const response = await fetch(`src/content/${sectionId}.html`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${sectionId}.html: ${response.status}`);
      }
      
      const content = await response.text();
      this.contentCache.set(sectionId, content);
      return content;
      
    } catch (error) {
      console.error(`Error loading ${sectionId} content:`, error);
      return this.getFallbackContent(sectionId);
    }
  }

  loadFallbackContent(contentArea) {
    // Fallback to inline content if file loading fails
    contentArea.innerHTML = `
      <div id="overview" class="module-section active">
        <h2 class="section-title">Content Loading Error</h2>
        <p>Unable to load module content from external files. Please check your server configuration.</p>
        <div class="highlight-box">
          <h3>Troubleshooting</h3>
          <p>Make sure you're serving this application from a web server (not file:// protocol) to enable content loading.</p>
          <p>For development, you can use: <code>npx http-server . -p 8080</code></p>
        </div>
        <button class="btn" onclick="location.reload()">Retry Loading</button>
      </div>
    `;
  }

  getFallbackContent(sectionId) {
    return `
      <h2 class="section-title">Error Loading ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</h2>
      <p>Content for this section could not be loaded. Please refresh the page or check your connection.</p>
      <div class="highlight-box">
        <p><strong>Note:</strong> This application requires a web server to load content files.</p>
      </div>
    `;
  }

  // Method to reload a specific section
  async reloadSection(sectionId) {
    this.contentCache.delete(sectionId);
    const content = await this.loadSectionContent(sectionId);
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.innerHTML = content;
    }
  }

  // Method to clear cache
  clearCache() {
    this.contentCache.clear();
  }
}