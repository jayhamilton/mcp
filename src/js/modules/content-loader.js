// Content Loader Module
export class ContentLoader {
  constructor() {
    this.sections = {
      overview: this.getOverviewContent(),
      jsonrpc: this.getJSONRPCContent(),
      architecture: this.getArchitectureContent(),
      implementation: this.getImplementationContent(),
      rag: this.getRAGContent(),
      quiz: this.getQuizContent(),
      resources: this.getResourcesContent()
    };
  }

  loadAllSections() {
    const contentArea = document.querySelector('.content-area');
    contentArea.innerHTML = '';
    
    Object.entries(this.sections).forEach(([id, content]) => {
      const sectionDiv = document.createElement('div');
      sectionDiv.id = id;
      sectionDiv.className = id === 'overview' ? 'module-section active' : 'module-section';
      sectionDiv.innerHTML = content;
      contentArea.appendChild(sectionDiv);
    });
  }

  getOverviewContent() {
    return `
      <h2 class="section-title">What is Model Context Protocol (MCP)?</h2>
      <div class="learning-objectives">
        <h3>Learning Objectives</h3>
        <ul>
          <li>Understand the core concepts of MCP</li>
          <li>Identify use cases and benefits</li>
          <li>Recognize MCP's role in AI application architecture</li>
        </ul>
      </div>
      <p>Model Context Protocol (MCP) is an open standard for connecting AI assistants to external data sources and tools. It enables seamless integration between language models and various services, databases, and APIs.</p>
      <div class="highlight-box">
        <h3>Key Benefits</h3>
        <p><strong>Standardization:</strong> Provides a unified way to connect AI models to external resources without custom integrations for each service.</p>
        <p><strong>Security:</strong> Implements secure communication patterns with proper authentication and authorization.</p>
        <p><strong>Scalability:</strong> Supports multiple concurrent connections and efficient resource management.</p>
      </div>
      <h3>Core Components</h3>
      <ul>
        <li><strong>Clients:</strong> AI applications (like Claude) that consume external data</li>
        <li><strong>Servers:</strong> Services that provide data, tools, or capabilities</li>
        <li><strong>Transports:</strong> Communication layers (HTTP, WebSocket, stdio)</li>
        <li><strong>Resources:</strong> Data sources (files, databases, APIs)</li>
        <li><strong>Tools:</strong> Executable functions the AI can invoke</li>
      </ul>
      <div class="code-block">
        <div class="ace-editor" id="editor1">// Example MCP server registration
const server = new MCPServer({
  name: "my-data-source",
  version: "1.0.0"
});

server.addResource({
  uri: "file://documents/",
  name: "Company Documents", 
  mimeType: "text/plain"
});

server.addTool({
  name: "search_documents",
  description: "Search through company documents",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" }
    }
  }
});</div>
      </div>
      <button class="btn" onclick="markSectionComplete('overview')">Complete Overview</button>
    `;
  }

  getJSONRPCContent() {
    return `
      <h2 class="section-title">JSON-RPC Foundation</h2>
      <div class="learning-objectives">
        <h3>Learning Objectives</h3>
        <ul>
          <li>Understand JSON-RPC protocol basics</li>
          <li>Learn MCP's message structure</li>
          <li>Implement basic request/response patterns</li>
        </ul>
      </div>
      <p>MCP is built on JSON-RPC 2.0, providing a lightweight and standardized remote procedure call protocol. This ensures compatibility and ease of implementation across different programming languages and platforms.</p>
      <h3>JSON-RPC Structure</h3>
      <div class="code-block">
        <div class="ace-editor" id="editor2">{
  "jsonrpc": "2.0",
  "method": "resources/read",
  "params": {
    "uri": "file://path/to/document.txt"
  },
  "id": 1
}</div>
      </div>
      <h3>MCP Request Types</h3>
      <ul>
        <li><strong>initialize:</strong> Establish connection and capabilities</li>
        <li><strong>resources/list:</strong> Enumerate available resources</li>
        <li><strong>resources/read:</strong> Read specific resource content</li>
        <li><strong>tools/list:</strong> Get available tools</li>
        <li><strong>tools/call:</strong> Execute a tool</li>
      </ul>
      <button class="btn" onclick="markSectionComplete('jsonrpc')">Complete JSON-RPC</button>
    `;
  }

