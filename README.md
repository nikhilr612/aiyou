# Aiyou

**Aiyou** is a frontend for **Large Language Models (LLMs)** developed as a **Next.js web application**. It facilitates seamless interaction with LLM APIs, providing a robust platform for AI-powered solutions. The project currently supports **Ollama**, with planned integration for the **OpenAI API** and other LLM services.

## Project Architecture
- **Frontend**: Handles user interaction and renders responses from LLMs.
- **Backend**: Manages API calls, RAG workflows, and embeddings generation.
- **Vector Database**: Powered by **LanceDB** for storing and querying embeddings with exceptional performance.
- **Model Integration**: Compatible with various LLM APIs, with additional integrations under development.


### Corrective RAG
Aiyou incorporates common **Retrieval-Augmented Generation (RAG)** techniques:
- **Iterative Refinement**: Implements corrective mechanisms to enhance the accuracy of generated responses.
- **Tool Calling**: Integrates tools to dynamically retrieve and utilize external context during response generation.
 
## Installation and Usage

### Prerequisites
- Ensure **Node.js** and a package manager such as **npm**, **yarn**, or **pnpm** are installed on your system.

### Steps to Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/nikhilr612/aiyou
   cd https://github.com/nikhilr612/aiyou
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application in your browser at:
   **[http://localhost:3000](http://localhost:3000)**.

## Resources and Documentation

For more information on the frameworks and tools utilized in Aiyou, refer to the following resources:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Huggingface Transformers](https://huggingface.co/transformers/)
- [LanceDB Documentation](https://lancedb.github.io/)