  getArchitectureContent() {
    return `
      <h2 class="section-title">Architecture & Design Patterns</h2>
      <div class="learning-objectives">
        <h3>Learning Objectives</h3>
        <ul>
          <li>Understand MCP architecture patterns</li>
          <li>Learn client-server communication flow</li>
          <li>Explore transport layer options</li>
        </ul>
      </div>

      <div class="diagram-container">
        <h3>MCP Communication Flow</h3>
        <svg class="communication-diagram" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
          <!-- Client Box -->
          <rect class="client-box" x="50" y="150" width="120" height="80" rx="10" fill="#667eea" stroke="#5a67d8" stroke-width="2"/>
          <text x="110" y="195" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">MCP Client</text>

          <!-- Server Box -->
          <rect class="server-box" x="630" y="150" width="120" height="80" rx="10" fill="#48bb78" stroke="#38a169" stroke-width="2"/>
          <text x="690" y="195" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">MCP Server</text>

          <!-- Request Path -->
          <path id="requestPath" class="message-path request-path" d="M 170 170 Q 400 120 630 170" stroke="#667eea" stroke-width="3" fill="none"/>
          
          <!-- Response Path -->
          <path id="responsePath" class="message-path response-path" d="M 630 210 Q 400 260 170 210" stroke="#48bb78" stroke-width="3" fill="none"/>

          <!-- Moving dots -->
          <circle class="message-dot request-dot" r="6" fill="#667eea"/>
          <circle class="message-dot response-dot" r="6" fill="#48bb78"/>

          <!-- Step indicators -->
          <g class="step-circle step-1">
            <circle cx="110" cy="120" r="15" fill="#f56565" stroke="white" stroke-width="2"/>
            <text class="step-text" x="110" y="125" text-anchor="middle" fill="white" font-size="12" font-weight="bold">1</text>
          </g>
          
          <g class="step-circle step-2">
            <circle cx="300" cy="90" r="15" fill="#ed8936" stroke="white" stroke-width="2"/>
            <text class="step-text" x="300" y="95" text-anchor="middle" fill="white" font-size="12" font-weight="bold">2</text>
          </g>
          
          <g class="step-circle step-3">
            <circle cx="690" cy="120" r="15" fill="#38b2ac" stroke="white" stroke-width="2"/>
            <text class="step-text" x="690" y="125" text-anchor="middle" fill="white" font-size="12" font-weight="bold">3</text>
          </g>
          
          <g class="step-circle step-4">
            <circle cx="500" cy="290" r="15" fill="#9f7aea" stroke="white" stroke-width="2"/>
            <text class="step-text" x="500" y="295" text-anchor="middle" fill="white" font-size="12" font-weight="bold">4</text>
          </g>

          <!-- Message labels -->
          <text class="message-text request-text" x="250" y="110" text-anchor="middle" fill="#4a5568" font-size="11">resources/read</text>
          <text class="message-text request-details" x="250" y="125" text-anchor="middle" fill="#718096" font-size="9">{"uri": "file://data.json"}</text>
          
          <text class="message-text response-text" x="450" y="280" text-anchor="middle" fill="#4a5568" font-size="11">Response</text>
          <text class="message-text response-details" x="450" y="295" text-anchor="middle" fill="#718096" font-size="9">{"content": "..."}</text>
        </svg>

        <div class="diagram-controls">
          <button id="playAnimation" class="diagram-btn">Play</button>
          <button id="pauseAnimation" class="diagram-btn" disabled>Pause</button>
          <button id="resetAnimation" class="diagram-btn">Reset</button>
        </div>
      </div>

      <h3>Transport Layers</h3>
      <ul>
        <li><strong>HTTP/HTTPS:</strong> Web-based applications and services</li>
        <li><strong>WebSocket:</strong> Real-time, bidirectional communication</li>
        <li><strong>stdio:</strong> Command-line tools and local processes</li>
      </ul>

      <button class="btn" onclick="markSectionComplete('architecture')">Complete Architecture</button>
    `;
  }

  getImplementationContent() {
    return `
      <h2 class="section-title">Implementation Guide</h2>
      <div class="learning-objectives">
        <h3>Learning Objectives</h3>
        <ul>
          <li>Set up a basic MCP server</li>
          <li>Implement resource and tool handlers</li>
          <li>Handle client connections</li>
        </ul>
      </div>

      <h3>Setting up MCP Server</h3>
      <div class="code-block">
        <div class="ace-editor large" id="editor8">import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'example-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Add a simple resource handler
server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'file://example.txt',
        name: 'Example File',
        description: 'An example text file',
        mimeType: 'text/plain',
      },
    ],
  };
});

// Add a tool
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'echo',
        description: 'Echo the input back',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message to echo',
            },
          },
          required: ['message'],
        },
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);</div>
      </div>

      <h3>Key Implementation Steps</h3>
      <ol>
        <li>Install the MCP SDK: <code>npm install @modelcontextprotocol/sdk</code></li>
        <li>Define server capabilities and metadata</li>
        <li>Implement request handlers for resources and tools</li>
        <li>Set up transport layer (stdio, HTTP, WebSocket)</li>
        <li>Handle initialization and error scenarios</li>
      </ol>

      <button class="btn" onclick="markSectionComplete('implementation')">Complete Implementation</button>
    `;
  }

  getRAGContent() {
    return `
      <h2 class="section-title">Retrieval Augmented Generation with MCP</h2>
      <div class="learning-objectives">
        <h3>Learning Objectives</h3>
        <ul>
          <li>Understand RAG architecture with MCP</li>
          <li>Learn how MCP enhances knowledge retrieval</li>
          <li>Implement RAG patterns using MCP servers</li>
        </ul>
      </div>

      <p>Retrieval Augmented Generation (RAG) enhances AI responses by incorporating external knowledge sources. MCP provides a standardized way to connect AI models to diverse knowledge repositories, making RAG implementations more robust and maintainable.</p>

      <div class="diagram-container">
        <h3>RAG Workflow with MCP</h3>
        <svg class="communication-diagram" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
          <!-- User Input -->
          <rect class="user-input" x="50" y="50" width="100" height="60" rx="8" fill="#4299e1" stroke="#3182ce" stroke-width="2"/>
          <text x="100" y="85" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">User Query</text>
          
          <!-- AI Client -->
          <rect class="ai-client" x="350" y="200" width="100" height="60" rx="8" fill="#805ad5" stroke="#6b46c1" stroke-width="2"/>
          <text x="400" y="235" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">AI Client</text>
          
          <!-- Knowledge Sources -->
          <g class="knowledge-sources">
            <rect x="150" y="350" width="80" height="50" rx="5" fill="#48bb78" stroke="#38a169" stroke-width="1"/>
            <text x="190" y="380" text-anchor="middle" fill="white" font-size="10" font-weight="bold">Database</text>
            
            <rect x="260" y="350" width="80" height="50" rx="5" fill="#ed8936" stroke="#dd6b20" stroke-width="1"/>
            <text x="300" y="380" text-anchor="middle" fill="white" font-size="10" font-weight="bold">Documents</text>
            
            <rect x="370" y="350" width="80" height="50" rx="5" fill="#9f7aea" stroke="#805ad5" stroke-width="1"/>
            <text x="410" y="380" text-anchor="middle" fill="white" font-size="10" font-weight="bold">APIs</text>
            
            <rect x="480" y="350" width="80" height="50" rx="5" fill="#38b2ac" stroke="#319795" stroke-width="1"/>
            <text x="520" y="380" text-anchor="middle" fill="white" font-size="10" font-weight="bold">Knowledge Base</text>
          </g>
          
          <!-- Final Response -->
          <rect class="final-response" x="650" y="50" width="100" height="60" rx="8" fill="#38a169" stroke="#2f855a" stroke-width="2"/>
          <text x="700" y="85" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">Enhanced Response</text>

          <!-- MCP Layer -->
          <rect class="mcp-layer" x="100" y="180" width="500" height="100" rx="10" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="8,4"/>
          <text x="350" y="175" text-anchor="middle" fill="#4a5568" font-size="12" font-weight="bold">MCP Protocol Layer</text>

          <!-- Paths and animations will be added by GSAP -->
          <path class="rag-path user-to-ai" d="M 150 80 L 350 230" stroke="#4299e1" stroke-width="2" fill="none"/>
          <path class="rag-path ai-to-db" d="M 380 260 L 190 350" stroke="#48bb78" stroke-width="2" fill="none"/>
          <path class="rag-path ai-to-docs" d="M 390 260 L 300 350" stroke="#ed8936" stroke-width="2" fill="none"/>
          <path class="rag-path ai-to-apis" d="M 410 260 L 410 350" stroke="#9f7aea" stroke-width="2" fill="none"/>
          <path class="rag-path ai-to-kb" d="M 420 260 L 520 350" stroke="#38b2ac" stroke-width="2" fill="none"/>
          <path class="rag-path ai-to-response" d="M 450 230 L 650 80" stroke="#38a169" stroke-width="2" fill="none"/>

          <!-- Return paths (dashed) -->
          <path class="rag-path db-return" d="M 190 350 L 380 260" stroke="#48bb78" stroke-width="1" stroke-dasharray="3,3" fill="none"/>
          <path class="rag-path docs-return" d="M 300 350 L 390 260" stroke="#ed8936" stroke-width="1" stroke-dasharray="3,3" fill="none"/>
          <path class="rag-path apis-return" d="M 410 350 L 410 260" stroke="#9f7aea" stroke-width="1" stroke-dasharray="3,3" fill="none"/>
          <path class="rag-path kb-return" d="M 520 350 L 420 260" stroke="#38b2ac" stroke-width="1" stroke-dasharray="3,3" fill="none"/>

          <!-- Arrows -->
          <polygon class="rag-arrow user-to-ai-arrow" points="340,225 350,230 340,235" fill="#4299e1"/>
          <polygon class="rag-arrow ai-to-db-arrow" points="195,345 190,350 185,345" fill="#48bb78"/>
          <polygon class="rag-arrow ai-to-docs-arrow" points="305,345 300,350 295,345" fill="#ed8936"/>
          <polygon class="rag-arrow ai-to-apis-arrow" points="415,345 410,350 405,345" fill="#9f7aea"/>
          <polygon class="rag-arrow ai-to-kb-arrow" points="525,345 520,350 515,345" fill="#38b2ac"/>
          <polygon class="rag-arrow ai-to-response-arrow" points="645,85 650,80 645,75" fill="#38a169"/>

          <!-- Animated dots -->
          <circle class="rag-dot user-query-dot" cx="100" cy="80" r="4" fill="#4299e1"/>
          <circle class="rag-dot db-dot" cx="190" cy="375" r="3" fill="#48bb78"/>
          <circle class="rag-dot docs-dot" cx="300" cy="375" r="3" fill="#ed8936"/>
          <circle class="rag-dot apis-dot" cx="410" cy="375" r="3" fill="#9f7aea"/>
          <circle class="rag-dot kb-dot" cx="520" cy="375" r="3" fill="#38b2ac"/>
          <circle class="rag-dot context-dot" cx="400" cy="230" r="5" fill="#805ad5"/>

          <!-- Step labels -->
          <text class="rag-label step-1-label" x="100" y="30" text-anchor="middle" fill="#4a5568" font-size="11" font-weight="bold">1. User Query</text>
          <text class="rag-label step-2-label" x="350" y="450" text-anchor="middle" fill="#4a5568" font-size="11" font-weight="bold">2. Knowledge Retrieval</text>
          <text class="rag-label step-3-label" x="400" y="150" text-anchor="middle" fill="#4a5568" font-size="11" font-weight="bold">3. Context Assembly</text>
          <text class="rag-label step-4-label" x="700" y="30" text-anchor="middle" fill="#4a5568" font-size="11" font-weight="bold">4. Enhanced Response</text>

          <!-- Status indicator -->
          <rect class="status-bg" x="300" y="120" width="200" height="25" rx="12" fill="#f7fafc" stroke="#e2e8f0" stroke-width="1"/>
          <text class="status-text" x="400" y="137" text-anchor="middle" fill="#4a5568" font-size="11">Processing query...</text>
        </svg>

        <div class="diagram-controls">
          <button id="playRAGAnimation" class="diagram-btn">Play RAG Animation</button>
          <button id="pauseRAGAnimation" class="diagram-btn" disabled>Pause</button>
          <button id="resetRAGAnimation" class="diagram-btn">Reset</button>
        </div>
      </div>

      <h3>MCP-Enhanced RAG Implementation</h3>
      <div class="code-block">
        <div class="ace-editor large" id="editor9">// RAG Server with multiple knowledge sources
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const ragServer = new Server({
  name: 'rag-knowledge-server',
  version: '1.0.0'
});

// Vector database resource
ragServer.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'vector://embeddings/documents',
        name: 'Document Embeddings',
        description: 'Vectorized company documents',
        mimeType: 'application/json'
      },
      {
        uri: 'sql://knowledge/database',
        name: 'Knowledge Database',
        description: 'Structured knowledge base',
        mimeType: 'application/json'
      }
    ]
  };
});

// RAG search tool
ragServer.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'semantic_search') {
    const { query, top_k = 5 } = request.params.arguments;
    
    // Perform semantic search across multiple sources
    const vectorResults = await searchVectorDB(query, top_k);
    const sqlResults = await searchKnowledgeDB(query);
    const apiResults = await searchExternalAPIs(query);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          results: [...vectorResults, ...sqlResults, ...apiResults],
          context: combineContext(vectorResults, sqlResults, apiResults)
        })
      }]
    };
  }
});</div>
      </div>

      <div class="highlight-box">
        <h3>RAG Benefits with MCP</h3>
        <p><strong>Modularity:</strong> Different knowledge sources can be separate MCP servers</p>
        <p><strong>Standardization:</strong> Consistent interface for all retrieval operations</p>
        <p><strong>Scalability:</strong> Easy to add new knowledge sources without changing client code</p>
        <p><strong>Security:</strong> Granular access control per knowledge source</p>
      </div>

      <button class="btn" onclick="markSectionComplete('rag')">Complete RAG Integration</button>
    `;
  }

  getQuizContent() {
    return `
      <h2 class="section-title">Knowledge Check</h2>
      <p>Test your understanding of Model Context Protocol concepts:</p>

      <div class="quiz-section">
        <div class="quiz-question">1. What protocol does MCP build upon?</div>
        <ul class="quiz-options">
          <li onclick="selectAnswer(this, false)">HTTP/2</li>
          <li onclick="selectAnswer(this, true)">JSON-RPC 2.0</li>
          <li onclick="selectAnswer(this, false)">GraphQL</li>
          <li onclick="selectAnswer(this, false)">REST</li>
        </ul>
      </div>

      <div class="quiz-section">
        <div class="quiz-question">2. Which are valid MCP transport layers?</div>
        <ul class="quiz-options">
          <li onclick="selectAnswer(this, false)">HTTP and FTP only</li>
          <li onclick="selectAnswer(this, true)">HTTP, WebSocket, and stdio</li>
          <li onclick="selectAnswer(this, false)">Only WebSocket</li>
          <li onclick="selectAnswer(this, false)">TCP and UDP</li>
        </ul>
      </div>

      <div class="quiz-section">
        <div class="quiz-question">3. What is the primary purpose of MCP?</div>
        <ul class="quiz-options">
          <li onclick="selectAnswer(this, false)">Replace HTTP protocol</li>
          <li onclick="selectAnswer(this, true)">Connect AI assistants to external data sources</li>
          <li onclick="selectAnswer(this, false)">Create web applications</li>
          <li onclick="selectAnswer(this, false)">Manage databases</li>
        </ul>
      </div>

      <div class="quiz-section">
        <div class="quiz-question">4. In MCP architecture, what role does the server play?</div>
        <ul class="quiz-options">
          <li onclick="selectAnswer(this, true)">Provides data, tools, or capabilities</li>
          <li onclick="selectAnswer(this, false)">Consumes external data</li>
          <li onclick="selectAnswer(this, false)">Routes network traffic</li>
          <li onclick="selectAnswer(this, false)">Stores user credentials</li>
        </ul>
      </div>

      <div class="quiz-section">
        <div class="quiz-question">5. Which MCP request type is used to read resource content?</div>
        <ul class="quiz-options">
          <li onclick="selectAnswer(this, false)">resources/list</li>
          <li onclick="selectAnswer(this, true)">resources/read</li>
          <li onclick="selectAnswer(this, false)">tools/call</li>
          <li onclick="selectAnswer(this, false)">initialize</li>
        </ul>
      </div>

      <div class="quiz-section">
        <div class="quiz-question">6. What does RAG stand for in the context of AI?</div>
        <ul class="quiz-options">
          <li onclick="selectAnswer(this, false)">Random Access Generation</li>
          <li onclick="selectAnswer(this, true)">Retrieval Augmented Generation</li>
          <li onclick="selectAnswer(this, false)">Rapid Application Generation</li>
          <li onclick="selectAnswer(this, false)">Resource Access Gateway</li>
        </ul>
      </div>

      <div class="quiz-section">
        <div class="quiz-question">7. How does MCP enhance RAG implementations?</div>
        <ul class="quiz-options">
          <li onclick="selectAnswer(this, false)">By replacing vector databases</li>
          <li onclick="selectAnswer(this, true)">By providing standardized access to knowledge sources</li>
          <li onclick="selectAnswer(this, false)">By eliminating the need for embeddings</li>
          <li onclick="selectAnswer(this, false)">By reducing response quality</li>
        </ul>
      </div>

      <div class="quiz-section">
        <div class="quiz-question">8. Which is a key benefit of using MCP servers?</div>
        <ul class="quiz-options">
          <li onclick="selectAnswer(this, false)">Faster internet connection</li>
          <li onclick="selectAnswer(this, false)">Better graphics rendering</li>
          <li onclick="selectAnswer(this, true)">Standardized integration patterns</li>
          <li onclick="selectAnswer(this, false)">Automatic code generation</li>
        </ul>
      </div>

      <div id="quiz-results" style="display: none;">
        <h3>Quiz Results</h3>
        <p id="score-text"></p>
        <button class="btn" onclick="resetQuiz()">Retake Quiz</button>
      </div>
    `;
  }

  getResourcesContent() {
    return `
      <h2 class="section-title">Additional Resources</h2>
      <h3>Official Documentation</h3>
      <ul>
        <li><a href="https://spec.modelcontextprotocol.io/" target="_blank">MCP Specification</a></li>
        <li><a href="https://github.com/modelcontextprotocol" target="_blank">MCP GitHub Organization</a></li>
        <li><a href="https://github.com/modelcontextprotocol/servers" target="_blank">Example MCP Servers</a></li>
      </ul>

      <h3>SDK and Tools</h3>
      <ul>
        <li><a href="https://www.npmjs.com/package/@modelcontextprotocol/sdk" target="_blank">MCP SDK (Node.js)</a></li>
        <li><a href="https://pypi.org/project/mcp/" target="_blank">MCP Python SDK</a></li>
        <li><a href="https://github.com/modelcontextprotocol/inspector" target="_blank">MCP Inspector</a></li>
      </ul>

      <h3>Community Examples</h3>
      <ul>
        <li>File system server</li>
        <li>Database connector</li>
        <li>API gateway server</li>
        <li>Git repository server</li>
      </ul>

      <div class="highlight-box">
        <h3>Next Steps</h3>
        <p>Ready to implement MCP in your project? Start with a simple file system server and gradually add more complex capabilities. The MCP community provides extensive examples and support.</p>
      </div>

      <button class="btn" onclick="markSectionComplete('resources')">Complete Resources</button>
    `;
  }
}